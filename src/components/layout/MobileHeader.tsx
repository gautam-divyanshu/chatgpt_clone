"use client";
interface MobileHeaderProps {
  onMenuClick: () => void;
}

export function MobileHeader({ onMenuClick }: MobileHeaderProps) {
  return (
    <div className="md:hidden border-b border-white/10 p-4 flex items-center justify-between">
      {/* Menu Button - Now matches the main sidebar toggle styling */}
      <button 
        onClick={onMenuClick} 
        className="p-2 rounded-lg chatgpt-hover transition-all duration-300 ease-in-out"
      >
        <svg
          className="w-6 h-6 chatgpt-text"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      {/* Title */}
      <h1 className="text-lg font-semibold chatgpt-text">
        ChatGPT
      </h1>

      {/* Options Button - Also using consistent styling */}
      <button className="p-2 rounded-lg chatgpt-hover transition-all duration-300 ease-in-out">
        <svg
          className="w-5 h-5 chatgpt-text"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
          />
        </svg>
      </button>
    </div>
  );
}