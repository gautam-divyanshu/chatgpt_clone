import { mem0Service } from '@/lib/mem0/service';
import { NextRequest } from 'next/server';

// GET /api/memory - Get memories for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const conversationId = searchParams.get('conversationId');
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
      // Search memories and filter by conversation if specified
      const searchResult = await mem0Service.getUserMemories(userId, limit * 2);
      if (searchResult.success && searchResult.memories) {
        let filteredMemories = searchResult.memories;
        
        // Filter by conversation if specified
        if (conversationId) {
          filteredMemories = filteredMemories.filter(memory => {
            const memoryConvId = memory.metadata?.conversation_id;
            return memoryConvId === conversationId;
          });
        }
        
        // Then filter by search query
        const searchedMemories = filteredMemories.filter(memory => {
          const content = (memory.text || memory.memory || memory.content || '').toLowerCase();
          return content.includes(query.toLowerCase());
        }).slice(0, limit);
        
        result = { success: true, memories: searchedMemories };
      } else {
        result = searchResult;
      }
    } else if (conversationId) {
      // Get conversation memories using client-side filtering
      const allMemoriesResult = await mem0Service.getUserMemories(userId, limit * 2);
      if (allMemoriesResult.success && allMemoriesResult.memories) {
        const conversationMemories = allMemoriesResult.memories.filter(memory => {
          const memoryConvId = memory.metadata?.conversation_id;
          return memoryConvId === conversationId;
        }).slice(0, limit);
        
        result = { success: true, memories: conversationMemories };
      } else {
        result = allMemoriesResult;
      }
    } else {
      // Get all user memories
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
