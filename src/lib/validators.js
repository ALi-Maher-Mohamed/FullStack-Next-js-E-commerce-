/**
 * Request/Response Validation Helpers
 * Validates common data structures across the API
 */

export const Validators = {
  /**
   * Validate email format
   */
  email: (email) => {
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return emailRegex.test(email);
  },

  /**
   * Validate phone format
   */
  phone: (phone) => {
    const phoneRegex =
      /^[+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/;
    return phoneRegex.test(phone);
  },

  /**
   * Validate password strength
   */
  password: (password) => {
    if (password.length < 6)
      return {
        valid: false,
        message: "Password must be at least 6 characters",
      };
    if (!/[A-Z]/.test(password))
      return {
        valid: false,
        message: "Password must contain uppercase letter",
      };
    if (!/[a-z]/.test(password))
      return {
        valid: false,
        message: "Password must contain lowercase letter",
      };
    if (!/[0-9]/.test(password))
      return { valid: false, message: "Password must contain number" };
    return { valid: true };
  },

  /**
   * Validate price
   */
  price: (price) => {
    const numPrice = parseFloat(price);
    return !isNaN(numPrice) && numPrice > 0;
  },

  /**
   * Validate MongoDB ObjectId
   */
  objectId: (id) => {
    return /^[0-9a-f]{24}$/.test(id);
  },

  /**
   * Validate product title
   */
  productTitle: (title) => {
    return title && title.trim().length > 0 && title.length <= 200;
  },

  /**
   * Validate product description
   */
  productDescription: (description) => {
    return (
      description && description.trim().length > 0 && description.length <= 3000
    );
  },
};

/**
 * Error response formatter
 */
export const formatError = (errors) => {
  if (typeof errors === "string") {
    return { message: errors };
  }

  if (Array.isArray(errors)) {
    return {
      message: "Validation errors",
      errors: errors.map((e) => ({
        field: e.field || "unknown",
        message: e.message || e,
      })),
    };
  }

  return errors;
};
