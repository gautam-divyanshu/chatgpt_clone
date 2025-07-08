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
   * Smart memory retrieval that considers conversation context and relevance
   */
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
      // Analyze current message to determine what type of memories to retrieve
      const messageContext = this.analyzeMessageContext(currentMessage);

      const relevantMemories: string[] = [];

      // Special handling for direct personal information queries
      if (this.isDirectPersonalQuery(currentMessage)) {
        console.log(
          "🔍 Direct personal query detected - retrieving all user memories"
        );
        const allUserMemories = await this.getUserMemories(userId, limit * 2);

        if (allUserMemories.success && allUserMemories.memories) {
          return allUserMemories.memories
            .map((memory) => memory.text || memory.memory || memory.content)
            .filter(Boolean)
            .slice(0, limit);
        }
      }

      // Strategy 1: Get conversation-specific memories first (if contextually relevant)
      if (messageContext.needsConversationContext) {
        const conversationMemories = await this.getConversationMemories(
          conversationId,
          userId,
          Math.min(3, limit)
        );

        if (conversationMemories.success && conversationMemories.memories) {
          const contextMemories = conversationMemories.memories
            .map((memory) => memory.text || memory.memory || memory.content)
            .filter(Boolean)
            .slice(0, 2); // Limit conversation context

          relevantMemories.push(...contextMemories);
        }
      }

      // Strategy 2: Get global memories only if truly relevant
      if (
        messageContext.needsGlobalMemories &&
        relevantMemories.length < limit
      ) {
        const remainingLimit = limit - relevantMemories.length;
        const globalSearchResult = await this.searchMemories(
          currentMessage,
          userId,
          remainingLimit,
          {
            keyword_search: true, // Enable keyword search for better matching
            filter_memories: true, // Filter for higher precision
            rerank: true, // Rerank for better relevance
          }
        );

        if (globalSearchResult.success && globalSearchResult.memories) {
          const globalMemories = globalSearchResult.memories
            .map((memory) => memory.text || memory.memory || memory.content)
            .filter(Boolean)
            .filter((memory) => this.isMemoryRelevant(memory, currentMessage))
            .slice(0, remainingLimit);

          relevantMemories.push(...globalMemories);
        }
      }

      console.log(
        `Retrieved ${relevantMemories.length} contextually relevant memories for user ${userId}`
      );
      console.log("Memory context analysis:", messageContext);

      return relevantMemories;
    } catch (error) {
      console.error("Error getting relevant memories:", error);
      return [];
    }
  }

  /**
   * Analyze message to determine what type of context is needed
   */
  private analyzeMessageContext(message: string): {
    needsConversationContext: boolean;
    needsGlobalMemories: boolean;
    contextType: "reference" | "personal" | "general" | "technical";
  } {
    const lowerMessage = message.toLowerCase();

    // Indicators that conversation context is needed
    const conversationIndicators = [
      "this",
      "that",
      "it",
      "here",
      "there",
      "above",
      "below",
      "screenshot",
      "image",
      "document",
      "file",
      "what you see",
      "analyze",
      "explain this",
      "about this",
      "regarding this",
    ];

    // Indicators that global memories might be relevant
    const personalIndicators = [
      "i like",
      "i prefer",
      "my favorite",
      "recommend",
      "suggest",
      "what should i",
      "help me",
      "my",
      "for me",
      "about me",
      "what do you know about me",
      "tell me about myself",
      "what do you remember",
      "what have i told you",
      "my information",
      "my details",
      "my preferences",
      "remind me",
      "what did i say",
      "personal information",
    ];

    // Technical/general questions that don't need personal context
    const technicalIndicators = [
      "how to",
      "what is",
      "explain",
      "define",
      "difference between",
      "why does",
      "when should",
      "where can",
      "which is better",
    ];

    const needsConversationContext = conversationIndicators.some((indicator) =>
      lowerMessage.includes(indicator)
    );

    const needsGlobalMemories =
      personalIndicators.some((indicator) =>
        lowerMessage.includes(indicator)
      ) &&
      !technicalIndicators.some((indicator) =>
        lowerMessage.includes(indicator)
      );

    let contextType: "reference" | "personal" | "general" | "technical" =
      "general";

    if (needsConversationContext) {
      contextType = "reference";
    } else if (needsGlobalMemories) {
      contextType = "personal";
    } else if (
      technicalIndicators.some((indicator) => lowerMessage.includes(indicator))
    ) {
      contextType = "technical";
    }

    return {
      needsConversationContext,
      needsGlobalMemories,
      contextType,
    };
  }

  /**
   * Check if this is a direct personal information query
   */
  private isDirectPersonalQuery(message: string): boolean {
    const lowerMessage = message.toLowerCase();

    const directPersonalQueries = [
      "what do you know about me",
      "tell me about myself",
      "what do you remember about me",
      "what have i told you",
      "what information do you have",
      "my information",
      "my details",
      "what are my preferences",
      "remind me about myself",
      "what did i tell you about me",
      "personal information",
      "about me",
    ];

    return directPersonalQueries.some(
      (query) =>
        lowerMessage.includes(query) ||
        (lowerMessage.includes("what") &&
          lowerMessage.includes("know") &&
          lowerMessage.includes("me")) ||
        (lowerMessage.includes("tell") &&
          lowerMessage.includes("about") &&
          lowerMessage.includes("me")) ||
        (lowerMessage.includes("remember") && lowerMessage.includes("me"))
    );
  }

  /**
   * Check if a memory is actually relevant to the current message
   */
  private isMemoryRelevant(memory: string, currentMessage: string): boolean {
    const memoryLower = memory.toLowerCase();
    const messageLower = currentMessage.toLowerCase();

    // Check for keyword overlap
    const messageWords = messageLower
      .split(/\s+/)
      .filter((word) => word.length > 3);
    const memoryWords = memoryLower.split(/\s+/);

    const overlap = messageWords.filter((word) =>
      memoryWords.some(
        (memWord) => memWord.includes(word) || word.includes(memWord)
      )
    );

    // Require significant overlap for relevance
    const relevanceThreshold = Math.max(
      1,
      Math.floor(messageWords.length * 0.2)
    );

    return overlap.length >= relevanceThreshold;
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
