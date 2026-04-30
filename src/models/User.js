import mongoose from "mongoose";

// Enum for user roles
export const USER_ROLES = {
  CUSTOMER: "customer",
  SELLER: "seller",
  ADMIN: "admin",
};

// Enum for OAuth providers
export const OAUTH_PROVIDERS = {
  GOOGLE: "google",
  EMAIL: "email",
};

const userSchema = new mongoose.Schema(
  {
    // Basic Information
    firstName: {
      type: String,
      required: [true, "Please provide a first name"],
      trim: true,
      maxLength: [50, "First name cannot exceed 50 characters"],
    },
    lastName: {
      type: String,
      required: [true, "Please provide a last name"],
      trim: true,
      maxLength: [50, "Last name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Please provide an email"],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email",
      ],
    },
    phone: {
      type: String,
      match: [
        /^[+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/,
        "Please provide a valid phone number",
      ],
    },

    // Authentication
    password: {
      type: String,
      minLength: [6, "Password must be at least 6 characters"],
      select: false, // Don't return password by default
    },
    authProvider: {
      type: String,
      enum: Object.values(OAUTH_PROVIDERS),
      default: OAUTH_PROVIDERS.EMAIL,
    },
    oauthId: String, // For Google OAuth

    // Role Management
    role: {
      type: String,
      enum: Object.values(USER_ROLES),
      default: USER_ROLES.CUSTOMER,
    },

    // Address Information
    address: {
      street: String,
      city: String,
      state: String,
      postalCode: String,
      country: String,
    },

    // Profile
    avatar: {
      url: String,
      publicId: String, // For Cloudinary
    },
    bio: {
      type: String,
      maxLength: [500, "Bio cannot exceed 500 characters"],
    },

    // Seller Info (if role === 'seller')
    sellerProfile: {
      storeName: String,
      storeDescription: String,
      bankAccount: {
        accountHolder: String,
        accountNumber: String,
        routingNumber: String,
      },
      verificationStatus: {
        type: String,
        enum: ["pending", "verified", "rejected"],
        default: "pending",
      },
    },

    // Wallet
    wallet: {
      balance: {
        type: Number,
        default: 0,
        min: 0,
      },
      currency: {
        type: String,
        default: "USD",
      },
    },

    // Preferences
    preferences: {
      language: {
        type: String,
        default: "en",
      },
      currency: {
        type: String,
        default: "USD",
      },
      emailNotifications: {
        type: Boolean,
        default: true,
      },
      smsNotifications: {
        type: Boolean,
        default: false,
      },
    },

    // Soft Delete
    isDeleted: {
      type: Boolean,
      default: false,
      select: false,
    },
    deletedAt: {
      type: Date,
      select: false,
    },

    // Status
    isActive: {
      type: Boolean,
      default: true,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
      select: false,
    },
    verificationTokenExpiry: {
      type: Date,
      select: false,
    },

    // Timestamps
    createdAt: {
      type: Date,
      default: Date.now,
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
userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });
userSchema.index({ role: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ isDeleted: 1, deletedAt: 1 });

// Hide soft-deleted documents by default
userSchema.query.active = function () {
  return this.where({ isDeleted: false });
};

// Virtual for full name
userSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Ensure virtuals are included in JSON
userSchema.set("toJSON", { virtuals: true });

export default mongoose.models.User || mongoose.model("User", userSchema);
