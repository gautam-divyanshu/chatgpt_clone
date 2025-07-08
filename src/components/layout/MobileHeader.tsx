"use client";

import { ShareHeader } from "../chat/ShareHeader";

interface MobileHeaderProps {
  onMenuClick: () => void;
  conversationId?: string | null; // Add this prop to pass conversationId if needed
}

export function MobileHeader({ onMenuClick, conversationId }: MobileHeaderProps) {
  return (
    <div className="md:hidden border-b border-white/10 p-4 flex items-center justify-between">
      {/* Menu Button - Now matches the main sidebar toggle styling */}
      <button 
        onClick={onMenuClick} 
        className="p-2 rounded-lg chatgpt-hover transition-all duration-300 ease-in-out"
      >
        <svg
          className="w-6 h-6 chatgpt-text"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      {/* Title */}
      <h1 className="text-lg font-semibold chatgpt-text">
        ChatGPT
      </h1>

      <div className="flex gap-2">
        <ShareHeader conversationId={conversationId} />
      </div>
    </div>
  );
}