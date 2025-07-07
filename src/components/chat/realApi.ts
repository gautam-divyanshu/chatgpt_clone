import { ChatMessage } from "./types";
import { UploadedFile } from "./upload-types";
import { CHAT_CONFIG, API_CONFIG } from "@/config";
import { generateUserId, generateConversationId } from "@/lib/utils";

interface StreamConfig {
  retryAttempts?: number;
  retryDelay?: number;
  timeoutMs?: number;
}

export const streamResponse = async (
  prompt: string,
  messageId: string,
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  controller: AbortController,
  conversationHistory: ChatMessage[] = [],
  config: StreamConfig = {},
  attachments: UploadedFile[] = [],
  userId?: string,
  conversationId?: string
): Promise<void> => {
  const {
    retryAttempts = CHAT_CONFIG.DEFAULT_RETRY_ATTEMPTS,
    retryDelay = CHAT_CONFIG.DEFAULT_RETRY_DELAY,
    timeoutMs = CHAT_CONFIG.DEFAULT_TIMEOUT,
  } = config;
  let attempt = 0;

  const attemptRequest = async (): Promise<void> => {
    try {
      const apiMessages = prepareConversationContext(
        conversationHistory,
        prompt
      );

      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("Request timeout")), timeoutMs);
      });

      const requestBody = {
        messages: apiMessages,
        attachments: attachments,
        userId: userId || generateUserId(),
        conversationId: conversationId || generateConversationId(),
      };

      const fetchPromise = fetch(API_CONFIG.CHAT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      const response = await Promise.race([fetchPromise, timeoutPromise]);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `HTTP ${response.status}: ${errorData.error || "Unknown error"}`
        );
      }

      if (!response.body) {
        throw new Error("No response body");
      }

      await processStream(response.body, messageId, setMessages, controller);
    } catch (error: unknown) {
      if ((error as Error).name === "AbortError" || controller.signal.aborted) {
        return;
      }

      if (
        attempt < retryAttempts - 1 &&
        !controller.signal.aborted &&
        isRetryableError(error)
      ) {
        attempt++;

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId
              ? {
                  ...msg,
                  content: `Retrying... (${attempt}/${retryAttempts})`,
                  status: "retrying",
                }
              : msg
          )
        );

        await new Promise((resolve) => setTimeout(resolve, retryDelay));
        return attemptRequest();
      } else {
        throw error;
      }
    }
  };

  try {
    await attemptRequest();

    if (!controller.signal.aborted) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? { ...msg, isStreaming: false, status: "sent" }
            : msg
        )
      );
    }
  } catch (error: unknown) {
    if ((error as Error).name === "AbortError" || controller.signal.aborted) {
      return;
    }

    const errorMessage = getErrorMessage(error);

    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId
          ? {
              ...msg,
              content: errorMessage,
              isStreaming: false,
              status: "error",
            }
          : msg
      )
    );
  } finally {
    if (!controller.signal.aborted) {
      setIsLoading(false);
    }
  }
};

function prepareConversationContext(
  conversationHistory: ChatMessage[],
  currentPrompt: string
): Array<{
  role: "user" | "assistant";
  content: string;
  attachments?: UploadedFile[];
}> {
  const maxContextTokens = CHAT_CONFIG.MAX_CONTEXT_TOKENS;
  const estimatedTokensPerChar = CHAT_CONFIG.TOKENS_PER_CHAR;

  let totalTokens = currentPrompt.length * estimatedTokensPerChar;
  const contextMessages: Array<{
    role: "user" | "assistant";
    content: string;
    attachments?: UploadedFile[];
  }> = [];

  const reversedHistory = [...conversationHistory]
    .filter((msg) => !msg.isStreaming && msg.content.trim())
    .reverse();

  for (const msg of reversedHistory) {
    const messageTokens = msg.content.length * estimatedTokensPerChar;

    if (totalTokens + messageTokens > maxContextTokens) {
      break;
    }

    const contextMessage: {
      role: "user" | "assistant";
      content: string;
      attachments?: UploadedFile[];
    } = {
      role: msg.isUser ? "user" : "assistant",
      content: msg.content,
    };

    if (msg.isUser && msg.attachments && msg.attachments.length > 0) {
      contextMessage.attachments = msg.attachments;
    }

    contextMessages.unshift(contextMessage);
    totalTokens += messageTokens;
  }

  const lastMessage = conversationHistory[conversationHistory.length - 1];
  if (!lastMessage || lastMessage.content !== currentPrompt) {
    contextMessages.push({
      role: "user",
      content: currentPrompt,
    });
  }

  return contextMessages;
}

async function processStream(
  body: ReadableStream<Uint8Array>,
  messageId: string,
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>,
  controller: AbortController
): Promise<void> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let currentContent = "";
  let buffer = "";

  try {
    while (true) {
      if (controller.signal.aborted) break;

      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (controller.signal.aborted) break;

        const trimmedLine = line.trim();
        if (!trimmedLine) continue;

        if (trimmedLine.startsWith("0:")) {
          const content = parseContentLine(trimmedLine.slice(2));
          if (content) {
            currentContent += content;
            updateMessageContent(messageId, currentContent, setMessages);
          }
        } else if (trimmedLine.startsWith("e:")) {
          break;
        }
      }
    }
  } catch (error: unknown) {
    if ((error as Error).name !== "AbortError") {
      throw error;
    }
  } finally {
    reader.releaseLock();
  }
}

function parseContentLine(line: string): string {
  try {
    if (line.startsWith('"') && line.endsWith('"')) {
      return JSON.parse(line);
    }
    return line;
  } catch {
    return line;
  }
}

let updateTimeout: NodeJS.Timeout | null = null;
function updateMessageContent(
  messageId: string,
  content: string,
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>
): void {
  if (updateTimeout) {
    clearTimeout(updateTimeout);
  }

  updateTimeout = setTimeout(() => {
    setMessages((prev) =>
      prev.map((msg) => (msg.id === messageId ? { ...msg, content } : msg))
    );
  }, CHAT_CONFIG.UPDATE_THROTTLE);
}

function isRetryableError(error: unknown): boolean {
  const retryableErrors = [
    "network error",
    "timeout",
    "rate limit",
    "temporary",
    "service unavailable",
    "failed to fetch",
    "connection",
  ];

  const errorMessage = (error as Error).message?.toLowerCase() || "";
  return retryableErrors.some((keyword) => errorMessage.includes(keyword));
}

function getErrorMessage(error: unknown): string {
  if ((error as Error).name === "AbortError") {
    return "Response cancelled";
  }

  const errorMsg = (error as Error).message?.toLowerCase() || "";

  if (errorMsg.includes("rate limit") || errorMsg.includes("quota")) {
    return "⚠️ Rate limit reached. Please wait a moment and try again.";
  }

  if (errorMsg.includes("timeout")) {
    return "⏱️ Request timed out. Please try again.";
  }

  if (errorMsg.includes("network") || errorMsg.includes("failed to fetch")) {
    return "🌐 Network error. Please check your connection and try again.";
  }

  if (errorMsg.includes("authentication") || errorMsg.includes("api key")) {
    return "🔑 Authentication error. Please check your API configuration.";
  }

  return "❌ Sorry, I encountered an error. Please try again.";
}
