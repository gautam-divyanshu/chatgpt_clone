import { NextRequest, NextResponse } from "next/server";
import { documentAI } from "@/lib/documentai/service";
import { ProcessedDocument } from "@/models/ProcessedDocument";
import connectToDatabase from "@/lib/database";

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const body = await request.json();
    const {
      fileId,
      fileName,
      fileUrl,
      mimeType,
      fileSize,
      userId,
      conversationId,
    } = body;

    console.log("📥 Document processing request:", {
      fileId,
      fileName,
      mimeType,
      fileSize,
      userId: userId ? "***" : "none",
      conversationId: conversationId ? "***" : "none",
    });

    if (!fileId || !fileName || !fileUrl || !mimeType) {
      console.error("❌ Missing required fields:", {
        fileId: !!fileId,
        fileName: !!fileName,
        fileUrl: !!fileUrl,
        mimeType: !!mimeType,
      });
      return NextResponse.json(
        {
          error: "Missing required fields: fileId, fileName, fileUrl, mimeType",
        },
        { status: 400 }
      );
    }

    // Check if document is already processed
    console.log("🔍 Checking if document already processed...");
    const existingDoc = await ProcessedDocument.findOne({ fileId });
    if (existingDoc) {
      console.log("✅ Document already processed, returning cached result");
      return NextResponse.json({
        success: true,
        document: {
          id: existingDoc._id,
          fileId: existingDoc.fileId,
          fileName: existingDoc.fileName,
          extractedText: existingDoc.extractedText,
          chunks: existingDoc.chunks,
          metadata: existingDoc.metadata,
        },
        message: "Document already processed",
      });
    }

    // Validate file type for Document AI
    const supportedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/bmp",
      "image/tiff",
    ];

    if (!supportedTypes.includes(mimeType)) {
      return NextResponse.json(
        {
          error: `Document AI doesn't support ${mimeType} files. Supported types: PDF and images (JPEG, PNG, GIF, WebP, BMP, TIFF).`,
          supportedTypes: supportedTypes,
        },
        { status: 400 }
      );
    }

    // Extract text using Document AI
    console.log(
      `🤖 Processing document with Google Document AI: ${fileName} (${fileId})`
    );
    console.log(`🔗 File URL: ${fileUrl}`);
    console.log(`📎 MIME type: ${mimeType}`);

    const extracted = await documentAI.extractTextFromUrl(fileUrl, mimeType);
    console.log(
      `✅ Text extraction completed. Length: ${extracted.text.length} characters`
    );

    if (!extracted.text || extracted.text.trim().length === 0) {
      console.error("❌ No text extracted from document");
      return NextResponse.json(
        { error: "No text could be extracted from the document" },
        { status: 400 }
      );
    }

    // Chunk the extracted text
    console.log("🧩 Creating text chunks...");
    const chunks = documentAI.chunkText(extracted.text, 1000, 200);
    console.log(`✅ Created ${chunks.length} text chunks`);

    // Save to database
    console.log("💾 Saving to database...");
    const processedDoc = new ProcessedDocument({
      fileId,
      fileName,
      fileUrl,
      mimeType,
      extractedText: extracted.text,
      chunks,
      metadata: {
        ...extracted.metadata,
        fileSize,
        processedAt: new Date(),
      },
      userId,
      conversationId,
    });

    await processedDoc.save();
    console.log(
      `✅ Document saved successfully: ${fileName} - ${chunks.length} chunks created`
    );

    return NextResponse.json({
      success: true,
      document: {
        id: processedDoc._id,
        fileId: processedDoc.fileId,
        fileName: processedDoc.fileName,
        extractedText: processedDoc.extractedText,
        chunks: processedDoc.chunks,
        metadata: processedDoc.metadata,
      },
      message: `Document processed successfully. Extracted ${extracted.text.length} characters into ${chunks.length} chunks.`,
    });
  } catch (error) {
    console.error("Document processing error:", error);

    return NextResponse.json(
      {
        error: "Failed to process document",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get("fileId");
    const userId = searchParams.get("userId");

    if (fileId) {
      // Get specific document
      const doc = await ProcessedDocument.findOne({ fileId });
      if (!doc) {
        return NextResponse.json(
          { error: "Document not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        document: {
          id: doc._id,
          fileId: doc.fileId,
          fileName: doc.fileName,
          extractedText: doc.extractedText,
          chunks: doc.chunks,
          metadata: doc.metadata,
        },
      });
    }

    if (userId) {
      // Get all documents for user
      const docs = await ProcessedDocument.find({ userId }).sort({
        createdAt: -1,
      });
      return NextResponse.json({
        success: true,
        documents: docs.map((doc) => ({
          id: doc._id,
          fileId: doc.fileId,
          fileName: doc.fileName,
          metadata: doc.metadata,
          createdAt: doc.createdAt,
        })),
      });
    }

    return NextResponse.json(
      { error: "Missing required parameter: fileId or userId" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Document retrieval error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve document" },
      { status: 500 }
    );
  }
}
