"use client";

import {
  ChatGPTIcon,
  NewChatIcon,
  SearchIcon,
  LibraryIcon,
  SoraIcon,
  ToggleIcon,
} from "@/components/ui/icons";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onToggle: () => void;
}

export function Sidebar({ isOpen, onClose, onToggle }: SidebarProps) {
  const chatItems = [
    "Test Next.js on Mobile",
    "Create ChatGPT Clone",
    "Install gh on Mac",
    "MacBook Sleep vs Shutdown",
    "Take You Forward vs MCS",
    "Darken Video on Mac",
    "Learn DSA in 2025?",
    "Improving Reading Skills",
    "Internship Availability Response",
    "Request for Scholarship Recons...",
    "Windows Install Disk Not Found",
    "Financial responsibility support",
    "Warp terminal error fix",
    "Sign out Apple ID issues",
    "Parents and Criticism",
    "Open VS Code Terminal",
    "Expense Calculation Summary",
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar - Smooth width transition like real ChatGPT */}
      <div
        className={`
        fixed md:relative inset-y-0 left-0 z-50 h-full chatgpt-sidebar flex flex-col
        transition-all duration-300 ease-in-out
        ${isOpen ? "w-64 translate-x-0" : "w-16 translate-x-0 md:translate-x-0"}
        ${!isOpen ? "-translate-x-full md:translate-x-0" : ""}
      `}
      >
        {/* Top Section */}
        <div className="flex-shrink-0 p-3">
          {/* Header */}
          <div
            className={`flex items-center mb-4 transition-all duration-300 ${
              isOpen ? "justify-between" : "justify-center"
            }`}
          >
            {/* ChatGPT Icon - Always visible */}
            <div className="flex items-center gap-2">
              <ChatGPTIcon />
            </div>

            {/* Toggle Button - Show when expanded */}
            {isOpen && (
              <button
                onClick={onToggle}
                className="p-1.5 rounded-lg chatgpt-hover opacity-100 transition-opacity duration-300"
              >
                <ToggleIcon />
              </button>
            )}
          </div>

          {/* New Chat Button */}
          <button
            className={`
            w-full flex items-center rounded-lg border border-white/20 chatgpt-hover text-left transition-all duration-300
            ${isOpen ? "gap-3 px-3 py-2.5" : "justify-center p-2.5"}
          `}
          >
            <NewChatIcon />
            <span
              className={`
              chatgpt-text text-sm whitespace-nowrap transition-all duration-300
              ${isOpen ? "opacity-100 w-auto" : "opacity-0 w-0 overflow-hidden"}
            `}
            >
              New chat
            </span>
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-shrink-0 px-3 pb-3">
          <div className="space-y-1">
            {/* Search chats */}
            <button
              className={`
              w-full flex items-center rounded-lg chatgpt-hover text-left transition-all duration-300
              ${isOpen ? "gap-3 px-3 py-2" : "justify-center p-2"}
            `}
            >
              <SearchIcon />
              <span
                className={`
                chatgpt-text text-sm whitespace-nowrap transition-all duration-300
                ${
                  isOpen
                    ? "opacity-100 w-auto"
                    : "opacity-0 w-0 overflow-hidden"
                }
              `}
              >
                Search chats
              </span>
            </button>

            {/* Library */}
            <button
              className={`
              w-full flex items-center rounded-lg chatgpt-hover text-left transition-all duration-300
              ${isOpen ? "gap-3 px-3 py-2" : "justify-center p-2"}
            `}
            >
              <LibraryIcon />
              <span
                className={`
                chatgpt-text text-sm whitespace-nowrap transition-all duration-300
                ${
                  isOpen
                    ? "opacity-100 w-auto"
                    : "opacity-0 w-0 overflow-hidden"
                }
              `}
              >
                Library
              </span>
            </button>

            {/* Sora */}
            <button
              className={`
              w-full flex items-center rounded-lg chatgpt-hover text-left transition-all duration-300
              ${isOpen ? "gap-3 px-3 py-2" : "justify-center p-2"}
            `}
            >
              <SoraIcon />
              <span
                className={`
                chatgpt-text text-sm whitespace-nowrap transition-all duration-300
                ${
                  isOpen
                    ? "opacity-100 w-auto"
                    : "opacity-0 w-0 overflow-hidden"
                }
              `}
              >
                Sora
              </span>
            </button>
          </div>
        </div>

        {/* Chats Section - Only show when expanded */}
        {isOpen && (
          <div className="flex-1 px-3 overflow-y-auto">
            <div className="text-xs chatgpt-text-muted font-medium px-3 py-2 mb-2">
              Chats
            </div>
            <div className="space-y-1">
              {chatItems.map((chat, index) => (
                <button
                  key={index}
                  className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg chatgpt-hover text-left group"
                >
                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                  <span className="chatgpt-text text-sm truncate flex-1">
                    {chat}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Section */}
        <div className="flex-shrink-0 p-3 border-t border-white/10">
          <button
            className={`
            w-full flex items-center rounded-lg chatgpt-hover text-left transition-all duration-300
            ${isOpen ? "gap-3 px-3 py-2" : "justify-center p-2"}
          `}
          >
            <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              U
            </div>
            <span
              className={`
              chatgpt-text text-sm whitespace-nowrap transition-all duration-300
              ${isOpen ? "opacity-100 w-auto" : "opacity-0 w-0 overflow-hidden"}
            `}
            >
              Upgrade plan
            </span>
          </button>
        </div>
      </div>
    </>
  );
}
