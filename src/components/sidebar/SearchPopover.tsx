"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { Portal } from "@/components/ui/Portal";
import {   X, Search } from "lucide-react";

interface SearchResult {
  id: string;
  title: string;
  excerpt?: string;
  createdAt: string;
  lastMessageAt: string;
}

interface SearchPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectConversation: (conversationId: string) => void;
  onNewChat?: () => void;
}

export function SearchPopover({
  isOpen,
  onClose,
  onSelectConversation,
}: SearchPopoverProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Focus search input when opened
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Reset state when closed
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
      setSearchResults([]);
      setHasSearched(false);
      setIsSearching(false);
    }
  }, [isOpen]);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      performSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const performSearch = async (query: string) => {
    if (!query.trim()) return;

    setIsSearching(true);
    setHasSearched(true);

    try {
      const response = await fetch(
        `/api/conversations/search?q=${encodeURIComponent(query)}`
      );
      const data = await response.json();
      if (data.success) {
        setSearchResults(data.results || []);
      } else {
        console.error("Search failed:", data.error);
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectResult = (conversationId: string) => {
    onSelectConversation(conversationId);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`;
    return `${Math.ceil(diffDays / 365)} years ago`;
  };

  if (!isOpen) return null;

  return (
    <Portal>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />

      {/* Search Modal */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
        <div className="bg-[#2a2a2a] rounded-2xl w-[500px] max-w-[90vw] max-h-[70vh] flex flex-col border border-gray-700/50 shadow-2xl">
          {/* Header with Search Input */}
          <div className="flex items-center gap-3 p-4 border-b border-gray-700/50">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search chats..."
                className="w-full pl-10 pr-4 py-2.5 bg-transparent border-none text-gray-300 placeholder-gray-500 focus:outline-none text-sm"
              />
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-gray-700/50 transition-colors"
              title="Close"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-2">
              {isSearching ? (
                <div className="flex items-center justify-center py-8">
                  <div className="flex items-center gap-3 text-gray-400">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                    <span className="text-sm">Searching...</span>
                  </div>
                </div>
              ) : hasSearched && searchResults.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-white/60">
                <svg
                  className="w-12 h-12 mb-4 text-white/30"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <p className="text-lg mb-2">No conversations found</p>
                <p className="text-sm text-white/40">
                    Try adjusting your search terms
                  </p>
                </div>
            ) : searchResults.length > 0 ? (
                        <div className="space-y-1">
                {searchResults.map((result) => (
                            <button
                              key={result.id}
                              onClick={() => handleSelectResult(result.id)}
                    className="w-full text-left p-4 rounded-lg hover:bg-white/5 transition-colors group"
                            >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-medium text-sm mb-1 truncate group-hover:text-white">
                                {result.title}
                        </h3>
                        {result.excerpt && (
                          <p className="text-white/60 text-xs line-clamp-2 mb-2">
                            {result.excerpt}
                          </p>
                        )}
                        <p className="text-white/40 text-xs">
                          {formatDate(result.lastMessageAt)}
                        </p>
                      </div>
                      
                      <svg
                        className="w-4 h-4 text-white/40 group-hover:text-white/60 flex-shrink-0 mt-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                            </button>
                          ))}
                        </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-white/60">
                <svg
                  className="w-12 h-12 mb-4 text-white/30"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <p className="text-lg mb-2">Search conversations</p>
                <p className="text-sm text-white/40">
                  Type to start searching your chat history
                </p>
                      </div>
            )}
                </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-white/10">
            <div className="flex items-center justify-between text-xs text-white/40">
              <span>Use keywords to find specific conversations</span>
              <span>ESC to close</span>
            </div>
          </div>
        </div>
      </div>
    </Portal>
  );
}
