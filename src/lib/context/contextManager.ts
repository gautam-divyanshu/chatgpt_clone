// Enhanced Context Window Management
import { ChatMessage } from "@/components/chat/types";
import { UploadedFile } from "@/components/chat/upload-types";

export interface ContextConfig {
  maxTokens: number;
  tokensPerChar: number;
  minMessagesIncluded: number;
  preserveSystemMessages: boolean;
  prioritizeRecentMessages: boolean;
  summarizeOlderMessages: boolean;
}

export interface PreparedMessage {
  role: "user" | "assistant" | "system";
  content: string;
  attachments?: UploadedFile[];
  tokenCount?: number;
  isOriginal?: boolean;
  isSummary?: boolean;
}

export interface ContextStats {
  totalTokens: number;
  messagesIncluded: number;
  messagesExcluded: number;
  messagesSummarized: number;
  hasReachedLimit: boolean;
}

export class ContextManager {
  private config: ContextConfig;

  constructor(config: Partial<ContextConfig> = {}) {
    this.config = {
      maxTokens: 4000,
      tokensPerChar: 0.25,
      minMessagesIncluded: 4, // Always include at least 4 messages
      preserveSystemMessages: true,
      prioritizeRecentMessages: true,
      summarizeOlderMessages: false, // Enable for advanced summarization
      ...config,
    };
  }

  /**
   * Prepare conversation context with intelligent message selection
   */
  prepareContext(
    conversationHistory: ChatMessage[],
    currentPrompt: string,
    systemPrompt?: string
  ): { messages: PreparedMessage[]; stats: ContextStats } {
    const filteredHistory = this.filterValidMessages(conversationHistory);
    
    // Calculate token budget
    const currentPromptTokens = this.estimateTokens(currentPrompt);
    const systemPromptTokens = systemPrompt ? this.estimateTokens(systemPrompt) : 0;
    const availableTokens = this.config.maxTokens - currentPromptTokens - systemPromptTokens;

    let totalTokens = currentPromptTokens + systemPromptTokens;
    const preparedMessages: PreparedMessage[] = [];
    let messagesIncluded = 0;
    let messagesExcluded = 0;
    let messagesSummarized = 0;

    // Add system prompt if provided
    if (systemPrompt) {
      preparedMessages.push({
        role: "system",
        content: systemPrompt,
        tokenCount: systemPromptTokens,
        isOriginal: true,
      });
    }

    // Strategy 1: Include recent messages first
    if (this.config.prioritizeRecentMessages) {
      const result = this.includeRecentMessages(
        filteredHistory,
        availableTokens,
        totalTokens
      );
      
      preparedMessages.push(...result.messages);
      totalTokens = result.totalTokens;
      messagesIncluded = result.messagesIncluded;
      messagesExcluded = filteredHistory.length - messagesIncluded;
    }

    // Strategy 2: Summarize older messages if enabled and space allows
    if (this.config.summarizeOlderMessages && messagesExcluded > 0) {
      const excludedMessages = filteredHistory.slice(0, messagesExcluded);
      const summary = this.summarizeMessages(excludedMessages);
      const summaryTokens = this.estimateTokens(summary.content);

      if (summaryTokens < availableTokens - (totalTokens - systemPromptTokens)) {
        preparedMessages.splice(-messagesIncluded, 0, summary);
        totalTokens += summaryTokens;
        messagesSummarized = excludedMessages.length;
      }
    }

    // Add current prompt
    preparedMessages.push({
      role: "user",
      content: currentPrompt,
      tokenCount: currentPromptTokens,
      isOriginal: true,
    });

    const stats: ContextStats = {
      totalTokens,
      messagesIncluded,
      messagesExcluded,
      messagesSummarized,
      hasReachedLimit: totalTokens >= this.config.maxTokens * 0.9, // 90% threshold
    };

    return { messages: preparedMessages, stats };
  }

  /**
   * Filter out invalid messages (streaming, empty, etc.)
   */
  private filterValidMessages(messages: ChatMessage[]): ChatMessage[] {
    return messages.filter(msg => 
      !msg.isStreaming && 
      msg.content.trim().length > 0 &&
      msg.status !== "error"
    );
  }

