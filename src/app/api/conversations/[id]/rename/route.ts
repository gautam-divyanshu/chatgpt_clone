// src/app/api/conversations/[id]/rename/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import Conversation from '@/models/Conversation';
import { auth } from '@/lib/auth/auth';

// PUT /api/conversations/[id]/rename - Rename conversation
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await request.json();
    const { title } = body;

    if (!title || !title.trim()) {
      return NextResponse.json(
        { success: false, error: 'Title is required' },
        { status: 400 }
      );
    }

    const resolvedParams = await params;
    const conversation = await Conversation.findOne({
      id: resolvedParams.id,
      userId: session.user.id // Ensure user owns the conversation
    });

    if (!conversation) {
      return NextResponse.json(
        { success: false, error: 'Conversation not found' },
        { status: 404 }
      );
    }

    // Update the conversation title
    conversation.title = title.trim();
    conversation.updatedAt = new Date();

    await conversation.save();

    return NextResponse.json({
      success: true,
      conversation: {
        id: conversation.id,
        title: conversation.title,
        updatedAt: conversation.updatedAt,
      }
    });
  } catch (error) {
    console.error('Error renaming conversation:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to rename conversation' },
      { status: 500 }
    );
  }
}
