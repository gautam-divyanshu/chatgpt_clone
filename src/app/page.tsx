"use client";

import { Sidebar } from "@/components/sidebar/Sidebar";
import { ChatGPTMain } from "@/components/chat/ChatGPTMain";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { useState } from "react";

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(true); // Start with sidebar open

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <ThemeProvider>
      <div className="h-screen flex chatgpt-main">
        {/* Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onToggle={toggleSidebar}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Mobile Header */}
          <MobileHeader onMenuClick={() => setSidebarOpen(true)} />

          {/* Chat Content */}
          <ChatGPTMain />
        </div>
      </div>
    </ThemeProvider>
  );
}
