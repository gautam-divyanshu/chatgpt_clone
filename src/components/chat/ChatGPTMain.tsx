"use client";

import { useEffect } from "react";
import { ChatInput } from "./ChatInput";
import { ChatHeader } from "./ChatHeader";
import { WelcomeScreen } from "./WelcomeScreen";
import { MessageList } from "./MessageList";
import { useChatLogic } from "./useChatLogic";

export function ChatGPTMain() {
  const {
    messages,
    input,
    setInput,
    isLoading,
    messagesEndRef,
    chatContainerRef,
    handleScroll,
    scrollToBottom,
    handleSendMessage,
    handleEditMessage,
    handleSaveEdit,
    handleCancelEdit,
  } = useChatLogic();

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleExampleClick = (prompt: string) => {
    handleSendMessage(prompt);
  };

  return (
    <div className="flex-1 flex flex-col h-full chatgpt-main">
      {/* Header - Desktop Only */}
      <ChatHeader />

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
          />
        )}

        <ChatInput
          input={input}
          setInput={setInput}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
