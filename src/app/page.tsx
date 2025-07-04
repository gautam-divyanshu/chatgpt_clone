"use client";

import { Sidebar } from "@/components/sidebar/Sidebar";
import { MainContent } from "@/components/chat/MainContent";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { useState } from "react";

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ThemeProvider>
      <div className="h-screen flex bg-gray-100 dark:bg-gray-900">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Mobile Header */}
          <MobileHeader onMenuClick={() => setSidebarOpen(true)} />

          {/* Chat Content */}
          <MainContent />
        </div>
      </div>
    </ThemeProvider>
  );
}
