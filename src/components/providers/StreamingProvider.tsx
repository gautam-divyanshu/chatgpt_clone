"use client";

import React, { createContext, useContext, useState } from 'react';

interface StreamingState {
  conversationId: string | null;
  isStreaming: boolean;
  streamingMessageId: string | null;
  controller: AbortController | null;
}

interface StreamingContextType {
  streamingState: StreamingState;
  setStreamingState: (state: Partial<StreamingState>) => void;
  clearStreaming: () => void;
}

const StreamingContext = createContext<StreamingContextType | undefined>(undefined);

export function StreamingProvider({ children }: { children: React.ReactNode }) {
  const [streamingState, setStreamingStateInternal] = useState<StreamingState>({
    conversationId: null,
    isStreaming: false,
    streamingMessageId: null,
    controller: null,
  });

  const setStreamingState = (updates: Partial<StreamingState>) => {
    setStreamingStateInternal(prev => ({ ...prev, ...updates }));
  };

  const clearStreaming = () => {
    if (streamingState.controller) {
      try {
        streamingState.controller.abort();
      } catch {
        // Ignore abort errors
      }
    }
    setStreamingStateInternal({
      conversationId: null,
      isStreaming: false,
      streamingMessageId: null,
      controller: null,
    });
  };

  return (
    <StreamingContext.Provider value={{ streamingState, setStreamingState, clearStreaming }}>
      {children}
    </StreamingContext.Provider>
  );
}

export function useStreaming() {
  const context = useContext(StreamingContext);
  if (context === undefined) {
    throw new Error('useStreaming must be used within a StreamingProvider');
  }
  return context;
}
