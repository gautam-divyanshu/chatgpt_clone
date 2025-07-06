import React, { useState, useRef, useEffect, useCallback } from "react";
import { EditableMessageProps } from "./types";

export function EditableMessage({
  content,
  onSave,
  onCancel,
}: EditableMessageProps) {
  const [editContent, setEditContent] = useState(content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const cursorPositionRef = useRef<number>(0);

  // Auto-resize textarea based on content
  const adjustTextareaSize = useCallback(() => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;

      // Store current cursor position
      cursorPositionRef.current = textarea.selectionStart;

      // Reset height to get accurate scroll height
      textarea.style.height = "auto";

      // Calculate the number of lines
      const lines = editContent.split("\n");
      const lineHeight = 28; // Approximate line height in pixels (based on leading-7 = 1.75rem)
      const paddingVertical = 0; // No extra padding needed
      const calculatedHeight = Math.max(
        lineHeight,
        lines.length * lineHeight + paddingVertical
      );

      // Set the height
      textarea.style.height = `${calculatedHeight}px`;

      // Calculate width based on content
      const maxLineLength = Math.max(...lines.map((line) => line.length), 10); // Minimum 10 chars

      // Set a dynamic width based on content length
      const minWidth = 200;
      const maxWidth = 600;
      const charWidth = 8.5; // More accurate character width for the font
      const calculatedWidth = Math.min(
        maxWidth,
        Math.max(minWidth, maxLineLength * charWidth + 32)
      ); // +32 for padding

      textarea.style.width = `${calculatedWidth}px`;

      // Restore cursor position after size adjustment
      setTimeout(() => {
        if (textarea) {
          textarea.setSelectionRange(cursorPositionRef.current, cursorPositionRef.current);
        }
      }, 0);
    }
  }, [editContent]);

  // Only run once when component mounts to focus and set initial cursor position
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      // Set cursor to end only on initial mount
      textareaRef.current.setSelectionRange(content.length, content.length);
      adjustTextareaSize();
    }
  }, []); // Empty dependency array - only run once

  // Run when content changes to adjust size, but preserve cursor position
  useEffect(() => {
    adjustTextareaSize();
  }, [editContent, adjustTextareaSize]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.ctrlKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      e.preventDefault();
      onCancel();
    }
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    // Store cursor position before updating content
    if (textareaRef.current) {
      cursorPositionRef.current = textareaRef.current.selectionStart;
    }
    setEditContent(e.target.value);
  };

  const handleSave = () => {
    if (editContent.trim()) {
      onSave(editContent.trim());
    }
  };

  return (
    <div className="bg-[#424242] rounded-3xl px-4 py-3 max-w-fit">
      <textarea
        ref={textareaRef}
        value={editContent}
        onChange={handleContentChange}
        onKeyDown={handleKeyPress}
        className="bg-transparent text-[#ececec] resize-none outline-none text-base font-sans whitespace-pre-wrap"
        style={{
          minHeight: "28px",
          width: "auto",
          minWidth: "200px",
          overflow: "hidden",
          lineHeight: "28px",
          padding: "0",
          margin: "0",
          border: "none",
        }}
        rows={1}
      />
      <div className="flex gap-2 mt-3 justify-end">
        <button
          onClick={onCancel}
          className="px-3 py-1 text-sm text-[#ececec] bg-[#212121] rounded-full hover:bg-[#2a2a2a] transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="px-3 py-1 text-sm bg-white text-black rounded-full hover:bg-gray-200 transition-colors"
        >
          Send
        </button>
      </div>
    </div>
  );
}