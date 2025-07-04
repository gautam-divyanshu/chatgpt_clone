"use client";

import { Sidebar } from "@/components/sidebar/Sidebar";
import { MainContent } from "@/components/chat/MainContent";

export default function Home() {
  return (
    <div className="h-screen flex bg-gray-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <MainContent />
    </div>
  );
}
