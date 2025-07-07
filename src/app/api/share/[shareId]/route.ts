// src/app/api/share/[shareId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import Conversation from '@/models/Conversation';

// GET /api/share/[shareId] - Get shared conversation by share ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shareId: string }> }
) {
  try {
    await connectDB();
    
    const resolvedParams = await params;
    const conversation = await Conversation.findOne({ 
      shareId: resolvedParams.shareId,
      isShared: true
    });
    
    if (!conversation) {
      return NextResponse.json(
        { success: false, error: 'Shared conversation not found or no longer available' },
        { status: 404 }
      );
    }
    
    // Return conversation data without sensitive user information
    return NextResponse.json({
      success: true,
      conversation: {
        id: conversation.shareId, // Use shareId instead of internal ID
        title: conversation.title,
        messages: conversation.messages,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
        messageCount: conversation.messageCount,
        sharedAt: conversation.sharedAt,
        // Don't include userId for privacy
      }
    });
  } catch (error) {
    console.error('Error fetching shared conversation:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch shared conversation' },
      { status: 500 }
    );
  }
}
