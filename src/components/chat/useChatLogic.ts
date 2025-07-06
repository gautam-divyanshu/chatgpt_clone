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

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    if (streamingControllerRef.current) {
      streamingControllerRef.current.abort();
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content,
      isUser: true,
      timestamp: new Date().toLocaleTimeString(),
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
    };

    setMessages((prev) => [...prev, aiMessage]);

    const controller = new AbortController();
    streamingControllerRef.current = controller;

    // Pass conversation history to the API
    const conversationHistory = [...messages, userMessage];

    await streamResponse(
      content,
      aiMessageId,
      setMessages,
      setIsLoading,
      controller,
      conversationHistory
    );
  };

  // Handle message editing
  const handleEditMessage = (messageId: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId
          ? { ...msg, isEditing: true, originalContent: msg.content }
          : msg
      )
    );
  };

  // Handle edit save
  const handleSaveEdit = async (messageId: string, newContent: string) => {
    if (!newContent.trim()) return;

    // Find the message being edited
    const messageIndex = messages.findIndex((msg) => msg.id === messageId);
    if (messageIndex === -1) return;

    // Cancel any ongoing streaming
    if (streamingControllerRef.current) {
      streamingControllerRef.current.abort();
    }

    // Update the edited message and remove all subsequent messages
    const updatedMessages = messages.slice(0, messageIndex + 1).map((msg) =>
      msg.id === messageId
        ? {
            ...msg,
            content: newContent,
            isEditing: false,
            originalContent: undefined,
            timestamp: new Date().toLocaleTimeString(), // Update timestamp
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
    };

    setMessages((prev) => [...prev, aiMessage]);

    const controller = new AbortController();
    streamingControllerRef.current = controller;

    // Use updated messages for context (all messages up to and including the edited one)
    await streamResponse(
      newContent,
      aiMessageId,
      setMessages,
      setIsLoading,
      controller,
      updatedMessages
    );
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
  };
}
