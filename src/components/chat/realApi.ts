import { ChatMessage } from "./types";

export const streamResponse = async (
  prompt: string,
  messageId: string,
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  controller: AbortController,
  conversationHistory: ChatMessage[] = []
): Promise<void> => {
  try {
    // Prepare messages for API (convert to the format expected by Vercel AI SDK)
    const apiMessages = conversationHistory
      .filter(msg => !msg.isStreaming) // Only include completed messages
      .map(msg => ({
        role: msg.isUser ? 'user' as const : 'assistant' as const,
        content: msg.content
      }));
    
    // Add the current prompt
    apiMessages.push({
      role: 'user' as const,
      content: prompt
    });

    console.log('Sending messages to API:', apiMessages);

    // Call your API endpoint
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: apiMessages
      }),
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    if (!response.body) {
      throw new Error('No response body');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let currentContent = "";

    while (true) {
      if (controller.signal.aborted) break;
      
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');
      
      for (const line of lines) {
        if (controller.signal.aborted) break;
        
        if (line.startsWith('0:')) {
          // This is text content
          const content = line.slice(2).replace(/^"(.*)"$/, '$1');
          if (content) {
            currentContent += content;
            
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === messageId 
                  ? { ...msg, content: currentContent } 
                  : msg
              )
            );
          }
        }
      }
    }

    // Mark streaming as complete
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId 
          ? { ...msg, isStreaming: false } 
          : msg
      )
    );

  } catch (error: any) {
    console.error('Real API Error:', error);
    
    // Fallback to a simple error message
    const errorMessage = error.name === 'AbortError' 
      ? "Response cancelled" 
      : "Sorry, I encountered an error. Please try again.";
    
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId 
          ? { 
              ...msg, 
              content: errorMessage,
              isStreaming: false 
            } 
          : msg
      )
    );
  } finally {
    setIsLoading(false);
  }
};
