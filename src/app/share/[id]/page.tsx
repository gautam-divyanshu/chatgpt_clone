"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { MessageList } from "@/components/chat/MessageList";
import { UserAvatar } from "@/components/auth/UserAvatar";

interface SharedAttachment {
  originalName: string;
  cloudinaryUrl: string;
  cloudinaryPublicId: string;
  fileType: string;
  fileSize: number;
  isImage: boolean;
  uploadedAt: string;
}

interface SharedMessage {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: string;
  attachments?: SharedAttachment[];
}

interface SharedConversation {
  id: string;
  title: string;
  messages: SharedMessage[];
  createdAt: string;
  viewCount: number;
  isShared: true;
}

export default function SharedConversationPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const shareId = params.id as string;

  const [conversation, setConversation] = useState<SharedConversation | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [forking, setForking] = useState(false);

  useEffect(() => {
    const fetchSharedConversation = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/shared/${shareId}`);
        const data = await response.json();

        if (data.success) {
          setConversation(data.conversation);
        } else {
          setError(data.error || "Failed to load shared conversation");
        }
      } catch (error) {
        console.error("Error fetching shared conversation:", error);
        setError("Failed to load shared conversation");
      } finally {
        setLoading(false);
      }
    };

    if (shareId) {
      fetchSharedConversation();
    }
  }, [shareId]);

  const handleContinueChat = async () => {
    if (!session) {
      router.push("/auth/signin");
      return;
    }

    try {
      setForking(true);
      const response = await fetch(`/api/shared/${shareId}/fork`, {
        method: "POST",
      });

      const data = await response.json();

      if (data.success) {
        // Navigate to the new forked conversation
        router.push(`/c/${data.conversation.id}`);
      } else {
        console.error("Failed to fork conversation:", data.error);
      }
    } catch (error) {
      console.error("Error forking conversation:", error);
    } finally {
      setForking(false);
    }
  };

  // Transform shared messages to the format expected by MessageList
  const transformedMessages =
    conversation?.messages.map((msg) => ({
      id: msg.id,
      content: msg.content,
      isUser: msg.role === "user",
      timestamp: new Date(msg.timestamp).toLocaleTimeString(),
      status: "sent" as const,
      attachments: msg.attachments?.map(att => ({
        id: att.cloudinaryPublicId,
        url: att.cloudinaryUrl,
        originalName: att.originalName,
        size: att.fileSize,
        type: att.fileType,
        isImage: att.isImage,
        isDocument: !att.isImage,
        width: null as number | null,
        height: null as number | null,
        format: att.fileType.split('/')[1] || 'unknown',
        createdAt: att.uploadedAt,
      })) || [],
    })) || [];

  if (loading) {
    return (
      <ThemeProvider>
        <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Loading shared conversation...
            </p>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  if (error || !conversation) {
    return (
      <ThemeProvider>
        <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="text-center max-w-md">
            <div className="mb-4">
              <svg
                className="w-16 h-16 text-gray-400 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Conversation Not Found
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {error || "Shared conversation not found or no longer available"}
            </p>
            <button
              onClick={() => router.push("/")}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to ChatGPT
            </button>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <div className="h-screen flex flex-col chatgpt-main">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-white/10 px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="chatgpt-text text-lg font-medium">
              {conversation.title}
            </span>
            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full">
              Shared
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm chatgpt-text-muted">
              {conversation.viewCount} views
            </span>
            <UserAvatar />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto">
            <MessageList
              messages={transformedMessages}
              isLoading={false}
              messagesEndRef={{ current: null }}
              chatContainerRef={{ current: null }}
              onScroll={() => {}}
              onEditMessage={() => {}}
              onSaveEdit={() => {}}
              onCancelEdit={() => {}}
              onRetryMessage={() => {}}
            />
          </div>

          {/* Continue Chat Section */}
          <div className="border-t border-white/10 p-6">
            <div className="max-w-3xl mx-auto text-center">
              <h3 className="text-lg font-medium chatgpt-text mb-2">
                Want to continue this conversation?
              </h3>
              <p className="text-sm chatgpt-text-muted mb-4">
                {session
                  ? "Continue chatting and it will be saved to your conversations."
                  : "Sign in to continue this conversation in your own ChatGPT."}
              </p>
              <button
                onClick={handleContinueChat}
                disabled={forking}
                className="px-6 py-3 bg-white text-black hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition-all flex items-center gap-2 mx-auto"
              >
                {forking ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                    {session ? "Continuing..." : "Redirecting..."}
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                    {session ? "Continue conversation" : "Sign in to continue"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}
