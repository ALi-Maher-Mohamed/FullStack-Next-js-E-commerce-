import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Order";
import { withRole } from "@/lib/auth";
import { USER_ROLES } from "@/models/User";
import { NextResponse } from "next/server";

/**
 * GET /api/seller/orders
 * Get orders containing products from the logged-in seller
 */
export const GET = withRole(USER_ROLES.SELLER, USER_ROLES.ADMIN)(async function (request) {
  try {
    await dbConnect();
    const sellerId = request.user.userId;

    // Find orders where at least one item belongs to this seller
    const orders = await Order.find({ "items.seller": sellerId })
      .populate("user", "firstName lastName email")
      .populate("items.product", "title images")
      .sort({ createdAt: -1 })
      .lean();

    // Map orders to only include relevant information for the seller
    // (Optional: filter items to only show those belonging to the seller)
    const filteredOrders = orders.map(order => {
      const sellerItems = order.items.filter(item => item.seller.toString() === sellerId);
      const sellerSubtotal = sellerItems.reduce((acc, item) => acc + item.total, 0);
      
      return {
        ...order,
        sellerItems,
        sellerSubtotal,
        // We keep the original total/tax/shipping for context, 
        // but the seller is primarily concerned with their items.
      };
    });

    return NextResponse.json({
      success: true,
      data: filteredOrders,
    });
  } catch (error) {
    console.error("Get seller orders error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
});
