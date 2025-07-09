import { DocumentProcessorServiceClient } from '@google-cloud/documentai';
import { ENV } from '@/config';

export interface ExtractedContent {
  text: string;
  metadata: {
    pageCount?: number;
    language?: string;
    confidence?: number;
  };
}

export interface TextChunk {
  id: string;
  text: string;
  startIndex: number;
  endIndex: number;
  pageNumber?: number;
  metadata?: Record<string, unknown>;
}

export class DocumentAIService {
  private client: DocumentProcessorServiceClient;
  private processorName: string;

  constructor() {
    console.log('🔧 Initializing Document AI Service...');
    
    // Initialize the client with credentials
    const clientConfig: { credentials?: unknown; keyFilename?: string } = {};
    
    if (ENV.GOOGLE_APPLICATION_CREDENTIALS) {
      // Check if it's a file path or JSON string
      if (ENV.GOOGLE_APPLICATION_CREDENTIALS.startsWith('{') || 
          ENV.GOOGLE_APPLICATION_CREDENTIALS.length > 500) {
        // It's a JSON string or base64 encoded
        try {
          let credentialsJson;
          if (ENV.GOOGLE_APPLICATION_CREDENTIALS.startsWith('eyJ')) {
            // Base64 encoded
            credentialsJson = JSON.parse(
              Buffer.from(ENV.GOOGLE_APPLICATION_CREDENTIALS, 'base64').toString('utf-8')
            );
          } else {
            // Direct JSON string
            credentialsJson = JSON.parse(ENV.GOOGLE_APPLICATION_CREDENTIALS);
          }
          
          // Validate that it's a service account key
          if (!credentialsJson.client_email || !credentialsJson.private_key) {
            console.error('❌ Invalid credentials: Missing client_email or private_key');
            console.error('💡 You need Service Account credentials, not OAuth credentials');
            console.error('📝 Credential type detected:', credentialsJson.type || 'unknown');
            throw new Error('Invalid service account credentials. Please use Service Account JSON key, not OAuth credentials.');
          }
          
          clientConfig.credentials = credentialsJson;
          console.log('✅ Using Service Account credentials');
          console.log('📧 Service Account Email:', credentialsJson.client_email);
        } catch (error) {
          console.error('❌ Failed to parse credentials JSON:', error);
          throw new Error('Invalid credentials format: ' + (error instanceof Error ? error.message : 'Unknown error'));
        }
      } else {
        // It's a file path
        clientConfig.keyFilename = ENV.GOOGLE_APPLICATION_CREDENTIALS;
        console.log('✅ Using credentials file:', ENV.GOOGLE_APPLICATION_CREDENTIALS);
      }
    } else {
      console.log('ℹ️ Using default Google Cloud credentials (ADC)');
    }
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.client = new DocumentProcessorServiceClient(clientConfig as any);

    // Construct the processor path
    this.processorName = `projects/${ENV.GOOGLE_CLOUD_PROJECT_ID}/locations/${ENV.GOOGLE_CLOUD_LOCATION}/processors/${ENV.GOOGLE_CLOUD_PROCESSOR_ID}`;
    console.log('✅ Document AI Service initialized successfully');
    console.log('🔗 Processor name:', this.processorName);
  }

