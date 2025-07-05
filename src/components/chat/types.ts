export interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: string;
  isStreaming?: boolean;
  isEditing?: boolean;
  originalContent?: string;
}

export interface EditableMessageProps {
  content: string;
  onSave: (content: string) => void;
  onCancel: () => void;
}
