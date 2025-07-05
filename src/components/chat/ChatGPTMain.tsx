"use client";

import { useState } from "react";
import { ChatInput } from "./ChatInput";

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
            <div>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`px-4 py-6 ${
                    message.isUser && "bg-transparent"
                  }`}
                >
                  <div className="max-w-3xl mx-auto">
                    {message.isUser ? (
                      // User message - moved to right with edit/copy buttons below
                      <div className="flex flex-col items-end">
                        <div className="bg-[#2f2f2f] rounded-3xl px-4 py-3 max-w-fit">
                          <p className="text-[#ececec] text-base leading-7">
                            {message.content}
                          </p>
                        </div>
                        <div className="flex gap-2 mt-2">
                          <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
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
                          <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
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
                      </div>
                    ) : (
                      // AI message content - clean text without background
                      <div className="text-[#ececec] text-base leading-7 space-y-4">
                        <div className="whitespace-pre-wrap">
                          {message.content}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="px-4 py-6 bg-[#212121]">
                  <div className="max-w-3xl mx-auto">
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
              )}
            </div>
          </div>
        )}

        {/* Use ChatInput Component */}
        <ChatInput
          input={input}
          setInput={setInput}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
