import dbConnect from "@/lib/dbConnect";
import Product, { PRODUCT_STATUS } from "@/models/Product";
import { USER_ROLES } from "@/models/User";
import { withRole } from "@/lib/auth";
import { NextResponse } from "next/server";

/**
 * GET /api/products
 * Get all products with filtering, sorting, and pagination
 */
export async function GET(request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);

    // Query parameters
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const sort = searchParams.get("sort") || "-createdAt";
    const search = searchParams.get("search");
    const category = searchParams.get("category");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const status = searchParams.get("status") || PRODUCT_STATUS.ACTIVE;
    const isFeatured = searchParams.get("isFeatured");

    // Build filter query
    const filter = {
      status,
      visibility: "public",
    };

    // Text search
    if (search) {
      filter.$text = { $search: search };
    }

    // Category filter
    if (category) {
      filter.category = category;
    }

    // Price range filter
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) {
        filter.price.$gte = parseFloat(minPrice);
      }
      if (maxPrice) {
        filter.price.$lte = parseFloat(maxPrice);
      }
    }

    // Featured filter
    if (isFeatured === "true") {
      filter.isFeatured = true;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query
    const [products, total] = await Promise.all([
      Product.find(filter)
        .select("-inventoryHistory")
        .populate("seller", "firstName lastName avatar storeName")
        .populate("category", "name slug")
        .sort(sort)
        .limit(limit)
        .skip(skip)
        .lean(),
      Product.countDocuments(filter),
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json(
      {
        success: true,
        data: products,
        pagination: {
          currentPage: page,
          pageSize: limit,
          total,
          totalPages,
          hasNextPage,
          hasPrevPage,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Get products error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/products
 * Create a new product (Seller/Admin only)
 */
export const POST = withRole(
  USER_ROLES.SELLER,
  USER_ROLES.ADMIN,
)(async function (request) {
  try {
    await dbConnect();

    const productData = await request.json();
    const user = request.user;

    // Validation
    if (
      !productData.title ||
      !productData.description ||
      !productData.price ||
      !productData.category
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Generate slug
    const slug = productData.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .substring(0, 100);

    // Check if slug exists
    const existingProduct = await Product.findOne({ slug });
    if (existingProduct) {
      return NextResponse.json(
        { error: "Product with this title already exists" },
        { status: 409 },
      );
    }

    // Create product
    const product = new Product({
      ...productData,
      slug,
      seller: user.userId, // Set seller from authenticated user
      stock: productData.stock || { quantity: 0 },
    });

    await product.save();

    // Populate seller and category
    await product.populate("seller", "firstName lastName avatar storeName");
    await product.populate("category", "name slug");

    return NextResponse.json(
      {
        success: true,
        message: "Product created successfully",
        data: product,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create product error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
});
