import dbConnect from "@/lib/dbConnect";
import Order, { ORDER_STATUS } from "@/models/Order";
import { withRole } from "@/lib/auth";
import User, { USER_ROLES } from "@/models/User";
import { NextResponse } from "next/server";

/**
 * PATCH /api/seller/orders/[id]
 * Update the status of items belonging to the seller in a specific order
 */
export const PATCH = withRole(
  USER_ROLES.SELLER,
  USER_ROLES.ADMIN,
)(async function (request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    const { status, itemId, comment, trackingNumber } = await request.json();
    const sellerId = request.user.userId;

    if (!status || !Object.values(ORDER_STATUS).includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (trackingNumber) {
      order.trackingNumber = trackingNumber;
    }

    let itemUpdated = false;
    let newlyDeliveredTotal = 0;

    // Helper to process status update for an item
    const processItemStatus = (item) => {
      if (item.seller.toString() === sellerId) {
        // If transitioning to delivered, track the total for wallet update
        if (status === ORDER_STATUS.DELIVERED && item.status !== ORDER_STATUS.DELIVERED) {
          newlyDeliveredTotal += item.total;
        }
        item.status = status;
        itemUpdated = true;
      }
    };

    if (itemId) {
      const item = order.items.id(itemId);
      if (item) processItemStatus(item);
    } else {
      order.items.forEach(processItemStatus);
    }

    if (!itemUpdated) {
      return NextResponse.json(
        { error: "No items found for this seller in this order" },
        { status: 403 },
      );
    }

    // Update Seller Wallet if items were newly delivered
    if (newlyDeliveredTotal > 0) {
      await User.findByIdAndUpdate(sellerId, {
        $inc: { "wallet.balance": newlyDeliveredTotal }
      });
    }

    // Add to status history
    order.statusHistory.push({
      status: `Seller update: ${status}`,
      comment: comment || `Status updated by seller. ${trackingNumber ? 'Tracking: ' + trackingNumber : ''}`,
      timestamp: new Date(),
    });

    // Sync overall order status
    const allItemsDelivered = order.items.every(item => item.status === ORDER_STATUS.DELIVERED);
    const allItemsShipped = order.items.every(item => 
      item.status === ORDER_STATUS.SHIPPED || item.status === ORDER_STATUS.DELIVERED
    );

    if (allItemsDelivered) {
      order.status = ORDER_STATUS.DELIVERED;
      order.paymentStatus = "completed";
    } else if (allItemsShipped) {
      order.status = ORDER_STATUS.SHIPPED;
    }

    await order.save();

    return NextResponse.json({
      success: true,
      message: newlyDeliveredTotal > 0 
        ? `Order updated. Earnings of $${newlyDeliveredTotal.toFixed(2)} added to wallet.`
        : "Order status updated successfully",
      data: order,
    });
  } catch (error) {
    console.error("Update seller order error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
});
