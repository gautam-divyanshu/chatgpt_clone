// Main component
export { ChatGPTMain } from "./ChatGPTMain";

// Sub-components
export { ChatHeader } from "./ChatHeader";
export { WelcomeScreen } from "./WelcomeScreen";
export { MessageList } from "./MessageList";
export { MessageItem } from "./MessageItem";
export { EditableMessage } from "./EditableMessage";

// Hooks
export { useChatLogic } from "./useChatLogic";

// Utilities
export { generateMockResponse, streamResponse } from "./mockApi";

// Types
export type { ChatMessage, EditableMessageProps } from "./types";
