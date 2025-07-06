// src/app/api/conversations/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import Conversation from '@/models/Conversation';

// GET /api/conversations/[id] - Get specific conversation with messages
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const conversation = await Conversation.findOne({ id: params.id });
    
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
        messageCount: conversation.messageCount
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
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { messages, title } = body;
    
    const conversation = await Conversation.findOne({ id: params.id });
    
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
        messageCount: conversation.messageCount
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
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const conversation = await Conversation.findOneAndDelete({ id: params.id });
    
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
