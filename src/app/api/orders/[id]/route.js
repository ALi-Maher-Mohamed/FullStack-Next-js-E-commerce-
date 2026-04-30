import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Order";
import { withAuth, withRole } from "@/lib/auth";
import { USER_ROLES } from "@/models/User";
import { NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";

/**
 * GET /api/orders/[id]
 * Get single order
 */
export const GET = withAuth(async function (request, { params }) {
  try {
    await dbConnect();

    const { id } = await params;
    const user = request.user;

    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
    }

    const order = await Order.findById(id)
      .populate("items.product", "title price images")
      .populate("user", "firstName lastName email");

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Ownership check: Only the user who placed the order or an admin can see it
    if (
      user.role !== USER_ROLES.ADMIN &&
      order.user._id.toString() !== user.userId
    ) {
      return NextResponse.json(
        { error: "Forbidden: You don't have access to this order" },
        { status: 403 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: order,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Get order error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
});

/**
 * PUT /api/orders/[id]
 * Update order status (Admin only)
 */
export const PUT = withRole(USER_ROLES.ADMIN)(async function (
  request,
  { params },
) {
  try {
    await dbConnect();

    const { id } = await params;
    const { status, comment } = await request.json();

    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
    }

    const order = await Order.findById(id);

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    order.status = status;
    order.statusHistory.push({
      status,
      comment,
    });

    await order.save();

    return NextResponse.json(
      {
        success: true,
        data: order,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Update order error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
});
