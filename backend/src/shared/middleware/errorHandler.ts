/**
 * @fileoverview Global error handling middleware for Express.
 *
 * Provides:
 * - Error handler for ApiError and unknown errors
 * - 404 Not Found handler for unmatched routes
 *
 * Error responses include stack traces in development mode only.
 *
 * @module shared/middleware/errorHandler
 */
// filepath: /Users/stiliyangoshev/Desktop/Coding/Full Projects/SignalFriend/backend/src/shared/middleware/errorHandler.ts
import type { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import { ApiError } from "../utils/ApiError.js";
import { logger } from "../config/logger.js";
import { env } from "../config/env.js";

/**
 * Global error handler middleware.
 * Must be registered last in the middleware chain.
 *
 * Handles:
 * - ApiError instances with proper status codes
 * - Unknown errors with 500 status code
 * - Stack traces in development mode
 *
 * @param err - The error object
 * @param _req - Express request object (unused)
 * @param res - Express response object
 * @param _next - Express next function (unused)
 */
export const errorHandler: ErrorRequestHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Log error
  logger.error(err);

  // Handle known ApiError
  if (err instanceof ApiError) {
    const errorResponse: Record<string, unknown> = {
      success: false,
      error: err.message,
    };
    if (err.details) {
      errorResponse["details"] = err.details;
    }
    res.status(err.statusCode).json(errorResponse);
    return;
  }

  // Handle unknown errors
  const statusCode = 500;
  const message = env.NODE_ENV === "production" 
    ? "Internal server error" 
    : err.message;

  const response: { success: boolean; error: string; stack?: string } = {
    success: false,
    error: message,
  };

  if (env.NODE_ENV === "development") {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

/**
 * 404 Not Found handler for unmatched routes.
 * Should be registered after all routes but before error handler.
 *
 * @param req - Express request object
 * @param _res - Express response object (unused)
 * @param next - Express next function
 */
export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  next(ApiError.notFound(`Route ${req.originalUrl} not found`));
}
