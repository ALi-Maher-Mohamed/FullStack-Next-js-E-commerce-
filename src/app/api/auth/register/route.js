import dbConnect from "@/lib/dbConnect";
import User, { USER_ROLES, OAUTH_PROVIDERS } from "@/models/User";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

/**
 * POST /api/auth/register
 * Register a new user with email and password
 */
export async function POST(request) {
  try {
    await dbConnect();

    const {
      firstName,
      lastName,
      email,
      phone,
      password,
      role = USER_ROLES.CUSTOMER,
    } = await request.json();

    // Validation
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 },
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 },
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = new User({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase(),
      phone,
      password: hashedPassword,
      role: Object.values(USER_ROLES).includes(role)
        ? role
        : USER_ROLES.CUSTOMER,
      authProvider: OAUTH_PROVIDERS.EMAIL,
    });

    await user.save();

    // Return user without password
    const { password: _, ...userWithoutPassword } = user.toObject();

    // Create JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "7d" },
    );

    const response = NextResponse.json(
      {
        message: "User registered successfully",
        token,
        user: userWithoutPassword,
      },
      { status: 201 },
    );

    // Set token in httpOnly cookie
    response.cookies.set("authToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
