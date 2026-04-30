import dbConnect from "@/lib/dbConnect";
import Category from "@/models/Category";
import Product from "@/models/Product";
import { USER_ROLES } from "@/models/User";
import { withRole } from "@/lib/auth";
import { NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";

/**
 * GET /api/categories/[id]
 */
export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;

    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid category ID" }, { status: 400 });
    }

    const category = await Category.findById(id);
    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: category });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * PUT /api/categories/[id]
 * Update category (Admin only)
 */
export const PUT = withRole(USER_ROLES.ADMIN)(async function (request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    const data = await request.json();

    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    // Auto-generate slug if name changes
    if (data.name) {
      data.slug = data.name
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-");
    }

    const category = await Category.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Category updated successfully",
      data: category,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});

/**
 * DELETE /api/categories/[id]
 * Delete category and all associated products (Admin only)
 */
export const DELETE = withRole(USER_ROLES.ADMIN)(async function (request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;

    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    // 1. Find the category
    const category = await Category.findById(id);
    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    // 2. Cascading Delete: Delete all products in this category
    const deletedProducts = await Product.deleteMany({ category: id });

    // 3. Delete the category itself
    await Category.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: `Category and ${deletedProducts.deletedCount} associated products deleted successfully`,
    });
  } catch (error) {
    console.error("Delete category error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});
