import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(request) {
  try {
    await dbConnect();

    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 },
      );
    }

    // ✅ Select verification fields too
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+password +verificationToken +verificationTokenExpiry",
    );

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    }

    // ✅ Check if email is verified
    if (!user.emailVerified) {
      return NextResponse.json(
        {
          error:
            "Please verify your email address before logging in. Check your inbox for the verification link.",
        },
        { status: 403 },
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: "User account is inactive" },
        { status: 403 },
      );
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    }

    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "7d" },
    );

    const {
      password: _,
      verificationToken: __,
      verificationTokenExpiry: ___,
      ...userWithoutPassword
    } = user.toObject();

    const response = NextResponse.json(
      {
        message: "Login successful",
        token,
        user: userWithoutPassword,
      },
      { status: 200 },
    );

    response.cookies.set("authToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
