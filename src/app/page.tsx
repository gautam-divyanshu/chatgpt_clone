"use client";

import { Sidebar } from "@/components/sidebar/Sidebar";
import { ChatGPTMain } from "@/components/chat/ChatGPTMain";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useState, useCallback, useEffect } from "react";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (status === "loading") return; // Still loading
    if (!session) {
      router.push("/auth/signin");
    }
  }, [session, status, router]);

  // Reset conversation when navigating to home route
  useEffect(() => {
    if (pathname === "/") {
      setCurrentConversationId(null);
    }
  }, [pathname]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Handle conversation selection from sidebar
  const handleSelectConversation = useCallback((conversationId: string) => {
    router.push(`/c/${conversationId}`); // Navigate to conversation route
  }, [router]);

  // Handle creating new conversation
  const handleNewChat = useCallback(() => {
    setCurrentConversationId(null);
    // Navigate to home route
    router.push("/");
    // Close sidebar on mobile after selection
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }, [router]);

  // Handle when a conversation is deleted
  const handleConversationDeleted = useCallback(() => {
    setCurrentConversationId(null);
  }, []);

  // Handle when a new conversation is created in ChatGPTMain
  const handleConversationCreated = useCallback((conversationId: string) => {
    setCurrentConversationId(conversationId);
    // Use replace instead of push to avoid unmounting
    // This updates the URL without causing a full page navigation
    window.history.replaceState({}, '', `/c/${conversationId}`);
  }, []);

  // Show loading state while checking authentication
  if (status === "loading") {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render the main app if not authenticated
  if (!session) {
    return null;
  }

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
          onConversationDeleted={handleConversationDeleted}
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
