import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Order";
import Product from "@/models/Product";
import User from "@/models/User";
import { NextResponse } from "next/server";

/**
 * GET /api/orders
 * Get user's orders
 */
export async function GET(request) {
  try {
    await dbConnect();

    const auth = request.headers.get("authorization");
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Extract user ID from token (simplified, should use JWT decode)
    const userId = request.headers.get("x-user-id");

    const orders = await Order.find({ user: userId })
      .populate("items.product", "title price images")
      .populate("user", "firstName lastName email phone")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(
      {
        success: true,
        data: orders,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Get orders error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/orders
 * Create new order
 */
export async function POST(request) {
  try {
    await dbConnect();

    const { items, shippingAddress, billingAddress, paymentMethod } =
      await request.json();

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "Order must contain items" },
        { status: 400 },
      );
    }

    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Calculate totals
    let subtotal = 0;
    const populatedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return NextResponse.json(
          { error: `Product ${item.product} not found` },
          { status: 404 },
        );
      }

      const itemTotal = (product.salePrice || product.price) * item.quantity;
      subtotal += itemTotal;

      populatedItems.push({
        product: item.product,
        quantity: item.quantity,
        price: product.salePrice || product.price,
        total: itemTotal,
      });
    }

    const tax = subtotal * 0.1; // 10% tax
    const shippingCost = subtotal > 100 ? 0 : 10; // Free shipping over $100
    const total = subtotal + tax + shippingCost;

    const order = new Order({
      user: userId,
      items: populatedItems,
      shippingAddress,
      billingAddress,
      subtotal,
      tax,
      shippingCost,
      total,
      paymentMethod,
      statusHistory: [
        {
          status: "pending",
          comment: "Order created",
        },
      ],
    });

    await order.save();
    await order.populate("items.product", "title price images");

    return NextResponse.json(
      {
        success: true,
        data: order,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create order error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
