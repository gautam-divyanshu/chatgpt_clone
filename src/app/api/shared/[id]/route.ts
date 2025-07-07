// src/app/api/shared/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import SharedConversation from '@/models/SharedConversation';

// GET /api/shared/[id] - Get shared conversation (public access)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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

    // Increment view count
    await SharedConversation.updateOne(
      { id: resolvedParams.id },
      { $inc: { viewCount: 1 } }
    );
    
    return NextResponse.json({
      success: true,
      conversation: {
        id: sharedConversation.id,
        title: sharedConversation.title,
        messages: sharedConversation.messages,
        createdAt: sharedConversation.createdAt,
        viewCount: sharedConversation.viewCount + 1,
        isShared: true
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
