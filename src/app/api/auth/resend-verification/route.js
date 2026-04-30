import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import VerificationToken from "@/models/VerificationToken";
import { sendVerificationEmail } from "@/lib/email";
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(request) {
  try {
    await dbConnect();

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email address is required" },
        { status: 400 },
      );
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Return success even if user not found to prevent email enumeration
      return NextResponse.json({
        success: true,
        message: "If an account exists with this email, a verification link has been sent.",
      });
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { error: "Email is already verified" },
        { status: 400 },
      );
    }

    // Check for existing valid token to prevent spam (Rate limiting)
    const existingToken = await VerificationToken.findOne({
      userId: user._id,
      type: "email_verification",
      expiresAt: { $gt: new Date() },
      createdAt: { $gt: new Date(Date.now() - 2 * 60 * 1000) }, // Wait 2 mins between resends
    });

    if (existingToken) {
      return NextResponse.json(
        { error: "Please wait at least 2 minutes before requesting another email." },
        { status: 429 },
      );
    }

    // Generate new token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const tokenExpiry = new Date();
    tokenExpiry.setHours(tokenExpiry.getHours() + 24);

    // Save new token
    await VerificationToken.create({
      userId: user._id,
      token: verificationToken,
      expiresAt: tokenExpiry,
    });

    // Send email
    await sendVerificationEmail(
      user.email,
      `${user.firstName} ${user.lastName}`,
      verificationToken,
    );

    return NextResponse.json({
      success: true,
      message: "Verification email sent successfully!",
    });
  } catch (error) {
    console.error("Resend verification error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
