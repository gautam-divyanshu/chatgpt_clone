export const API_CONFIG = {
  CHAT_ENDPOINT: '/api/chat',
  MEMORY_ENDPOINT: '/api/memory',
  UPLOAD_ENDPOINT: '/api/upload',
  CONVERSATIONS_ENDPOINT: '/api/conversations',
} as const;

export const CHAT_CONFIG = {
  MAX_CONTEXT_TOKENS: 4000, // Reduced for faster processing
  TOKENS_PER_CHAR: 0.25,
  DEFAULT_RETRY_ATTEMPTS: 2, // Reduced retries for speed
  DEFAULT_RETRY_DELAY: 500, // Faster retry
  DEFAULT_TIMEOUT: 20000, // Reduced timeout
  AUTO_SAVE_DELAY: 500, // Faster auto-save
  UPDATE_THROTTLE: 8, // ~120fps for smoother streaming
} as const;

export const UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  SUPPORTED_IMAGE_TYPES: [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp'
  ],
  SUPPORTED_DOCUMENT_TYPES: [
    'application/pdf',
    'text/plain',
    'text/csv',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-powerpoint',
  ],
} as const;

export const UI_CONFIG = {
  SCROLL_THRESHOLD: 50,
  MOBILE_BREAKPOINT: 768,
  SIDEBAR_WIDTH: 260,
} as const;
