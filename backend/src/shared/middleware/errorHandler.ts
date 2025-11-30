import type { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import { ApiError } from "../utils/ApiError.js";
import { logger } from "../config/logger.js";
import { env } from "../config/env.js";

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

// 404 handler
export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  next(ApiError.notFound(`Route ${req.originalUrl} not found`));
}
