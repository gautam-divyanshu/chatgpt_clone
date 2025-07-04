"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Message } from "./Message";
import { ChatInput } from "./ChatInput";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useState } from "react";

interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: string;
}

export function MainContent() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (content: string) => {
    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content,
      isUser: true,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    // Simulate AI response after a delay
    setTimeout(() => {
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: `This is a simulated response to: "${content}"\n\nI'm a demo ChatGPT clone built with Next.js, TypeScript, and Tailwind CSS. In a real implementation, this would connect to an AI API to generate responses.`,
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
    <div className="flex-1 flex flex-col h-full">
      {/* Header - Desktop Only */}
      <div className="hidden md:flex justify-between items-center border-b border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-900">
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
          ChatGPT
        </h1>
        <ThemeToggle />
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          // Welcome Screen
          <div className="p-6 bg-gray-50 dark:bg-gray-900 h-full">
            <div className="max-w-3xl mx-auto">
              <Card className="mb-6">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <h2 className="text-2xl font-bold mb-2">
                      How can I help you today?
                    </h2>
                    <p className="text-gray-600">
                      Start a conversation or try one of these examples:
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Example Prompts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() =>
                    handleExampleClick(
                      "Explain quantum computing in simple terms"
                    )
                  }
                >
                  <CardContent className="p-4">
                    <h3 className="font-medium mb-1">Explain a concept</h3>
                    <p className="text-sm text-gray-600">
                      Explain quantum computing in simple terms
                    </p>
                  </CardContent>
                </Card>

                <Card
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() =>
                    handleExampleClick("Write a Python function to sort a list")
                  }
                >
                  <CardContent className="p-4">
                    <h3 className="font-medium mb-1">Help with code</h3>
                    <p className="text-sm text-gray-600">
                      Write a Python function to sort a list
                    </p>
                  </CardContent>
                </Card>

                <Card
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() =>
                    handleExampleClick(
                      "Write a short story about space exploration"
                    )
                  }
                >
                  <CardContent className="p-4">
                    <h3 className="font-medium mb-1">Creative writing</h3>
                    <p className="text-sm text-gray-600">
                      Write a short story about space exploration
                    </p>
                  </CardContent>
                </Card>

                <Card
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() =>
                    handleExampleClick(
                      "What are the benefits of renewable energy?"
                    )
                  }
                >
                  <CardContent className="p-4">
                    <h3 className="font-medium mb-1">Answer questions</h3>
                    <p className="text-sm text-gray-600">
                      What are the benefits of renewable energy?
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        ) : (
          // Messages
          <div className="divide-y divide-gray-100">
            {messages.map((message) => (
              <Message
                key={message.id}
                content={message.content}
                isUser={message.isUser}
                timestamp={message.timestamp}
              />
            ))}

            {isLoading && (
              <div className="flex gap-4 p-4 bg-white">
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-sm font-medium">
                  AI
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">Assistant</span>
                    <span className="text-xs text-gray-500">typing...</span>
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
            )}
          </div>
        )}
      </div>

      {/* Input Area */}
      <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
    </div>
  );
}
