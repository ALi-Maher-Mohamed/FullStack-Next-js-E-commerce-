import mongoose from "mongoose";

// Create a cached connection object
let cached = global.mongooseConnection;

if (!cached) {
  cached = global.mongooseConnection = { conn: null, promise: null };
}

/**
 * MongoDB Connection with Pooling for Next.js
 * Handles serverless environment by reusing connections
 * @returns {Promise<typeof mongoose>} - Mongoose instance
 */
async function dbConnect() {
  // If already connected, return the cached connection
  if (cached.conn) {
    console.log("Using cached MongoDB connection");
    return cached.conn;
  }

  // If connection is in progress, wait for it
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      minPoolSize: 5,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      maxIdleTimeMS: 60000,
      connectTimeoutMS: 10000,
      family: 4, // Use IPv4
    };

    cached.promise = mongoose
      .connect(process.env.MONGODB_URI || "", opts)
      .then((mongoose) => {
        console.log("✓ Connected to MongoDB with connection pooling");
        return mongoose;
      })
      .catch((err) => {
        console.error("✗ MongoDB connection error:", err.message);
        cached.promise = null; // Reset promise on error
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
