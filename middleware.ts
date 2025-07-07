// middleware.ts
import { auth } from "@/lib/auth/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  // Allow access to share routes without authentication
  const isShareRoute = nextUrl.pathname.startsWith('/share/');
  if (isShareRoute) {
    return NextResponse.next();
  }

  // Protect API routes (except auth routes and share routes)
  const isApiRoute = nextUrl.pathname.startsWith("/api");
  const isAuthApiRoute = nextUrl.pathname.startsWith("/api/auth");
  const isShareApiRoute = nextUrl.pathname.startsWith("/api/share");

  if (isApiRoute && !isAuthApiRoute && !isShareApiRoute && !isLoggedIn) {
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
