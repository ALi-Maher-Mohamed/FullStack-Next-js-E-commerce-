import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Order";
import Product from "@/models/Product";
import User, { USER_ROLES } from "@/models/User";
import { withRole } from "@/lib/auth";
import { NextResponse } from "next/server";

/**
 * GET /api/seller/stats
 * Get sales and performance statistics for the seller
 */
export const GET = withRole(
  USER_ROLES.SELLER,
  USER_ROLES.ADMIN,
)(async function (request) {
  try {
    await dbConnect();
    const sellerId = request.user.userId;

    // 1. Get Seller Profile & Balance
    const seller = await User.findById(sellerId).select("wallet sellerProfile");

    // 2. Get Products Stats
    const totalProducts = await Product.countDocuments({ seller: sellerId });
    const lowStockProducts = await Product.countDocuments({ 
      seller: sellerId, 
      "stock.quantity": { $lte: 10 } 
    });

    // 3. Get Orders & Revenue
    // We need to aggregate the total from order items belonging to this seller
    const orders = await Order.find({ "items.seller": sellerId }).lean();
    
    let totalRevenue = 0;
    let totalOrders = orders.length;
    let pendingOrders = 0;
    let completedOrders = 0;

    orders.forEach(order => {
      const sellerItems = order.items.filter(item => item.seller.toString() === sellerId);
      const sellerSubtotal = sellerItems.reduce((acc, item) => acc + item.total, 0);
      totalRevenue += sellerSubtotal;

      // Check if all seller items in this order are completed
      const allSellerItemsCompleted = sellerItems.every(item => item.status === 'delivered');
      if (allSellerItemsCompleted) {
        completedOrders++;
      } else {
        pendingOrders++;
      }
    });

    // 4. Recent Sales (Last 5 items)
    const recentSales = [];
    orders.slice(0, 5).forEach(order => {
      order.items.forEach(item => {
        if (item.seller.toString() === sellerId) {
          recentSales.push({
            orderId: order.orderId,
            productId: item.product,
            quantity: item.quantity,
            total: item.total,
            status: item.status,
            createdAt: order.createdAt
          });
        }
      });
    });

    return NextResponse.json({
      success: true,
      data: {
        revenue: totalRevenue,
        orders: {
          total: totalOrders,
          pending: pendingOrders,
          completed: completedOrders
        },
        products: {
          total: totalProducts,
          lowStock: lowStockProducts
        },
        wallet: seller.wallet,
        recentSales: recentSales.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5)
      }
    });

  } catch (error) {
    console.error("Get seller stats error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
});
