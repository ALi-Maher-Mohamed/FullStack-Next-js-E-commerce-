/**
 * Constants and configuration for the e-commerce system
 */

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
  MIN_LIMIT: 1,
};

export const SORT_OPTIONS = {
  NEWEST: "-createdAt",
  OLDEST: "createdAt",
  PRICE_ASC: "price",
  PRICE_DESC: "-price",
  RATING: "-ratings.average",
  POPULAR: "-ratings.count",
};

export const ERROR_MESSAGES = {
  UNAUTHORIZED: "You are not authorized to perform this action",
  FORBIDDEN: "You do not have permission to access this resource",
  NOT_FOUND: "Resource not found",
  VALIDATION_ERROR: "Validation error",
  INTERNAL_ERROR: "Internal server error",
  DUPLICATE_EMAIL: "User with this email already exists",
  INVALID_CREDENTIALS: "Invalid email or password",
  INACTIVE_ACCOUNT: "User account is inactive",
  INVALID_TOKEN: "Invalid or expired token",
  MISSING_REQUIRED_FIELDS: "Missing required fields",
  INVALID_PRODUCT_ID: "Invalid product ID",
  PRODUCT_NOT_FOUND: "Product not found",
  SELLER_NOT_FOUND: "Seller not found",
  CATEGORY_NOT_FOUND: "Category not found",
};

export const SUCCESS_MESSAGES = {
  USER_CREATED: "User created successfully",
  LOGIN_SUCCESS: "Login successful",
  PRODUCT_CREATED: "Product created successfully",
  PRODUCT_UPDATED: "Product updated successfully",
  PRODUCT_DELETED: "Product deleted successfully",
  UPDATE_SUCCESS: "Updated successfully",
};

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_ERROR: 500,
};

export const UPLOAD_LIMITS = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  MAX_IMAGES_PER_PRODUCT: 10,
};

export const DECIMAL_PLACES = {
  PRICE: 2,
  RATING: 1,
  DISCOUNT: 0,
};

export const DEFAULT_VALUES = {
  STOCK_RESERVE: 0,
  PRODUCT_VISIBILITY: "public",
  USER_ROLE: "customer",
  LOW_STOCK_THRESHOLD: 10,
};
