import { useState, useRef, useCallback, useEffect } from "react";
import { ChatMessage } from "./types";
import { UploadedFile } from "./upload-types";
import { streamResponse } from "./realApi";
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
  const [currentConversationId, setCurrentConversationId] = useState<
    string | null
  >(conversationId || null);
  const [isLoadingConversation, setIsLoadingConversation] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const streamingControllerRef = useRef<AbortController | null>(null);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Transform database message to component message
  const transformDbMessage = useCallback(
    (dbMessage: DbChatMessage): ChatMessage => {
      return {
        id: dbMessage.id,
        content: dbMessage.content,
        isUser: dbMessage.isUser,
        timestamp: new Date(dbMessage.timestamp).toLocaleTimeString(),
        status: "sent",
        attachments:
          dbMessage.attachments?.map((att: ChatAttachment) => ({
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
    },
    []
  );

  // Transform component message to database message
  const transformToDbMessage = useCallback(
    (message: ChatMessage): DbChatMessage => {
      return {
        id: message.id,
        content: message.content,
        isUser: message.isUser,
        timestamp: new Date().toISOString(),
        attachments:
          message.attachments?.map((att: UploadedFile) => ({
            originalName: att.originalName,
            cloudinaryUrl: att.url,
            cloudinaryPublicId: att.id,
            fileType: att.type,
            fileSize: att.size,
            isImage: att.isImage,
            uploadedAt: new Date(att.createdAt),
          })) || [],
      };
    },
    []
  );

  // Auto-save messages to database with debouncing
  const autoSaveMessages = useCallback(
    async (newMessages: ChatMessage[], convId?: string) => {
      if (!convId || newMessages.length === 0) return;

      // Clear existing timeout
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }

      // Debounce auto-save by 1 second (reduced from 2 seconds for better responsiveness)
      autoSaveTimeoutRef.current = setTimeout(async () => {
        try {
          // Only save non-streaming messages
          const completedMessages = newMessages.filter(
            (msg) => !msg.isStreaming && msg.content.trim()
          );
          if (completedMessages.length > 0) {
            const dbMessages = completedMessages.map(transformToDbMessage);
            await ConversationManager.updateConversation(convId, dbMessages);
            console.log(
              "💾 Auto-saved conversation:",
              convId,
              "with",
              completedMessages.length,
              "messages"
            );
          }
        } catch (error) {
          console.error("Auto-save failed:", error);
        }
      }, 1000);
    },
    [transformToDbMessage]
  );

  // Create new conversation
  const createNewConversation = useCallback(
    async (firstMessage?: ChatMessage) => {
      try {
        const dbFirstMessage = firstMessage
          ? transformToDbMessage(firstMessage)
          : undefined;
        const conversation = await ConversationManager.createNewConversation(
          undefined,
          dbFirstMessage
        );

        if (conversation) {
          setCurrentConversationId(conversation.id);
          console.log("✅ Created new conversation:", conversation.id);
          return conversation.id;
        }
      } catch (error) {
        console.error("Failed to create new conversation:", error);
      }
      return null;
    },
    [transformToDbMessage]
  );

  // Load conversation from database
  const loadConversation = useCallback(
    async (convId: string) => {
      if (!convId) return;

      setIsLoadingConversation(true);
      try {
        const conversation = await ConversationManager.getConversation(convId);
        if (conversation && conversation.messages) {
          const transformedMessages =
            conversation.messages.map(transformDbMessage);
          setMessages(transformedMessages);
          setCurrentConversationId(convId);
          console.log(
            "✅ Loaded conversation:",
            convId,
            "with",
            transformedMessages.length,
            "messages"
          );
        }
      } catch (error) {
        console.error("Failed to load conversation:", error);
      } finally {
        setIsLoadingConversation(false);
      }
    },
    [transformDbMessage]
  );

  // Switch to a different conversation
  const switchConversation = useCallback(
    async (convId: string | null) => {
      if (convId === currentConversationId) return;

      // Don't switch if we're currently loading a response
      if (isLoading) {
        console.log(
          "🔄 Skipping conversation switch - currently loading response"
        );
        return;
      }

      if (convId) {
        await loadConversation(convId);
      } else {
        // Start fresh conversation
        setMessages([]);
        setCurrentConversationId(null);
      }
    },
    [currentConversationId, loadConversation, isLoading]
  );

  // Auto-save when messages change - This will catch both user messages AND AI responses
  useEffect(() => {
    if (currentConversationId && messages.length > 0) {
      // Check if there are any completed (non-streaming) messages
      const hasCompletedMessages = messages.some(
        (msg) => !msg.isStreaming && msg.content.trim()
      );
      if (hasCompletedMessages) {
        console.log("🔄 Triggering auto-save for", messages.length, "messages");
        autoSaveMessages(messages, currentConversationId);
      }
    }
  }, [messages, currentConversationId, autoSaveMessages]);

  // Additional auto-save when loading state changes (AI response completes)
  useEffect(() => {
    if (!isLoading && currentConversationId && messages.length > 0) {
      // AI response just completed, make sure it's saved
      const lastMessage = messages[messages.length - 1];
      if (
        !lastMessage.isUser &&
        !lastMessage.isStreaming &&
        lastMessage.content.trim()
      ) {
        console.log("🔄 AI response completed, force saving...");
        autoSaveMessages(messages, currentConversationId);
      }
    }
  }, [isLoading, messages, currentConversationId, autoSaveMessages]);

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

  // Stop/Pause streaming
  const handleStopStreaming = () => {
    if (streamingControllerRef.current) {
      try {
        streamingControllerRef.current.abort();
      } catch {
        console.log("Stream aborted by user");
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

  const handleSendMessage = async (
    content: string,
    attachments?: UploadedFile[]
  ) => {
    if (
      (!content.trim() && (!attachments || attachments.length === 0)) ||
      isLoading
    )
      return;

    console.log("=== SENDING MESSAGE ===");
    console.log("Content:", content);
    console.log("Attachments:", attachments?.length || 0);
    console.log("Current conversation ID:", currentConversationId);

    // Cancel any ongoing streaming
    if (streamingControllerRef.current) {
      try {
        streamingControllerRef.current.abort();
      } catch {
        // Ignore abort errors
      }
    }

    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      content,
      isUser: true,
      timestamp: new Date().toLocaleTimeString(),
      status: "sent",
      attachments: attachments || [],
    };

    // Create new conversation if none exists
    let convId = currentConversationId;
    let updatedMessages = messages;

    if (!convId) {
      console.log("🔄 Creating new conversation...");
      convId = await createNewConversation(userMessage);
      if (!convId) {
        console.error("Failed to create conversation");
        return;
      }
      // Add user message to state
      updatedMessages = [userMessage];
      setMessages(updatedMessages);
    } else {
      // Add to existing conversation
      updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
    }

    setInput("");
    setIsLoading(true);
    setShouldAutoScroll(true);

    const aiMessageId = `msg_${Date.now() + 1}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
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

    // Build conversation history - for both new and existing conversations,
    // we want to include all messages up to this point
    const conversationHistory = updatedMessages;

    console.log("=== CONVERSATION HISTORY DEBUG ===");
    console.log("Conversation ID:", convId);
    console.log("Current conversation ID:", currentConversationId);
    console.log("Updated messages:", updatedMessages.length);
    console.log("Conversation history:", conversationHistory.length);
    console.log(
      "History contents:",
      conversationHistory.map((msg) => ({
        id: msg.id,
        isUser: msg.isUser,
        content: msg.content.substring(0, 50) + "...",
        attachments: msg.attachments?.length || 0,
      }))
    );

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
        },
        attachments || []
      );
    } catch (error: unknown) {
      if (error instanceof Error && error.name !== "AbortError") {
        console.error("Send message error:", error);
      }
    }
  };

  // Enhanced message editing
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

    const aiMessageId = `msg_${Date.now() + 1}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
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
        },
        editedMessage.attachments || []
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
        {
          retryAttempts: 2,
          retryDelay: 500,
          timeoutMs: 30000,
        },
        userMessage.attachments || []
      );
    } catch (error: unknown) {
      if (error instanceof Error && error.name !== "AbortError") {
        console.error("Retry message error:", error);
      }
    }
  };

  // Cleanup on unmount
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
