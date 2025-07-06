"use client";

import { useState, useEffect } from "react";
import {
  ChatGPTIcon,
  NewChatIcon,
  SearchIcon,
  LibraryIcon,
  SoraIcon,
  ToggleIcon,
  GPTsIcon,
} from "@/components/ui/icons";
import { ConversationManager, type Conversation } from "@/lib/conversationManager";

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
  onNewChat 
}: SidebarProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  // Load conversations on mount and when sidebar opens
  useEffect(() => {
    if (isOpen) {
      loadConversations();
    }
  }, [isOpen]);

  const loadConversations = async () => {
    setLoading(true);
    try {
      const allConversations = await ConversationManager.getAllConversations(50);
      setConversations(allConversations);
      console.log('📱 Sidebar: Loaded', allConversations.length, 'conversations');
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  // Refresh conversations when a new conversation might be created
  useEffect(() => {
    if (isOpen && currentConversationId && conversations.length > 0) {
      // Only refresh if we don't have this conversation in our list (new conversation created)
      const hasConversation = conversations.some(conv => conv.id === currentConversationId);
      if (!hasConversation) {
        loadConversations();
      }
    }
  }, [currentConversationId, isOpen, conversations.length]);

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

        {/* Conversations Section - Only show when expanded */}
        {isOpen && (
          <div className="flex-1 overflow-y-auto">
            <div className="text-xs chatgpt-text-muted font-medium px-3 pt-6 pb-2">
              Recent Chats
            </div>
            
            {loading ? (
              <div className="px-3 py-4 text-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white/60 mx-auto mb-2"></div>
                <p className="text-xs chatgpt-text-muted">Loading...</p>
              </div>
            ) : conversations.length === 0 ? (
              <div className="px-3 py-4 text-center">
                <p className="text-xs chatgpt-text-muted">No conversations yet</p>
              </div>
            ) : (
              <div className="space-y-1 px-1">
                {conversations.map((conversation) => (
                  <div key={conversation.id}>
                    <button
                      onClick={() => onSelectConversation(conversation.id)}
                      className={`w-full flex items-center px-3 py-2.5 rounded-lg chatgpt-hover text-left transition-all ${
                        currentConversationId === conversation.id
                          ? 'bg-white/10 border border-white/20'
                          : 'border border-transparent'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="chatgpt-text text-sm truncate font-medium">
                          {conversation.title}
                        </div>
                      </div>
                    </button>
                  </div>
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
    </>
  );
}