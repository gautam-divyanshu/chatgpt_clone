"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ChatGPTIcon,
  NewChatIcon,
  SearchIcon,
  LibraryIcon,
  SoraIcon,
  ToggleIcon,
  GPTsIcon,
} from "@/components/ui/icons";
import { useConversations } from "@/components/providers/ConversationProvider";
import { ConversationManager } from "@/lib/conversationManager";
import { ConversationItem } from "./ConversationItem";
import { SearchPopover } from "./SearchPopover";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onToggle: () => void;
  currentConversationId?: string | null;
  onSelectConversation: (conversationId: string) => void;
  onNewChat: () => void;
}

export function Sidebar({
  isOpen,
  onClose,
  onToggle,
  currentConversationId,
  onSelectConversation,
  onNewChat,
}: SidebarProps) {
  const [loading, setLoading] = useState(false);
  const { conversations, refreshConversations } = useConversations();
  const [showSearchPopover, setShowSearchPopover] = useState(false);

  const loadConversations = useCallback(async () => {
    setLoading(true);
    try {
      await refreshConversations();
      console.log("📱 Sidebar: Loaded conversations");
    } catch (error) {
      console.error("Failed to load conversations:", error);
    } finally {
      setLoading(false);
    }
  }, [refreshConversations]);

  const handleSearchClick = useCallback(() => {
    setShowSearchPopover(true);
  }, []);

  const handleSearchSelect = useCallback(
    (conversationId: string) => {
      setShowSearchPopover(false);
      onSelectConversation(conversationId);
    },
    [onSelectConversation]
  );

  // Handle conversation rename
  const handleRename = useCallback(
    async (conversationId: string, newTitle: string) => {
      try {
        const response = await fetch(
          `/api/conversations/${conversationId}/rename`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ title: newTitle }),
          }
        );
        const data = await response.json();
        if (data.success) {
          await refreshConversations();
          console.log(
            `Renamed conversation ${conversationId} to "${newTitle}"`
          );
        } else {
          console.error("Failed to rename conversation:", data.error);
        }
      } catch (error) {
        console.error("Failed to rename conversation:", error);
      }
    },
    [refreshConversations]
  );

  // Handle conversation delete
  const handleDelete = useCallback(
    async (conversationId: string) => {
      try {
        const success = await ConversationManager.deleteConversation(
          conversationId
        );
        if (success) {
          await refreshConversations();
          console.log(`Deleted conversation ${conversationId}`);
          if (conversationId === currentConversationId) {
            window.location.href = "/";
          }
        }
      } catch (error) {
        console.error("Failed to delete conversation:", error);
      }
    },
    [refreshConversations, currentConversationId]
  );

  // Handle conversation share
  const handleShare = useCallback((conversationId: string) => {
    console.log(`Sharing conversation ${conversationId}`);
  }, []);

  // Load conversations when sidebar opens
  useEffect(() => {
    if (isOpen && conversations.length === 0) {
      loadConversations();
    }
  }, [isOpen, conversations.length, loadConversations]);

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed md:relative inset-y-0 left-0 z-50 h-full flex flex-col group
        transition-all duration-300 ease-in-out border-r border-black/20
        ${
          isOpen
            ? "w-64 translate-x-0 chatgpt-sidebar"
            : "w-16 md:translate-x-0 -translate-x-full md:block"
        }
        ${
          !isOpen
            ? "md:bg-[#212121] md:hover:chatgpt-sidebar"
            : "chatgpt-sidebar"
        }
      `}
        style={{
          backgroundColor: !isOpen ? "#212121" : "#171717",
          transition: "all 0.3s ease-in-out, background-color 0.3s ease-in-out",
        }}
      >
        {/* Top Section */}
        <div className="flex-shrink-0 mb-4 px-3 pt-3">
          {/* Header */}
          <div className="relative w-full group/header">
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

              {/* Toggle Button */}
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
            onClick={onNewChat}
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
            onClick={handleSearchClick}
            className={`
            w-full flex items-center rounded-lg chatgpt-hover text-left transition-all duration-300
            ${isOpen ? "gap-2 px-3 py-2" : "justify-center p-2"}
          `}
          >
            <SearchIcon />
            <span
              className={`
              chatgpt-text text-sm whitespace-nowrap transition-all duration-300
              ${isOpen ? "opacity-100 w-auto" : "opacity-0 w-0 overflow-hidden"}
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
            disabled
            style={{ opacity: 0.5, cursor: "not-allowed" }}
            onClick={(e) => e.preventDefault()}
          >
            <LibraryIcon />
            <span
              className={`
              chatgpt-text text-sm whitespace-nowrap transition-all duration-300
              ${isOpen ? "opacity-100 w-auto" : "opacity-0 w-0 overflow-hidden"}
            `}
            >
              Library
            </span>
          </button>
        </div>

        <div>
          {/* Sora - Only show when expanded */}
          {isOpen && (
            <button
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg chatgpt-hover text-left transition-all duration-300"
              disabled
              style={{ opacity: 0.5, cursor: "not-allowed" }}
              onClick={(e) => e.preventDefault()}
            >
              <SoraIcon />
              <span className="chatgpt-text text-sm whitespace-nowrap">
                Sora
              </span>
            </button>
          )}

          {/* GPTs - Only show when expanded */}
          {isOpen && (
            <button
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg chatgpt-hover text-left transition-all duration-300"
              disabled
              style={{ opacity: 0.5, cursor: "not-allowed" }}
              onClick={(e) => e.preventDefault()}
            >
              <GPTsIcon />
              <span className="chatgpt-text text-sm whitespace-nowrap">
                GPTs
              </span>
            </button>
          )}
        </div>

        {/* Conversations Section - Only show when expanded */}
        {isOpen && (
          <div className="flex-1 overflow-y-auto">
            <div className="text-xs chatgpt-text-muted font-medium px-3 pt-6 pb-2">
              Chats
            </div>
            {loading ? (
              <div className="px-3 py-4 text-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white/60 mx-auto mb-2"></div>
                <p className="text-xs chatgpt-text-muted">Loading...</p>
              </div>
            ) : conversations.length === 0 ? (
              <div className="px-3 py-4 text-center">
                <p className="text-xs chatgpt-text-muted">
                  No conversations yet
                </p>
              </div>
            ) : (
              <div className=" px-1">
                {conversations.map((conversation) => (
                  <ConversationItem
                    key={conversation.id}
                    conversation={conversation}
                    isActive={currentConversationId === conversation.id}
                    onSelect={onSelectConversation}
                    onRename={handleRename}
                    onDelete={handleDelete}
                    onShare={handleShare}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Bottom Section */}
        <div className="flex-shrink-0 p-3">
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

      {/* Search Popover */}
      <SearchPopover
        isOpen={showSearchPopover}
        onClose={() => setShowSearchPopover(false)}
        onSelectConversation={handleSearchSelect}
      />
    </>
  );
}
