// src/models/SharedConversation.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface ISharedConversation extends Document {
  id: string;
  originalConversationId: string;
  title: string;
  messages: Array<{
    id: string;
    content: string;
    role: 'user' | 'assistant';
    timestamp: string;
    attachments?: Array<{
      originalName: string;
      cloudinaryUrl: string;
      cloudinaryPublicId: string;
      fileType: string;
      fileSize: number;
      isImage: boolean;
      uploadedAt: string;
    }>;
  }>;
  ownerId: string;
  createdAt: Date;
  isPublic: boolean;
  viewCount: number;
}

const SharedConversationSchema = new Schema<ISharedConversation>({
  id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  originalConversationId: {
    type: String,
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 100
  },
  messages: [{
    id: {
      type: String,
      required: true
    },
    content: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: true
    },
    timestamp: {
      type: String,
      required: true
    },
    attachments: [{
      originalName: String,
      cloudinaryUrl: String,
      cloudinaryPublicId: String,
      fileType: String,
      fileSize: Number,
      isImage: Boolean,
      uploadedAt: String
    }]
  }],
  ownerId: {
    type: String,
    required: true,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  viewCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: false // We handle timestamps manually
});

// Indexes for performance
SharedConversationSchema.index({ id: 1 });
SharedConversationSchema.index({ originalConversationId: 1 });
SharedConversationSchema.index({ ownerId: 1 });
SharedConversationSchema.index({ createdAt: -1 });

const SharedConversation = mongoose.models.SharedConversation || mongoose.model<ISharedConversation>('SharedConversation', SharedConversationSchema);

export default SharedConversation;
