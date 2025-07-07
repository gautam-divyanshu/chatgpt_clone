// src/app/api/conversations/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/database";
import Conversation from "@/models/Conversation";
import { auth } from "@/lib/auth/auth";

// GET /api/conversations - Get all conversations for authenticated user
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const conversations = await Conversation.findWithPagination(
      session.user.id,
      limit,
      offset
    );

    return NextResponse.json({
      success: true,
      conversations,
      count: conversations.length,
    });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch conversations" },
      { status: 500 }
    );
  }
}

// POST /api/conversations - Create new conversation for authenticated user
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const { title, firstMessage } = body;

    const conversation = Conversation.createNew(session.user.id);

    if (title) {
      conversation.title = title;
    }

    if (firstMessage) {
      conversation.addMessage({
        role: "user",
        content: firstMessage.content,
        attachments: firstMessage.attachments || [],
      });
    }

    await conversation.save();

    return NextResponse.json({
      success: true,
      conversation: {
        id: conversation.id,
        title: conversation.title,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
        messageCount: conversation.messageCount,
        userId: conversation.userId,
      },
    });
  } catch (error) {
    console.error("Error creating conversation:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create conversation" },
      { status: 500 }
    );
  }
}
