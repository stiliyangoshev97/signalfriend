/**
 * @fileoverview Admin authentication middleware.
 *
 * Provides middleware and utilities for admin-only access control.
 * Admin addresses are configured via ADMIN_ADDRESSES environment variable.
 *
 * @module shared/middleware/admin
 */
import type { Request, Response, NextFunction } from "express";
import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";

/**
 * Checks if a wallet address is an admin (MultiSig signer).
 *
 * @param address - The wallet address to check
 * @returns True if the address is in the admin list
 */
export function isAdmin(address: string): boolean {
  const normalizedAddress = address.toLowerCase();
  return env.ADMIN_ADDRESSES.includes(normalizedAddress);
}

/**
 * Middleware that requires the authenticated user to be an admin.
 * Must be used after the `authenticate` middleware.
 *
 * @throws {ApiError} 401 if not authenticated
 * @throws {ApiError} 403 if not an admin
 */
export function requireAdmin(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  // Check if user is authenticated
  if (!req.user) {
    throw ApiError.unauthorized("Authentication required");
  }

  // Check if user is an admin
  if (!isAdmin(req.user.address)) {
    throw ApiError.forbidden("Admin access required");
  }

  next();
}
