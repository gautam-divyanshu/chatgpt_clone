"use client";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const chatItems = [
    "Test Next.js on Mobile",
    "Create ChatGPT Clone",
    "Install gh on Mac",
    "MacBook Sleep vs Shutdown",
    "Take You Forward vs MCS",
    "Darken Video on Mac",
    "Learn DSA in 2025?",
    "Improving Reading Skills",
    "Internship Availability Response",
    "Request for Scholarship Recons...",
    "Windows Install Disk Not Found",
    "Financial responsibility support",
    "Warp terminal error fix",
    "Sign out Apple ID issues",
    "Parents and Criticism",
    "Open VS Code Terminal",
    "Expense Calculation Summary",
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar - Exact match to screenshot */}
      <div
        className={`
        fixed md:relative inset-y-0 left-0 z-50
        w-64 h-full chatgpt-sidebar flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}
      >
        {/* Top Section */}
        <div className="flex-shrink-0 p-3">
          {/* ChatGPT Icon and Title */}
          <div className="flex items-center gap-2 px-3 py-2 mb-4">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
              <svg
                className="w-4 h-4 text-white"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z" />
              </svg>
            </div>
          </div>

          {/* New Chat Button */}
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border border-white/20 chatgpt-hover text-left">
            <svg
              className="w-4 h-4 chatgpt-text"
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
            <span className="chatgpt-text text-sm">New chat</span>
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-shrink-0 px-3 pb-3">
          <div className="space-y-1">
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg chatgpt-hover text-left">
              <svg
                className="w-4 h-4 chatgpt-text"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <span className="chatgpt-text text-sm">Search chats</span>
            </button>

            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg chatgpt-hover text-left">
              <svg
                className="w-4 h-4 chatgpt-text"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
              <span className="chatgpt-text text-sm">Library</span>
            </button>

            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg chatgpt-hover text-left">
              <svg
                className="w-4 h-4 chatgpt-text"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="chatgpt-text text-sm">Sora</span>
            </button>

            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg chatgpt-hover text-left">
              <svg
                className="w-4 h-4 chatgpt-text"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <span className="chatgpt-text text-sm">GPTs</span>
            </button>
          </div>
        </div>

        {/* Chats Section */}
        <div className="flex-1 px-3 overflow-y-auto">
          <div className="text-xs chatgpt-text-muted font-medium px-3 py-2 mb-2">
            Chats
          </div>
          <div className="space-y-1">
            {chatItems.map((chat, index) => (
              <button
                key={index}
                className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg chatgpt-hover text-left group"
              >
                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                <span className="chatgpt-text text-sm truncate flex-1">
                  {chat}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex-shrink-0 p-3 border-t border-white/10">
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg chatgpt-hover text-left">
            <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
              U
            </div>
            <span className="chatgpt-text text-sm">Upgrade plan</span>
          </button>
        </div>
      </div>
    </>
  );
}
