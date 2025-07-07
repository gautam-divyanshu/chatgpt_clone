// src/models/Conversation.ts
import mongoose, { Schema, Document, Model } from "mongoose";

// Attachment interface for files stored in Cloudinary
export interface IAttachment {
  originalName: string;
  cloudinaryUrl: string;
  cloudinaryPublicId: string;
  fileType: string;
  fileSize: number;
  isImage: boolean;
  uploadedAt: Date;
}

// Message interface
export interface IMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  attachments?: IAttachment[];
}

// Conversation interface
export interface IConversation extends Document {
  id: string;
  title: string;
  messages: IMessage[];
  userId: string; // Associate conversation with user
  shareId?: string; // For sharing conversations
  isShared?: boolean;
  sharedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  messageCount: number;
  lastMessageAt: Date;
  updateTitleFromFirstMessage(): void;
  addMessage(message: Partial<IMessage>): IMessage;
}

// Interface for static methods
export interface IConversationModel extends Model<IConversation> {
  createNew(userId: string): IConversation;
  findWithPagination(
    userId: string,
    limit?: number,
    offset?: number
  ): Promise<Partial<IConversation>[]>;
}

// Attachment Schema
const AttachmentSchema = new Schema<IAttachment>({
  originalName: { type: String, required: true },
  cloudinaryUrl: { type: String, required: true },
  cloudinaryPublicId: { type: String, required: true },
  fileType: { type: String, required: true },
  fileSize: { type: Number, required: true },
  isImage: { type: Boolean, required: true },
  uploadedAt: { type: Date, default: Date.now },
});

// Message Schema
const MessageSchema = new Schema<IMessage>({
  id: { type: String, required: true },
  role: { type: String, enum: ["user", "assistant"], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  attachments: [AttachmentSchema],
});

// Conversation Schema
const ConversationSchema = new Schema<IConversation>(
  {
    id: { type: String, required: true, unique: true },
    title: { type: String, default: "New Chat" },
    messages: [MessageSchema],
    userId: { type: String, required: true },
    shareId: { type: String }, // For sharing conversations
    isShared: { type: Boolean, default: false },
    sharedAt: { type: Date },
    messageCount: { type: Number, default: 0 },
    lastMessageAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
    collection: "conversations",
  }
);

// Indexes for better performance
ConversationSchema.index({ userId: 1, createdAt: -1 });
ConversationSchema.index({ userId: 1, updatedAt: -1 });
ConversationSchema.index({ userId: 1, lastMessageAt: -1 });
ConversationSchema.index({ shareId: 1 }); // For shared conversations
ConversationSchema.index({ createdAt: -1 });
ConversationSchema.index({ updatedAt: -1 });
ConversationSchema.index({ lastMessageAt: -1 });

// Pre-save middleware to update messageCount and lastMessageAt
ConversationSchema.pre("save", function (next) {
  this.messageCount = this.messages.length;
  if (this.messages.length > 0) {
    const lastMessage = this.messages[this.messages.length - 1];
    this.lastMessageAt = lastMessage.timestamp;
  }
  next();
});

// Auto-generate title from first user message
ConversationSchema.methods.updateTitleFromFirstMessage = function () {
  if (this.title === "New Chat" && this.messages.length > 0) {
    const firstUserMessage = this.messages.find(
      (msg: IMessage) => msg.role === "user"
    );
    if (firstUserMessage) {
      // Generate title from first 50 characters
      let title = firstUserMessage.content.trim().substring(0, 50);
      if (firstUserMessage.content.length > 50) {
        // Try to cut at word boundary
        const lastSpace = title.lastIndexOf(" ");
        if (lastSpace > 20) {
          title = title.substring(0, lastSpace) + "...";
        } else {
          title += "...";
        }
      }
      this.title = title;
    }
  }
};

// Method to add a message
ConversationSchema.methods.addMessage = function (message: Partial<IMessage>) {
  const newMessage: IMessage = {
    id:
      message.id ||
      `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    role: message.role!,
    content: message.content!,
    timestamp: message.timestamp || new Date(),
    attachments: message.attachments || [],
  };

  this.messages.push(newMessage);
  this.updateTitleFromFirstMessage();
  return newMessage;
};

// Static method to create a new conversation
ConversationSchema.statics.createNew = function (userId: string) {
  return new this({
    id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    title: "New Chat",
    messages: [],
    userId: userId,
  });
};

// Static method to find conversations with pagination
ConversationSchema.statics.findWithPagination = function (
  userId: string,
  limit = 50,
  offset = 0
) {
  return this.find({ userId })
    .sort({ lastMessageAt: -1, createdAt: -1 })
    .skip(offset)
    .limit(limit)
    .select("id title createdAt updatedAt messageCount lastMessageAt userId")
    .lean();
};

// Export the model
const Conversation =
  (mongoose.models.Conversation as IConversationModel) ||
  mongoose.model<IConversation, IConversationModel>(
    "Conversation",
    ConversationSchema
  );
export default Conversation;
