// Context Window Indicator Component
"use client";

import { useState } from 'react';
import { ChatMessage } from '@/components/chat/types';
import { useContextWindow } from '@/lib/context/useContextWindow';

interface ContextWindowIndicatorProps {
  messages: ChatMessage[];
  modelName?: string;
  className?: string;
  showDetails?: boolean;
}

export function ContextWindowIndicator({
  messages,
  modelName = "gemini-1.5-flash",
  className = "",
  showDetails = false,
}: ContextWindowIndicatorProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const { contextInfo, shouldShowWarning, shouldSuggestNewConversation } = useContextWindow(
    messages,
    modelName
  );

  if (!contextInfo.stats) {
    return null;
  }

  const getIndicatorColor = () => {
    if (contextInfo.utilization < 50) return "bg-green-500";
    if (contextInfo.utilization < 80) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getTextColor = () => {
    if (contextInfo.utilization < 50) return "text-green-400";
    if (contextInfo.utilization < 80) return "text-yellow-400";
    return "text-red-400";
  };

  if (!showDetails) {
    // Compact indicator
    return (
      <div 
        className={`relative inline-flex items-center ${className}`}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <div className="flex items-center gap-1.5">
          <div className={`w-2 h-2 rounded-full ${getIndicatorColor()}`} />
          <span className={`text-xs ${getTextColor()}`}>
            {Math.round(contextInfo.utilization)}%
          </span>
        </div>

        {/* Tooltip */}
        {showTooltip && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50">
            <div className="bg-[#2a2a2a] border border-white/20 rounded-lg px-3 py-2 text-xs text-white shadow-lg min-w-48">
              <div className="font-medium mb-1">Context Window</div>
              <div className="space-y-1 text-xs">
                <div>Messages: {contextInfo.stats.messagesIncluded}</div>
                <div>Tokens: {contextInfo.stats.totalTokens.toLocaleString()}</div>
                <div>Remaining: {contextInfo.remainingTokens.toLocaleString()}</div>
                <div className="mt-2 text-gray-300">{contextInfo.recommendation}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Detailed view
  return (
    <div className={`p-3 bg-[#2a2a2a] border border-white/10 rounded-lg ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-white">Context Window</h3>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${getIndicatorColor()}`} />
          <span className={`text-sm ${getTextColor()}`}>
            {Math.round(contextInfo.utilization)}%
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-700 rounded-full h-2 mb-3">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${getIndicatorColor()}`}
          style={{ width: `${Math.min(contextInfo.utilization, 100)}%` }}
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div>
          <div className="text-gray-400">Messages Included</div>
          <div className="text-white font-medium">{contextInfo.stats.messagesIncluded}</div>
        </div>
        <div>
          <div className="text-gray-400">Total Tokens</div>
          <div className="text-white font-medium">{contextInfo.stats.totalTokens.toLocaleString()}</div>
        </div>
        <div>
          <div className="text-gray-400">Remaining</div>
          <div className="text-white font-medium">{contextInfo.remainingTokens.toLocaleString()}</div>
        </div>
        <div>
          <div className="text-gray-400">Excluded</div>
          <div className="text-white font-medium">{contextInfo.stats.messagesExcluded}</div>
        </div>
      </div>

      {/* Recommendation */}
      <div className="mt-3 p-2 bg-[#1a1a1a] rounded text-xs text-gray-300">
        {contextInfo.recommendation}
      </div>

      {/* Warnings */}
      {shouldShowWarning && (
        <div className="mt-2 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded text-xs text-yellow-400">
          ⚠️ Context window is filling up. Consider the conversation length.
        </div>
      )}

      {shouldSuggestNewConversation && (
        <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded text-xs text-red-400">
          🔄 Consider starting a new conversation to maintain optimal performance.
        </div>
      )}
    </div>
  );
}

// Compact context indicator for chat header
export function CompactContextIndicator({ 
  messages, 
  modelName = "gemini-1.5-flash" 
}: { 
  messages: ChatMessage[]; 
  modelName?: string; 
}) {
  return (
    <ContextWindowIndicator
      messages={messages}
      modelName={modelName}
      className="ml-2"
      showDetails={false}
    />
  );
}
