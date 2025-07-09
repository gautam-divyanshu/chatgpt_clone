// src/lib/auth/auth.ts
import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { ENV } from "@/config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  trustHost: true,
  basePath: "/api/auth",
  ...(ENV.NEXTAUTH_URL && { url: new URL(ENV.NEXTAUTH_URL) }),
});
