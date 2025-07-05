"use client";

import { useRef, useEffect } from "react";
import {
  PlusIcon,
  ToolsIcon,
  MicrophoneIcon,
  SendIcon,
  UpArrowIcon,
} from "@/components/ui/icons";

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  onSendMessage: (content: string) => void;
  isLoading: boolean;
}

export function ChatInput({
  input,
  setInput,
  onSendMessage,
  isLoading,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Auto-resize textarea based on content
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      // Reset height to auto to get accurate scrollHeight
      textarea.style.height = "auto";

      const scrollHeight = textarea.scrollHeight;
      const maxHeight = 300; // Maximum height in pixels
      const minHeight = 24; // Minimum height (single line)

      if (scrollHeight <= maxHeight) {
        // Content fits within max height - expand naturally
        textarea.style.height = `${Math.max(scrollHeight, minHeight)}px`;
        textarea.style.overflowY = "hidden";
      } else {
        // Content exceeds max height - fix height and show scroll
        textarea.style.height = `${maxHeight}px`;
        textarea.style.overflowY = "auto";
      }
    }
  }, [input]);

  return (
    <div className="px-4 py-4">
      <div className="max-w-4xl mx-auto">
        {/* Main Input Container */}
        <div className="chatgpt-input-container rounded-3xl px-4 py-3">
          {/* Input Field Row */}
          <div className="flex items-start mb-3">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask anything"
              disabled={isLoading}
              rows={1}
              className="flex-1 bg-transparent text-white placeholder:text-gray-400 outline-none text-base border-0 resize-none min-h-[24px] leading-6"
              style={{
                maxHeight: "300px",
                scrollbarWidth: "thin",
                scrollbarColor: "#6b7280 transparent",
              }}
            />
          </div>

          {/* Buttons Row */}
          <div className="flex items-center justify-between">
            {/* Left side buttons */}
            <div className="flex items-center gap-2">
              {/* Plus Button */}
              <button
                type="button"
                className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-white/10 transition-colors text-white"
              >
                <PlusIcon />
              </button>

              {/* Tools Button */}
              <button
                type="button"
                className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-white/10 transition-colors text-white"
              >
                <ToolsIcon />
                <span className="text-sm">Tools</span>
              </button>
            </div>

            {/* Right side buttons */}
            <div className="flex items-center gap-2">
              {/* Voice Button */}
              <button
                type="button"
                className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-white/10 transition-colors text-white"
              >
                <MicrophoneIcon />
              </button>

              {/* Send Button (when typing) */}
              {input.trim() && !isLoading && (
                <button
                  onClick={handleSubmit}
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-white text-black hover:bg-gray-200 transition-colors"
                >
                  <SendIcon />
                </button>
              )}

              {/* Up Arrow Button (when empty) */}
              {!input.trim() && (
                <button
                  type="button"
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-[#565869] hover:bg-[#6b6d80] transition-colors text-white"
                >
                  <UpArrowIcon />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
