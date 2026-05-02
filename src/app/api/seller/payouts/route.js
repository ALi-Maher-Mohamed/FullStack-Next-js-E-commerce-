import dbConnect from "@/lib/dbConnect";
import User, { USER_ROLES } from "@/models/User";
import { withRole } from "@/lib/auth";
import { NextResponse } from "next/server";

/**
 * POST /api/seller/payouts
 * Create a withdrawal request
 */
export const POST = withRole(
  USER_ROLES.SELLER,
  USER_ROLES.ADMIN,
)(async function (request) {
  try {
    await dbConnect();
    const sellerId = request.user.userId;
    const { amount } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const seller = await User.findById(sellerId);
    if (seller.wallet.balance < amount) {
      return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });
    }

    // Deduct from balance
    seller.wallet.balance -= amount;
    
    // In a real app, you'd create a Payout model record here
    // and trigger a payment gateway transfer.
    // For now, we just update the user's wallet.
    
    await seller.save();

    return NextResponse.json({
      success: true,
      message: `Withdrawal of $${amount.toFixed(2)} processed successfully.`,
      balance: seller.wallet.balance
    });

  } catch (error) {
    console.error("Payout error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
});
