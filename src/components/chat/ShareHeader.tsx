"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { SharePopover } from "./SharePopover";
import { UserAvatar } from "@/components/auth/UserAvatar";

interface ShareHeaderProps {
  conversationId?: string | null;
}

export function ShareHeader({ conversationId }: ShareHeaderProps) {
  const pathname = usePathname();
  const [showSharePopover, setShowSharePopover] = useState(false);

  // Check if we're on a conversation route (not home route)
  const isConversationRoute = pathname.startsWith("/c/");

  const handleShareClick = () => {
    if (isConversationRoute && conversationId) {
      setShowSharePopover(true);
    }
  };

  const handleCloseShare = () => {
    setShowSharePopover(false);
  };

  return (
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
      {conversationId && (
        <SharePopover
          isOpen={showSharePopover}
          onClose={handleCloseShare}
          conversationId={conversationId}
        />
      )}
    </div>
  );
}