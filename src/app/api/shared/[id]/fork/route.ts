// src/app/api/shared/[id]/fork/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import SharedConversation from '@/models/SharedConversation';
import Conversation from '@/models/Conversation';
import { auth } from '@/lib/auth/auth';

// POST /api/shared/[id]/fork - Fork a shared conversation to user's private conversations
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Please sign in to continue this conversation" },
        { status: 401 }
      );
    }

    await connectDB();
    
    const resolvedParams = await params;
    const sharedConversation = await SharedConversation.findOne({ 
      id: resolvedParams.id,
      isPublic: true
    });
    
    if (!sharedConversation) {
      return NextResponse.json(
        { success: false, error: 'Shared conversation not found or no longer available' },
        { status: 404 }
      );
    }

    // Create a new private conversation for the user
    const newConversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const forkedConversation = new Conversation({
      id: newConversationId,
      title: `${sharedConversation.title} (continued)`,
      messages: sharedConversation.messages, // Copy all messages
      userId: session.user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
      messageCount: sharedConversation.messages.length,
      lastMessageAt: new Date()
    });

    await forkedConversation.save();

    return NextResponse.json({
      success: true,
      conversation: {
        id: forkedConversation.id,
        title: forkedConversation.title,
        messages: forkedConversation.messages,
        createdAt: forkedConversation.createdAt,
        updatedAt: forkedConversation.updatedAt,
        messageCount: forkedConversation.messageCount
      }
    });
  } catch (error) {
    console.error('Error forking shared conversation:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fork conversation' },
      { status: 500 }
    );
  }
}
