// middleware.ts
import { auth } from "@/lib/auth/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  // Protect API routes (except auth routes)
  const isApiRoute = nextUrl.pathname.startsWith("/api");
  const isAuthApiRoute = nextUrl.pathname.startsWith("/api/auth");

  if (isApiRoute && !isAuthApiRoute && !isLoggedIn) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  // Protect main app routes
  const isAuthPage = nextUrl.pathname.startsWith("/auth");
  
  if (!isAuthPage && !isLoggedIn) {
    return Response.redirect(new URL("/auth/signin", nextUrl));
  }

  // Redirect authenticated users away from auth pages
  if (isAuthPage && isLoggedIn) {
    return Response.redirect(new URL("/", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)",
  ],
};
