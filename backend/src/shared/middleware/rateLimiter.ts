/**
 * @fileoverview Tiered rate limiting middleware configuration for Express.
 *
 * Provides production-ready tiered rate limiters:
 * - Authentication: Strict limits to prevent brute force (nonce/verify)
 * - Read operations: High limits for browsing (signals, predictors, etc.)
 * - Write operations: Moderate limits for data creation/updates
 * - Critical operations: Very high/no limits for purchases (never block revenue)
 *
 * Design Principles:
 * 1. Authenticated users get higher limits (abuse is traceable)
 * 2. Reads >> Writes (reads are cheap, writes need protection)
 * 3. Never block purchases (lost revenue + terrible UX)
 * 4. IP-based for unauthenticated, hybrid for authenticated
 *
 * @module shared/middleware/rateLimiter
 */
import rateLimit, { type Options as RateLimitOptions } from "express-rate-limit";
import type { Request, Response } from "express";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";

// =============================================================================
// CONFIGURATION CONSTANTS
// =============================================================================

/** 15 minutes in milliseconds */
const FIFTEEN_MINUTES = 15 * 60 * 1000;
/** 1 minute in milliseconds */
const ONE_MINUTE = 60 * 1000;

/**
 * Rate limit configuration per tier.
 * Easy to adjust for production scaling.
 */
const RATE_LIMITS = {
  /** Auth nonce generation: 60 req/15min (handles wallet switching) */
  AUTH_NONCE: { windowMs: FIFTEEN_MINUTES, max: 60 },
  /** Auth verify: 20 req/15min (prevents brute force, allows retries) */
  AUTH_VERIFY: { windowMs: FIFTEEN_MINUTES, max: 20 },
  /** Auth logout: 30 req/15min */
  AUTH_LOGOUT: { windowMs: FIFTEEN_MINUTES, max: 30 },
  /** Read operations: 200 req/min (generous for normal browsing) */
  READ: { windowMs: ONE_MINUTE, max: 200 },
  /** Write operations: 60 req/15min (4/min average - plenty for real usage) */
  WRITE: { windowMs: FIFTEEN_MINUTES, max: 60 },
  /** Critical/purchase operations: 500 req/15min (sanity check, never block) */
  CRITICAL: { windowMs: FIFTEEN_MINUTES, max: 500 },
  /** General fallback: uses env config */
  GENERAL: { windowMs: env.RATE_LIMIT_WINDOW_MS, max: env.RATE_LIMIT_MAX_REQUESTS },
} as const;

// =============================================================================
// KEY GENERATORS
// =============================================================================

/**
 * Generates a rate limit key based on IP address.
 * Used for unauthenticated endpoints.
 */
const ipKeyGenerator = (req: Request): string => {
  return req.ip || req.socket.remoteAddress || "unknown";
};

/**
 * Generates a rate limit key based on authenticated user OR IP.
 * Authenticated users get tracked by wallet address (more lenient).
 * Unauthenticated users get tracked by IP (stricter).
 */
const hybridKeyGenerator = (req: Request): string => {
  // If authenticated, use wallet address (allows more requests per user)
  const user = (req as Request & { user?: { walletAddress: string } }).user;
  if (user?.walletAddress) {
    return `user:${user.walletAddress.toLowerCase()}`;
  }
  // Fallback to IP for unauthenticated requests
  return `ip:${ipKeyGenerator(req)}`;
};

// =============================================================================
// RATE LIMIT HANDLERS
// =============================================================================

/**
 * Handler called when rate limit is exceeded.
 * Logs the event for monitoring.
 */
const createRateLimitHandler = (tierName: string) => {
  return (req: Request, res: Response) => {
    const key = hybridKeyGenerator(req);
    logger.warn({
      msg: "Rate limit exceeded",
      tier: tierName,
      key,
      path: req.path,
      method: req.method,
      ip: req.ip,
    });
  };
};

// =============================================================================
// RATE LIMITER FACTORY
// =============================================================================

/**
 * Creates a rate limiter with consistent configuration.
 */
