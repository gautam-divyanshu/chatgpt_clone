import { google } from "@ai-sdk/google";
import { streamText } from "ai";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

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

    // Enhanced model configuration for better responses
    const result = await streamText({
      model: google("gemini-1.5-flash"),
      messages,
      temperature: 0.7,
      maxTokens: 4096, // Increased for longer responses
      topP: 0.95, // Better response quality
      frequencyPenalty: 0.3, // Reduce repetition
      presencePenalty: 0.3, // Encourage diverse topics
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