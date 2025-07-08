"use client";

import { useState, useEffect } from "react";

interface SharePopoverProps {
  isOpen: boolean;
  onClose: () => void;
  conversationId: string;
}

export function SharePopover({
  isOpen,
  onClose,
  conversationId,
}: SharePopoverProps) {
  const [shareUrl, setShareUrl] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Reset state when opened
      setShareUrl("");
      setIsCopied(false);
      setError(null);
    }
  }, [isOpen]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy link:", error);
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleCreateLink = async () => {
    try {
      setIsCreating(true);
      setError(null);
      const response = await fetch(
        `/api/conversations/${conversationId}/share`,
        {
          method: "POST",
        }
      );
      const data = await response.json();

      if (data.success) {
        setShareUrl(data.shareUrl);
      } else {
        setError(data.error || "Failed to create share link");
      }
    } catch (error) {
      console.error("Failed to create share link:", error);
      setError("Failed to create share link");
    } finally {
      setIsCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />

      {/* Popover */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
        <div className="bg-[#2f2f2f] rounded-2xl w-[90vw] sm:w-[70vw] md:w-[528px] p-4 text-white">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-medium text-white">
              Share public link to chat
            </h3>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Description */}
          <p className="text-white/80 mb-5 leading-relaxed">
            Your name, custom instructions, and any messages you add after
            sharing stay private.{" "}
            <a
              href="#"
              className="text-white underline hover:no-underline"
              onClick={(e) => e.preventDefault()}
            >
              Learn more
            </a>
          </p>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-lg">
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          {/* URL Input and Button */}
          <div className="flex items-center gap-3 mb-2">
            <div className="flex gap-4 w-full rounded-full pl-4 p-2 border border-[#555]">
              <input
                type="text"
                value={shareUrl || "https://chatgpt.com/share/..."}
                readOnly
                className={`w-full bg-transparent focus:outline-none text-lg ${
                  shareUrl ? "text-white" : "text-white/60"
                }`}
              />
              
            {shareUrl ? (
              <button
                onClick={handleCopyLink}
                className={`px-6 py-2 sm:py-4 rounded-full font-medium text-sm transition-all flex items-center gap-2 whitespace-nowrap ${
                  isCopied
                    ? "bg-green-600 text-white"
                    : "bg-white text-black hover:bg-gray-100"
                }`}
              >
                {isCopied ? (
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
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Copied!
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
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                    Copy link
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleCreateLink}
                disabled={isCreating}
                className="px-6 py-2 sm:py-4 rounded-full font-medium text-sm transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap bg-white text-black hover:bg-gray-100"
              >
                {isCreating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                    Creating...
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
                        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.1m0 0l4-4a4 4 0 105.656-5.656l-1.1 1.1"
                      />
                    </svg>
                    Create link
                  </>
                )}
              </button>
            )}
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
