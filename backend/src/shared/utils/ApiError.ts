/**
 * @fileoverview Custom error class for API responses.
 *
 * Provides a structured error class with HTTP status codes
 * and static factory methods for common error types.
 *
 * @module shared/utils/ApiError
 */
// filepath: /Users/stiliyangoshev/Desktop/Coding/Full Projects/SignalFriend/backend/src/shared/utils/ApiError.ts

/**
 * Custom error class for API responses.
 * Includes HTTP status code and optional details for validation errors.
 *
 * @extends Error
 */
export class ApiError extends Error {
  /** HTTP status code for the error response */
  public readonly statusCode: number;
  /** Additional error details (e.g., validation errors) */
  public readonly details?: unknown;

  /**
   * Creates a new ApiError instance.
   *
   * @param statusCode - HTTP status code
   * @param message - Error message
   * @param details - Optional additional details
   */
  constructor(statusCode: number, message: string, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.name = "ApiError";
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Creates a 400 Bad Request error.
   *
   * @param message - Error message
   * @param details - Optional validation error details
   * @returns ApiError with 400 status code
   */
  static badRequest(message = "Bad request", details?: unknown): ApiError {
    return new ApiError(400, message, details);
  }

  /**
   * Creates a 401 Unauthorized error.
   *
   * @param message - Error message
   * @returns ApiError with 401 status code
   */
  static unauthorized(message = "Unauthorized"): ApiError {
    return new ApiError(401, message);
  }

  /**
   * Creates a 403 Forbidden error.
   *
   * @param message - Error message
   * @returns ApiError with 403 status code
   */
  static forbidden(message = "Forbidden"): ApiError {
    return new ApiError(403, message);
  }

  /**
   * Creates a 404 Not Found error.
   *
   * @param message - Error message
   * @returns ApiError with 404 status code
   */
  static notFound(message = "Not found"): ApiError {
    return new ApiError(404, message);
  }

  /**
   * Creates a 409 Conflict error.
   *
   * @param message - Error message
   * @returns ApiError with 409 status code
   */
  static conflict(message = "Conflict"): ApiError {
    return new ApiError(409, message);
  }

  /**
   * Creates a 429 Too Many Requests error.
   *
   * @param message - Error message
   * @returns ApiError with 429 status code
   */
  static tooManyRequests(message = "Too many requests"): ApiError {
    return new ApiError(429, message);
  }

  /**
   * Creates a 500 Internal Server Error.
   *
   * @param message - Error message
   * @returns ApiError with 500 status code
   */
  static internal(message = "Internal server error"): ApiError {
    return new ApiError(500, message);
  }
}
