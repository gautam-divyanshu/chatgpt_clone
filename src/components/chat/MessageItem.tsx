import React, { useState } from "react";
import { ChatMessage } from "./types";
import { EditableMessage } from "./EditableMessage";
import { MarkdownRenderer } from "./MarkdownRenderer";

interface MessageItemProps {
  message: ChatMessage;
  onEditMessage: (messageId: string) => void;
  onSaveEdit: (messageId: string, newContent: string) => void;
  onCancelEdit: (messageId: string) => void;
  onRetryMessage?: (messageId: string) => void;
}

export function MessageItem({
  message,
  onEditMessage,
  onSaveEdit,
  onCancelEdit,
  onRetryMessage,
}: MessageItemProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  // Format the content properly - replace \n with actual line breaks
  const formatContent = (content: string) => {
    return content.replace(/\\n/g, '\n');
  };

  // Check if message has error status
  const hasError = message.status === 'error';
  const isRetrying = message.status === 'retrying';

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
                    onClick={() => handleCopy(message.content)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    title={copied ? "Copied!" : "Copy message"}
                  >
                    {copied ? (
                      <svg
                        className="w-4 h-4 text-green-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    ) : (
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
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          // AI message content with enhanced error handling
          <div className="group">
            <div className="text-base leading-7">
              {hasError || isRetrying ? (
                // Error state
                <div className={`p-4 rounded-lg border ${
                  hasError 
                    ? 'bg-red-900/20 border-red-500/50 text-red-200' 
                    : 'bg-yellow-900/20 border-yellow-500/50 text-yellow-200'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    {hasError ? (
                      <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-yellow-400 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    )}
                    <span className="font-medium">
                      {hasError ? 'Error' : 'Retrying...'}
                      {message.retryCount ? ` (Attempt ${message.retryCount})` : ''}
                    </span>
                  </div>
                  <p>{message.content}</p>
                </div>
              ) : (
                // Normal content with markdown
                <MarkdownRenderer content={formatContent(message.content)} />
              )}
              
              {message.isStreaming && !hasError && !isRetrying && (
                <span
                  className="inline-block w-2 h-5 ml-1 animate-pulse"
                  style={{ backgroundColor: "#ececec" }}
                ></span>
              )}
            </div>
            
            {/* AI message actions - show when not streaming and has content */}
            {!message.isStreaming && message.content && (
              <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleCopy(formatContent(message.content))}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  title={copied ? "Copied!" : "Copy response"}
                >
                  {copied ? (
                    <svg
                      className="w-4 h-4 text-green-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
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
                  )}
                </button>
                
                {/* Retry button - show for ALL AI messages */}
                {onRetryMessage && (
                  <button
                    onClick={() => onRetryMessage(message.id)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    title="Regenerate response"
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
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}