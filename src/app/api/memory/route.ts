import { mem0Service } from '@/lib/mem0/service';
import { NextRequest } from 'next/server';

// GET /api/memory - Get memories for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const query = searchParams.get('query');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!userId) {
      return Response.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    if (!mem0Service.isAvailable()) {
      return Response.json(
        { error: 'Memory service not available' },
        { status: 503 }
      );
    }

    let result;

    if (query) {
      // Search memories globally (no conversation filtering)
      const searchResult = await mem0Service.searchMemories(query, userId, limit);
      result = searchResult;
    } else {
      // Get all user memories globally
      result = await mem0Service.getUserMemories(userId, limit);
    }

    if (!result.success) {
      return Response.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return Response.json({
      memories: result.memories || [],
      count: result.memories?.length || 0
    });

  } catch (error) {
    console.error('Memory GET error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/memory - Add a new memory
export async function POST(request: NextRequest) {
  try {
    const { message, userId, conversationId, metadata } = await request.json();

    if (!message || !userId) {
      return Response.json(
        { error: 'message and userId are required' },
        { status: 400 }
      );
    }

    if (!mem0Service.isAvailable()) {
      return Response.json(
        { error: 'Memory service not available' },
        { status: 503 }
      );
    }

    const result = await mem0Service.addMemory(
      message,
      userId,
      conversationId || `conv_${Date.now()}`,
      metadata
    );

    if (!result.success) {
      return Response.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      memoryId: result.memoryId
    });

  } catch (error) {
    console.error('Memory POST error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/memory - Delete a memory
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const memoryId = searchParams.get('memoryId');

    if (!memoryId) {
      return Response.json(
        { error: 'memoryId is required' },
        { status: 400 }
      );
    }

    if (!mem0Service.isAvailable()) {
      return Response.json(
        { error: 'Memory service not available' },
        { status: 503 }
      );
    }

    const result = await mem0Service.deleteMemory(memoryId);

    if (!result.success) {
      return Response.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return Response.json({ success: true });

  } catch (error) {
    console.error('Memory DELETE error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
