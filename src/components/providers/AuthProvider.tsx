// src/components/providers/AuthProvider.tsx
"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";
import { useMemoryMigration } from "@/hooks/useMemoryMigration";

interface AuthProviderProps {
  children: ReactNode;
}

function AuthProviderInner({ children }: AuthProviderProps) {
  // Initialize memory migration when authentication state changes
  useMemoryMigration();
  
  return <>{children}</>;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  return (
    <SessionProvider>
      <AuthProviderInner>{children}</AuthProviderInner>
    </SessionProvider>
  );
}
