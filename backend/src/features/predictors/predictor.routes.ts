/**
 * @fileoverview Express router configuration for Predictor endpoints.
 *
 * Route definitions:
 * - GET /api/predictors - Public, list predictors with filters
 * - GET /api/predictors/top - Public, get leaderboard
 * - GET /api/predictors/:address - Public, get predictor profile
 * - GET /api/predictors/:address/check - Public, check predictor status
 * - PUT /api/predictors/:address - Auth required, update own profile
 *
 * @module features/predictors/predictor.routes
 */
import { Router } from "express";
import {
  listPredictors,
  getTopPredictors,
  getPredictorByAddress,
  updatePredictorProfile,
  checkPredictorStatus,
  getPredictorEarnings,
  applyForVerification,
  checkFieldUniqueness,
} from "./predictor.controller.js";
import { validate } from "../../shared/middleware/validation.js";
import { authenticate, optionalAuth } from "../../shared/middleware/auth.js";
import { writeRateLimiter } from "../../shared/middleware/rateLimiter.js";
import {
  listPredictorsSchema,
  getPredictorByAddressSchema,
  updatePredictorProfileSchema,
  checkFieldUniquenessSchema,
} from "./predictor.schemas.js";

/** Express router instance for predictor routes */
const router = Router();

// ============================================================================
// Public Routes
// ============================================================================

/**
 * GET /api/predictors
 * List predictors with filtering, sorting, and pagination.
 * Supports query params: categoryId, active, sortBy, sortOrder, page, limit, search
 */
router.get("/", validate(listPredictorsSchema, "query"), listPredictors);

/**
 * GET /api/predictors/top
 * Get top predictors for leaderboard display.
 * Query params: metric (totalSales|averageRating|totalSignals), limit (max 50)
 */
router.get("/top", getTopPredictors);

/**
 * GET /api/predictors/check-unique
 * Check if a field value (displayName, telegram, discord) is available.
 * Query params: field (displayName|telegram|discord), value, excludeAddress (optional)
 * Returns { available: boolean }
 */
router.get(
  "/check-unique",
  validate(checkFieldUniquenessSchema, "query"),
  checkFieldUniqueness
);

/**
 * GET /api/predictors/:address
 * Get a single predictor's full profile by wallet address.
 * Uses optional auth - if authenticated and viewing own profile, returns private contact info.
 */
router.get(
  "/:address",
  optionalAuth,
  validate(getPredictorByAddressSchema, "params"),
  getPredictorByAddress
);

/**
 * GET /api/predictors/:address/check
 * Quick check if an address is an active predictor.
 * Returns { isPredictor: boolean }
 */
router.get(
  "/:address/check",
  validate(getPredictorByAddressSchema, "params"),
  checkPredictorStatus
);

// ============================================================================
// Protected Routes (Authentication Required)
// ============================================================================

/**
 * GET /api/predictors/:address/earnings
 * Get predictor's earnings breakdown from signal sales.
 * Only the predictor can view their own earnings.
 */
router.get(
  "/:address/earnings",
  authenticate,
  validate(getPredictorByAddressSchema, "params"),
  getPredictorEarnings
);

/**
 * PUT /api/predictors/:address
 * Update predictor's own profile.
 * Only the predictor can update their own profile.
 * Rate limited: 60 req/15min (write operations)
 */
router.put(
  "/:address",
  authenticate,
  writeRateLimiter,
  validate(getPredictorByAddressSchema, "params"),
  validate(updatePredictorProfileSchema),
  updatePredictorProfile
);

/**
 * POST /api/predictors/:address/apply-verification
 * Apply for profile verification.
 * Requires 100+ sales (or 100 more sales after rejection).
 * Only the predictor can apply for their own verification.
 * Rate limited: 60 req/15min (write operations)
 */
router.post(
  "/:address/apply-verification",
  authenticate,
  writeRateLimiter,
  validate(getPredictorByAddressSchema, "params"),
  applyForVerification
);

export const predictorRoutes = router;
