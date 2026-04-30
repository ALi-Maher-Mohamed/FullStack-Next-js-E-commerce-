import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Order";
import Product from "@/models/Product";
import { withAuth } from "@/lib/auth";
import { NextResponse } from "next/server";

/**
 * GET /api/orders
 * Get user's orders
 */
export const GET = withAuth(async function (request) {
  try {
    await dbConnect();

    const user = request.user;
    const userId = user.userId;

    const orders = await Order.find({ user: userId })
      .populate("items.product", "title price images")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error("Get orders error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
});

/**
 * POST /api/orders
 * Create new order (without transactions - works with standalone MongoDB)
 */
export const POST = withAuth(async function (request) {
  await dbConnect();

  try {
    const { items, shippingAddress, billingAddress, paymentMethod } =
      await request.json();

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "Order must contain items" },
        { status: 400 },
      );
    }

    const user = request.user;
    const userId = user.userId;

    // Calculate totals and check stock
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

      const price = product.salePrice || product.price;

      // Check stock availability
      if (product.stock.quantity < item.quantity) {
        return NextResponse.json(
          {
            error: `Insufficient stock for ${product.title}. Available: ${product.stock.quantity}`,
          },
          { status: 400 },
        );
      }

      const itemTotal = price * item.quantity;
      subtotal += itemTotal;

      populatedItems.push({
        product: item.product,
        quantity: item.quantity,
        price: price,
        total: itemTotal,
      });
    }

    const tax = subtotal * 0.1; // 10% tax
    const shippingCost = subtotal > 100 ? 0 : 10; // Free shipping over $100
    const total = subtotal + tax + shippingCost;

    // Create order
    const order = new Order({
      user: userId,
      items: populatedItems,
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      subtotal,
      tax,
      shippingCost,
      total,
      paymentMethod,
      status: "pending",
      paymentStatus: paymentMethod === "wallet" ? "completed" : "pending",
      statusHistory: [{ status: "pending", comment: "Order created" }],
    });

    await order.save();

    for (const item of items) {
      await Product.updateOne(
        { _id: item.product, "stock.quantity": { $gte: item.quantity } },
        { $inc: { "stock.quantity": -item.quantity } },
      );
    }

    await order.populate("items.product", "title price images");

    return NextResponse.json({
      success: true,
      data: order,
      message: "Order created successfully",
    });
  } catch (error) {
    console.error("Create order error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
});
