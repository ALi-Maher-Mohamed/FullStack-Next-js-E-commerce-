import mongoose from "mongoose";
import Product from "./src/models/Product.js";

const MONGODB_URI = "mongodb://127.0.0.1:27017/shophub_db";

async function checkDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");
    
    const count = await Product.countDocuments();
    console.log(`Total products in DB: ${count}`);
    
    const sample = await Product.findOne().lean();
    if (sample) {
      console.log("Sample product found:", sample.title);
    } else {
      console.log("No products found.");
    }
    
    process.exit(0);
  } catch (error) {
    console.error("DB check failed:", error);
    process.exit(1);
  }
}

checkDB();
