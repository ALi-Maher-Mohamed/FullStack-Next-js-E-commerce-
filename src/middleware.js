import { NextResponse } from "next/server";

// Define protected routes and their allowed roles
const PROTECTED_ROUTES = [
  { path: "/profile", roles: ["customer", "seller", "admin"] },
  { path: "/orders", roles: ["customer", "seller", "admin"] },
  { path: "/seller-dashboard", roles: ["seller", "admin"] },
  { path: "/admin-dashboard", roles: ["admin"] },
  { path: "/cart", roles: ["customer", "seller", "admin"] },
];

export function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Check if current path is protected
  const protectedRoute = PROTECTED_ROUTES.find(route => 
    pathname.startsWith(route.path)
  );

  if (protectedRoute) {
    const token = request.cookies.get("authToken")?.value;

    if (!token) {
      // Redirect to login if no token
      const url = new URL("/login", request.url);
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }

    // Note: We can't easily verify JWT payload in standard Edge Middleware 
    // without a compatible library or manual parsing (which is risky).
    // For now, we rely on the existence of the token for page redirection.
    // The API routes will handle the actual role verification.
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    "/profile/:path*",
    "/orders/:path*",
    "/seller-dashboard/:path*",
    "/admin-dashboard/:path*",
    "/cart/:path*",
  ],
};
