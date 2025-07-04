"use client";

import { useState } from "react";

interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: string;
}

export function ChatGPTMain() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content,
      isUser: true,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: `This is a simulated response to: "${content}"\n\nI'm a demo ChatGPT clone with the exact UI design. In a real implementation, this would connect to an AI API.`,
        isUser: false,
        timestamp: new Date().toLocaleTimeString(),
      };

      setMessages((prev) => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(input);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(input);
    }
  };

  const handleExampleClick = (prompt: string) => {
    handleSendMessage(prompt);
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

      {/* Content Area */}
      <div className="flex-1 flex flex-col">
        {messages.length === 0 ? (
          /* Welcome Screen */
          <div className="flex-1 flex items-center justify-center px-6">
            <div className="max-w-4xl w-full">
              {/* Welcome Message */}
              <div className="text-center mb-12">
                <h1 className="text-4xl font-normal chatgpt-text mb-8">
                  How can I help you today?
                </h1>
              </div>

              {/* Example Prompts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto mb-8">
                <button
                  onClick={() =>
                    handleExampleClick(
                      "Explain quantum computing in simple terms"
                    )
                  }
                  className="p-4 rounded-2xl border border-white/20 chatgpt-hover text-left transition-all hover:border-white/30"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-4 h-4 text-blue-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium chatgpt-text text-sm mb-1">
                        Explain a concept
                      </div>
                      <div className="text-sm chatgpt-text-muted">
                        Explain quantum computing in simple terms
                      </div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() =>
                    handleExampleClick("Write a Python function to sort a list")
                  }
                  className="p-4 rounded-2xl border border-white/20 chatgpt-hover text-left transition-all hover:border-white/30"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-4 h-4 text-green-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                        />
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium chatgpt-text text-sm mb-1">
                        Help with code
                      </div>
                      <div className="text-sm chatgpt-text-muted">
                        Write a Python function to sort a list
                      </div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() =>
                    handleExampleClick(
                      "Write a short story about space exploration"
                    )
                  }
                  className="p-4 rounded-2xl border border-white/20 chatgpt-hover text-left transition-all hover:border-white/30"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-4 h-4 text-purple-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium chatgpt-text text-sm mb-1">
                        Creative writing
                      </div>
                      <div className="text-sm chatgpt-text-muted">
                        Write a short story about space exploration
                      </div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() =>
                    handleExampleClick(
                      "What are the benefits of renewable energy?"
                    )
                  }
                  className="p-4 rounded-2xl border border-white/20 chatgpt-hover text-left transition-all hover:border-white/30"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-4 h-4 text-orange-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium chatgpt-text text-sm mb-1">
                        Answer questions
                      </div>
                      <div className="text-sm chatgpt-text-muted">
                        What are the benefits of renewable energy?
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Messages */
          <div className="flex-1 overflow-y-auto">
            <div className="divide-y divide-white/10">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`p-6 ${message.isUser ? "bg-white/5" : ""}`}
                >
                  <div className="max-w-3xl mx-auto flex gap-4">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                        message.isUser ? "bg-blue-500" : "bg-green-500"
                      }`}
                    >
                      {message.isUser ? "U" : "AI"}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-sm chatgpt-text">
                          {message.isUser ? "You" : "ChatGPT"}
                        </span>
                        <span className="text-xs chatgpt-text-muted">
                          {message.timestamp}
                        </span>
                      </div>
                      <div className="chatgpt-text whitespace-pre-wrap">
                        {message.content}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="p-6">
                  <div className="max-w-3xl mx-auto flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-sm font-medium">
                      AI
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-sm chatgpt-text">
                          ChatGPT
                        </span>
                        <span className="text-xs chatgpt-text-muted">
                          typing...
                        </span>
                      </div>
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="flex-shrink-0 px-6 py-6">
          <div className="max-w-4xl mx-auto">
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
                    placeholder="Message ChatGPT..."
                    disabled={isLoading}
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
                  {input.trim() && !isLoading && (
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

            {/* Footer Text */}
            <p className="text-center text-xs chatgpt-text-muted mt-4">
              ChatGPT can make mistakes. Check important info.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
