import dbConnect from "@/lib/dbConnect";
import Product, { PRODUCT_STATUS } from "@/models/Product";
import { USER_ROLES } from "@/models/User";
import { withRole } from "@/lib/auth";
import { NextResponse } from "next/server";

// ✅ Helper functions
function getDiscountNumber(discount) {
  if (!discount) return 0;
  if (typeof discount === "number") return discount;
  if (typeof discount === "object") {
    return discount.active ? discount.value || 0 : 0;
  }
  if (typeof discount === "string") return parseInt(discount) || 0;
  return 0;
}

function getDiscountObject(discount) {
  const value = getDiscountNumber(discount);
  return {
    type: "percentage",
    value: value,
    active: value > 0,
  };
}

function getStockQuantity(stock) {
  if (!stock) return 0;
  if (typeof stock === "number") return stock;
  if (typeof stock === "object") return stock.quantity || stock.value || 0;
  if (typeof stock === "string") return parseInt(stock) || 0;
  return 0;
}

function getPriceValue(price) {
  if (!price) return 0;
  if (typeof price === "object") return price.value || price.amount || 0;
  if (typeof price === "number") return price;
  if (typeof price === "string") return parseFloat(price) || 0;
  return 0;
}

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
    const sellerId = searchParams.get("seller");

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

    // Seller filter (for seller dashboard)
    if (sellerId) {
      filter.seller = sellerId;
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

    // ✅ Log the incoming data for debugging
    console.log("Creating product for seller:", user.userId);
    console.log("Product data:", JSON.stringify(productData, null, 2));

    // Validation
    if (
      !productData.title ||
      !productData.description ||
      !productData.price ||
      !productData.category
    ) {
      return NextResponse.json(
        {
          error: "Missing required fields: title, description, price, category",
        },
        { status: 400 },
      );
    }

    // Generate slug from title
    let slug = productData.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .substring(0, 100);

    // Remove trailing/leading hyphens
    slug = slug.replace(/^-|-$/g, "");

    // Check if slug exists - if so, add a suffix
    let existingProduct = await Product.findOne({ slug });
    let counter = 1;
    let originalSlug = slug;
    while (existingProduct) {
      slug = `${originalSlug}-${counter}`;
      existingProduct = await Product.findOne({ slug });
      counter++;
    }

    // ✅ Create product with discount as OBJECT (matching schema)
    const product = new Product({
      title: productData.title.trim(),
      slug,
      description: productData.description.trim(),
      shortDescription:
        productData.shortDescription ||
        productData.description.substring(0, 200),
      price: getPriceValue(productData.price),
      discount: getDiscountObject(productData.discount), // ✅ Object, not number
      category: productData.category,
      seller: user.userId,
      stock: {
        quantity: getStockQuantity(productData.stock),
        reserved: 0,
        lowStockThreshold: productData.lowStockThreshold || 10,
      },
      images: productData.images || [
        { url: "/placeholder.png", isPrimary: true },
      ],
      tags: productData.tags || [],
      status: productData.status || PRODUCT_STATUS.ACTIVE,
      isFeatured: productData.isFeatured || false,
      visibility: productData.visibility || "public",
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

    // ✅ Handle validation errors specially
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((e) => e.message);
      return NextResponse.json({ error: errors.join(", ") }, { status: 400 });
    }

    // ✅ Handle duplicate key error (slug)
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "A product with this title already exists" },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
});
