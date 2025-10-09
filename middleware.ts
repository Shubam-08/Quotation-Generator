// middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAdminRoute = req.nextUrl.pathname.startsWith("/admin");

    // If accessing admin route, check if user is admin
    if (isAdminRoute) {
      if (!token) {
        return NextResponse.redirect(new URL("/login", req.url));
      }
      
      if (token.role !== "admin") {
        return NextResponse.redirect(new URL("/products", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // Let the middleware function handle the logic
        return true;
      },
    },
  }
);

export const config = {
  matcher: ["/admin/:path*"],
};
