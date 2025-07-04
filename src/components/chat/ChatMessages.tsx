"use client";

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: string;
}

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
}

export function ChatMessages({ messages, isLoading }: ChatMessagesProps) {
  return (
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
                  <span className="text-xs chatgpt-text-muted">typing...</span>
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
  );
}
