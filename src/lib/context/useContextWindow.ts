// React hook for context window monitoring
import { useState, useEffect, useMemo } from 'react';
import { ChatMessage } from '@/components/chat/types';
import { ContextManager, ContextStats, MODEL_CONFIGS } from './contextManager';

export interface ContextWindowInfo {
  stats: ContextStats | null;
  utilization: number;
  remainingTokens: number;
  canFitMore: boolean;
  isNearLimit: boolean;
  recommendation: string;
}

export function useContextWindow(
  messages: ChatMessage[],
  modelName: string = "gemini-1.5-flash"
) {
  const [contextManager] = useState(() => {
    const config = MODEL_CONFIGS[modelName];
    return new ContextManager(config);
  });

  const contextInfo: ContextWindowInfo = useMemo(() => {
    if (messages.length === 0) {
      return {
        stats: null,
        utilization: 0,
        remainingTokens: contextManager.getConfig().maxTokens,
        canFitMore: true,
        isNearLimit: false,
        recommendation: "Ready for conversation",
      };
    }

    // Simulate context preparation to get stats
    const { stats } = contextManager.prepareContext(messages, "");
    const config = contextManager.getConfig();
    
    const utilization = (stats.totalTokens / config.maxTokens) * 100;
    const remainingTokens = config.maxTokens - stats.totalTokens;
    const isNearLimit = utilization > 80;
    const canFitMore = remainingTokens > 200;

    let recommendation = "";
    if (utilization < 50) {
      recommendation = "Context window healthy";
    } else if (utilization < 80) {
      recommendation = "Context filling up, consider conversation length";
    } else if (utilization < 95) {
      recommendation = "Context nearly full, older messages may be excluded";
    } else {
      recommendation = "Context window full, consider starting new conversation";
    }

    return {
      stats,
      utilization,
      remainingTokens,
      canFitMore,
      isNearLimit,
      recommendation,
    };
  }, [messages, contextManager]);

  // Update context manager when model changes
  useEffect(() => {
    const newConfig = MODEL_CONFIGS[modelName];
    if (newConfig) {
      contextManager.updateConfig(newConfig);
    }
  }, [modelName, contextManager]);

  return {
    contextInfo,
    contextManager,
    shouldShowWarning: contextInfo.isNearLimit,
    shouldSuggestNewConversation: contextInfo.utilization > 90,
  };
}

// Hook for getting context preparation results
export function usePreparedContext(
  messages: ChatMessage[],
  currentPrompt: string,
  modelName: string = "gemini-1.5-flash"
) {
  const { contextManager } = useContextWindow(messages, modelName);

  return useMemo(() => {
    return contextManager.prepareContext(messages, currentPrompt);
  }, [messages, currentPrompt, contextManager]);
}
