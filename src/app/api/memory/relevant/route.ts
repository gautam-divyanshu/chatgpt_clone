import { mem0Service } from '@/lib/mem0/service';
import { NextRequest } from 'next/server';

// POST /api/memory/relevant - Get relevant memories for current message
export async function POST(request: NextRequest) {
  try {
    const { message, userId, conversationId, limit = 5 } = await request.json();

    if (!message || !userId) {
      return Response.json(
        { error: 'message and userId are required' },
        { status: 400 }
      );
    }

    if (!mem0Service.isAvailable()) {
      return Response.json({ memories: [] });
    }

    const memories = await mem0Service.getRelevantMemories(
      message,
      userId,
      conversationId || `conv_${Date.now()}`,
      limit
    );

    return Response.json({ memories });

  } catch (error) {
    console.error('Relevant memories error:', error);
    return Response.json({ memories: [] });
  }
}
