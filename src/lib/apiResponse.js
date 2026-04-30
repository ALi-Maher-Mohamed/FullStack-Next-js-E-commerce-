/**
 * API Response Helper
 * Standardized response format for all API endpoints
 */

export const ApiResponse = {
  success: (data, message = "Success", statusCode = 200) => {
    return {
      statusCode,
      message,
      data,
      success: true,
    };
  },

  error: (message = "Error", statusCode = 500, errors = null) => {
    return {
      statusCode,
      message,
      errors,
      success: false,
    };
  },
};

/**
 * Catch async errors and return formatted response
 */
export const catchAsyncErrors = (fn) => {
  return async (request, context) => {
    try {
      return await fn(request, context);
    } catch (error) {
      console.error("API Error:", error);
      return ApiResponse.error(error.message || "Internal Server Error", 500);
    }
  };
};
