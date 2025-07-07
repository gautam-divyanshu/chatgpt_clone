import { useState, useRef, useCallback, useEffect } from "react";
import { ChatMessage } from "./types";
import { UploadedFile } from "./upload-types";
import { streamResponse } from "./realApi";
import { CHAT_CONFIG } from "@/config";
import { generateMessageId, getUserIdFromStorage } from "@/lib/utils";
import {
  ConversationManager,
  type ChatMessage as DbChatMessage,
  type ChatAttachment,
} from "@/lib/conversationManager";

export function useChatLogic(conversationId?: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(
    conversationId || null
  );
  const [isLoadingConversation, setIsLoadingConversation] = useState(false);
  
  const [userId] = useState(() => getUserIdFromStorage());
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const streamingControllerRef = useRef<AbortController | null>(null);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const transformDbMessage = useCallback((dbMessage: DbChatMessage): ChatMessage => {
    return {
      id: dbMessage.id,
      content: dbMessage.content,
      isUser: dbMessage.isUser,
      timestamp: new Date(dbMessage.timestamp).toLocaleTimeString(),
      status: "sent",
      attachments: dbMessage.attachments?.map((att: ChatAttachment) => ({
        id: att.cloudinaryPublicId,
        url: att.cloudinaryUrl,
        originalName: att.originalName,
        size: att.fileSize,
        type: att.fileType,
        isImage: att.isImage,
        isDocument: !att.isImage,
        width: null,
        height: null,
        format: att.fileType.split("/")[1] || "unknown",
        createdAt: new Date(att.uploadedAt).toISOString(),
      })) || [],
    };
  }, []);

  const transformToDbMessage = useCallback((message: ChatMessage): DbChatMessage => {
    return {
      id: message.id,
      content: message.content,
      isUser: message.isUser,
      timestamp: new Date().toISOString(),
      attachments: message.attachments?.map((att: UploadedFile) => ({
        originalName: att.originalName,
        cloudinaryUrl: att.url,
        cloudinaryPublicId: att.id,
        fileType: att.type,
        fileSize: att.size,
        isImage: att.isImage,
        uploadedAt: new Date(att.createdAt),
      })) || [],
    };
  }, []);

  const autoSaveMessages = useCallback(async (newMessages: ChatMessage[], convId?: string) => {
    if (!convId || newMessages.length === 0) return;

    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    autoSaveTimeoutRef.current = setTimeout(async () => {
      try {
        const completedMessages = newMessages.filter(
          (msg) => !msg.isStreaming && msg.content.trim()
        );
        if (completedMessages.length > 0) {
          const dbMessages = completedMessages.map(transformToDbMessage);
          await ConversationManager.updateConversation(convId, dbMessages);
        }
      } catch (error) {
        console.error("Auto-save failed:", error);
      }
    }, CHAT_CONFIG.AUTO_SAVE_DELAY);
  }, [transformToDbMessage]);

  const createNewConversation = useCallback(async (firstMessage?: ChatMessage) => {
    try {
      const dbFirstMessage = firstMessage ? transformToDbMessage(firstMessage) : undefined;
      const conversation = await ConversationManager.createNewConversation(
        undefined,
        dbFirstMessage
      );

      if (conversation) {
        setCurrentConversationId(conversation.id);
        return conversation.id;
      }
    } catch (error) {
      console.error("Failed to create new conversation:", error);
    }
    return null;
  }, [transformToDbMessage]);

  const loadConversation = useCallback(async (convId: string) => {
    if (!convId) return;

    setIsLoadingConversation(true);
    try {
      const conversation = await ConversationManager.getConversation(convId);
      if (conversation && conversation.messages) {
        const transformedMessages = conversation.messages.map(transformDbMessage);
        setMessages(transformedMessages);
        setCurrentConversationId(convId);
      }
    } catch (error) {
      console.error("Failed to load conversation:", error);
    } finally {
      setIsLoadingConversation(false);
    }
  }, [transformDbMessage]);

  const switchConversation = useCallback(async (convId: string | null) => {
    if (convId === currentConversationId || isLoading) return;

    if (convId) {
      await loadConversation(convId);
    } else {
      setMessages([]);
      setCurrentConversationId(null);
    }
  }, [currentConversationId, loadConversation, isLoading]);

  useEffect(() => {
    if (currentConversationId && messages.length > 0) {
      const hasCompletedMessages = messages.some(
        (msg) => !msg.isStreaming && msg.content.trim()
      );
      if (hasCompletedMessages) {
        autoSaveMessages(messages, currentConversationId);
      }
    }
  }, [messages, currentConversationId, autoSaveMessages]);

  useEffect(() => {
    if (!isLoading && currentConversationId && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (!lastMessage.isUser && !lastMessage.isStreaming && lastMessage.content.trim()) {
        autoSaveMessages(messages, currentConversationId);
      }
    }
  }, [isLoading, messages, currentConversationId, autoSaveMessages]);

  const isScrolledToBottom = () => {
    if (!chatContainerRef.current) return true;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    return Math.abs(scrollHeight - clientHeight - scrollTop) < 50;
  };

  const handleScroll = () => {
    setShouldAutoScroll(isScrolledToBottom());
  };

  const scrollToBottom = useCallback(() => {
    if (shouldAutoScroll) {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [shouldAutoScroll]);

  const handleStopStreaming = () => {
    if (streamingControllerRef.current) {
      try {
        streamingControllerRef.current.abort();
      } catch {
        // Ignore abort errors
      }
      streamingControllerRef.current = null;
    }

    setIsLoading(false);
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

  const handleSendMessage = async (content: string, attachments?: UploadedFile[]) => {
    if ((!content.trim() && (!attachments || attachments.length === 0)) || isLoading) return;

    if (streamingControllerRef.current) {
      try {
        streamingControllerRef.current.abort();
      } catch {
        // Ignore abort errors
      }
    }

    const userMessage: ChatMessage = {
      id: generateMessageId(),
      content,
      isUser: true,
      timestamp: new Date().toLocaleTimeString(),
      status: "sent",
      attachments: attachments || [],
    };

    let convId = currentConversationId;
    let updatedMessages = messages;

    if (!convId) {
      convId = await createNewConversation(userMessage);
      if (!convId) {
        console.error("Failed to create conversation");
        return;
      }
      updatedMessages = [userMessage];
      setMessages(updatedMessages);
    } else {
      updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
    }

    setInput("");
    setIsLoading(true);
    setShouldAutoScroll(true);

    const aiMessageId = generateMessageId();
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
    const conversationHistory = updatedMessages;

    try {
      await streamResponse(
        content,
        aiMessageId,
        setMessages,
        setIsLoading,
        controller,
        conversationHistory,
        { retryAttempts: 3, retryDelay: 1000, timeoutMs: 30000 },
        attachments || [],
        userId,
        convId
      );
    } catch (error: unknown) {
      if (error instanceof Error && error.name !== "AbortError") {
        console.error("Send message error:", error);
      }
    }
  };

  const handleEditMessage = (messageId: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId
          ? { ...msg, isEditing: true, originalContent: msg.content }
          : msg
      )
    );
  };

  const handleSaveEdit = async (messageId: string, newContent: string) => {
    if (!newContent.trim()) return;

    const messageIndex = messages.findIndex((msg) => msg.id === messageId);
    if (messageIndex === -1) return;

    const editedMessage = messages[messageIndex];

    if (streamingControllerRef.current) {
      try {
        streamingControllerRef.current.abort();
      } catch {
        // Ignore abort errors
      }
    }

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

    const aiMessageId = generateMessageId();
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
        { retryAttempts: 3, retryDelay: 1000, timeoutMs: 30000 },
        editedMessage.attachments || [],
        userId,
        currentConversationId || undefined
      );
    } catch (error: unknown) {
      if (error instanceof Error && error.name !== "AbortError") {
        console.error("Edit message error:", error);
      }
    }
  };

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

  const handleRetryMessage = async (messageId: string) => {
    const messageIndex = messages.findIndex((msg) => msg.id === messageId);
    const message = messages[messageIndex];

    if (!message || message.isUser || messageIndex === -1) return;

    const userMessage = messages
      .slice(0, messageIndex)
      .reverse()
      .find((msg) => msg.isUser);

    if (!userMessage) return;

    if (streamingControllerRef.current) {
      try {
        streamingControllerRef.current.abort();
      } catch {
        // Ignore abort errors
      }
    }

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
        { retryAttempts: 2, retryDelay: 500, timeoutMs: 30000 },
        userMessage.attachments || [],
        userId,
        currentConversationId || undefined
      );
    } catch (error: unknown) {
      if (error instanceof Error && error.name !== "AbortError") {
        console.error("Retry message error:", error);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  return {
    messages,
    input,
    setInput,
    isLoading,
    isLoadingConversation,
    shouldAutoScroll,
    currentConversationId,
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
    switchConversation,
    createNewConversation,
    loadConversation,
  };
}
