import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";

/**
 * GET /api/users
 * Get all users (Admin only)
 */
export async function GET(request) {
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
}

/**
 * GET /api/users/[id]
 * Get user profile
 */
export async function GET_USER(request, { params }) {
  try {
    await dbConnect();

    const { id } = params;

    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
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
}

/**
 * PUT /api/users/[id]
 * Update user
 */
export async function PUT(request, { params }) {
  try {
    await dbConnect();

    const { id } = params;
    const updateData = await request.json();

    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    // Don't allow updating password or email directly
    delete updateData.password;
    delete updateData.email;

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
}

/**
 * DELETE /api/users/[id]
 * Soft delete user (Admin only)
 */
export async function DELETE(request, { params }) {
  try {
    await dbConnect();

    const { id } = params;

    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const user = await User.findByIdAndUpdate(
      id,
      {
        isDeleted: true,
        deletedAt: new Date(),
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
}
