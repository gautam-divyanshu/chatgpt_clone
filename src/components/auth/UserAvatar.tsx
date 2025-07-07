"use client";

import { useState, useRef, useEffect } from "react";
import { signOut } from "next-auth/react";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";

export function UserAvatar() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await signOut({ callbackUrl: "/auth/signin" });
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Generate avatar from email
  const getAvatarText = (email: string) => {
    return email.charAt(0).toUpperCase();
  };

  // Generate avatar background color from email
  const getAvatarColor = (email: string) => {
    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-yellow-500",
      "bg-indigo-500",
      "bg-red-500",
      "bg-teal-500",
    ];
    const index = email.charCodeAt(0) % colors.length;
    return colors[index];
  };

  if (!user?.email) {
    return null;
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-8 h-8 rounded-full text-white text-sm font-medium hover:opacity-80 transition-opacity"
        style={{ backgroundColor: user.image ? "transparent" : undefined }}
      >
        {user.image ? (
          <Image
            src={user.image}
            alt="User avatar"
            width={32}
            height={32}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${getAvatarColor(
              user.email
            )}`}
          >
            {getAvatarText(user.email)}
          </div>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute right-0 top-10 w-96 rounded-xl shadow-lg border border-gray-700 py-3 z-50"
          style={{ backgroundColor: "#2e2e2e" }}
        >
          {/* User Info */}
          <div className="px-5 py-4 border-b border-gray-600">
            <div className="flex items-center space-x-4">
              {user.image ? (
                <Image
                  src={user.image}
                  alt="User avatar"
                  width={48}
                  height={48}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-medium text-lg ${getAvatarColor(
                    user.email
                  )}`}
                >
                  {getAvatarText(user.email)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                {user.name && (
                  <p className="text-base font-medium text-white truncate">
                    {user.name}
                  </p>
                )}
                <p className="text-base text-gray-300 truncate">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <button
              onClick={handleLogout}
              className="w-full text-left px-5 py-3 text-base text-gray-300 hover:bg-gray-600 flex items-center space-x-4 transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
