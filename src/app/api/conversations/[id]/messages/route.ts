// src/app/api/conversations/[id]/messages/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import Conversation from '@/models/Conversation';

// POST /api/conversations/[id]/messages - Add a message to conversation
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { role, content, attachments } = body;
    
    if (!role || !content) {
      return NextResponse.json(
        { success: false, error: 'Role and content are required' },
        { status: 400 }
      );
    }
    
    const resolvedParams = await params;
    const conversation = await Conversation.findOne({ id: resolvedParams.id });
    
    if (!conversation) {
      return NextResponse.json(
        { success: false, error: 'Conversation not found' },
        { status: 404 }
      );
    }
    
    const newMessage = conversation.addMessage({
      role,
      content,
      attachments: attachments || []
    });
    
    await conversation.save();
    
    return NextResponse.json({
      success: true,
      message: newMessage,
      conversation: {
        id: conversation.id,
        title: conversation.title,
        messageCount: conversation.messageCount,
        updatedAt: conversation.updatedAt
      }
    });
  } catch (error) {
    console.error('Error adding message:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add message' },
      { status: 500 }
    );
  }
}
