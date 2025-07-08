import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITextChunk {
  id: string;
  text: string;
  startIndex: number;
  endIndex: number;
  pageNumber?: number;
  metadata?: Record<string, unknown>;
}

export interface IProcessedDocument extends Document {
  fileId: string; // Cloudinary public_id
  fileName: string;
  fileUrl: string;
  mimeType: string;
  extractedText: string;
  chunks: ITextChunk[];
  metadata: {
    pageCount?: number;
    language?: string;
    confidence?: number;
    processedAt: Date;
    fileSize?: number;
  };
  userId?: string; // For user-specific documents
  conversationId?: string; // Link to conversation if needed
  createdAt: Date;
  updatedAt: Date;
}

const TextChunkSchema = new Schema({
  id: { type: String, required: true },
  text: { type: String, required: true },
  startIndex: { type: Number, required: true },
  endIndex: { type: Number, required: true },
  pageNumber: { type: Number },
  metadata: { type: Schema.Types.Mixed },
});

const ProcessedDocumentSchema = new Schema({
  fileId: { type: String, required: true, unique: true },
  fileName: { type: String, required: true },
  fileUrl: { type: String, required: true },
  mimeType: { type: String, required: true },
  extractedText: { type: String, required: true },
  chunks: [TextChunkSchema],
  metadata: {
    pageCount: { type: Number },
    language: { type: String },
    confidence: { type: Number },
    processedAt: { type: Date, default: Date.now },
    fileSize: { type: Number },
  },
  userId: { type: String },
  conversationId: { type: String },
}, {
  timestamps: true,
});

// Indexes for faster queries
ProcessedDocumentSchema.index({ fileId: 1 });
ProcessedDocumentSchema.index({ userId: 1 });
ProcessedDocumentSchema.index({ conversationId: 1 });
ProcessedDocumentSchema.index({ 'chunks.text': 'text' }); // Text search index

export const ProcessedDocument: Model<IProcessedDocument> = 
  mongoose.models.ProcessedDocument || 
  mongoose.model<IProcessedDocument>('ProcessedDocument', ProcessedDocumentSchema);
