import { useState, useRef, useCallback } from "react";
import { ChatMessage } from "./types";
import { streamResponse } from "./realApi";

export function useChatLogic() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const streamingControllerRef = useRef<AbortController | null>(null);

  // Check if user is scrolled to bottom
  const isScrolledToBottom = () => {
    if (!chatContainerRef.current) return true;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    return Math.abs(scrollHeight - clientHeight - scrollTop) < 50;
  };

  // Handle scroll events to detect manual scrolling
  const handleScroll = () => {
    setShouldAutoScroll(isScrolledToBottom());
  };

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    if (shouldAutoScroll) {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [shouldAutoScroll]);

  // Stop/Pause streaming - Fixed error handling
  const handleStopStreaming = () => {
    if (streamingControllerRef.current) {
      try {
        streamingControllerRef.current.abort();
      } catch {
        // Ignore abort errors - they're expected
        console.log("Stream aborted by user");
      }
      streamingControllerRef.current = null;
    }

    setIsLoading(false);

    // Mark the last streaming message as stopped (not error)
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.isStreaming) {
          return {
            ...msg,
            isStreaming: false,
            status: "sent",
            content: msg.content || "Response stopped by user.",
          };
        }
        return msg;
      })
    );
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    // Cancel any ongoing streaming
    if (streamingControllerRef.current) {
      try {
        streamingControllerRef.current.abort();
      } catch {
        // Ignore abort errors
      }
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content,
      isUser: true,
      timestamp: new Date().toLocaleTimeString(),
      status: "sent",
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setShouldAutoScroll(true);

    const aiMessageId = (Date.now() + 1).toString();
    const aiMessage: ChatMessage = {
      id: aiMessageId,
      content: "",
      isUser: false,
      timestamp: new Date().toLocaleTimeString(),
      isStreaming: true,
      status: "sending",
    };

    setMessages((prev) => [...prev, aiMessage]);

    const controller = new AbortController();
    streamingControllerRef.current = controller;

    // Pass conversation history to the API with enhanced config
    const conversationHistory = [...messages, userMessage];

    try {
      await streamResponse(
        content,
        aiMessageId,
        setMessages,
        setIsLoading,
        controller,
        conversationHistory,
        {
          retryAttempts: 3,
          retryDelay: 1000,
          timeoutMs: 30000,
        }
      );
    } catch (error: unknown) {
      // Only log if it's not an abort error
      if (error instanceof Error && error.name !== "AbortError") {
        console.error("Send message error:", error);
      }
    }
  };

  // Enhanced message editing with better error handling
  const handleEditMessage = (messageId: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId
          ? { ...msg, isEditing: true, originalContent: msg.content }
          : msg
      )
    );
  };

  // Enhanced edit save with retry logic
  const handleSaveEdit = async (messageId: string, newContent: string) => {
    if (!newContent.trim()) return;

    // Find the message being edited
    const messageIndex = messages.findIndex((msg) => msg.id === messageId);
    if (messageIndex === -1) return;

    // Cancel any ongoing streaming
    if (streamingControllerRef.current) {
      try {
        streamingControllerRef.current.abort();
      } catch {
        // Ignore abort errors
      }
    }

    // Update the edited message and remove all subsequent messages
    const updatedMessages = messages.slice(0, messageIndex + 1).map((msg) =>
      msg.id === messageId
        ? {
            ...msg,
            content: newContent,
            isEditing: false,
            originalContent: undefined,
            timestamp: new Date().toLocaleTimeString(),
            status: "sent" as const,
          }
        : msg
    );

    setMessages(updatedMessages);
    setIsLoading(true);
    setShouldAutoScroll(true);

    // Generate new AI response
    const aiMessageId = (Date.now() + 1).toString();
    const aiMessage: ChatMessage = {
      id: aiMessageId,
      content: "",
      isUser: false,
      timestamp: new Date().toLocaleTimeString(),
      isStreaming: true,
      status: "sending",
    };

    setMessages((prev) => [...prev, aiMessage]);

    const controller = new AbortController();
    streamingControllerRef.current = controller;

    try {
      await streamResponse(
        newContent,
        aiMessageId,
        setMessages,
        setIsLoading,
        controller,
        updatedMessages,
        {
          retryAttempts: 3,
          retryDelay: 1000,
          timeoutMs: 30000,
        }
      );
    } catch (error: unknown) {
      if (error instanceof Error && error.name !== "AbortError") {
        console.error("Edit message error:", error);
      }
    }
  };

  // Handle edit cancel
  const handleCancelEdit = (messageId: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId
          ? {
              ...msg,
              isEditing: false,
              content: msg.originalContent || msg.content,
              originalContent: undefined,
            }
          : msg
      )
    );
  };

  // Fixed: Retry failed message
  const handleRetryMessage = async (messageId: string) => {
    const messageIndex = messages.findIndex((msg) => msg.id === messageId);
    const message = messages[messageIndex];

    if (!message || message.isUser || messageIndex === -1) return;

    // Find the previous user message
    const userMessage = messages
      .slice(0, messageIndex)
      .reverse()
      .find((msg) => msg.isUser);

    if (!userMessage) return;

    // Cancel any ongoing streaming
    if (streamingControllerRef.current) {
      try {
        streamingControllerRef.current.abort();
      } catch {
        // Ignore abort errors
      }
    }

    // Reset the AI message
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId
          ? {
              ...msg,
              content: "",
              isStreaming: true,
              status: "sending",
              retryCount: (msg.retryCount || 0) + 1,
            }
          : msg
      )
    );

    setIsLoading(true);
    const controller = new AbortController();
    streamingControllerRef.current = controller;

    const conversationHistory = messages.slice(0, messageIndex);

    try {
      await streamResponse(
        userMessage.content,
        messageId,
        setMessages,
        setIsLoading,
        controller,
        conversationHistory,
        {
          retryAttempts: 2, // Fewer retries for manual retry
          retryDelay: 500,
          timeoutMs: 30000,
        }
      );
    } catch (error: unknown) {
      if (error instanceof Error && error.name !== "AbortError") {
        console.error("Retry message error:", error);
      }
    }
  };

  return {
    messages,
    input,
    setInput,
    isLoading,
    shouldAutoScroll,
    messagesEndRef,
    chatContainerRef,
    handleScroll,
    scrollToBottom,
    handleSendMessage,
    handleEditMessage,
    handleSaveEdit,
    handleCancelEdit,
    handleRetryMessage,
    handleStopStreaming,
  };
}
