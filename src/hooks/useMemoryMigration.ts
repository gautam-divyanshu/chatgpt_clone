// src/hooks/useMemoryMigration.ts
"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "./useAuth";
import { getAnonymousUserId, clearAnonymousUserId } from "@/lib/utils";

export function useMemoryMigration() {
  const { isAuthenticated, user, isLoading } = useAuth();
  const migrationAttempted = useRef(false);

  useEffect(() => {
    // Only attempt migration once per session and when user is authenticated
    if (
      isAuthenticated && 
      user?.id && 
      !isLoading && 
      !migrationAttempted.current
    ) {
      migrationAttempted.current = true;
      
      const anonymousUserId = getAnonymousUserId();
      
      if (anonymousUserId && anonymousUserId !== user.id) {
        console.log('🔄 Attempting to migrate memories from anonymous session:', anonymousUserId);
        
        // Attempt memory migration
        fetch('/api/memory/migrate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            anonymousUserId
          })
        })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            console.log('✅ Memory migration successful:', data.message);
            // Clear the anonymous user ID since memories are now migrated
            clearAnonymousUserId();
          } else {
            console.warn('⚠️ Memory migration failed:', data.error);
          }
        })
        .catch(error => {
          console.error('❌ Memory migration error:', error);
        });
      }
    }
  }, [isAuthenticated, user?.id, isLoading]);

  return {
    // You can expose migration status here if needed
    isMigrationPossible: () => {
      const anonymousUserId = getAnonymousUserId();
      return isAuthenticated && anonymousUserId && anonymousUserId !== user?.id;
    }
  };
}
