"use client";

import { Button } from "@/components/ui/button";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed md:relative inset-y-0 left-0 z-50
        w-64 h-full bg-gray-900 dark:bg-gray-800 text-white p-4 flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}
      >
        {/* Mobile Close Button */}
        <div className="md:hidden flex justify-end mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-gray-800"
          >
            ✕
          </Button>
        </div>

        {/* Header */}
        <div className="mb-4">
          <Button className="w-full bg-gray-800 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 text-white border border-gray-600 dark:border-gray-500">
            + New Chat
          </Button>
        </div>

        {/* Chat History */}
        <div className="flex-1 space-y-2">
          <h3 className="text-sm font-medium text-gray-400 mb-2">
            Recent Chats
          </h3>

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
            <div className="p-2 rounded hover:bg-gray-800 cursor-pointer text-sm">
              Python data structures
            </div>
            <div className="p-2 rounded hover:bg-gray-800 cursor-pointer text-sm">
              Web development roadmap
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
    </>
  );
}
