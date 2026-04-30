import dbConnect from "@/lib/dbConnect";
import User, { USER_ROLES, OAUTH_PROVIDERS } from "@/models/User";
import VerificationToken from "@/models/VerificationToken"; // ✅ أضف هذا
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto"; // ✅ أضف هذا
import { sendVerificationEmail } from "@/lib/email"; // ✅ أضف هذا

export async function POST(request) {
  try {
    await dbConnect();

    const { firstName, lastName, email, phone, password, role } =
      await request.json();

    // Validation
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Role validation: Only customer or seller allowed
    let assignedRole = USER_ROLES.CUSTOMER;
    if (role === USER_ROLES.SELLER) {
      assignedRole = USER_ROLES.SELLER;
    } else if (role === USER_ROLES.ADMIN) {
      return NextResponse.json(
        { error: "Forbidden: Cannot register as admin." },
        { status: 403 },
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

    // ✅ Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const tokenExpiry = new Date();
    tokenExpiry.setHours(tokenExpiry.getHours() + 24);

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user with verification fields
    const user = new User({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase(),
      phone,
      password: hashedPassword,
      role: assignedRole,
      authProvider: OAUTH_PROVIDERS.EMAIL,
      emailVerified: false,
      verificationToken,
      verificationTokenExpiry: tokenExpiry,
    });

    await user.save();

    // ✅ Save verification token in separate collection
    await VerificationToken.create({
      userId: user._id,
      token: verificationToken,
      expiresAt: tokenExpiry,
    });

    // ✅ Send verification email
    await sendVerificationEmail(
      user.email,
      `${user.firstName} ${user.lastName}`,
      verificationToken,
    );

    // Return user without password
    const {
      password: _,
      verificationToken: __,
      verificationTokenExpiry: ___,
      ...userWithoutPassword
    } = user.toObject();

    return NextResponse.json(
      {
        message:
          "Registration successful! Please check your email to verify your account.",
        user: userWithoutPassword,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
