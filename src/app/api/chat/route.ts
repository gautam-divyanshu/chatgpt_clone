import { google } from "@ai-sdk/google";
import { streamText } from "ai";

export async function POST(req: Request) {
  try {
    const { messages, attachments = [] } = await req.json();

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

    // Log for debugging (remove in production)
    console.log("Received messages:", messages.length, "messages");
    console.log("Received attachments:", attachments.length, "files");

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

    // Process messages with multimodal content (images only)
    const processedMessages = await processMessagesWithAttachments(messages, attachments);

    // Enhanced model configuration for better responses
    const result = await streamText({
      model: google("gemini-1.5-flash"),
      messages: processedMessages,
      temperature: 0.7,
      maxTokens: 4096,
      topP: 0.95,
      frequencyPenalty: 0.3,
      presencePenalty: 0.3,
    });

    return result.toDataStreamResponse({
      headers: {
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
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

// Process messages to include multimodal content (images only)
async function processMessagesWithAttachments(messages: any[], attachments: any[]) {
  const processedMessages = [];

  for (const message of messages) {
    if (message.role === 'user') {
      // Find attachments for this message (last user message gets current attachments)
      const isLastUserMessage = messages.indexOf(message) === messages.length - 1;
      const messageAttachments = isLastUserMessage ? attachments : (message.attachments || []);

      if (messageAttachments.length > 0) {
        // Create multimodal content
        const content = [];

        // Add text content if exists
        if (message.content && message.content.trim()) {
          content.push({
            type: 'text',
            text: message.content
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
          content: message.content
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