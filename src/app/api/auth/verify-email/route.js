import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import VerificationToken from "@/models/VerificationToken";
import { sendWelcomeEmail } from "@/lib/email";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    await dbConnect();

    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: "Verification token required" },
        { status: 400 },
      );
    }

    // Find valid token
    const verificationRecord = await VerificationToken.findOne({
      token,
      type: "email_verification",
      used: false,
      expiresAt: { $gt: new Date() },
    });

    if (!verificationRecord) {
      return NextResponse.json(
        { error: "Invalid or expired verification token" },
        { status: 400 },
      );
    }

    // Update user as verified
    const user = await User.findByIdAndUpdate(
      verificationRecord.userId,
      {
        emailVerified: true,
        $unset: { verificationToken: 1, verificationTokenExpiry: 1 },
      },
      { new: true },
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Mark token as used
    verificationRecord.used = true;
    await verificationRecord.save();

    // Send welcome email
    await sendWelcomeEmail(user.email, `${user.firstName} ${user.lastName}`);

    return NextResponse.json({
      success: true,
      message: "Email verified successfully! You can now log in.",
    });
  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
