import React from "react";
import { ChatMessage } from "./types";
import { MessageItem } from "./MessageItem";

interface MessageListProps {
  messages: ChatMessage[];
  isLoading: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  chatContainerRef: React.RefObject<HTMLDivElement | null>;
  onScroll: () => void;
  onEditMessage: (messageId: string) => void;
  onSaveEdit: (messageId: string, newContent: string) => void;
  onCancelEdit: (messageId: string) => void;
  onRetryMessage?: (messageId: string) => void;
}

export function MessageList({
  messages,
  isLoading,
  messagesEndRef,
  chatContainerRef,
  onScroll,
  onEditMessage,
  onSaveEdit,
  onCancelEdit,
  onRetryMessage,
}: MessageListProps) {
  return (
    <div
      ref={chatContainerRef}
      onScroll={onScroll}
      className="flex-1 overflow-y-auto"
      style={{
        scrollbarWidth: "thin",
        scrollbarColor: "#6b7280 transparent",
      }}
    >
      <div className="pb-4">
        {messages.map((message) => (
          <MessageItem
            key={message.id}
            message={message}
            onEditMessage={onEditMessage}
            onSaveEdit={onSaveEdit}
            onCancelEdit={onCancelEdit}
            onRetryMessage={onRetryMessage}
          />
        ))}

        {/* Enhanced loading state */}
        {isLoading &&
          messages.length > 0 &&
          !messages[messages.length - 1]?.isStreaming && (
            <div className="px-4 py-6">
              <div className="max-w-3xl mx-auto">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                  <span className="text-sm text-[#8e8ea0]">ChatGPT is thinking...</span>
                </div>
              </div>
            </div>
          )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
