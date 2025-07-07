"use client";

import { useRef, useEffect, useState } from "react";
import { FileUpload } from "./FileUpload";
import { CompactFilePreview } from "./CompactFilePreview";
import { UploadedFile } from "./upload-types";
import {
  ToolsIcon,
  MicrophoneIcon,
  StopIcon,
  SendIcon,
  UpArrowIcon,
} from "../ui/icons";

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  onSendMessage: (content: string, attachments?: UploadedFile[]) => void;
  onStopStreaming: () => void;
  isLoading: boolean;
}

export function ChatInput({
  input,
  setInput,
  onSendMessage,
  onStopStreaming,
  isLoading,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [attachments, setAttachments] = useState<UploadedFile[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((input.trim() || attachments.length > 0) && !isLoading) {
      onSendMessage(input.trim(), attachments);
      setAttachments([]); // Clear attachments after sending
      setUploadError(null);
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

  const handleFileUpload = (file: UploadedFile) => {
    setAttachments((prev) => [...prev, file]);
    setUploadError(null);
  };

  const handleUploadError = (error: string) => {
    setUploadError(error);
  };

  const removeAttachment = (fileId: string) => {
    setAttachments((prev) => prev.filter((file) => file.id !== fileId));
  };

  return (
    <div className="flex-shrink-0 px-6 py-6">
      <div className="max-w-4xl mx-auto">
        {/* Upload Error */}
        {uploadError && (
          <div className="mb-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-sm text-red-400">{uploadError}</p>
            <button
              onClick={() => setUploadError(null)}
              className="text-xs text-red-300 hover:text-red-200 mt-1"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Main Input Container */}
        <div className="chatgpt-input-container rounded-3xl px-4 py-3">
          {/* Compact File Attachments - Inside input area */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {attachments.map((file) => (
                <CompactFilePreview
                  key={file.id}
                  file={file}
                  onRemove={() => removeAttachment(file.id)}
                />
              ))}
            </div>
          )}

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
              className="flex-1 bg-transparent chatgpt-text placeholder:text-white outline-none text-base border-0 resize-none min-h-[24px] leading-6"
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
              {/* File Upload Button */}
              <FileUpload
                onFileUpload={handleFileUpload}
                onUploadError={handleUploadError}
              />

              {/* Tools Button */}
                <button
                type="button"
                className="flex items-center gap-2 px-3 py-2 rounded-full chatgpt-hover transition-colors chatgpt-text opacity-50 cursor-not-allowed"
                disabled
                tabIndex={-1}
                aria-disabled="true"
                >
                <ToolsIcon className="w-5 h-5" />
                <span className="text-sm">Tools</span>
                </button>
            </div>

            {/* Right side buttons */}
            <div className="flex items-center gap-2">
              {/* Voice Button */}
              <button
                type="button"
                className="flex items-center justify-center w-8 h-8 rounded-full chatgpt-hover transition-colors chatgpt-text"
              >
                <MicrophoneIcon className="w-5 h-5" />
              </button>

              {/* Stop Button (when AI is responding) */}
              {isLoading && (
                <button
                  type="button"
                  onClick={onStopStreaming}
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-white text-black hover:bg-gray-200 transition-colors"
                  title="Stop generating"
                >
                  <StopIcon className="w-5 h-5" />
                </button>
              )}

              {/* Send Button (when user has typed something and not loading) */}
              {(input.trim() || attachments.length > 0) && !isLoading && (
                <button
                  onClick={handleSubmit}
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-white text-black hover:bg-gray-200 transition-colors"
                >
                  <SendIcon className="w-5 h-5" />
                </button>
              )}

              {/* Up Arrow Button (when empty and not loading) */}
              {!input.trim() && attachments.length === 0 && !isLoading && (
                <button
                  type="button"
                  className="flex items-center justify-center w-9 h-9 rounded-full bg-white/40 hover:bg-[#6b6d80] transition-colors text-black/70"
                >
                  <UpArrowIcon className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer Text */}
        <p className="text-center text-xs chatgpt-text-muted mt-4">
          ChatGPT can make mistakes. Check important info.
        </p>
      </div>
    </div>
  );
}
