// src/app/api/conversations/[id]/share/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import Conversation from '@/models/Conversation';
import SharedConversation from '@/models/SharedConversation';
import { auth } from '@/lib/auth/auth';

// POST /api/conversations/[id]/share - Create a shareable link
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

    // Check if already shared
    let sharedConversation = await SharedConversation.findOne({
      originalConversationId: conversation.id
    });

    if (!sharedConversation) {
      // Create new shared conversation
      const shareId = `shared_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      sharedConversation = new SharedConversation({
        id: shareId,
        originalConversationId: conversation.id,
        title: conversation.title,
        messages: conversation.messages,
        ownerId: session.user.id,
        createdAt: new Date(),
        isPublic: true
      });

      await sharedConversation.save();
    }

    const shareUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/share/${sharedConversation.id}`;

    return NextResponse.json({
      success: true,
      shareUrl,
      shareId: sharedConversation.id
    });
  } catch (error) {
    console.error('Error creating share link:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create share link' },
      { status: 500 }
    );
  }
}

// DELETE /api/conversations/[id]/share - Remove sharing
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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
      userId: session.user.id
    });
    
    if (!conversation) {
      return NextResponse.json(
        { success: false, error: 'Conversation not found' },
        { status: 404 }
      );
    }

    // Remove shared conversation
    await SharedConversation.deleteOne({
      originalConversationId: conversation.id
    });

    return NextResponse.json({
      success: true,
      message: 'Share link removed'
    });
  } catch (error) {
    console.error('Error removing share link:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to remove share link' },
      { status: 500 }
    );
  }
}
