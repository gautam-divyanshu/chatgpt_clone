"use client";

import { useState } from "react";

export function MainContent() {
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      console.log("Send message:", input);
      setInput("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full chatgpt-main">
      {/* Header - Desktop Only */}
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

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        {/* Center Content - Exact match to screenshot */}
        <div className="max-w-2xl w-full text-center space-y-8">
          {/* Main Heading */}
          <div className="space-y-2">
            <h1 className="text-3xl font-normal chatgpt-text">
              Ready when you are.
            </h1>
          </div>

          {/* Input Container - Exact styling */}
          <div className="chatgpt-input-container rounded-3xl p-4">
            <form onSubmit={handleSubmit} className="relative">
              <div className="flex items-center gap-3">
                {/* Plus Button */}
                <button
                  type="button"
                  className="flex-shrink-0 p-2 rounded-lg chatgpt-hover"
                >
                  <svg
                    className="w-5 h-5 chatgpt-text-muted"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </button>

                {/* Input Field */}
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask anything"
                  className="flex-1 bg-transparent chatgpt-text placeholder:chatgpt-text-muted outline-none text-base"
                />

                {/* Tools Button */}
                <button
                  type="button"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg chatgpt-hover"
                >
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
                      d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                    />
                  </svg>
                  <span className="text-sm chatgpt-text-muted">Tools</span>
                </button>

                {/* Voice Button */}
                <button
                  type="button"
                  className="flex-shrink-0 p-2 rounded-lg chatgpt-hover"
                >
                  <svg
                    className="w-5 h-5 chatgpt-text-muted"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                    />
                  </svg>
                </button>

                {/* Send Button */}
                {input.trim() && (
                  <button
                    type="submit"
                    className="flex-shrink-0 p-2 rounded-lg bg-white text-black hover:bg-gray-200 transition-colors"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
