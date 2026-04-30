import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Product";
import { USER_ROLES } from "@/models/User";
import { withAuth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";

/**
 * GET /api/products/[id]
 * Get a single product by ID
 */
export async function GET(request, { params }) {
  try {
    await dbConnect();

    const { id } = await params;

    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { error: "Invalid product ID" },
        { status: 400 },
      );
    }

    const product = await Product.findById(id)
      .populate("seller", "firstName lastName avatar storeName email phone")
      .populate("category", "name slug");

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        success: true,
        data: product,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Get product error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/products/[id]
 * Update a product (Seller/Admin only)
 */
export const PUT = withAuth(async function (request, { params }) {
  try {
    await dbConnect();

    const { id } = await params;
    const user = request.user;

    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { error: "Invalid product ID" },
        { status: 400 },
      );
    }

    const productToUpdate = await Product.findById(id);

    if (!productToUpdate) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Ownership check
    if (
      user.role !== USER_ROLES.ADMIN &&
      productToUpdate.seller.toString() !== user.userId
    ) {
      return NextResponse.json(
        { error: "Forbidden: You don't own this product" },
        { status: 403 },
      );
    }

    const updateData = await request.json();

    // Don't allow updating slug or seller directly
    delete updateData.slug;
    delete updateData.seller;

    const product = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("seller", "firstName lastName avatar storeName")
      .populate("category", "name slug");

    return NextResponse.json(
      {
        success: true,
        message: "Product updated successfully",
        data: product,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Update product error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
});

/**
 * DELETE /api/products/[id]
 * Delete a product (Admin only)
 */
export const DELETE = withAuth(async function (request, { params }) {
  try {
    await dbConnect();

    const { id } = await params;
    const user = request.user;

    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { error: "Invalid product ID" },
        { status: 400 },
      );
    }

    const productToDelete = await Product.findById(id);

    if (!productToDelete) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Admin can delete any product
    if (
      user.role !== USER_ROLES.ADMIN &&
      productToDelete.seller.toString() !== user.userId
    ) {
      return NextResponse.json(
        { error: "Forbidden: You don't own this product" },
        { status: 403 },
      );
    }

    await Product.findByIdAndDelete(id);

    return NextResponse.json(
      {
        success: true,
        message: "Product deleted successfully",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Delete product error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
});
