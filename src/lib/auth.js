import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

/**
 * Middleware to verify JWT tokens
 * Extract token from Authorization header or cookies
 */
export function verifyToken(request) {
  try {
    let token = null;

    // Check Authorization header
    const authHeader = request.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }

    // Fall back to cookie
    if (!token) {
      token = request.cookies.get("authToken")?.value;
    }

    if (!token) {
      return { authenticated: false, error: "No token provided" };
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key",
    );
    return { authenticated: true, user: decoded };
  } catch (error) {
    return { authenticated: false, error: error.message };
  }
}

/**
 * Middleware wrapper for protected routes
 */
export function withAuth(handler) {
  return async (request, context) => {
    const auth = verifyToken(request);

    if (!auth.authenticated) {
      return NextResponse.json(
        { error: "Unauthorized: " + auth.error },
        { status: 401 },
      );
    }

    // Add user to request
    request.user = auth.user;

    return handler(request, context);
  };
}

/**
 * Role-based access control middleware
 */
export function withRole(...allowedRoles) {
  return (handler) => {
    return async (request, context) => {
      const auth = verifyToken(request);

      if (!auth.authenticated) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      if (!allowedRoles.includes(auth.user.role)) {
        return NextResponse.json(
          {
            error:
              "Forbidden: Insufficient permissions. Required role: " +
              allowedRoles.join(" or "),
          },
          { status: 403 },
        );
      }

      request.user = auth.user;
      return handler(request, context);
    };
  };
}
