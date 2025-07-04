"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function MainContent() {
  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-gray-200 p-4 bg-white">
        <h1 className="text-lg font-semibold">ChatGPT</h1>
      </div>

      {/* Chat Area */}
      <div className="flex-1 p-6 overflow-y-auto bg-gray-50">
        {/* Welcome Message */}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <h3 className="font-medium mb-1">Explain a concept</h3>
                <p className="text-sm text-gray-600">
                  Explain quantum computing in simple terms
                </p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <h3 className="font-medium mb-1">Help with code</h3>
                <p className="text-sm text-gray-600">
                  Write a Python function to sort a list
                </p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <h3 className="font-medium mb-1">Creative writing</h3>
                <p className="text-sm text-gray-600">
                  Write a short story about space exploration
                </p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
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

      {/* Input Area */}
      <div className="border-t border-gray-200 p-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="flex gap-2">
            <Input placeholder="Message ChatGPT..." className="flex-1" />
            <Button>Send</Button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            ChatGPT can make mistakes. Check important info.
          </p>
        </div>
      </div>
    </div>
  );
}
