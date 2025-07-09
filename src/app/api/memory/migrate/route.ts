import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { mem0Service } from "@/lib/mem0/service";

export async function POST(req: NextRequest) {
  try {
    // Get the authenticated session
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { anonymousUserId } = await req.json();

    if (!anonymousUserId) {
      return NextResponse.json(
        { error: "Anonymous user ID is required" },
        { status: 400 }
      );
    }

    // Don't migrate if the anonymous ID is the same as authenticated ID
    if (anonymousUserId === session.user.id) {
      return NextResponse.json({
        success: true,
        migratedCount: 0,
        message: "No migration needed - IDs are the same"
      });
    }

    console.log(`🔄 Starting memory migration from ${anonymousUserId} to ${session.user.id}`);

    // Migrate memories from anonymous user to authenticated user
    const result = await mem0Service.migrateAnonymousMemories(
      anonymousUserId,
      session.user.id
    );

    if (result.success) {
      console.log(`✅ Memory migration completed: ${result.migratedCount} memories migrated`);
      
      return NextResponse.json({
        success: true,
        migratedCount: result.migratedCount,
        message: `Successfully migrated ${result.migratedCount} memories`
      });
    } else {
      console.error(`❌ Memory migration failed:`, result.error);
      
      return NextResponse.json(
        { 
          error: "Migration failed", 
          details: result.error 
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Memory migration error:", error);
    
    return NextResponse.json(
      { 
        error: "Internal server error", 
        details: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    );
  }
}
