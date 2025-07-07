import { google } from "@ai-sdk/google";
import { streamText } from "ai";
import { mem0Service } from "@/lib/mem0/service";
import { createErrorResponse, logError } from "@/lib/errors";
import { generateUserId, generateConversationId, generateMessageId } from "@/lib/utils";
import { UploadedFile } from "@/components/chat/upload-types";

export async function POST(req: Request) {
  try {
    const {
      messages,
      attachments = [],
      userId,
      conversationId,
    } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "Invalid messages format" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const finalUserId = userId || generateUserId();
    const finalConversationId = conversationId || generateConversationId();
    const currentUserMessage = messages[messages.length - 1]?.content || "";

    // Get relevant memories for context (optimized for speed)
    let memoryContext = "";
    let memoryPromise: Promise<void> | null = null;
    
    if (mem0Service.isAvailable() && currentUserMessage) {
      // Run memory retrieval in parallel with message processing
      memoryPromise = (async () => {
        try {
          const relevantMemories = await mem0Service.getRelevantMemories(
            currentUserMessage,
            finalUserId,
            finalConversationId,
            3 // Reduced from 5 to 3 for speed
          );

          if (relevantMemories.length > 0) {
            memoryContext = `\nContext: ${relevantMemories.join('; ')}\nRespond naturally using this context.\n\n`;
          }
        } catch (error) {
          console.warn("Failed to retrieve memories:", error);
        }
      })();
    }

    const processedMessages = await processMessagesWithAttachments(
      messages,
      attachments,
      memoryContext
    );

    // Wait for memory retrieval to complete if it's running
    if (memoryPromise) {
      await memoryPromise;
      // Re-process messages with memory context if it was retrieved
      if (memoryContext) {
        const lastMessage = processedMessages[processedMessages.length - 1];
        if (lastMessage && lastMessage.role === 'user') {
          if (typeof lastMessage.content === 'string') {
            lastMessage.content = memoryContext + lastMessage.content;
          } else if (Array.isArray(lastMessage.content)) {
            const textContent = lastMessage.content.find(c => c.type === 'text');
            if (textContent) {
              textContent.text = memoryContext + textContent.text;
            }
          }
        }
      }
    }

    const result = await streamText({
      model: google("gemini-1.5-flash"),
      messages: processedMessages,
      temperature: 0.8, // Slightly higher for faster generation
      maxTokens: 2048, // Reduced for faster responses
      topP: 0.9, // Optimized for speed
      // Removed frequency/presence penalties for speed
      onFinish: async (finishResult) => {
        if (mem0Service.isAvailable()) {
          try {
            const conversationMessages: { role: 'user' | 'assistant', content: string }[] = [
              { role: "user", content: currentUserMessage },
              { role: "assistant", content: finishResult.text },
            ];

            await mem0Service.addMemory(
              conversationMessages,
              finalUserId,
              finalConversationId,
              {
                timestamp: new Date().toISOString(),
                category: "context",
                importance: "medium",
                messageId: generateMessageId(),
              }
            );
          } catch (error) {
            console.warn("Failed to store conversation in memory:", error);
          }
        }
      },
    });

    return result.toDataStreamResponse({
      headers: {
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "X-User-ID": finalUserId,
        "X-Conversation-ID": finalConversationId,
      },
    });
  } catch (error: unknown) {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    logError(errorObj, 'Chat API');
    
    const errorResponse = createErrorResponse(errorObj, 'Failed to generate response. Please try again.');
    
    return new Response(
      JSON.stringify({ 
        error: errorResponse.error,
        type: errorResponse.code 
      }),
      {
        status: errorResponse.statusCode,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

interface ApiMessage {
  role: "user" | "assistant";
  content: string;
  attachments?: UploadedFile[];
}

async function processMessagesWithAttachments(
  messages: ApiMessage[],
  attachments: UploadedFile[],
  memoryContext: string = ""
) {
  const processedMessages = [];

  for (const message of messages) {
    if (message.role === "user") {
      const isLastUserMessage =
        messages.indexOf(message) === messages.length - 1;
      const messageAttachments = isLastUserMessage
        ? attachments
        : message.attachments || [];

      let messageContent = message.content;
      if (isLastUserMessage && memoryContext) {
        messageContent = memoryContext + messageContent;
      }

      if (messageAttachments.length > 0) {
        const content = [];

        if (messageContent && messageContent.trim()) {
          content.push({
            type: "text" as const,
            text: messageContent,
          });
        }

        for (const attachment of messageAttachments) {
          if (attachment.isImage) {
            content.push({
              type: "image" as const,
              image: attachment.url,
            });
          } else {
            content.push({
              type: "text" as const,
              text: `\n[Document uploaded: ${attachment.originalName} (${attachment.type}) - I can see you've uploaded this document, but I can only read images. Please copy and paste any text content you'd like me to analyze.]`,
            });
          }
        }

        processedMessages.push({
          role: "user" as const,
          content: content,
        });
      } else {
        processedMessages.push({
          role: "user" as const,
          content: messageContent,
        });
      }
    } else {
      processedMessages.push({
        role: "assistant" as const,
        content: message.content,
      });
    }
  }

  return processedMessages;
}
