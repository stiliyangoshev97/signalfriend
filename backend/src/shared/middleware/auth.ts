/**
 * @fileoverview JWT authentication middleware for Express.
 *
 * Provides middleware functions for:
 * - Required authentication (authenticate)
 * - Optional authentication (optionalAuth)
 *
 * Extends Express Request type to include user payload.
 *
 * @module shared/middleware/auth
 */
// filepath: /Users/stiliyangoshev/Desktop/Coding/Full Projects/SignalFriend/backend/src/shared/middleware/auth.ts
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";
import type { Address } from "viem";

/**
 * JWT payload structure for authenticated users.
 */
export interface AuthPayload {
  /** Ethereum wallet address */
  address: Address;
  /** Token issued at timestamp */
  iat: number;
  /** Token expiration timestamp */
  exp: number;
}

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      /** Authenticated user payload (set by auth middleware) */
      user?: AuthPayload;
    }
  }
}

/**
 * Authentication middleware that requires a valid JWT token.
 * Extracts token from Authorization header (Bearer scheme).
 *
 * @param req - Express request object
 * @param _res - Express response object (unused)
 * @param next - Express next function
 * @throws {ApiError} 401 if no token provided, token is invalid, or token is expired
 */
export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      throw ApiError.unauthorized("No token provided");
    }

    const token = authHeader.slice(7);

    const decoded = jwt.verify(token, env.JWT_SECRET) as AuthPayload;
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(ApiError.unauthorized("Invalid token"));
    } else if (error instanceof jwt.TokenExpiredError) {
      next(ApiError.unauthorized("Token expired"));
    } else {
      next(error);
    }
  }
}

/**
 * Optional authentication middleware.
 * Sets req.user if valid token is present, but doesn't require authentication.
 * Useful for routes that behave differently for authenticated users.
 *
 * @param req - Express request object
 * @param _res - Express response object (unused)
 * @param next - Express next function
 */
export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return next();
    }

    const token = authHeader.slice(7);
    const decoded = jwt.verify(token, env.JWT_SECRET) as AuthPayload;
    req.user = decoded;
    next();
  } catch {
    // Token invalid, but that's ok for optional auth
    next();
  }
}
