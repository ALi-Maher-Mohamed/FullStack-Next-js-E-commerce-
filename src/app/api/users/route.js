import dbConnect from "@/lib/dbConnect";
import User, { USER_ROLES } from "@/models/User";
import { withRole } from "@/lib/auth";
import { NextResponse } from "next/server";

/**
 * GET /api/users
 * Get all users (Admin only)
 */
export const GET = withRole(USER_ROLES.ADMIN)(async function (request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;

    const filter = { isDeleted: false };
    if (role) {
      filter.role = role;
    }

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find(filter).select("-password").limit(limit).skip(skip).lean(),
      User.countDocuments(filter),
    ]);

    return NextResponse.json(
      {
        success: true,
        data: users,
        pagination: {
          currentPage: page,
          pageSize: limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Get users error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
});
