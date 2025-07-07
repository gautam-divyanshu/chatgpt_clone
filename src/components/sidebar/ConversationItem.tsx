'use client';

import { useState, useRef, useEffect } from 'react';
import { SharePopover } from '@/components/chat/SharePopover';
import { Portal } from '@/components/ui/Portal';

interface ConversationItemProps {
  conversation: {
    id: string;
    title: string;
    createdAt: string;
    updatedAt: string;
    messageCount: number;
    lastMessageAt: string;
  };
  isActive: boolean;
  onSelect: (id: string) => void;
  onRename: (id: string, newTitle: string) => void;
  onDelete: (id: string) => void;
  onShare: (id: string) => void;
}

export function ConversationItem({
  conversation,
  isActive,
  onSelect,
  onRename,
  onDelete,
}: ConversationItemProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newTitle, setNewTitle] = useState(conversation.title);
  const [showSharePopover, setShowSharePopover] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const renameInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  // Focus input when renaming starts
  useEffect(() => {
    if (isRenaming && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [isRenaming]);

  const handleConversationClick = () => {
    // Don't select conversation if clicking on dropdown or while renaming
    if (isRenaming || isDropdownOpen) return;
    onSelect(conversation.id);
  };

  const handleDropdownToggle = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent conversation selection
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleRenameClick = () => {
    setIsRenaming(true);
    setIsDropdownOpen(false);
  };

  const handleRenameSubmit = () => {
    if (newTitle.trim() && newTitle.trim() !== conversation.title) {
      onRename(conversation.id, newTitle.trim());
    }
    setIsRenaming(false);
    setNewTitle(conversation.title);
  };

  const handleRenameCancel = () => {
    setIsRenaming(false);
    setNewTitle(conversation.title);
  };

  const handleDeleteClick = () => {
    onDelete(conversation.id);
    setIsDropdownOpen(false);
  };

  const handleShareClick = () => {
    setShowSharePopover(true);
    setIsDropdownOpen(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRenameSubmit();
    } else if (e.key === 'Escape') {
      handleRenameCancel();
    }
  };

  return (
    <>
      <div className="group relative">
        <div
          onClick={handleConversationClick}
          className={`w-full flex items-center px-3 py-1 rounded-lg cursor-pointer transition-all ${
            isActive
              ? 'bg-white/5 '
              : 'border border-transparent chatgpt-hover'
          }`}
        >
          <div className="flex-1 min-w-0">
            {isRenaming ? (
              <input
                ref={renameInputRef}
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onBlur={handleRenameSubmit}
                onKeyDown={handleKeyPress}
                className="w-full bg-transparent border border-white/30 rounded px-2 py-1 text-sm chatgpt-text focus:outline-none focus:border-white/60"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <div className="chatgpt-text text-sm truncate ">
                {conversation.title}
              </div>
            )}
          </div>

          {/* Three dots menu - visible on hover */}
          {!isRenaming && (
            <div
              ref={dropdownRef}
              className="relative opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <button
                onClick={handleDropdownToggle}
                className="p-1.5 rounded-md hover:bg-white/20 transition-colors"
                title="More options"
              >
                <svg
                  className="w-4 h-4 chatgpt-text"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                  />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 top-8 w-48 bg-[#2f2f2f] border border-white/20 rounded-lg shadow-xl z-50 py-1">
                  <button
                    onClick={handleRenameClick}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm chatgpt-text hover:bg-white/10 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" 
                      />
                    </svg>
                    Rename
                  </button>

                  <button
                    onClick={handleShareClick}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm chatgpt-text hover:bg-white/10 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" 
                      />
                    </svg>
                    Share
                  </button>

                  <hr className="my-1 border-white/10" />

                  <button
                    onClick={handleDeleteClick}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:bg-red-500/20 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1H8a1 1 0 00-1 1v3M4 7h16" 
                      />
                    </svg>
                    Delete
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Share Popover - Rendered using Portal to escape sidebar positioning */}
      {showSharePopover && (
        <Portal>
          <SharePopover
            isOpen={showSharePopover}
            onClose={() => setShowSharePopover(false)}
            conversationId={conversation.id}
          />
        </Portal>
      )}
    </>
  );
}
