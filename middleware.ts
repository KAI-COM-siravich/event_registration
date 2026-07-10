import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // Redirect logged in users away from the login page
    if (req.nextUrl.pathname === "/" && req.nextauth.token) {
      if ((req.nextauth.token as any).role === "CUSTOMER") {
        return NextResponse.redirect(new URL("/register", req.url));
      }
      return NextResponse.redirect(new URL("/admin", req.url));
    }
    
    // API Authorization
    if (req.nextUrl.pathname.startsWith("/api/")) {
      const path = req.nextUrl.pathname;
      const method = req.method;
      
      const isPublicApi = 
        path.startsWith("/api/auth") || 
        (path === "/api/events" && method === "GET") ||
        (path === "/api/registrations" && method === "POST");
        
      if (!isPublicApi && !req.nextauth.token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }
    
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Let the middleware function handle API routes so it can respond with JSON
        if (req.nextUrl.pathname.startsWith("/api/")) {
          return true;
        }

        const isProtectedPath = ['/admin', '/events', '/booths', '/rewards', '/check-in']
          .some(path => req.nextUrl.pathname.startsWith(path));
          
        if (isProtectedPath) {
          if (!token) return false;
          // CUSTOMER shouldn't access these admin/staff paths
          if ((token as any).role === "CUSTOMER") return false;
          return true;
        }
        return true; // Allow public paths (e.g. /register)
      }
    }
  }
);

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|register).*)'],
}
