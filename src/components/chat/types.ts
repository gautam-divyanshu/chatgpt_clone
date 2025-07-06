import { UploadedFile } from './upload-types';

export interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: string;
  isStreaming?: boolean;
  isEditing?: boolean;
  originalContent?: string;
  status?: 'sending' | 'sent' | 'error' | 'retrying';
  errorType?: 'network' | 'rate_limit' | 'auth' | 'server' | 'timeout';
  retryCount?: number;
  attachments?: UploadedFile[];
}

export interface EditableMessageProps {
  content: string;
  onSave: (content: string) => void;
  onCancel: () => void;
}

export interface StreamConfig {
  retryAttempts?: number;
  retryDelay?: number;
  timeoutMs?: number;
}

export interface ApiError {
  error: string;
  type: 'rate_limit' | 'auth_error' | 'server_error' | 'network_error';
  retryAfter?: number;
}
