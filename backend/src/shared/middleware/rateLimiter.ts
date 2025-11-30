/**
 * @fileoverview Rate limiting middleware configuration for Express.
 *
 * Provides two rate limiters:
 * - General rate limiter for most API endpoints
 * - Stricter auth rate limiter for authentication endpoints
 *
 * @module shared/middleware/rateLimiter
 */
// filepath: /Users/stiliyangoshev/Desktop/Coding/Full Projects/SignalFriend/backend/src/shared/middleware/rateLimiter.ts
import rateLimit from "express-rate-limit";
import { env } from "../config/env.js";

/**
 * General rate limiter for API endpoints.
 * Uses configured window and max requests from environment.
 */
export const rateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  message: {
    success: false,
    error: "Too many requests, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Stricter rate limiter for authentication endpoints.
 * 10 requests per 15 minutes to prevent brute force attacks.
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per window
  message: {
    success: false,
    error: "Too many authentication attempts, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
