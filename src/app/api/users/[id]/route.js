import dbConnect from "@/lib/dbConnect";
import User, { USER_ROLES } from "@/models/User";
import { withAuth, withRole } from "@/lib/auth";
import { NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";

/**
 * GET /api/users/[id]
 * Get user profile
 */
export const GET = withAuth(async function (request, { params }) {
  try {
    await dbConnect();

    const { id } = await params;
    const currentUser = request.user;

    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    // Ownership check: Only the user themselves or an admin can see the profile
    if (currentUser.role !== USER_ROLES.ADMIN && currentUser.userId !== id) {
      return NextResponse.json(
        { error: "Forbidden: You cannot access this profile" },
        { status: 403 },
      );
    }

    const user = await User.findById(id).select("-password");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        success: true,
        data: user,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
});

/**
 * PUT /api/users/[id]
 * Update user
 */
export const PUT = withAuth(async function (request, { params }) {
  try {
    await dbConnect();

    const { id } = await params;
    const currentUser = request.user;

    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    // Ownership check: Only the user themselves or an admin can update
    if (currentUser.role !== USER_ROLES.ADMIN && currentUser.userId !== id) {
      return NextResponse.json(
        { error: "Forbidden: You cannot update this profile" },
        { status: 403 },
      );
    }

    const updateData = await request.json();

    // Don't allow updating password or email directly here
    // Also don't allow non-admins to change roles
    delete updateData.password;
    delete updateData.email;
    if (currentUser.role !== USER_ROLES.ADMIN) {
      delete updateData.role;
    }

    const user = await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        success: true,
        data: user,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
});

/**
 * DELETE /api/users/[id]
 * Soft delete user (Admin only)
 */
export const DELETE = withRole(USER_ROLES.ADMIN)(async function (
  request,
  { params },
) {
  try {
    await dbConnect();

    const { id } = await params;

    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const user = await User.findByIdAndUpdate(
      id,
      {
        isDeleted: true,
        deletedAt: new Date(),
        isActive: false,
      },
      { new: true },
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        success: true,
        message: "User deleted successfully",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
});
