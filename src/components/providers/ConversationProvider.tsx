"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";

interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  lastMessageAt: string;
}

interface ConversationContextType {
  conversations: Conversation[];
  setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>;
  addConversation: (conversation: Conversation) => void;
  addConversationToTop: (conversation: Conversation) => void;
  updateConversation: (id: string, updates: Partial<Conversation>) => void;
  removeConversation: (id: string) => void;
  refreshConversations: () => Promise<void>;
}

const ConversationContext = createContext<ConversationContextType | undefined>(
  undefined
);

interface ConversationProviderProps {
  children: ReactNode;
}

export function ConversationProvider({ children }: ConversationProviderProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);

  const addConversation = useCallback((conversation: Conversation) => {
    setConversations((prev) => [conversation, ...prev]);
  }, []);

  const addConversationToTop = useCallback((conversation: Conversation) => {
    setConversations((prev) => {
      // Check if conversation already exists
      const exists = prev.find((conv) => conv.id === conversation.id);
      if (exists) {
        // If it exists, move it to the top and update it
        return [
          { ...exists, ...conversation },
          ...prev.filter((conv) => conv.id !== conversation.id),
        ];
      }
      // If it's new, add to the top
      return [conversation, ...prev];
    });
  }, []);

  const updateConversation = useCallback(
    (id: string, updates: Partial<Conversation>) => {
      setConversations((prev) => {
        const updatedConversations = prev.map((conv) =>
          conv.id === id ? { ...conv, ...updates } : conv
        );

        // Only resort if lastMessageAt was updated (meaning a new message was added)
        if (updates.lastMessageAt) {
          // Move the updated conversation to the top, but preserve order for others
          const updatedConv = updatedConversations.find(
            (conv) => conv.id === id
          );
          const otherConvs = updatedConversations.filter(
            (conv) => conv.id !== id
          );
          return updatedConv
            ? [updatedConv, ...otherConvs]
            : updatedConversations;
        }

        return updatedConversations;
      });
    },
    []
  );

  const removeConversation = useCallback((id: string) => {
    setConversations((prev) => prev.filter((conv) => conv.id !== id));
  }, []);

  const refreshConversations = useCallback(async () => {
    try {
      const response = await fetch("/api/conversations");
      if (response.ok) {
        const data = await response.json();
        // Sort conversations consistently by lastMessageAt (newest first), then by createdAt
        const sortedConversations = (data.conversations || []).sort(
          (a: Conversation, b: Conversation) => {
            const aDate = new Date(a.lastMessageAt || a.createdAt);
            const bDate = new Date(b.lastMessageAt || b.createdAt);
            return bDate.getTime() - aDate.getTime();
          }
        );
        setConversations(sortedConversations);
      }
    } catch (error) {
      console.error("Failed to refresh conversations:", error);
    }
  }, []);

  const value = {
    conversations,
    setConversations,
    addConversation,
    addConversationToTop,
    updateConversation,
    removeConversation,
    refreshConversations,
  };

  return (
    <ConversationContext.Provider value={value}>
      {children}
    </ConversationContext.Provider>
  );
}

export function useConversations() {
  const context = useContext(ConversationContext);
  if (context === undefined) {
    throw new Error(
      "useConversations must be used within a ConversationProvider"
    );
  }
  return context;
}
