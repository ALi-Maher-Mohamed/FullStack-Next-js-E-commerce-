import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Product";
import { NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";

/**
 * GET /api/products/[id]
 * Get a single product by ID
 */
export async function GET(request, { params }) {
  try {
    await dbConnect();

    const { id } = params;

    // Validate MongoDB ObjectId
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
export async function PUT(request, { params }) {
  try {
    await dbConnect();

    const { id } = params;

    // Validate MongoDB ObjectId
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { error: "Invalid product ID" },
        { status: 400 },
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

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

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
}

/**
 * DELETE /api/products/[id]
 * Delete a product (Admin only)
 */
export async function DELETE(request, { params }) {
  try {
    await dbConnect();

    const { id } = params;

    // Validate MongoDB ObjectId
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { error: "Invalid product ID" },
        { status: 400 },
      );
    }

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

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
}
