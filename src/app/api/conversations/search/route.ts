// src/app/api/conversations/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import Conversation from '@/models/Conversation';
import { auth } from '@/lib/auth/auth';

// GET /api/conversations/search - Search conversations
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.trim().length < 2) {
      return NextResponse.json({
        success: true,
        results: []
      });
    }

    const searchTerm = query.trim();

    // Search in conversation titles and message content using aggregation
    const searchResults = await Conversation.aggregate([
      {
        $match: {
          userId: session.user.id,
          $or: [
            { title: { $regex: searchTerm, $options: 'i' } },
            { 'messages.content': { $regex: searchTerm, $options: 'i' } }
          ]
        }
      },
      {
        $addFields: {
          // Check if title matches
          titleMatch: {
            $regexMatch: {
              input: '$title',
              regex: searchTerm,
              options: 'i'
            }
          },
          // Find matching messages
          matchingMessages: {
            $filter: {
              input: '$messages',
              cond: {
                $regexMatch: {
                  input: '$$this.content',
                  regex: searchTerm,
                  options: 'i'
                }
              }
            }
          }
        }
      },
      {
        $addFields: {
          // Get excerpt from first matching message
          excerpt: {
            $cond: {
              if: { $gt: [{ $size: '$matchingMessages' }, 0] },
              then: {
                $substr: [
                  { $arrayElemAt: ['$matchingMessages.content', 0] },
                  0,
                  150
                ]
              },
              else: null
            }
          }
        }
      },
      {
        $project: {
          id: 1,
          title: 1,
          createdAt: 1,
          lastMessageAt: 1,
          excerpt: {
            $cond: {
              if: { $ne: ['$excerpt', null] },
              then: { $concat: ['$excerpt', '...'] },
              else: null
            }
          }
        }
      },
      {
        $sort: { lastMessageAt: -1 }
      },
      {
        $limit: 20
      }
    ]);

    return NextResponse.json({
      success: true,
      results: searchResults,
      query: searchTerm
    });

  } catch (error) {
    console.error('Error searching conversations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to search conversations' },
      { status: 500 }
    );
  }
}
