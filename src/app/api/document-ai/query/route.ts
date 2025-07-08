import { NextRequest, NextResponse } from "next/server";
import { documentAI } from "@/lib/documentai/service";
import { ProcessedDocument } from "@/models/ProcessedDocument";
import connectToDatabase from "@/lib/database";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const body = await request.json();
    const { query, fileIds, userId, maxChunks = 3 } = body;

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    const searchFilter: { fileId?: { $in: string[] }, userId?: string } = {};

    // Build search filter
    if (fileIds && fileIds.length > 0) {
      searchFilter.fileId = { $in: fileIds };
    }
    if (userId) {
      searchFilter.userId = userId;
    }

    // Get documents to search
    const documents = await ProcessedDocument.find(searchFilter);

    if (documents.length === 0) {
      return NextResponse.json(
        { error: "No documents found to search" },
        { status: 404 }
      );
    }

    // Search for relevant chunks across all documents
    let allRelevantChunks: Array<{ chunk: { id: string; text: string; startIndex: number; endIndex: number; pageNumber?: number; metadata?: Record<string, unknown> }; source: string }> = [];

    documents.forEach((doc) => {
      const relevantChunks = documentAI.searchRelevantChunks(
        doc.chunks,
        query,
        maxChunks
      );

      relevantChunks.forEach((chunk) => {
        allRelevantChunks.push({
          chunk,
          source: doc.fileName,
        });
      });
    });

    // Sort all chunks by relevance and limit
    allRelevantChunks = allRelevantChunks.slice(0, maxChunks * 2); // Get more for better context

    if (allRelevantChunks.length === 0) {
      return NextResponse.json({
        success: true,
        answer:
          "I couldn't find any relevant information in the uploaded documents to answer your question.",
        sources: [],
        chunks: [],
      });
    }

    // Prepare context for Gemini
    const context = allRelevantChunks
      .map((item) => {
        return `[Source: ${item.source}]\n${item.chunk.text}\n`;
      })
      .join("\n---\n\n");

    // Generate answer using Gemini
    const prompt = `Answer the following question using ONLY the information provided in the context below. If the context doesn't contain enough information to answer the question, say so clearly.

Context:
${context}

Question: ${query}

Please provide a clear, accurate answer based solely on the information in the context above. If you reference specific information, mention which source document it came from.`;

    const { text: answer } = await generateText({
      model: google("gemini-1.5-flash"),
      prompt,
      maxTokens: 1000,
      temperature: 0.3, // Lower temperature for more factual responses
    });

    // Prepare sources
    const sources = [...new Set(allRelevantChunks.map((item) => item.source))];

    return NextResponse.json({
      success: true,
      answer,
      sources,
      chunks: allRelevantChunks.map((item) => ({
        text: item.chunk.text,
        source: item.source,
        id: item.chunk.id,
      })),
      metadata: {
        documentsSearched: documents.length,
        chunksFound: allRelevantChunks.length,
        query,
      },
    });
  } catch (error) {
    console.error("Document query error:", error);
    return NextResponse.json(
      {
        error: "Failed to process query",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
