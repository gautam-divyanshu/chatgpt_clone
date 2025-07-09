import { google } from "@ai-sdk/google";
import { streamText } from "ai";
import { mem0Service } from "@/lib/mem0/service";
import { createErrorResponse, logError } from "@/lib/errors";
import { generateUserId, generateConversationId, generateMessageId, getAuthenticatedUserId } from "@/lib/utils";
import { auth } from "@/lib/auth/auth";
import { UploadedFile } from "@/components/chat/upload-types";
import { documentAI } from "@/lib/documentai/service";
import { ProcessedDocument } from "@/models/ProcessedDocument";
import connectToDatabase from "@/lib/database";


export async function POST(req: Request) {
  try {
    // Get the authenticated session
    const session = await auth();
    
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

    // Use authenticated user ID if available, otherwise fall back to provided userId or generate one
    const authenticatedUserId = session?.user?.id;
    const finalUserId = getAuthenticatedUserId(authenticatedUserId) || userId || generateUserId();
    
    console.log('🔐 User ID determination:', {
      authenticatedUserId,
      providedUserId: userId,
      finalUserId,
      isAuthenticated: !!session?.user
    });
    const finalConversationId = conversationId || generateConversationId();
    const currentUserMessage = messages[messages.length - 1]?.content || "";

    // Get relevant memories for context
    let memoryContext = "";
    if (mem0Service.isAvailable() && currentUserMessage) {
      try {
        const memoryPromise = mem0Service.getRelevantMemories(
          currentUserMessage,
          finalUserId,
          finalConversationId,
          5 // Standard limit for all queries
        );

        const relevantMemories = await Promise.race([
          memoryPromise,
          new Promise<string[]>((_, reject) =>
            setTimeout(() => reject(new Error("Memory timeout")), 3000)
          ),
        ]);

        console.log(`🧠 Retrieved ${relevantMemories.length} memories for user ${finalUserId}`);

        if (relevantMemories.length > 0) {
          memoryContext = `\n**Relevant Information:**\n${relevantMemories
            .map((mem) => `• ${mem}`)
            .join("\n")}\n\n`;
        }
      } catch (error) {
        console.warn("⚠️ Failed to retrieve memories:", error);
      }
    }

    const processedMessages = await processMessagesWithAttachments(
      messages,
      attachments,
      memoryContext,
      finalUserId
    );

    const result = await streamText({
      model: google("gemini-2.5-flash"),
      messages: processedMessages,
      temperature: 0.8, // Slightly higher for faster generation
      maxTokens: 2048, // Reduced for faster responses
      topP: 0.9, // Optimized for speed
      system: `You are Claude, an AI assistant with memory capabilities. You can remember information from previous conversations with users and use this context to provide personalized responses. When users ask what you know about them or request personal information, provide helpful summaries based on your memory. You should acknowledge your memory capabilities when relevant and use remembered information naturally in conversations.`,
      // Removed frequency/presence penalties for speed
      onFinish: (finishResult) => {
        // Store memory asynchronously without blocking the response
        if (mem0Service.isAvailable()) {
          // Run memory storage in the background (fire and forget)
          Promise.resolve().then(async () => {
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
                  isAuthenticated: !!session?.user,
                }
              );
              
              console.log('💾 Memory stored successfully in background');
            } catch (error) {
              console.warn("⚠️ Failed to store conversation in memory (background):", error);
            }
          });
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
  memoryContext: string = "",
  userId?: string
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

        // Check for processed documents
        const documentContext = await getDocumentContext(messageAttachments, messageContent, userId);
        if (documentContext) {
          content.push({
            type: "text" as const,
            text: documentContext,
          });
        }

        for (const attachment of messageAttachments) {
          if (attachment.isImage) {
            content.push({
              type: "image" as const,
              image: attachment.url,
            });
          } else if (!documentContext) {
            // Only show fallback message if document wasn't processed
            content.push({
              type: "text" as const,
              text: `\n[Document uploaded: ${attachment.originalName} (${attachment.type}) - Document processing not available. Please copy and paste any text content you'd like me to analyze.]`,
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

/**
 * Get document context from processed documents for relevant attachments
 */
async function getDocumentContext(
  attachments: UploadedFile[],
  userMessage: string,
  _userId?: string // eslint-disable-line @typescript-eslint/no-unused-vars
): Promise<string | null> {
  try {
    await connectToDatabase();
    
    // Get document attachments only
    const documentAttachments = attachments.filter(att => att.isDocument);
    if (documentAttachments.length === 0) {
      return null;
    }

    console.log('🔍 Searching for processed documents:', documentAttachments.map(att => ({ fileId: att.id, fileName: att.originalName })));

    // Check if documents are processed
    const fileIds = documentAttachments.map(att => att.id);
    const processedDocs = await ProcessedDocument.find({ 
      fileId: { $in: fileIds } 
    });

    console.log(`📊 Found ${processedDocs.length} processed documents`);

    if (processedDocs.length === 0) {
      console.log('🚨 No processed documents found for:', fileIds);
      
      // Show what processed documents exist
      const allDocs = await ProcessedDocument.find({}).select('fileId fileName').limit(10);
      console.log('📝 Available processed documents:', allDocs.map(doc => ({ fileId: doc.fileId, fileName: doc.fileName })));
      
      return null;
    }

    // Find relevant chunks using simple keyword search
    let relevantChunks: Array<{ text: string; source: string }> = [];
    
    for (const doc of processedDocs) {
      console.log(`🔍 Searching in document: ${doc.fileName} (${doc.chunks.length} chunks)`);
      
      const chunks = documentAI.searchRelevantChunks(
        doc.chunks,
        userMessage,
        2 // Get top 2 chunks per document
      );
      
      console.log(`✅ Found ${chunks.length} relevant chunks in ${doc.fileName}`);
      
      chunks.forEach(chunk => {
        relevantChunks.push({
          text: chunk.text,
          source: doc.fileName,
        });
      });
    }

    // Limit total chunks to prevent token overflow
    relevantChunks = relevantChunks.slice(0, 4);

    if (relevantChunks.length === 0) {
      // If no relevant chunks found, provide basic document info
  // const docNames = processedDocs.map(doc => doc.fileName).join(', '); // Unused variable
      const docContents = processedDocs.map(doc => `${doc.fileName}: ${doc.extractedText.substring(0, 200)}...`).join('\n\n');
      
      console.log('💬 No relevant chunks found, providing basic document info');
      
      return `\n\n[Documents uploaded and processed]\n${docContents}\n[Please answer based on the document content above]\n`;
    }

    // Format context for the AI
  const contextParts = relevantChunks.map(chunk => {
      return `[From ${chunk.source}]\n${chunk.text}`;
    });

    const context = `\n\n[Document Context - Use this information to answer the user's question]\n${contextParts.join('\n\n---\n\n')}\n[End Document Context]\n`;
    
    console.log('✅ Providing document context:', {
      chunksCount: relevantChunks.length,
      sources: [...new Set(relevantChunks.map(c => c.source))],
      contextLength: context.length
    });
    
    return context;
    
  } catch (error) {
    console.error('❌ Error getting document context:', error);
    return null;
  }
}
