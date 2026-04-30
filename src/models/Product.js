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
    // Discount as an object to support complex logic
    discount: {
      type: {
        type: String,
        enum: ["percentage", "fixed"],
        default: "percentage",
      },
      value: { type: Number, default: 0 },
      active: { type: Boolean, default: false },
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
        publicId: String,
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
        name: String,
        values: [String],
      },
    ],

    // Specifications
    specifications: mongoose.Schema.Types.Mixed,

    // Seller Information
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Ratings & Reviews
    ratings: {
      average: { type: Number, min: 0, max: 5, default: 0 },
      count: { type: Number, default: 0 },
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
        action: String,
        reason: String,
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  },
);

// Pre-save hook for automatic slug generation and sale price calculation
productSchema.pre("save", async function () {
  // Generate slug
  if (this.isModified("title")) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  }

  // Calculate salePrice based on discount object
  if (this.discount?.active && this.discount.value > 0) {
    if (this.discount.type === "percentage") {
      this.salePrice = this.price * (1 - this.discount.value / 100);
    } else {
      this.salePrice = Math.max(0, this.price - this.discount.value);
    }
  } else {
    this.salePrice = this.price;
  }

  // Automatic status update
  if (this.stock.quantity <= 0) {
    this.status = PRODUCT_STATUS.OUT_OF_STOCK;
  } else if (
    this.status === PRODUCT_STATUS.OUT_OF_STOCK &&
    this.stock.quantity > 0
  ) {
    this.status = PRODUCT_STATUS.ACTIVE;
  }
});

// Indexes for performance
productSchema.index({ slug: 1 });
productSchema.index({ category: 1 });
productSchema.index({ seller: 1 });
productSchema.index({ status: 1 });
productSchema.index({ price: 1 });
productSchema.index({ title: "text", description: "text", tags: "text" });
productSchema.index({ createdAt: -1 });

// Virtuals
productSchema.virtual("availableStock").get(function () {
  return this.stock.quantity - (this.stock.reserved || 0);
});

productSchema.set("toJSON", { virtuals: true });

export default mongoose.models.Product ||
  mongoose.model("Product", productSchema);
