"use client";

interface MessageProps {
  content: string;
  isUser: boolean;
  timestamp: string;
}

export function Message({ content, isUser, timestamp }: MessageProps) {
  return (
    <div className={`flex gap-4 p-4 ${isUser ? "bg-gray-50" : "bg-white"}`}>
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
          isUser ? "bg-blue-500" : "bg-green-500"
        }`}
      >
        {isUser ? "U" : "AI"}
      </div>

      {/* Message Content */}
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-sm">
            {isUser ? "You" : "Assistant"}
          </span>
          <span className="text-xs text-gray-500">{timestamp}</span>
        </div>
        <div className="text-gray-900 whitespace-pre-wrap">{content}</div>
      </div>
    </div>
  );
}
