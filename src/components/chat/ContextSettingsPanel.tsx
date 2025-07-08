// Advanced Context Window Settings Panel
"use client";

import { useState } from 'react';
import { ChatMessage } from '@/components/chat/types';
import { ContextWindowIndicator } from './ContextWindowIndicator';
import { useContextWindow } from '@/lib/context/useContextWindow';
import { MODEL_CONFIGS } from '@/lib/context/contextManager';

interface ContextSettingsPanelProps {
  messages: ChatMessage[];
  currentModel: string;
  onModelChange?: (model: string) => void;
  className?: string;
}

export function ContextSettingsPanel({
  messages,
  currentModel,
  onModelChange,
  className = "",
}: ContextSettingsPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { contextInfo, contextManager } = useContextWindow(messages, currentModel);

  const availableModels = Object.keys(MODEL_CONFIGS);
  const config = contextManager.getConfig();

  const handleModelChange = (model: string) => {
	onModelChange?.(model);
  };

  return (
	<div className={`bg-[#2a2a2a] border border-white/10 rounded-lg ${className}`}>
	  {/* Header */}
	  <div
		className="flex items-center justify-between p-3 cursor-pointer hover:bg-white/5 transition-colors"
		onClick={() => setIsExpanded(!isExpanded)}
	  >
		<div className="flex items-center gap-2">
		  <svg
			className="w-4 h-4 text-gray-400"
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
		  >
			<path
			  strokeLinecap="round"
			  strokeLinejoin="round"
			  strokeWidth={2}
			  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
			/>
		  </svg>
		  <span className="text-sm font-medium text-white">Context Settings</span>
		</div>

		<div className="flex items-center gap-2">
		  {contextInfo.stats && (
			<span className="text-xs text-gray-400">
			  {Math.round(contextInfo.utilization)}% used
			</span>
		  )}
		  <svg
			className={`w-4 h-4 text-gray-400 transition-transform ${
			  isExpanded ? 'rotate-180' : ''
			}`}
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
		  >
			<path
			  strokeLinecap="round"
			  strokeLinejoin="round"
			  strokeWidth={2}
			  d="M19 9l-7 7-7-7"
			/>
		  </svg>
		</div>
	  </div>

	  {/* Expanded Content */}
	  {isExpanded && (
		<div className="border-t border-white/10 p-3 space-y-4">
		  {/* Model Selection */}
		  <div>
			<label className="block text-xs font-medium text-gray-400 mb-2">
			  Model
			</label>
			<select
			  value={currentModel}
			  onChange={(e) => handleModelChange(e.target.value)}
			  className="w-full bg-[#1a1a1a] border border-white/20 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
			>
			  {availableModels.map((model) => (
				<option key={model} value={model}>
				  {model}
				</option>
			  ))}
			</select>
		  </div>

		  {/* Context Window Indicator */}
		  <ContextWindowIndicator
			messages={messages}
			modelName={currentModel}
			showDetails={true}
		  />

		  {/* Model Info */}
		  <div className="text-xs text-gray-400 space-y-1">
			<div>Max Tokens: {config.maxTokens.toLocaleString()}</div>
			<div>Min Messages: {config.minMessagesIncluded}</div>
			<div>Strategy: {config.prioritizeRecentMessages ? 'Recent First' : 'Balanced'}</div>
		  </div>

		  {/* Tips */}
		  <div className="p-2 bg-[#1a1a1a] rounded text-xs text-gray-300">
			<div className="font-medium mb-1">💡 Tips:</div>
			<ul className="space-y-1 list-disc list-inside">
			  <li>Longer conversations may exclude older messages</li>
			  <li>Start new conversations when context is full</li>
			  <li>Recent messages are always prioritized</li>
			</ul>
		  </div>
		</div>
	  )}
	</div>
  );
}

// Compact version for sidebar or toolbar
export function CompactContextSettings({
  messages,
  currentModel,
  onModelChange,
}: ContextSettingsPanelProps) {
  const [showPanel, setShowPanel] = useState(false);
  useContextWindow(messages, currentModel);

  return (
	<div className="relative">
	  <button
		onClick={() => setShowPanel(!showPanel)}
		className="p-2 rounded-lg hover:bg-white/10 transition-colors"
		title="Context Settings"
	  >
		<svg
		  className="w-4 h-4 text-gray-400"
		  fill="none"
		  stroke="currentColor"
		  viewBox="0 0 24 24"
		>
		  <path
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth={2}
			d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
		  />
		  <path
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth={2}
			d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
		  />
		</svg>
	  </button>

	  {showPanel && (
		<div className="absolute top-full right-0 mt-2 z-50">
		  <ContextSettingsPanel
			messages={messages}
			currentModel={currentModel}
			onModelChange={onModelChange}
			className="w-80"
		  />
		</div>
	  )}
	</div>
  );
}
