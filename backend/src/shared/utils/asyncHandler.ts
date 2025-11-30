/**
 * @fileoverview Async wrapper utility for Express route handlers.
 *
 * Eliminates the need for try-catch blocks in async route handlers
 * by automatically catching errors and forwarding them to Express
 * error handling middleware.
 *
 * @module shared/utils/asyncHandler
 */
// filepath: /Users/stiliyangoshev/Desktop/Coding/Full Projects/SignalFriend/backend/src/shared/utils/asyncHandler.ts
import type { Request, Response, NextFunction, RequestHandler } from "express";

/** Type for async Express route handlers */
type AsyncRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void>;

/**
 * Wraps an async route handler to automatically catch errors.
 * Any rejected promise will be forwarded to Express error middleware.
 *
 * @param fn - Async route handler function
 * @returns Express-compatible RequestHandler
 *
 * @example
 * ```typescript
 * export const getUser = asyncHandler(async (req, res) => {
 *   const user = await UserService.findById(req.params.id);
 *   res.json({ success: true, data: user });
 * });
 * ```
 */
export function asyncHandler(fn: AsyncRequestHandler): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
