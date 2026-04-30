import mongoose from "mongoose";

// Enum for product status
export const PRODUCT_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  OUT_OF_STOCK: "out_of_stock",
  DISCONTINUED: "discontinued",
};

const productSchema = new mongoose.Schema(
  {
    // Basic Information
    title: {
      type: String,
      required: [true, "Please provide a product title"],
      trim: true,
      maxLength: [200, "Product title cannot exceed 200 characters"],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Please provide a product description"],
      maxLength: [3000, "Description cannot exceed 3000 characters"],
    },
    shortDescription: {
      type: String,
      maxLength: [500, "Short description cannot exceed 500 characters"],
    },

    // Pricing
    price: {
      type: Number,
      required: [true, "Please provide a product price"],
      min: [0, "Price cannot be negative"],
    },
    costPrice: {
      type: Number,
      min: [0, "Cost price cannot be negative"],
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    salePrice: {
      type: Number,
      min: [0, "Sale price cannot be negative"],
    },

    // Category & Tags
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    subcategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],

    // Images
    images: [
      {
        url: {
          type: String,
          required: true,
        },
        publicId: String, // For Cloudinary
        alt: String,
        isPrimary: {
          type: Boolean,
          default: false,
        },
      },
    ],

    // Inventory
    stock: {
      quantity: {
        type: Number,
        required: true,
        default: 0,
        min: 0,
      },
      reserved: {
        type: Number,
        default: 0,
        min: 0,
      },
      lowStockThreshold: {
        type: Number,
        default: 10,
      },
    },

    // Variants
    variants: [
      {
        name: String, // e.g., "Color", "Size"
        values: [String], // e.g., ["Red", "Blue"], ["S", "M", "L"]
      },
    ],

    // Specifications/Attributes
    specifications: mongoose.Schema.Types.Mixed,

    // Seller Information
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Ratings & Reviews
    ratings: {
      average: {
        type: Number,
        min: 0,
        max: 5,
        default: 0,
      },
      count: {
        type: Number,
        default: 0,
      },
    },

    // Shipping
    shipping: {
      weight: Number, // in kg
      dimensions: {
        length: Number, // in cm
        width: Number,
        height: Number,
      },
      shippingClass: String,
      isShippable: {
        type: Boolean,
        default: true,
      },
    },

    // SEO
    seo: {
      metaTitle: String,
      metaDescription: String,
      keywords: [String],
    },

    // Status & Visibility
    status: {
      type: String,
      enum: Object.values(PRODUCT_STATUS),
      default: PRODUCT_STATUS.ACTIVE,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    visibility: {
      type: String,
      enum: ["public", "private", "hidden"],
      default: "public",
    },

    // Track inventory changes
    inventoryHistory: [
      {
        quantity: Number,
        action: String, // 'added', 'sold', 'returned', 'adjusted'
        reason: String,
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Timestamps
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes for performance
productSchema.index({ slug: 1 });
productSchema.index({ category: 1 });
productSchema.index({ seller: 1 });
productSchema.index({ status: 1 });
productSchema.index({ price: 1 });
productSchema.index({ title: "text", description: "text", tags: "text" });
productSchema.index({ createdAt: -1 });
productSchema.index({ isFeatured: 1, status: 1 });

// Virtual for available stock
productSchema.virtual("availableStock").get(function () {
  return this.stock.quantity - this.stock.reserved;
});

// Virtual for is low stock
productSchema.virtual("isLowStock").get(function () {
  return this.availableStock <= this.stock.lowStockThreshold;
});

// Calculate sale price before saving
productSchema.pre("save", function (next) {
  if (this.discount > 0) {
    this.salePrice = this.price - (this.price * this.discount) / 100;
  }
  next();
});

// Ensure virtuals are included in JSON
productSchema.set("toJSON", { virtuals: true });

export default mongoose.models.Product ||
  mongoose.model("Product", productSchema);
