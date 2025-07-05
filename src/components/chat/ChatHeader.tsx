import React from "react";

export function ChatHeader() {
  return (
    <div className="hidden md:flex justify-between items-center border-b border-white/10 px-6 py-4">
      <div className="flex items-center gap-2">
        <span className="chatgpt-text text-lg font-medium">ChatGPT</span>
        <svg
          className="w-4 h-4 chatgpt-text-muted"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
      <div className="flex items-center gap-2">
        <button className="p-2 rounded-lg chatgpt-hover">
          <svg
            className="w-5 h-5 chatgpt-text"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
            />
          </svg>
        </button>
        <button className="p-2 rounded-lg chatgpt-hover">
          <svg
            className="w-5 h-5 chatgpt-text"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
