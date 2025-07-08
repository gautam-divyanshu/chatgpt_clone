import { useState, useCallback } from "react";
import { UploadedFile } from "../components/chat/upload-types";

export interface ProcessedDocument {
  id: string;
  fileId: string;
  fileName: string;
  extractedText: string;
  chunks: Array<{
    id: string;
    text: string;
    startIndex: number;
    endIndex: number;
    metadata?: Record<string, unknown>;
  }>;
  metadata: {
    pageCount?: number;
    language?: string;
    confidence?: number;
    processedAt: string;
    fileSize?: number;
  };
}

export interface DocumentQueryResult {
  answer: string;
  sources: string[];
  chunks: Array<{
    text: string;
    source: string;
    id: string;
  }>;
  metadata: {
    documentsSearched: number;
    chunksFound: number;
    query: string;
  };
}

export interface UseDocumentAIReturn {
  // State
  isProcessing: boolean;
  processedDocuments: ProcessedDocument[];
  processingError: string | null;
  queryError: string | null;

  // Actions
  processDocument: (
    file: UploadedFile,
    userId?: string,
    conversationId?: string
  ) => Promise<ProcessedDocument | null>;
  queryDocuments: (
    query: string,
    fileIds?: string[],
    userId?: string
  ) => Promise<DocumentQueryResult | null>;
  getProcessedDocument: (fileId: string) => Promise<ProcessedDocument | null>;
  clearErrors: () => void;
}

export function useDocumentAI(): UseDocumentAIReturn {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedDocuments, setProcessedDocuments] = useState<
    ProcessedDocument[]
  >([]);
  const [processingError, setProcessingError] = useState<string | null>(null);
  const [queryError, setQueryError] = useState<string | null>(null);

  const processDocument = useCallback(
    async (
      file: UploadedFile,
      userId?: string,
      conversationId?: string
    ): Promise<ProcessedDocument | null> => {
      // Only process documents, not images
      if (!file.isDocument) {
        return null;
      }

      // Check if already processed
      const existing = processedDocuments.find((doc) => doc.fileId === file.id);
      if (existing) {
        return existing;
      }

      setIsProcessing(true);
      setProcessingError(null);

      try {
        console.log('📤 Sending document processing request:', {
          fileId: file.id,
          fileName: file.originalName,
          fileUrl: file.url,
          mimeType: file.type,
          fileSize: file.size,
        });
        
        const response = await fetch("/api/document-ai/process", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fileId: file.id,
            fileName: file.originalName,
            fileUrl: file.url,
            mimeType: file.type,
            fileSize: file.size,
            userId,
            conversationId,
          }),
        });

        console.log('📥 Document processing response status:', response.status, response.statusText);
        
        let result;
        try {
          result = await response.json();
          console.log('📄 Document processing response body:', result);
        } catch (jsonError) {
          console.error('❌ Failed to parse response as JSON:', jsonError);
          const textResponse = await response.text();
          console.log('📄 Raw response text:', textResponse);
          throw new Error(`Invalid JSON response: ${textResponse.substring(0, 200)}...`);
        }

        if (!response.ok) {
          console.error('Document processing API error:', {
            status: response.status,
            statusText: response.statusText,
            error: result.error,
            details: result.details,
            fileInfo: {
              name: file.originalName,
              type: file.type,
              size: file.size,
              url: file.url
            }
          });
          throw new Error(result.error || `Failed to process document (${response.status})`);
        }

        if (result.success && result.document) {
          const processedDoc = result.document as ProcessedDocument;

          // Add to processed documents if not already there
          setProcessedDocuments((prev) => {
            const exists = prev.find(
              (doc) => doc.fileId === processedDoc.fileId
            );
            if (exists) return prev;
            return [...prev, processedDoc];
          });

          return processedDoc;
        }

        throw new Error("Invalid response from server");
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to process document";
        setProcessingError(errorMessage);
        console.error("Document processing error:", error);
        return null;
      } finally {
        setIsProcessing(false);
      }
    },
    [processedDocuments]
  );

  const queryDocuments = useCallback(
    async (
      query: string,
      fileIds?: string[],
      userId?: string
    ): Promise<DocumentQueryResult | null> => {
      if (!query.trim()) {
        setQueryError("Query cannot be empty");
        return null;
      }

      setQueryError(null);

      try {
        const response = await fetch("/api/document-ai/query", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: query.trim(),
            fileIds,
            userId,
            maxChunks: 3,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Failed to query documents");
        }

        if (result.success) {
          return {
            answer: result.answer,
            sources: result.sources,
            chunks: result.chunks,
            metadata: result.metadata,
          };
        }

        throw new Error("Invalid response from server");
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to query documents";
        setQueryError(errorMessage);
        console.error("Document query error:", error);
        return null;
      }
    },
    []
  );

  const getProcessedDocument = useCallback(
    async (fileId: string): Promise<ProcessedDocument | null> => {
      // Check cache first
      const existing = processedDocuments.find((doc) => doc.fileId === fileId);
      if (existing) {
        return existing;
      }

      try {
        const response = await fetch(
          `/api/document-ai/process?fileId=${encodeURIComponent(fileId)}`
        );
        const result = await response.json();

        if (response.ok && result.success && result.document) {
          const processedDoc = result.document as ProcessedDocument;

          // Add to cache
          setProcessedDocuments((prev) => {
            const exists = prev.find(
              (doc) => doc.fileId === processedDoc.fileId
            );
            if (exists) return prev;
            return [...prev, processedDoc];
          });

          return processedDoc;
        }

        return null;
      } catch (error) {
        console.error("Failed to get processed document:", error);
        return null;
      }
    },
    [processedDocuments]
  );

  const clearErrors = useCallback(() => {
    setProcessingError(null);
    setQueryError(null);
  }, []);

  return {
    isProcessing,
    processedDocuments,
    processingError,
    queryError,
    processDocument,
    queryDocuments,
    getProcessedDocument,
    clearErrors,
  };
}
