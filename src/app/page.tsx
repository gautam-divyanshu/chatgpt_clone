"use client";

import { Sidebar } from "@/components/sidebar/Sidebar";
import { ChatGPTMain } from "@/components/chat/ChatGPTMain";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { useState, useCallback } from "react";

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Handle conversation selection from sidebar
  const handleSelectConversation = useCallback((conversationId: string) => {
    console.log('📱 Page: Switching to conversation:', conversationId);
    setCurrentConversationId(conversationId);
    // Close sidebar on mobile after selection
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }, []);

  // Handle creating new conversation
  const handleNewChat = useCallback(() => {
    console.log('📱 Page: Starting new chat');
    setCurrentConversationId(null);
    // Close sidebar on mobile after selection
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }, []);

  // Handle when a new conversation is created in ChatGPTMain
  const handleConversationCreated = useCallback((conversationId: string) => {
    console.log('📱 Page: New conversation created:', conversationId);
    setCurrentConversationId(conversationId);
  }, []);

  return (
    <ThemeProvider>
      <div className="h-screen flex chatgpt-main">
        {/* Sidebar with Conversation List */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onToggle={toggleSidebar}
          currentConversationId={currentConversationId}
          onSelectConversation={handleSelectConversation}
          onNewChat={handleNewChat}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Mobile Header */}
          <MobileHeader onMenuClick={() => setSidebarOpen(true)} />

          {/* Chat Content with Conversation Context */}
          <ChatGPTMain 
            conversationId={currentConversationId}
            onConversationCreated={handleConversationCreated}
          />
        </div>
      </div>
    </ThemeProvider>
  );
}