const createRateLimiter = (
  config: { windowMs: number; max: number },
  tierName: string,
  options: Partial<RateLimitOptions> = {}
) => {
  return rateLimit({
    windowMs: config.windowMs,
    max: config.max,
    message: {
      success: false,
      error: `Too many ${tierName.toLowerCase()} requests, please try again later.`,
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: ipKeyGenerator,
    handler: (req, res) => {
      createRateLimitHandler(tierName)(req, res);
      res.status(429).json({
        success: false,
        error: `Too many ${tierName.toLowerCase()} requests, please try again later.`,
      });
    },
    ...options,
  });
};

// =============================================================================
// AUTHENTICATION RATE LIMITERS
// =============================================================================

/**
 * Rate limiter for nonce generation.
 * 60 requests per 15 minutes per IP.
 * Higher limit to support wallet switching during development/testing.
 */
export const authNonceRateLimiter = createRateLimiter(
  RATE_LIMITS.AUTH_NONCE,
  "authentication",
  { keyGenerator: ipKeyGenerator }
);

/**
 * Rate limiter for signature verification.
 * 20 requests per 15 minutes per IP.
 * Stricter to prevent brute force attacks.
 */
export const authVerifyRateLimiter = createRateLimiter(
  RATE_LIMITS.AUTH_VERIFY,
  "authentication",
  { keyGenerator: ipKeyGenerator }
);

/**
 * Rate limiter for logout.
 * 30 requests per 15 minutes per IP.
 */
export const authLogoutRateLimiter = createRateLimiter(
  RATE_LIMITS.AUTH_LOGOUT,
  "authentication",
  { keyGenerator: ipKeyGenerator }
);

/**
 * Legacy auth rate limiter (for backwards compatibility).
 * Uses the verify limits (strictest).
 * @deprecated Use specific auth limiters instead
 */
export const authRateLimiter = authVerifyRateLimiter;

// =============================================================================
// OPERATION-BASED RATE LIMITERS
// =============================================================================

/**
 * Rate limiter for read operations (GET requests).
 * 200 requests per minute per IP.
 * High limit for normal browsing experience.
 *
 * Use for: GET /signals, GET /predictors, GET /categories, etc.
 */
export const readRateLimiter = createRateLimiter(
  RATE_LIMITS.READ,
  "read",
  { keyGenerator: ipKeyGenerator }
);

/**
 * Rate limiter for write operations (POST/PUT/DELETE).
 * 60 requests per 15 minutes per user/IP.
 * Uses hybrid key: authenticated users tracked by wallet.
 *
 * Use for: POST /signals, PUT /predictors, POST /reviews, etc.
 */
export const writeRateLimiter = createRateLimiter(
  RATE_LIMITS.WRITE,
  "write",
  { keyGenerator: hybridKeyGenerator }
);

/**
 * Rate limiter for critical operations (purchases, receipts).
 * 500 requests per 15 minutes per user/IP.
 * Very high limit - NEVER block purchases/revenue.
 *
 * Use for: POST /receipts, purchase-related endpoints
 */
export const criticalRateLimiter = createRateLimiter(
  RATE_LIMITS.CRITICAL,
  "critical",
  { keyGenerator: hybridKeyGenerator }
);

// =============================================================================
// GENERAL RATE LIMITER (Legacy/Fallback)
// =============================================================================

/**
 * General rate limiter for API endpoints.
 * Uses configured window and max requests from environment.
 * Applied globally as a fallback safety net.
 */
export const rateLimiter = createRateLimiter(
  RATE_LIMITS.GENERAL,
  "general",
  { keyGenerator: ipKeyGenerator }
);

// =============================================================================
// SKIP FUNCTION FOR AUTHENTICATED USERS
// =============================================================================

/**
 * Skip function that bypasses rate limiting for authenticated users.
 * Useful for critical endpoints where we trust authenticated users more.
 */
export const skipIfAuthenticated = (req: Request): boolean => {
  const user = (req as Request & { user?: { walletAddress: string } }).user;
  return !!user?.walletAddress;
};

// =============================================================================
// EXPORTS SUMMARY
// =============================================================================

/**
 * Rate Limiter Usage Guide:
 *
 * 1. AUTH ENDPOINTS:
 *    - GET /auth/nonce     → authNonceRateLimiter  (60/15min)
 *    - POST /auth/verify   → authVerifyRateLimiter (20/15min)
 *    - POST /auth/logout   → authLogoutRateLimiter (30/15min)
 *
 * 2. READ ENDPOINTS (high frequency, low risk):
 *    - GET /signals        → readRateLimiter (200/min)
 *    - GET /predictors     → readRateLimiter
 *    - GET /categories     → readRateLimiter
 *    - GET /stats          → readRateLimiter
 *
 * 3. WRITE ENDPOINTS (moderate frequency, medium risk):
 *    - POST /signals       → writeRateLimiter (60/15min)
 *    - PUT /predictors/:id → writeRateLimiter
 *    - POST /reviews       → writeRateLimiter
 *    - POST /reports       → writeRateLimiter
 *
 * 4. CRITICAL ENDPOINTS (must not block):
 *    - Webhook endpoints   → No rate limiting (whitelisted)
 *    - Purchase receipts   → criticalRateLimiter (500/15min)
 *
 * 5. ADMIN ENDPOINTS:
 *    - All admin routes    → writeRateLimiter (trusted users)
 */
