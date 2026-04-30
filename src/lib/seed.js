import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User, { USER_ROLES } from "../models/User.js";
import Product from "../models/Product.js";
import Category from "../models/Category.js";
import Order, { ORDER_STATUS } from "../models/Order.js";

// Database Connection URI
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/shophub_db";

async function seed() {
  try {
    console.log("🚀 Starting database seeding...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // 1. Clear existing collections
    await User.deleteMany({});
    await Product.deleteMany({});
    await Category.deleteMany({});
    await Order.deleteMany({});
    console.log("🧹 Cleared existing collections");

    // 2. Create Users
    const hashedPassword = await bcrypt.hash("password123", 12);
    
    const admin = await User.create({
      firstName: "System",
      lastName: "Admin",
      email: "admin@shophub.com",
      password: hashedPassword,
      role: USER_ROLES.ADMIN,
      isActive: true,
    });

    const seller = await User.create({
      firstName: "Premium",
      lastName: "Seller",
      email: "seller@shophub.com",
      password: hashedPassword,
      role: USER_ROLES.SELLER,
      isActive: true,
      sellerProfile: {
        storeName: "ShopHub Official Store",
        storeDescription: "The best tech and lifestyle products.",
        verificationStatus: "verified"
      }
    });

    const customer = await User.create({
      firstName: "John",
      lastName: "Doe",
      email: "customer@shophub.com",
      password: hashedPassword,
      role: USER_ROLES.CUSTOMER,
      isActive: true,
      address: {
        street: "123 Main St",
        city: "New York",
        state: "NY",
        postalCode: "10001",
        country: "USA"
      }
    });
    console.log("👤 Users created (Admin, Seller, Customer)");

    // 3. Create Categories
    const categoriesData = [
      { name: "Electronics", slug: "electronics", description: "Latest gadgets and devices" },
      { name: "Fashion", slug: "fashion", description: "Trendy clothing and accessories" },
      { name: "Home & Garden", slug: "home-garden", description: "Improve your living space" },
      { name: "Sports", slug: "sports", description: "Gear for your active lifestyle" },
      { name: "Beauty", slug: "beauty", description: "Skincare and cosmetics" },
    ];
    const categories = await Category.insertMany(categoriesData);
    console.log("📁 Categories created");

    // 4. Create Products
    const productsData = [
      {
        title: "Ultra-Wide Gaming Monitor",
        slug: "ultra-wide-gaming-monitor",
        description: "Experience immersive gaming with 144Hz refresh rate and HDR support.",
        price: 599.99,
        discount: 10,
        category: categories[0]._id,
        seller: seller._id,
        images: [{ url: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800", isPrimary: true }],
        stock: { quantity: 25 },
        ratings: { average: 4.8, count: 120 },
        isFeatured: true
      },
      {
        title: "Noise-Cancelling Headphones",
        slug: "noise-cancelling-headphones",
        description: "Focus on your music with industry-leading noise cancellation technology.",
        price: 299.99,
        discount: 15,
        category: categories[0]._id,
        seller: seller._id,
        images: [{ url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800", isPrimary: true }],
        stock: { quantity: 50 },
        ratings: { average: 4.5, count: 85 }
      },
      {
        title: "Mechanical RGB Keyboard",
        slug: "mechanical-rgb-keyboard",
        description: "Tactile switches and customizable RGB lighting for the ultimate setup.",
        price: 129.99,
        discount: 0,
        category: categories[0]._id,
        seller: seller._id,
        images: [{ url: "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=800", isPrimary: true }],
        stock: { quantity: 100 },
        ratings: { average: 4.7, count: 210 }
      },
      {
        title: "Classic Leather Jacket",
        slug: "classic-leather-jacket",
        description: "Timeless style and durability with 100% genuine leather.",
        price: 199.99,
        discount: 20,
        category: categories[1]._id,
        seller: seller._id,
        images: [{ url: "https://images.unsplash.com/photo-1551028150-64b9f398f678?w=800", isPrimary: true }],
        stock: { quantity: 30 },
        ratings: { average: 4.4, count: 45 }
      },
      {
        title: "Minimalist Smart Watch",
        slug: "minimalist-smart-watch",
        description: "Track your health and stay connected with a sleek, modern design.",
        price: 149.99,
        discount: 5,
        category: categories[0]._id,
        seller: seller._id,
        images: [{ url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800", isPrimary: true }],
        stock: { quantity: 15 },
        ratings: { average: 4.2, count: 67 },
        isFeatured: true
      },
      {
        title: "Ergonomic Office Chair",
        slug: "ergonomic-office-chair",
        description: "Premium lumbar support for long hours at your desk.",
        price: 249.99,
        discount: 0,
        category: categories[2]._id,
        seller: seller._id,
        images: [{ url: "https://images.unsplash.com/photo-1505797149-43b0000ee20e?w=800", isPrimary: true }],
        stock: { quantity: 40 },
        ratings: { average: 4.9, count: 32 }
      },
      {
        title: "Performance Running Shoes",
        slug: "performance-running-shoes",
        description: "Lightweight and responsive for your daily miles.",
        price: 119.99,
        discount: 10,
        category: categories[3]._id,
        seller: seller._id,
        images: [{ url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800", isPrimary: true }],
        stock: { quantity: 80 },
        ratings: { average: 4.6, count: 156 }
      },
      {
        title: "Organic Face Serum",
        slug: "organic-face-serum",
        description: "Glow naturally with 100% plant-based ingredients.",
        price: 49.99,
        discount: 0,
        category: categories[4]._id,
        seller: seller._id,
        images: [{ url: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=800", isPrimary: true }],
        stock: { quantity: 200 },
        ratings: { average: 4.8, count: 92 }
      }
    ];

    const products = await Product.insertMany(productsData);
    console.log("📦 Products created");

    // 5. Create Sample Orders
    const ordersData = [
      {
        user: customer._id,
        items: [
          {
            product: products[0]._id,
            quantity: 1,
            price: products[0].price,
            total: products[0].price
          }
        ],
        shippingAddress: customer.address,
        subtotal: products[0].price,
        tax: products[0].price * 0.1,
        shippingCost: 0,
        total: products[0].price * 1.1,
        paymentMethod: "credit_card",
        paymentStatus: "completed",
        status: ORDER_STATUS.DELIVERED,
        statusHistory: [{ status: "delivered", comment: "Delivered to customer" }]
      },
      {
        user: customer._id,
        items: [
          {
            product: products[1]._id,
            quantity: 2,
            price: products[1].price,
            total: products[1].price * 2
          }
        ],
        shippingAddress: customer.address,
        subtotal: products[1].price * 2,
        tax: (products[1].price * 2) * 0.1,
        shippingCost: 0,
        total: (products[1].price * 2) * 1.1,
        paymentMethod: "credit_card",
        paymentStatus: "pending",
        status: ORDER_STATUS.PENDING,
        statusHistory: [{ status: "pending", comment: "Waiting for payment" }]
      }
    ];

    await Order.create(ordersData);
    console.log("🛒 Sample Orders created");

    console.log("✨ Seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

seed();
