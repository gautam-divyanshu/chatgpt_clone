"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ChatInput } from "./ChatInput";
import { WelcomeScreen } from "./WelcomeScreen";
import { MessageList } from "./MessageList";
import { SharePopover } from "./SharePopover";
import { useChatLogic } from "./useChatLogic";
import { UserAvatar } from "@/components/auth/UserAvatar";

interface ChatGPTMainProps {
  conversationId?: string | null;
  onConversationCreated?: (conversationId: string) => void;
}

export function ChatGPTMain({
  conversationId,
  onConversationCreated,
}: ChatGPTMainProps) {
  const pathname = usePathname();
  const [showSharePopover, setShowSharePopover] = useState(false);

  // Check if we're on a conversation route (not home route)
  const isConversationRoute = pathname.startsWith("/c/");

  const {
    messages,
    input,
    setInput,
    isLoading,
    isLoadingConversation,
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
  } = useChatLogic(conversationId);

  // Notify parent when a new conversation is created
  useEffect(() => {
    if (currentConversationId && onConversationCreated) {
      onConversationCreated(currentConversationId);
    }
  }, [currentConversationId, onConversationCreated]);

  // Switch conversation when conversationId prop changes
  useEffect(() => {
    if (conversationId !== currentConversationId) {
      switchConversation(conversationId || null);
    }
  }, [conversationId, currentConversationId, switchConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleExampleClick = (prompt: string) => {
    handleSendMessage(prompt);
  };

  const handleShareClick = () => {
    if (isConversationRoute && currentConversationId) {
      setShowSharePopover(true);
    }
  };

  const handleCloseShare = () => {
    setShowSharePopover(false);
  };

  // Show loading state when switching conversations
  if (isLoadingConversation) {
    return (
      <div className="flex-1 flex flex-col h-full chatgpt-main">
        {/* Header - Desktop Only */}
        <div className="hidden md:flex justify-between items-center border-b border-white/10 px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="chatgpt-text text-lg font-medium">ChatGPT</span>
            <svg
              className="w-4 h-4 chatgpt-text-muted"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShareClick}
              disabled={!isConversationRoute}
              className={`p-2 rounded-lg transition-all ${
                isConversationRoute
                  ? "chatgpt-hover"
                  : "opacity-50 cursor-not-allowed"
              }`}
              title={
                isConversationRoute
                  ? "Share conversation"
                  : "Share not available"
              }
            >
              <svg
                className="w-5 h-5 chatgpt-text"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                />
              </svg>
            </button>

            <UserAvatar />
          </div>
        </div>

        {/* Loading State */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white/60 mx-auto mb-3"></div>
            <p className="chatgpt-text-muted">Loading conversation...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full chatgpt-main">
      {/* Header - Desktop Only */}
      <div className="hidden md:flex justify-between items-center border-b border-white/10 px-6 py-4">
        <div className="flex items-center gap-2">
          <span className="chatgpt-text text-lg font-medium">ChatGPT</span>
          <svg
            className="w-4 h-4 chatgpt-text-muted"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleShareClick}
            disabled={!isConversationRoute}
            className={`flex items-center gap-2 p-2 rounded-lg transition-all mr-5 ${
              isConversationRoute
                ? "chatgpt-hover"
                : "opacity-50 cursor-not-allowed"
            }`}
            title={
              isConversationRoute ? "Share conversation" : "Share not available"
            }
          >
            <svg
              className="w-5 h-5 chatgpt-text"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
              />
            </svg>
            <span>Share</span>
          </button>

          <UserAvatar />
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col min-h-0">
        {messages.length === 0 ? (
          <WelcomeScreen onExampleClick={handleExampleClick} />
        ) : (
          <MessageList
            messages={messages}
            isLoading={isLoading}
            messagesEndRef={messagesEndRef}
            chatContainerRef={chatContainerRef}
            onScroll={handleScroll}
            onEditMessage={handleEditMessage}
            onSaveEdit={handleSaveEdit}
            onCancelEdit={handleCancelEdit}
            onRetryMessage={handleRetryMessage}
          />
        )}

        <ChatInput
          input={input}
          setInput={setInput}
          onSendMessage={handleSendMessage}
          onStopStreaming={handleStopStreaming}
          isLoading={isLoading}
          conversationId={currentConversationId}
        />
      </div>

      {/* Share Popover */}
      {currentConversationId && (
        <SharePopover
          isOpen={showSharePopover}
          onClose={handleCloseShare}
          conversationId={currentConversationId}
        />
      )}
    </div>
  );
}
