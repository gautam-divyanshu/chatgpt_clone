import { createMem0Client, ChatMemory } from "./config";

export class Mem0Service {
  private client: any;
  private initError: string | null = null;

  constructor() {
    try {
      this.client = createMem0Client();
      if (!this.client) {
        this.initError =
          "Failed to create Mem0 client - check API key and package installation";
      }
    } catch (error) {
      this.initError = `Mem0 initialization error: ${
        error instanceof Error ? error.message : "Unknown error"
      }`;
      this.client = null;
    }
  }

  // Check if Mem0 is available
  isAvailable(): boolean {
    return this.client !== null;
  }

  // Get initialization error if any
  getInitError(): string | null {
    return this.initError;
  }

  // Remove debug method since we don't need it
  // getStatus() method removed

  // Add memory for a user and conversation
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
      // Convert single message to messages format if needed
      let messages;
      if (typeof message === "string") {
        messages = [{ role: "user", content: message }];
      } else {
        messages = message;
      }

      // Prepare options according to mem0ai format
      const options: any = { user_id: userId };
      if (conversationId) {
        options.conversation_id = conversationId;
      }
      if (metadata) {
        options.metadata = {
          timestamp: new Date().toISOString(),
          ...metadata,
        };
      }

      const response = await this.client.add(messages, options);
      console.log("Memory added successfully:", response);

      return {
        success: true,
        memoryId: response.id || response.memory_id || response.message,
      };
    } catch (error) {
      console.error("Error adding memory:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Search memories for a user
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
      console.log("Search response:", response);

      return {
        success: true,
        memories: response.results || response || [],
      };
    } catch (error) {
      console.error("Error searching memories:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Get all memories for a user
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
      console.log("GetAll response:", response);

      return {
        success: true,
        memories: response.results || response || [],
      };
    } catch (error) {
      console.error("Error getting user memories:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Get memories for a specific conversation
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
      console.log("Conversation memories response:", response);

      return {
        success: true,
        memories: response.results || response || [],
      };
    } catch (error) {
      console.error("Error getting conversation memories:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Delete a specific memory
  async deleteMemory(
    memoryId: string
  ): Promise<{ success: boolean; error?: string }> {
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
      console.error("Error deleting memory:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Extract relevant memories for context injection
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
      // Search for relevant memories based on current message
      const searchResult = await this.searchMemories(
        currentMessage,
        userId,
        limit
      );

      if (!searchResult.success || !searchResult.memories) {
        return [];
      }

      // Also get recent conversation memories
      const conversationResult = await this.getConversationMemories(
        conversationId,
        userId,
        Math.max(3, limit - searchResult.memories.length)
      );

      const allMemories = [
        ...(searchResult.memories || []),
        ...(conversationResult.memories || []),
      ];

      // Remove duplicates and format for context
      const uniqueMemories = Array.from(
        new Map(allMemories.map((m) => [m.id, m])).values()
      );

      return uniqueMemories
        .slice(0, limit)
        .map((memory) => memory.text || memory.memory || memory.content)
        .filter(Boolean);
    } catch (error) {
      console.error("Error getting relevant memories:", error);
      return [];
    }
  }
}

// Export singleton instance
export const mem0Service = new Mem0Service();