  /**
   * Include recent messages within token budget
   */
  private includeRecentMessages(
    history: ChatMessage[],
    availableTokens: number,
    currentTotalTokens: number
  ): { messages: PreparedMessage[]; totalTokens: number; messagesIncluded: number } {
    const messages: PreparedMessage[] = [];
    let totalTokens = currentTotalTokens;
    let messagesIncluded = 0;

    // Reverse to start from most recent
    const reversedHistory = [...history].reverse();

    for (const msg of reversedHistory) {
      const messageTokens = this.estimateTokens(msg.content);
      
      // Check if we can include this message
      if (totalTokens + messageTokens <= this.config.maxTokens) {
        const preparedMsg: PreparedMessage = {
          role: msg.isUser ? "user" : "assistant",
          content: msg.content,
          tokenCount: messageTokens,
          isOriginal: true,
        };

        // Include attachments for user messages
        if (msg.isUser && msg.attachments && msg.attachments.length > 0) {
          preparedMsg.attachments = msg.attachments;
        }

        messages.unshift(preparedMsg); // Add to beginning to maintain order
        totalTokens += messageTokens;
        messagesIncluded++;
      } else {
        // Check minimum messages requirement
        if (messagesIncluded < this.config.minMessagesIncluded) {
          // Force include essential messages even if over budget
          const preparedMsg: PreparedMessage = {
            role: msg.isUser ? "user" : "assistant",
            content: this.truncateMessage(msg.content, availableTokens - totalTokens),
            tokenCount: Math.min(messageTokens, availableTokens - totalTokens),
            isOriginal: false, // Mark as modified
          };

          messages.unshift(preparedMsg);
          totalTokens += preparedMsg.tokenCount!;
          messagesIncluded++;
        }
        break;
      }
    }

    return { messages, totalTokens, messagesIncluded };
  }

  /**
   * Summarize older messages that don't fit in context
   */
  private summarizeMessages(messages: ChatMessage[]): PreparedMessage {
    const messageCount = messages.length;
    const userMessages = messages.filter(m => m.isUser).length;
    const assistantMessages = messages.filter(m => !m.isUser).length;
    
    // Create a brief summary
    const summary = `[Earlier conversation summary: ${messageCount} messages exchanged (${userMessages} from user, ${assistantMessages} responses). Key topics and context available if needed.]`;
    
    return {
      role: "system",
      content: summary,
      tokenCount: this.estimateTokens(summary),
      isOriginal: false,
      isSummary: true,
    };
  }

  /**
   * Truncate a message to fit within token limit
   */
  private truncateMessage(content: string, maxTokens: number): string {
    const maxChars = Math.floor(maxTokens / this.config.tokensPerChar);
    
    if (content.length <= maxChars) {
      return content;
    }

    // Truncate and add indicator
    const truncated = content.substring(0, maxChars - 20);
    return truncated + "... [truncated]";
  }

  /**
   * Estimate token count for text
   */
  private estimateTokens(text: string): number {
    return Math.ceil(text.length * this.config.tokensPerChar);
  }

  /**
   * Get context window utilization info
   */
  getContextInfo(messages: PreparedMessage[]): {
    totalTokens: number;
    utilization: number;
    remainingTokens: number;
    canFitMore: boolean;
  } {
    const totalTokens = messages.reduce((sum, msg) => sum + (msg.tokenCount || 0), 0);
    const utilization = (totalTokens / this.config.maxTokens) * 100;
    const remainingTokens = this.config.maxTokens - totalTokens;

    return {
      totalTokens,
      utilization,
      remainingTokens,
      canFitMore: remainingTokens > 100, // Buffer for safety
    };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<ContextConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration
   */
  getConfig(): ContextConfig {
    return { ...this.config };
  }
}

// Model-specific context configurations
export const MODEL_CONFIGS: Record<string, Partial<ContextConfig>> = {
  "gemini-1.5-flash": {
    maxTokens: 1000000, // Gemini 1.5 Flash has 1M token context
    tokensPerChar: 0.25,
    minMessagesIncluded: 10,
    summarizeOlderMessages: false, // Not needed with large context
  },
  "gemini-1.5-pro": {
    maxTokens: 2000000, // Gemini 1.5 Pro has 2M token context
    tokensPerChar: 0.25,
    minMessagesIncluded: 20,
    summarizeOlderMessages: false,
  },
  "gpt-3.5-turbo": {
    maxTokens: 4096,
    tokensPerChar: 0.25,
    minMessagesIncluded: 4,
    summarizeOlderMessages: true,
  },
  "gpt-4": {
    maxTokens: 8192,
    tokensPerChar: 0.25,
    minMessagesIncluded: 6,
    summarizeOlderMessages: true,
  },
  "claude-3-haiku": {
    maxTokens: 200000,
    tokensPerChar: 0.25,
    minMessagesIncluded: 15,
    summarizeOlderMessages: false,
  },
  "claude-3-sonnet": {
    maxTokens: 200000,
    tokensPerChar: 0.25,
    minMessagesIncluded: 15,
    summarizeOlderMessages: false,
  },
};

// Default context manager instance
export const defaultContextManager = new ContextManager(MODEL_CONFIGS["gemini-1.5-flash"]);
