import { createMem0Client, ChatMemory } from "./config";

export class Mem0Service {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  isAvailable(): boolean {
    return this.client !== null;
  }

  getInitError(): string | null {
    return this.initError;
  }

  /**
   * Enhanced memory addition with v2 contextual features
   */
  async addMemory(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    message: string | any[],
    userId: string,
    conversationId?: string,
    metadata?: ChatMemory["metadata"] & { isAuthenticated?: boolean }
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

      // Determine memory scope based on content analysis
      const memoryScope = this.analyzeMemoryScope(messages, metadata);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const options: any = {
        user_id: userId,
        version: "v2", // Use v2 for better contextual memory
      };

      // Use run_id for conversation-specific memories, omit for global memories
      if (memoryScope.scope === "conversation" && conversationId) {
        options.run_id = conversationId;
      }

      // Enhanced metadata with memory classification
      if (metadata || conversationId || memoryScope.category) {
        options.metadata = {
          timestamp: new Date().toISOString(),
          category: memoryScope.category,
          scope: memoryScope.scope,
          importance: memoryScope.importance,
          isAuthenticated: metadata?.isAuthenticated || false,
          userType: metadata?.isAuthenticated ? 'authenticated' : 'anonymous',
          ...metadata,
          ...(conversationId && { source_conversation_id: conversationId }),
        };
      }

      // Add memory customization for better relevance
      if (memoryScope.scope === "conversation") {
        options.includes =
          "conversation context, current topic discussion, immediate references";
        options.excludes =
          "unrelated personal preferences, general facts not relevant to current topic";
      } else {
        options.includes =
          "important personal preferences, facts about the user, long-term information";
        options.excludes =
          "temporary conversation context, topic-specific details";
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

  /**
   * Analyze memory content to determine appropriate scope and classification
   */
  private analyzeMemoryScope(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    messages: any[],
    metadata?: ChatMemory["metadata"]
  ): {
    scope: "global" | "conversation";
    category: string;
    importance: "high" | "medium" | "low";
  } {
    const content = messages
      .map((m) => m.content)
      .join(" ")
      .toLowerCase();

    // Keywords that suggest global/persistent memory
    const globalKeywords = [
      "i am",
      "my name is",
      "i like",
      "i love",
      "i hate",
      "i prefer",
      "i always",
      "i never",
      "my favorite",
      "allergic to",
      "vegetarian",
      "i work at",
      "i live in",
      "my job",
      "my profession",
      "my family",
      "i was born",
      "my birthday",
      "my age",
    ];

    // Keywords that suggest conversation-specific memory
    const conversationKeywords = [
      "right now",
      "currently",
      "today",
      "this",
      "here",
      "that",
      "screenshot",
      "image",
      "document",
      "file",
      "upload",
      "show me",
      "look at",
      "analyze",
      "explain this",
    ];

    const hasGlobalKeywords = globalKeywords.some((keyword) =>
      content.includes(keyword)
    );
    const hasConversationKeywords = conversationKeywords.some((keyword) =>
      content.includes(keyword)
    );

    // Default to conversation scope for context-specific interactions
    let scope: "global" | "conversation" = "conversation";
    let category = "context";
    let importance: "high" | "medium" | "low" = "medium";

    if (hasGlobalKeywords && !hasConversationKeywords) {
      scope = "global";
      category = "preference";
      importance = "high";
    } else if (hasGlobalKeywords && hasConversationKeywords) {
      // Mixed content - prefer global for important personal info
      scope = "global";
      category = "fact";
      importance = "medium";
    }

    // Override with explicit metadata if provided
    if (metadata?.category) {
      category = metadata.category;
      if (metadata.category === "preference" || metadata.category === "fact") {
        scope = "global";
        importance = "high";
      }
    }

    return { scope, category, importance };
  }

  /**
   * Retrieves relevant memories for a user based on the current message.
   * This simplified approach queries all user memories and lets the memory service determine relevance.
   */
  async getRelevantMemories(
    currentMessage: string,
    userId: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    conversationId: string,
    limit: number = 5
  ): Promise<string[]> {
    if (!this.client) {
      return [];
    }

    try {
      // Search across all user memories for relevance
      const searchResult = await this.searchMemories(
        currentMessage,
        userId,
        limit,
        { rerank: true }
      );

      if (searchResult.success && searchResult.memories) {
        const memories = searchResult.memories
          .map((memory) => memory.text || memory.memory || memory.content)
          .filter(Boolean);
        
        console.log(`Retrieved ${memories.length} relevant memories for user ${userId}`);
        return memories;
      }

      return [];
    } catch (error) {
      console.error("Error getting relevant memories:", error);
      return [];
    }
  }

  /**
   * Enhanced search with advanced retrieval options
   */
  async searchMemories(
    query: string,
    userId: string,
    limit: number = 10,
    options: {
      keyword_search?: boolean;
      rerank?: boolean;
      filter_memories?: boolean;
    } = {}
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<{ success: boolean; memories?: any[]; error?: string }> {
    if (!this.client) {
      return {
        success: false,
        error: this.initError || "Mem0 client not available",
      };
    }

    try {
      const searchOptions = {
        user_id: userId,
        limit,
        ...options,
      };

      const response = await this.client.search(query, searchOptions);

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

  /**
   * Get memories specific to a conversation
   */
  async getConversationMemories(
    conversationId: string,
    userId: string,
    limit: number = 20
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        run_id: conversationId, // Use run_id for v2 API
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

  /**
   * Get all user memories (global scope)
   */
  async getUserMemories(
    userId: string,
    limit: number = 50
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  /**
   * Delete a specific memory
   */
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
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Migrate anonymous user memories to authenticated user
   */
  async migrateAnonymousMemories(
    anonymousUserId: string,
    authenticatedUserId: string
  ): Promise<{ success: boolean; migratedCount: number; error?: string }> {
    if (!this.client) {
      return {
        success: false,
        migratedCount: 0,
        error: this.initError || "Mem0 client not available",
      };
    }

    try {
      // Get all memories from the anonymous user
      const anonymousMemories = await this.getUserMemories(anonymousUserId);
      
      if (!anonymousMemories.success || !anonymousMemories.memories) {
        return { success: true, migratedCount: 0 };
      }

      console.log(`🔄 Migrating ${anonymousMemories.memories.length} memories from ${anonymousUserId} to ${authenticatedUserId}`);

      let migratedCount = 0;
      
      // Re-add each memory with the authenticated user ID
      for (const memory of anonymousMemories.memories) {
        try {
          const content = memory.text || memory.memory || memory.content;
          if (content) {
            const result = await this.addMemory(
              content,
              authenticatedUserId,
              undefined,
              {
                ...memory.metadata,
                migratedFrom: anonymousUserId,
                isAuthenticated: true,
                userType: 'authenticated',
                migrationDate: new Date().toISOString(),
              }
            );
            
            if (result.success) {
              migratedCount++;
              // Delete the original anonymous memory
              if (memory.id) {
                await this.deleteMemory(memory.id);
              }
            }
          }
        } catch (error) {
          console.warn(`Failed to migrate memory: ${error}`);
        }
      }

      console.log(`✅ Successfully migrated ${migratedCount} memories`);
      
      return {
        success: true,
        migratedCount,
      };
    } catch (error) {
      return {
        success: false,
        migratedCount: 0,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Legacy method for backward compatibility
   */
  async getGlobalUserMemories(
    currentMessage: string,
    userId: string,
    conversationId: string,
    limit: number = 5
  ): Promise<string[]> {
    console.warn(
      "getGlobalUserMemories is deprecated. Use getRelevantMemories instead."
    );
    return this.getRelevantMemories(
      currentMessage,
      userId,
      conversationId,
      limit
    );
  }
}

export const mem0Service = new Mem0Service();
