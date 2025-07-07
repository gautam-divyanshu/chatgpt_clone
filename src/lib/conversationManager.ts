// src/lib/conversationManager.ts

export interface ChatAttachment {
  originalName: string;
  cloudinaryUrl: string;
  cloudinaryPublicId: string;
  fileType: string;
  fileSize: number;
  isImage: boolean;
  uploadedAt: Date;
}

interface ServerAttachment {
  originalName: string;
  cloudinaryUrl: string;
  cloudinaryPublicId: string;
  fileType: string;
  fileSize: number;
  isImage: boolean;
  uploadedAt: string;
}

interface ServerMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
  attachments?: ServerAttachment[];
}

interface CreateConversationRequest {
  title?: string;
  firstMessage?: ServerMessage;
}

interface UpdateConversationRequest {
  messages: ServerMessage[];
  title?: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: string;
  attachments?: ChatAttachment[];
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  lastMessageAt: string;
  messages?: ChatMessage[];
}

export class ConversationManager {
  private static readonly API_BASE = '/api/conversations';

  // Transform server message format to client format
  private static transformMessage(serverMessage: ServerMessage): ChatMessage {
    return {
      id: serverMessage.id,
      content: serverMessage.content,
      isUser: serverMessage.role === 'user',
      timestamp: serverMessage.timestamp,
      attachments: serverMessage.attachments?.map((att: ServerAttachment) => ({
        originalName: att.originalName,
        cloudinaryUrl: att.cloudinaryUrl,
        cloudinaryPublicId: att.cloudinaryPublicId,
        fileType: att.fileType,
        fileSize: att.fileSize,
        isImage: att.isImage,
        uploadedAt: new Date(att.uploadedAt)
      })) || []
    };
  }

  // Transform client message format to server format
  private static transformMessageToServer(clientMessage: ChatMessage): ServerMessage {
    return {
      id: clientMessage.id,
      role: clientMessage.isUser ? 'user' : 'assistant',
      content: clientMessage.content,
      timestamp: clientMessage.timestamp,
      attachments: clientMessage.attachments?.map(att => ({
        originalName: att.originalName,
        cloudinaryUrl: att.cloudinaryUrl,
        cloudinaryPublicId: att.cloudinaryPublicId,
        fileType: att.fileType,
        fileSize: att.fileSize,
        isImage: att.isImage,
        uploadedAt: att.uploadedAt.toISOString()
      })) || []
    };
  }

  // Get all conversations (list view)
  static async getAllConversations(limit = 50, offset = 0): Promise<Conversation[]> {
    try {
      const response = await fetch(`${this.API_BASE}?limit=${limit}&offset=${offset}`);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch conversations');
      }
      
      return data.conversations;
    } catch (error) {
      console.error('Error fetching conversations:', error);
      return [];
    }
  }

  // Get a specific conversation with full messages
  static async getConversation(id: string): Promise<Conversation | null> {
    try {
      const response = await fetch(`${this.API_BASE}/${id}`);
      const data = await response.json();
      
      if (!data.success) {
        if (response.status === 404) return null;
        throw new Error(data.error || 'Failed to fetch conversation');
      }
      
      const conversation = data.conversation;
      return {
        ...conversation,
        messages: conversation.messages?.map(this.transformMessage) || []
      };
    } catch (error) {
      console.error('Error fetching conversation:', error);
      return null;
    }
  }

  // Create a new conversation
  static async createNewConversation(title?: string, firstMessage?: ChatMessage): Promise<Conversation | null> {
    try {
      const requestBody: CreateConversationRequest = {};
      
      if (title) {
        requestBody.title = title;
      }
      
      if (firstMessage) {
        requestBody.firstMessage = this.transformMessageToServer(firstMessage);
      }
      
      const response = await fetch(this.API_BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to create conversation');
      }
      
      return data.conversation;
    } catch (error) {
      console.error('Error creating conversation:', error);
      return null;
    }
  }

  // Update conversation with new messages
  static async updateConversation(conversationId: string, messages: ChatMessage[], title?: string): Promise<boolean> {
    try {
      const serverMessages = messages.map(this.transformMessageToServer);
      
      const requestBody: UpdateConversationRequest = { messages: serverMessages };
      if (title) {
        requestBody.title = title;
      }
      
      const response = await fetch(`${this.API_BASE}/${conversationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to update conversation');
      }
      
      return true;
    } catch (error) {
      console.error('Error updating conversation:', error);
      return false;
    }
  }

  // Add a single message to conversation
  static async addMessage(conversationId: string, message: ChatMessage): Promise<boolean> {
    try {
      const serverMessage = this.transformMessageToServer(message);
      
      const response = await fetch(`${this.API_BASE}/${conversationId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(serverMessage),
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to add message');
      }
      
      return true;
    } catch (error) {
      console.error('Error adding message:', error);
      return false;
    }
  }

  // Delete a conversation
  static async deleteConversation(id: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.API_BASE}/${id}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to delete conversation');
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting conversation:', error);
      return false;
    }
  }

  // Upload file and get attachment data
  static async uploadFile(file: File): Promise<ChatAttachment | null> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to upload file');
      }
      
      const fileData = data.file;
      
      return {
        originalName: fileData.originalName,
        cloudinaryUrl: fileData.url,
        cloudinaryPublicId: fileData.id,
        fileType: fileData.type,
        fileSize: fileData.size,
        isImage: fileData.isImage,
        uploadedAt: new Date(fileData.createdAt)
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      return null;
    }
  }

  // Create message with attachments
  static createMessage(content: string, isUser: boolean, attachments?: ChatAttachment[]): ChatMessage {
    return {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      content,
      isUser,
      timestamp: new Date().toISOString(),
      attachments: attachments || []
    };
  }

  // Utility: Format file size
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Utility: Format timestamp
  static formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  }

  // Utility: Get conversation preview text
  static getConversationPreview(messages: ChatMessage[], maxLength = 60): string {
    const lastUserMessage = messages.filter(msg => msg.isUser).pop();
    if (lastUserMessage) {
      const content = lastUserMessage.content.trim();
      if (content.length <= maxLength) return content;
      return content.substring(0, maxLength) + '...';
    }
    return 'No messages yet';
  }
}
