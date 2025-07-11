// src/app/api/conversations/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import Conversation from '@/models/Conversation';
import { auth } from '@/lib/auth/auth';

// GET /api/conversations/[id] - Get specific conversation with messages
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();
    
    const resolvedParams = await params;
    const conversation = await Conversation.findOne({ 
      id: resolvedParams.id,
      userId: session.user.id // Ensure user can only access their own conversations
    });
    
    if (!conversation) {
      return NextResponse.json(
        { success: false, error: 'Conversation not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      conversation: {
        id: conversation.id,
        title: conversation.title,
        messages: conversation.messages,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
        messageCount: conversation.messageCount,
        userId: conversation.userId
      }
    });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch conversation' },
      { status: 500 }
    );
  }
}

// PUT /api/conversations/[id] - Update conversation (add messages)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();
    
    const body = await request.json();
    const { messages, title } = body;
    
    const resolvedParams = await params;
    const conversation = await Conversation.findOne({ 
      id: resolvedParams.id,
      userId: session.user.id // Ensure user can only update their own conversations
    });
    
    if (!conversation) {
      return NextResponse.json(
        { success: false, error: 'Conversation not found' },
        { status: 404 }
      );
    }
    
    // Update title if provided
    if (title) {
      conversation.title = title;
    }
    
    // Replace all messages or add new ones
    if (messages) {
      conversation.messages = messages;
      conversation.updateTitleFromFirstMessage();
    }
    
    await conversation.save();
    
    return NextResponse.json({
      success: true,
      conversation: {
        id: conversation.id,
        title: conversation.title,
        messages: conversation.messages,
        updatedAt: conversation.updatedAt,
        messageCount: conversation.messageCount,
        userId: conversation.userId
      }
    });
  } catch (error) {
    console.error('Error updating conversation:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update conversation' },
      { status: 500 }
    );
  }
}

// DELETE /api/conversations/[id] - Delete conversation
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();
    
    const resolvedParams = await params;
    const conversation = await Conversation.findOneAndDelete({ 
      id: resolvedParams.id,
      userId: session.user.id // Ensure user can only delete their own conversations
    });
    
    if (!conversation) {
      return NextResponse.json(
        { success: false, error: 'Conversation not found' },
        { status: 404 }
      );
    }
    
    // TODO: Delete associated Cloudinary files
    // We'll implement this when we handle file cleanup
    
    return NextResponse.json({
      success: true,
      message: 'Conversation deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting conversation:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete conversation' },
      { status: 500 }
    );
  }
}
