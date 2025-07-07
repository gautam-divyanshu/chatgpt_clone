import { google } from "@ai-sdk/google";
import { streamText } from "ai";
import { mem0Service } from "@/lib/mem0/service";

export async function POST(req: Request) {
  try {
    const { messages, attachments = [], userId, conversationId } = await req.json();

    // Enhanced validation
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "Invalid messages format" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Generate user and conversation IDs if not provided
    const finalUserId = userId || `user_${Date.now()}`;
    const finalConversationId = conversationId || `conv_${Date.now()}`;
    const currentUserMessage = messages[messages.length - 1]?.content || '';

    console.log("Chat with memory - User:", finalUserId, "Conversation:", finalConversationId);
    console.log("Received messages:", messages.length, "messages");
    console.log("Received attachments:", attachments.length, "files");

    // Step 1: Get relevant memories for context (if Mem0 is available)
    let memoryContext = '';
    if (mem0Service.isAvailable() && currentUserMessage) {
      try {
        const relevantMemories = await mem0Service.getRelevantMemories(
          currentUserMessage,
          finalUserId,
          finalConversationId,
          5 // limit to 5 most relevant memories
        );
        
        if (relevantMemories.length > 0) {
          memoryContext = `\n\nContext about this user:\n${relevantMemories.map((memory, i) => `- ${memory}`).join('\n')}\n\nPlease use this context naturally in your response without explicitly mentioning it.\n\n`;
          console.log('Retrieved', relevantMemories.length, 'relevant memories');
        }
      } catch (error) {
        console.warn('Failed to retrieve memories:', error);
      }
    }

    // Optional: Add test error trigger (remove in production)
    const lastMessage = messages[messages.length - 1]?.content?.toLowerCase() || '';
    if (lastMessage.includes('test error')) {
      return new Response(
        JSON.stringify({ 
          error: "Test error triggered for retry functionality",
          type: "server_error" 
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Step 2: Process messages with multimodal content and add memory context
    const processedMessages = await processMessagesWithAttachments(messages, attachments, memoryContext);

    // Step 3: Enhanced model configuration for better responses
    const result = await streamText({
      model: google("gemini-1.5-flash"),
      messages: processedMessages,
      temperature: 0.7,
      maxTokens: 4096,
      topP: 0.95,
      frequencyPenalty: 0.3,
      presencePenalty: 0.3,
      onFinish: async (finishResult) => {
        // Step 4: Store the conversation in memory after response is generated
        if (mem0Service.isAvailable()) {
          try {
            // Store user message and assistant response as conversation memory
            const conversationMessages = [
              { role: 'user', content: currentUserMessage },
              { role: 'assistant', content: finishResult.text }
            ];
            
            await mem0Service.addMemory(
              conversationMessages,
              finalUserId,
              finalConversationId,
              {
                category: 'context',
                importance: 'medium',
                messageId: `msg_${Date.now()}`
              }
            );
            
            console.log('Conversation stored in memory successfully');
          } catch (error) {
            console.warn('Failed to store conversation in memory:', error);
          }
        }
      }
    });

    return result.toDataStreamResponse({
      headers: {
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "X-User-ID": finalUserId,
        "X-Conversation-ID": finalConversationId,
      },
    });
  } catch (error: any) {
    console.error("Chat API Error:", error);
    
    // Enhanced error responses with specific types
    if (error.message?.includes("rate limit") || error.message?.includes("quota")) {
      return new Response(
        JSON.stringify({ 
          error: "Rate limit exceeded. Please wait a moment and try again.",
          type: "rate_limit" 
        }),
        {
          status: 429,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (error.message?.includes("API key") || error.message?.includes("authentication")) {
      return new Response(
        JSON.stringify({ 
          error: "Authentication error. Please check your API configuration.",
          type: "auth_error" 
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        error: "Failed to generate response. Please try again.",
        type: "server_error" 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

// Process messages to include multimodal content (images only) and memory context
async function processMessagesWithAttachments(messages: any[], attachments: any[], memoryContext: string = '') {
  const processedMessages = [];

  for (const message of messages) {
    if (message.role === 'user') {
      // Find attachments for this message (last user message gets current attachments)
      const isLastUserMessage = messages.indexOf(message) === messages.length - 1;
      const messageAttachments = isLastUserMessage ? attachments : (message.attachments || []);

      // Add memory context to the last user message if available
      let messageContent = message.content;
      if (isLastUserMessage && memoryContext) {
        messageContent = memoryContext + messageContent;
      }

      if (messageAttachments.length > 0) {
        // Create multimodal content
        const content = [];

        // Add text content if exists
        if (messageContent && messageContent.trim()) {
          content.push({
            type: 'text',
            text: messageContent
          });
        }

        // Process attachments - IMAGES ONLY
        for (const attachment of messageAttachments) {
          if (attachment.isImage) {
            // Add image directly to AI
            content.push({
              type: 'image',
              image: attachment.url
            });
          } else {
            // For documents, just inform the AI about the file without reading content
            content.push({
              type: 'text',
              text: `\n[Document uploaded: ${attachment.originalName} (${attachment.type}) - I can see you've uploaded this document, but I can only read images. Please copy and paste any text content you'd like me to analyze.]`
            });
          }
        }

        processedMessages.push({
          role: 'user',
          content: content
        });
      } else {
        // Regular text message
        processedMessages.push({
          role: 'user',
          content: messageContent
        });
      }
    } else {
      // Assistant message - keep as text
      processedMessages.push({
        role: 'assistant',
        content: message.content
      });
    }
  }

  return processedMessages;
}
