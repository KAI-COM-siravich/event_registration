import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // Redirect logged in users away from the login page
    if (req.nextUrl.pathname === "/" && req.nextauth.token) {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
    
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const isProtectedPath = ['/admin', '/events', '/booths', '/rewards', '/check-in']
          .some(path => req.nextUrl.pathname.startsWith(path));
          
        if (isProtectedPath) {
          return !!token; // Require token for protected paths
        }
        return true; // Allow public paths (e.g. /register)
      }
    }
  }
);

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|register).*)'],
}
