import { createMem0Client, ChatMemory } from "./config";

export class Mem0Service {
  private client: any;
  private initError: string | null = null;

  constructor() {
    try {
      this.client = createMem0Client();
      if (!this.client) {
        this.initError = "Failed to create Mem0 client - check API key and package installation";
      }
    } catch (error) {
      this.initError = `Mem0 initialization error: ${
        error instanceof Error ? error.message : "Unknown error"
      }`;
      this.client = null;
    }
  }

  isAvailable(): boolean {
    return this.client !== null;
  }

  getInitError(): string | null {
    return this.initError;
  }

  async addMemory(
    message: string | any[],
    userId: string,
    conversationId?: string,
    metadata?: ChatMemory["metadata"]
  ): Promise<{ success: boolean; memoryId?: string; error?: string }> {
    if (!this.client) {
      return {
        success: false,
        error: this.initError || "Mem0 client not available",
      };
    }

    try {
      let messages;
      if (typeof message === "string") {
        messages = [{ role: "user", content: message }];
      } else {
        messages = message;
      }

      const options: any = { user_id: userId };
      if (conversationId) {
        options.conversation_id = conversationId;
      }
      if (metadata) {
        options.metadata = {
          ...metadata,
          timestamp: new Date().toISOString(),
          conversation_id: conversationId, // Explicitly store conversation ID in metadata
        };
      } else if (conversationId) {
        // Ensure conversation_id is always in metadata
        options.metadata = {
          timestamp: new Date().toISOString(),
          conversation_id: conversationId,
        };
      }

      const response = await this.client.add(messages, options);

      return {
        success: true,
        memoryId: response.id || response.memory_id || response.message,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Search memories for a user within a specific conversation only
  async searchConversationMemories(
    query: string,
    userId: string,
    conversationId: string,
    limit: number = 10
  ): Promise<{ success: boolean; memories?: any[]; error?: string }> {
    if (!this.client) {
      return {
        success: false,
        error: this.initError || "Mem0 client not available",
      };
    }

    try {
      // First get conversation memories, then filter by search query locally
      const conversationResult = await this.getConversationMemories(
        conversationId,
        userId,
        limit * 2 // Get more to filter locally
      );

      if (!conversationResult.success || !conversationResult.memories) {
        return { success: true, memories: [] };
      }

      // Filter memories that match the query
      const filteredMemories = conversationResult.memories.filter(memory => {
        const content = memory.text || memory.memory || memory.content || '';
        return content.toLowerCase().includes(query.toLowerCase());
      }).slice(0, limit);

      return {
        success: true,
        memories: filteredMemories,
      };
    } catch (error) {
      console.error('Error searching conversation memories:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async searchMemories(
    query: string,
    userId: string,
    limit: number = 10
  ): Promise<{ success: boolean; memories?: any[]; error?: string }> {
    if (!this.client) {
      return {
        success: false,
        error: this.initError || "Mem0 client not available",
      };
    }

    try {
      const options = { user_id: userId, limit };
      const response = await this.client.search(query, options);

      return {
        success: true,
        memories: response.results || response || [],
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async getUserMemories(
    userId: string,
    limit: number = 50
  ): Promise<{ success: boolean; memories?: any[]; error?: string }> {
    if (!this.client) {
      return {
        success: false,
        error: this.initError || "Mem0 client not available",
      };
    }

    try {
      const options = { user_id: userId, limit };
      const response = await this.client.getAll(options);

      return {
        success: true,
        memories: response.results || response || [],
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async getConversationMemories(
    conversationId: string,
    userId: string,
    limit: number = 20
  ): Promise<{ success: boolean; memories?: any[]; error?: string }> {
    if (!this.client) {
      return {
        success: false,
        error: this.initError || "Mem0 client not available",
      };
    }

    try {
      const options = {
        user_id: userId,
        conversation_id: conversationId,
        limit,
      };
      const response = await this.client.getAll(options);

      return {
        success: true,
        memories: response.results || response || [],
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async deleteMemory(memoryId: string): Promise<{ success: boolean; error?: string }> {
    if (!this.client) {
      return {
        success: false,
        error: this.initError || "Mem0 client not available",
      };
    }

    try {
      await this.client.delete(memoryId);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async getRelevantMemories(
    currentMessage: string,
    userId: string,
    conversationId: string,
    limit: number = 5
  ): Promise<string[]> {
    if (!this.client) {
      return [];
    }

    try {
      // Get all user memories and filter client-side for conversation isolation
      // This is more reliable than depending on Mem0's conversation_id filtering
      const allMemoriesResult = await this.getUserMemories(userId, 50);

      if (!allMemoriesResult.success || !allMemoriesResult.memories) {
        return [];
      }

      // Filter memories that belong to this specific conversation
      const conversationMemories = allMemoriesResult.memories.filter(memory => {
        const memoryConvId = memory.metadata?.conversation_id;
        return memoryConvId === conversationId;
      });

      // Extract and return memory content
      const relevantMemories = conversationMemories
        .slice(0, limit)
        .map((memory) => memory.text || memory.memory || memory.content)
        .filter(Boolean);

      console.log(`Retrieved ${relevantMemories.length} memories from conversation ${conversationId} (filtered from ${allMemoriesResult.memories.length} total)`);
      return relevantMemories;
    } catch (error) {
      console.error('Error getting relevant memories:', error);
      return [];
    }
  }

  // Optional: Method to get global user memories across conversations
  // (not used by default to ensure fresh conversations)
  async getGlobalUserMemories(
    currentMessage: string,
    userId: string,
    conversationId: string,
    limit: number = 5
  ): Promise<string[]> {
    if (!this.client) {
      return [];
    }

    try {
      const searchResult = await this.searchMemories(currentMessage, userId, limit);

      if (!searchResult.success || !searchResult.memories) {
        return [];
      }

      const conversationResult = await this.getConversationMemories(
        conversationId,
        userId,
        Math.max(3, limit - searchResult.memories.length)
      );

      const allMemories = [
        ...(searchResult.memories || []),
        ...(conversationResult.memories || []),
      ];

      const uniqueMemories = Array.from(
        new Map(allMemories.map((m) => [m.id, m])).values()
      );

      return uniqueMemories
        .slice(0, limit)
        .map((memory) => memory.text || memory.memory || memory.content)
        .filter(Boolean);
    } catch (error) {
      return [];
    }
  }
}

export const mem0Service = new Mem0Service();
