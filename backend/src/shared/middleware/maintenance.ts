/**
 * @fileoverview Maintenance mode middleware.
 *
 * When MAINTENANCE_MODE=true, all API requests return 503 Service Unavailable
 * except for the health check endpoint.
 *
 * Usage:
 * 1. Set MAINTENANCE_MODE=true in .env
 * 2. Optionally set MAINTENANCE_END=2024-12-03T12:00:00Z for ETA
 * 3. Pause smart contracts on-chain via MultiSig
 * 4. Perform maintenance
 * 5. Set MAINTENANCE_MODE=false and restart
 *
 * @module shared/middleware/maintenance
 */
import type { Request, Response, NextFunction } from "express";
import { env } from "../config/env.js";

/**
 * Middleware that blocks all requests during maintenance mode.
 * Returns 503 Service Unavailable with optional ETA.
 *
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
export const maintenanceMode = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Always allow health check endpoint
  if (req.path === "/health") {
    next();
    return;
  }

  // Check if maintenance mode is enabled
  if (env.MAINTENANCE_MODE) {
    res.status(503).json({
      success: false,
      error: "Site is under maintenance. Please try again later.",
      ...(env.MAINTENANCE_END && { maintenanceEnd: env.MAINTENANCE_END }),
    });
    return;
  }

  next();
};
