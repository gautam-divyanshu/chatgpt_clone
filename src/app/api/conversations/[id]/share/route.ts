// src/app/api/conversations/[id]/share/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import Conversation from '@/models/Conversation';
import { auth } from '@/lib/auth/auth';

// POST /api/conversations/[id]/share - Create a shareable link for conversation
export async function POST(
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
      userId: session.user.id // Ensure user owns the conversation
    });
    
    if (!conversation) {
      return NextResponse.json(
        { success: false, error: 'Conversation not found' },
        { status: 404 }
      );
    }

    // Generate a unique share ID
    const shareId = `share_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Update conversation with share information
    conversation.shareId = shareId;
    conversation.isShared = true;
    conversation.sharedAt = new Date();
    await conversation.save();

    const shareUrl = `${process.env.NEXTAUTH_URL}/share/${shareId}`;
    
    return NextResponse.json({
      success: true,
      shareId,
      shareUrl,
      message: 'Conversation shared successfully'
    });
  } catch (error) {
    console.error('Error sharing conversation:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to share conversation' },
      { status: 500 }
    );
  }
}

// DELETE /api/conversations/[id]/share - Remove sharing for conversation
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

    // Remove sharing
    conversation.shareId = undefined;
    conversation.isShared = false;
    conversation.sharedAt = undefined;
    await conversation.save();
    
    return NextResponse.json({
      success: true,
      message: 'Conversation sharing removed successfully'
    });
  } catch (error) {
    console.error('Error removing conversation sharing:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to remove sharing' },
      { status: 500 }
    );
  }
}
