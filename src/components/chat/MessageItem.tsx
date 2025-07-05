import React from "react";
import { ChatMessage } from "./types";
import { EditableMessage } from "./EditableMessage";

interface MessageItemProps {
  message: ChatMessage;
  onEditMessage: (messageId: string) => void;
  onSaveEdit: (messageId: string, newContent: string) => void;
  onCancelEdit: (messageId: string) => void;
}

export function MessageItem({
  message,
  onEditMessage,
  onSaveEdit,
  onCancelEdit,
}: MessageItemProps) {
  return (
    <div className={`px-4 py-6 ${message.isUser && "bg-transparent"}`}>
      <div className="max-w-3xl mx-auto">
        {message.isUser ? (
          // User message with editing functionality
          <div className="flex flex-col items-end">
            {message.isEditing ? (
              // Edit mode
              <div className="w-full max-w-fit">
                <EditableMessage
                  content={message.content}
                  onSave={(newContent) => onSaveEdit(message.id, newContent)}
                  onCancel={() => onCancelEdit(message.id)}
                />
              </div>
            ) : (
              // Display mode
              <>
                <div className="bg-[#2f2f2f] rounded-3xl px-4 py-3 max-w-fit">
                  <pre className="text-[#ececec] text-base leading-7 whitespace-pre-wrap font-sans">
                    {message.content}
                  </pre>
                </div>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => onEditMessage(message.id)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    title="Edit message"
                  >
                    <svg
                      className="w-4 h-4 text-[#8e8ea0]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </button>
                  <button
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    title="Copy message"
                  >
                    <svg
                      className="w-4 h-4 text-[#8e8ea0]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          // AI message content
          <div className="text-[#ececec] text-base leading-7 space-y-4">
            <div className="whitespace-pre-wrap">
              {message.content}
              {message.isStreaming && (
                <span
                  className="inline-block w-2 h-5 ml-1 animate-pulse"
                  style={{ backgroundColor: "#ececec" }}
                ></span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
