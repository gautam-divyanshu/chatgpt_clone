import { ChatMessage } from "./types";
import { UploadedFile } from "./upload-types";

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
  attachments: UploadedFile[] = []
): Promise<void> => {
  const { retryAttempts = 3, retryDelay = 1000, timeoutMs = 30000 } = config;

  let attempt = 0;

  const attemptRequest = async (): Promise<void> => {
    try {
      // Prepare conversation context with smart truncation
      const apiMessages = prepareConversationContext(
        conversationHistory,
        prompt
      );

      console.log("=== REAL API DEBUG ===");
      console.log(
        `Attempt ${attempt + 1}: Sending ${apiMessages.length} messages to API`
      );
      console.log(`Attachments being sent: ${attachments.length} files`);

      if (attachments.length > 0) {
        console.log("Attachment details:");
        attachments.forEach((att, idx) => {
          console.log(
            `${idx + 1}. ${att.originalName} (${att.type}) - ${
              att.isImage ? "IMAGE" : "DOCUMENT"
            }`
          );
          console.log(`   URL: ${att.url}`);
        });
      }

      // Create timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("Request timeout")), timeoutMs);
      });

      // Create fetch promise with attachments
      const requestBody = {
        messages: apiMessages,
        attachments: attachments, // Send attachments to API
      };

      console.log(
        "Request body being sent:",
        JSON.stringify(requestBody, null, 2)
      );

      const fetchPromise = fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      // Race between fetch and timeout
      const response = await Promise.race([fetchPromise, timeoutPromise]);

      console.log(`API Response status: ${response.status}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("API Error:", errorData);
        throw new Error(
          `HTTP ${response.status}: ${errorData.error || "Unknown error"}`
        );
      }

      if (!response.body) {
        throw new Error("No response body");
      }

      await processStream(response.body, messageId, setMessages, controller);
    } catch (error: unknown) {
      // Handle abort differently - it's not a real error
      if (error.name === "AbortError" || controller.signal.aborted) {
        console.log("Stream was cancelled by user");
        return; // Don't retry on user cancellation
      }

      console.error(`Attempt ${attempt + 1} failed:`, error);

      // Check if we should retry
      if (
        attempt < retryAttempts - 1 &&
        !controller.signal.aborted &&
        isRetryableError(error)
      ) {
        attempt++;
        console.log(
          `Retrying in ${retryDelay}ms... (attempt ${
            attempt + 1
          }/${retryAttempts})`
        );

        // Show retry message to user
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
        throw error; // Final failure
      }
    }
  };

  try {
    await attemptRequest();

    // Only mark as complete if not aborted
    if (!controller.signal.aborted) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? { ...msg, isStreaming: false, status: "sent" }
            : msg
        )
      );
    }
  } catch (error: any) {
    // Don't show error if user cancelled
    if (error.name === "AbortError" || controller.signal.aborted) {
      console.log("Stream cancelled by user");
      return;
    }

    console.error("Final streaming error:", error);

    // Enhanced error messages
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
    // Only set loading false if not aborted (handleStopStreaming will handle it)
    if (!controller.signal.aborted) {
      setIsLoading(false);
    }
  }
};

// Smart conversation context preparation with token management
function prepareConversationContext(
  conversationHistory: ChatMessage[],
  currentPrompt: string
): Array<{
  role: "user" | "assistant";
  content: string;
  attachments?: UploadedFile[];
}> {
  const maxContextTokens = 6000; // Conservative limit for Gemini
  const estimatedTokensPerChar = 0.25; // Rough estimation

  // Start with current prompt tokens
  let totalTokens = currentPrompt.length * estimatedTokensPerChar;
  const contextMessages: Array<{
    role: "user" | "assistant";
    content: string;
    attachments?: UploadedFile[];
  }> = [];

  // Add messages from newest to oldest until we hit token limit
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

    // Include attachments for user messages
    if (msg.isUser && msg.attachments && msg.attachments.length > 0) {
      contextMessage.attachments = msg.attachments;
      console.log(
        `Including ${
          msg.attachments.length
        } attachments in context for message: ${msg.content.substring(
          0,
          50
        )}...`
      );
    }

    contextMessages.unshift(contextMessage);
    totalTokens += messageTokens;
  }

  // Don't add current prompt again - it's already in the conversation history
  // Only add if the conversation history is empty or doesn't contain the current prompt
  const lastMessage = conversationHistory[conversationHistory.length - 1];
  if (!lastMessage || lastMessage.content !== currentPrompt) {
    contextMessages.push({
      role: "user",
      content: currentPrompt,
    });
  }

  console.log(
    `Context: ${contextMessages.length} messages, ~${Math.round(
      totalTokens
    )} tokens`
  );
  return contextMessages;
}

// Enhanced stream processing with better parsing
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
      if (controller.signal.aborted) {
        console.log("Stream processing aborted");
        break;
      }

      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");

      // Keep the last incomplete line in buffer
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (controller.signal.aborted) break;

        const trimmedLine = line.trim();
        if (!trimmedLine) continue;

        // Enhanced parsing for different data stream formats
        if (trimmedLine.startsWith("0:")) {
          // Text content
          const content = parseContentLine(trimmedLine.slice(2));
          if (content) {
            currentContent += content;
            updateMessageContent(messageId, currentContent, setMessages);
          }
        } else if (trimmedLine.startsWith("e:")) {
          // End of stream
          console.log("Stream ended:", trimmedLine);
          break;
        } else if (trimmedLine.startsWith("d:")) {
          // Stream data (metadata)
          try {
            const data = JSON.parse(trimmedLine.slice(2));
            console.log("Stream metadata:", data);
          } catch {
            // Ignore parsing errors for metadata
          }
        }
      }
    }
  } catch (error: any) {
    if (error.name !== "AbortError") {
      console.error("Stream processing error:", error);
      throw error;
    }
  } finally {
    reader.releaseLock();
  }
}

// Improved content parsing with better error handling
function parseContentLine(line: string): string {
  try {
    // Handle quoted strings
    if (line.startsWith('"') && line.endsWith('"')) {
      return JSON.parse(line);
    }
    return line;
  } catch {
    return line; // Fallback to raw line
  }
}

// Optimized message updates to prevent unnecessary re-renders
let updateTimeout: NodeJS.Timeout | null = null;
function updateMessageContent(
  messageId: string,
  content: string,
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>
): void {
  // Throttle updates to prevent too many re-renders
  if (updateTimeout) {
    clearTimeout(updateTimeout);
  }

  updateTimeout = setTimeout(() => {
    setMessages((prev) =>
      prev.map((msg) => (msg.id === messageId ? { ...msg, content } : msg))
    );
  }, 16); // ~60fps
}

// Error classification for retry logic
function isRetryableError(error: any): boolean {
  const retryableErrors = [
    "network error",
    "timeout",
    "rate limit",
    "temporary",
    "service unavailable",
    "failed to fetch",
    "connection",
  ];

  const errorMessage = error.message?.toLowerCase() || "";
  return retryableErrors.some((keyword) => errorMessage.includes(keyword));
}

// Enhanced error messages for better user experience
function getErrorMessage(error: any): string {
  if (error.name === "AbortError") {
    return "Response cancelled";
  }

  const errorMsg = error.message?.toLowerCase() || "";

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
