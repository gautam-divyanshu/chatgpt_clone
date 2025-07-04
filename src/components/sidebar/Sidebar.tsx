"use client";

import { Button } from "@/components/ui/button";
// import { Card } from "@/components/ui/card";

export function Sidebar() {
  return (
    <div className="w-64 h-full bg-gray-900 text-white p-4 flex flex-col">
      {/* Header */}
      <div className="mb-4">
        <Button className="w-full bg-gray-800 hover:bg-gray-700 text-white border border-gray-600">
          + New Chat
        </Button>
      </div>

      {/* Chat History */}
      <div className="flex-1 space-y-2">
        <h3 className="text-sm font-medium text-gray-400 mb-2">Recent Chats</h3>

        {/* Sample chat items */}
        <div className="space-y-1">
          <div className="p-2 rounded hover:bg-gray-800 cursor-pointer text-sm">
            How to learn React?
          </div>
          <div className="p-2 rounded hover:bg-gray-800 cursor-pointer text-sm">
            JavaScript best practices
          </div>
          <div className="p-2 rounded hover:bg-gray-800 cursor-pointer text-sm">
            CSS Grid vs Flexbox
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="text-xs text-gray-400 text-center">
          ChatGPT Clone v1.0
        </div>
      </div>
    </div>
  );
}
