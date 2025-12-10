/**
 * @fileoverview Express router configuration for Authentication endpoints.
 *
 * Route definitions:
 * - GET /api/auth/nonce - Get nonce for SIWE (rate limited: 60/15min)
 * - POST /api/auth/verify - Verify signature (rate limited: 20/15min)
 * - GET /api/auth/me - Get current user (auth required)
 *
 * @module features/auth/auth.routes
 */
// filepath: /Users/stiliyangoshev/Desktop/Coding/Full Projects/SignalFriend/backend/src/features/auth/auth.routes.ts
import { Router } from "express";
import { getNonce, verify, me } from "./auth.controller.js";
import { validate } from "../../shared/middleware/validation.js";
import { authenticate } from "../../shared/middleware/auth.js";
import { authNonceRateLimiter, authVerifyRateLimiter } from "../../shared/middleware/rateLimiter.js";
import { getNonceSchema, verifySchema } from "./auth.schemas.js";

/** Express router instance for auth routes */
const router = Router();

/** GET /api/auth/nonce?address=0x... - Generate nonce for SIWE (60 req/15min) */
router.get("/nonce", authNonceRateLimiter, validate(getNonceSchema, "query"), getNonce);

/** POST /api/auth/verify - Verify SIWE signature and get JWT (20 req/15min) */
router.post("/verify", authVerifyRateLimiter, validate(verifySchema), verify);

/** GET /api/auth/me - Get current authenticated user (protected) */
router.get("/me", authenticate, me);

export const authRoutes = router;
