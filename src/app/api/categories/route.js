import dbConnect from "@/lib/dbConnect";
import Category from "@/models/Category";
import { NextResponse } from "next/server";

/**
 * GET /api/categories
 * Get all categories
 */
export async function GET(request) {
  try {
    await dbConnect();

    const categories = await Category.find({ isActive: true })
      .sort({ displayOrder: 1, name: 1 })
      .lean();

    return NextResponse.json(
      {
        success: true,
        data: categories,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Get categories error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/categories
 * Create new category (Admin only)
 */
export async function POST(request) {
  try {
    await dbConnect();

    const data = await request.json();

    const slug = data.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");

    const category = new Category({
      ...data,
      slug,
    });

    await category.save();

    return NextResponse.json(
      {
        success: true,
        data: category,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create category error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