  /**
   * Extract text from a document URL (Cloudinary URL)
   */
  async extractTextFromUrl(fileUrl: string, mimeType: string): Promise<ExtractedContent> {
    try {
      console.log('🔄 Fetching file from Cloudinary...');
      console.log(`🔗 URL: ${fileUrl}`);
      console.log(`📎 MIME: ${mimeType}`);
      
      const response = await fetch(fileUrl);
      
      if (!response.ok) {
        console.error(`❌ Final fetch failed: ${response.status} ${response.statusText}`);
        throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);
      }
      
      console.log(`✅ File fetched successfully. Size: ${response.headers.get('content-length')} bytes`);

      const arrayBuffer = await response.arrayBuffer();
      console.log(`📎 Buffer size: ${arrayBuffer.byteLength} bytes`);
      
      const document = {
        content: Buffer.from(arrayBuffer).toString('base64'),
        mimeType: mimeType,
      };
      console.log(`📋 Base64 content length: ${document.content.length} characters`);

      // Process the document
      console.log('🤖 Sending to Google Document AI...');
      console.log(`🔗 Processor: ${this.processorName}`);
      
      const [result] = await this.client.processDocument({
        name: this.processorName,
        rawDocument: document,
      });
      console.log('✅ Document AI processing completed');

      if (!result.document) {
        console.error('❌ No document returned from Document AI');
        throw new Error('No document returned from Document AI');
      }

      const extractedText = result.document.text || '';
      const pages = result.document.pages || [];
      console.log(`✅ Extracted text length: ${extractedText.length} characters`);
      console.log(`📊 Page count: ${pages.length}`);

      return {
        text: extractedText,
        metadata: {
          pageCount: pages.length,
          language: result.document.textStyles?.[0]?.textAnchor?.textSegments?.[0]?.startIndex ? 'auto-detected' : undefined,
          confidence: this.calculateAverageConfidence(result.document),
        },
      };
    } catch (error) {
      console.error('❌ Document AI extraction error:', error);
      throw new Error(`Failed to extract text: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Chunk text into smaller pieces for processing
   */
  chunkText(text: string, chunkSize: number = 1000, overlap: number = 200): TextChunk[] {
    const chunks: TextChunk[] = [];
    let startIndex = 0;
    let chunkId = 0;

    // If text is very short, return as single chunk
    if (text.length <= chunkSize) {
      return [{
        id: `chunk_${chunkId}`,
        text: text.trim(),
        startIndex: 0,
        endIndex: text.length,
        metadata: {
          chunkSize: text.length,
          position: 0,
        },
      }];
    }

    while (startIndex < text.length) {
      const endIndex = Math.min(startIndex + chunkSize, text.length);
      let chunkText = text.slice(startIndex, endIndex);

      // Try to break at sentence or paragraph boundaries
      if (endIndex < text.length) {
        const lastPeriod = chunkText.lastIndexOf('.');
        const lastNewline = chunkText.lastIndexOf('\n');
        const breakPoint = Math.max(lastPeriod, lastNewline);

        if (breakPoint > chunkSize * 0.7) { // Only break if we're not losing too much content
          chunkText = chunkText.slice(0, breakPoint + 1);
        }
      }

      // Only add non-empty chunks
      if (chunkText.trim().length > 0) {
        chunks.push({
          id: `chunk_${chunkId}`,
          text: chunkText.trim(),
          startIndex,
          endIndex: startIndex + chunkText.length,
          metadata: {
            chunkSize: chunkText.length,
            position: chunkId,
          },
        });
        chunkId++;
      }

      // Move to next chunk with overlap
      const actualChunkLength = chunkText.length;
      startIndex += Math.max(actualChunkLength - overlap, 1);
    }

    return chunks.filter(chunk => chunk.text.length > 0);
  }

  /**
   * Search for relevant chunks based on a query (simple text matching without embeddings)
   */
  searchRelevantChunks(chunks: TextChunk[], query: string, maxChunks: number = 3): TextChunk[] {
    const queryWords = query.toLowerCase().split(/\s+/).filter(word => word.length > 2);
    
    // Score chunks based on keyword matches
    const scoredChunks = chunks.map(chunk => {
      const chunkText = chunk.text.toLowerCase();
      let score = 0;

      queryWords.forEach(word => {
        const matches = (chunkText.match(new RegExp(word, 'g')) || []).length;
        score += matches;
        
        // Bonus for exact phrase matches
        if (chunkText.includes(query.toLowerCase())) {
          score += 5;
        }
      });

      return { chunk, score };
    });

    // Sort by score and return top chunks
    return scoredChunks
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, maxChunks)
      .map(item => item.chunk);
  }

  /**
   * Calculate average confidence score from Document AI result
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private calculateAverageConfidence(document: any): number {
    if (!document.pages) return 0;

    let totalConfidence = 0;
    let elementCount = 0;

    document.pages.forEach((page: { tokens?: Array<{ detectedBreak?: { confidence?: number } }> }) => {
      if (page.tokens) {
        page.tokens.forEach((token: { detectedBreak?: { confidence?: number } }) => {
          if (token.detectedBreak?.confidence) {
            totalConfidence += token.detectedBreak.confidence;
            elementCount++;
          }
        });
      }
    });

    return elementCount > 0 ? totalConfidence / elementCount : 0;
  }
}

// Export singleton instance
export const documentAI = new DocumentAIService();
