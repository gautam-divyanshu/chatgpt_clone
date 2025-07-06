"use client";

import {
  ChatGPTIcon,
  NewChatIcon,
  SearchIcon,
  LibraryIcon,
  SoraIcon,
  ToggleIcon,
  GPTsIcon,
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

      {/* Sidebar - Fixed mobile animation */}
      <div
        className={`
        fixed md:relative inset-y-0 left-0 z-50 h-full flex flex-col group
        transition-all duration-300 ease-in-out border-r border-black/20
        ${
          isOpen
            ? "w-64 translate-x-0 chatgpt-sidebar"
            : "w-16 md:translate-x-0 -translate-x-full md:block"
        }
        ${!isOpen ? "md:bg-[#212121] md:hover:chatgpt-sidebar" : "chatgpt-sidebar"}
      `}
        style={{
          backgroundColor: !isOpen ? "#212121" : undefined,
          transition: "all 0.3s ease-in-out, background-color 0.3s ease-in-out",
        }}
      >
        {/* Top Section */}
        <div className="flex-shrink-0 mb-4 px-3 pt-3">
          {/* Header */}
          <div className="relative w-full group/header">
            {/* Container that maintains the layout */}
            <div
              className={`flex items-center h-8 transition-all duration-500 ease-in-out ${
                isOpen ? "justify-between" : "justify-center"
              }`}
            >
              {/* ChatGPT Icon */}
              <div
                className={`transition-opacity duration-300 ${
                  isOpen
                    ? "opacity-100"
                    : "opacity-100 group-hover/header:opacity-0"
                }`}
              >
                <ChatGPTIcon />
              </div>

              {/* Toggle Button - Only visible when open or on hover when closed */}
              <button
                onClick={onToggle}
                className={`rounded-lg chatgpt-hover transition-all duration-500 ease-in-out ${
                  isOpen
                    ? "opacity-100 pr-1"
                    : "opacity-0 group-hover/header:opacity-100 absolute left-1/2 transform -translate-x-1/2"
                }`}
              >
                <ToggleIcon />
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="pt-2 pb-3">
          {/* New Chat Button */}
          <button
            className={`
            w-full flex items-center rounded-lg chatgpt-hover text-left transition-all duration-300
            ${isOpen ? "gap-2 px-3 py-2.5" : "justify-center p-2.5"}
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

          {/* Search chats */}
          <button
            className={`
              w-full flex items-center rounded-lg chatgpt-hover text-left transition-all duration-300
              ${isOpen ? "gap-2 px-3 py-2" : "justify-center p-2"}
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
              ${isOpen ? "gap-2 px-3 py-2" : "justify-center p-2"}
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
        </div>
        <div>
          {/* Sora - Only show when expanded */}
          {isOpen && (
            <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg chatgpt-hover text-left transition-all duration-300">
              <SoraIcon />
              <span className="chatgpt-text text-sm whitespace-nowrap">
                Sora
              </span>
            </button>
          )}

          {/* GPTs - Only show when expanded */}
          {isOpen && (
            <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg chatgpt-hover text-left transition-all duration-300">
              <GPTsIcon />
              <span className="chatgpt-text text-sm whitespace-nowrap">
                GPTs
              </span>
            </button>
          )}
        </div>

        {/* Chats Section - Only show when expanded */}
        {isOpen && (
          <div className="flex-1 overflow-y-auto">
            <div className="text-2xs chatgpt-text-muted font-medium px-3 pt-6">
              Chats
            </div>
            <div className="space-y-1">
              {chatItems.map((chat, index) => (
                <button
                  key={index}
                  className="w-full flex items-center gap-2 px-4 py-2 rounded-lg chatgpt-hover text-left group"
                >
                  <span className="chatgpt-text text-sm truncate flex-1">
                    {chat}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Section */}
        <div className="flex-shrink-0 p-3 ">
          <button
            className={`
            w-full flex items-center rounded-lg chatgpt-hover text-left transition-all duration-300
            ${isOpen ? "gap-3 px-3 py-2" : "justify-center p-2"}
          `}
          >
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