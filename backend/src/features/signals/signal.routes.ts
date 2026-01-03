/**
 * @fileoverview Express router configuration for Signal endpoints.
 *
 * Route definitions:
 * - GET /api/signals - Public, list signals with filters
 * - GET /api/signals/my - Auth required, predictor's own signals (paginated)
 * - GET /api/signals/predictor/:address - Public, get predictor's signals
 * - GET /api/signals/:contentId - Public, get signal metadata
 * - GET /api/signals/:contentId/content - Public for expired, Auth for active signals
 * - POST /api/signals - Auth required, create signal (predictor only)
 * - PUT /api/signals/:contentId - Auth required, update own signal
 * - DELETE /api/signals/:contentId - Auth required, deactivate own signal
 *
 * @module features/signals/signal.routes
 */
import { Router } from "express";
import {
  listSignals,
  getSignalByContentId,
  getSignalContent,
  getContentIdentifier,
  createSignal,
  updateSignal,
  deactivateSignal,
  expireSignal,
  getSignalsByPredictor,
  getMySignals,
} from "./signal.controller.js";
import { validate } from "../../shared/middleware/validation.js";
import { authenticate, optionalAuth } from "../../shared/middleware/auth.js";
import { writeRateLimiter } from "../../shared/middleware/rateLimiter.js";
import {
  listSignalsSchema,
  getSignalByContentIdSchema,
  createSignalSchema,
  updateSignalSchema,
  mySignalsSchema,
} from "./signal.schemas.js";

/** Express router instance for signal routes */
const router = Router();

// ============================================================================
// Public Routes
// ============================================================================

/**
 * GET /api/signals
 * List signals with filtering, sorting, and pagination.
 * Query params: categoryId, predictorAddress, active, sortBy, sortOrder,
 *               page, limit, search, minPrice, maxPrice
 */
router.get("/", validate(listSignalsSchema, "query"), listSignals);

/**
 * GET /api/signals/my
 * Get authenticated predictor's signals with pagination.
 * Query params: status, sortBy, sortOrder, page, limit
 * Auth required.
 */
router.get("/my", authenticate, validate(mySignalsSchema, "query"), getMySignals);

/**
 * GET /api/signals/predictor/:address
 * Get all signals created by a specific predictor.
 * Query params: includeInactive (boolean)
 */
router.get("/predictor/:address", getSignalsByPredictor);

/**
 * GET /api/signals/:contentId
 * Get a single signal's public metadata by contentId.
 */
router.get(
  "/:contentId",
  validate(getSignalByContentIdSchema, "params"),
  getSignalByContentId
);

/**
 * GET /api/signals/:contentId/content-identifier
 * Get the bytes32 content identifier for on-chain purchases.
 * Auth required to prevent predictors from purchasing their own signals.
 */
router.get(
  "/:contentId/content-identifier",
  authenticate,
  validate(getSignalByContentIdSchema, "params"),
  getContentIdentifier
);

/**
 * GET /api/signals/:contentId/content
 * Get the protected content of a signal.
 * - Expired signals: Public access (content unlocks for transparency)
 * - Active signals: Auth required (owner, predictor, or admin only)
 */
router.get(
  "/:contentId/content",
  optionalAuth,
  validate(getSignalByContentIdSchema, "params"),
  getSignalContent
);

// ============================================================================
// Protected Routes (Authentication Required)
// ============================================================================

/**
 * POST /api/signals
 * Create a new signal for sale.
 * Only active predictors can create signals.
 * Rate limited: 60 req/15min (write operations)
 */
router.post("/", authenticate, writeRateLimiter, validate(createSignalSchema), createSignal);

/**
 * PUT /api/signals/:contentId
 * Update a signal's metadata.
 * Only the signal's creator can update it.
 * Rate limited: 60 req/15min (write operations)
 */
router.put(
  "/:contentId",
  authenticate,
  writeRateLimiter,
  validate(getSignalByContentIdSchema, "params"),
  validate(updateSignalSchema),
  updateSignal
);

/**
 * DELETE /api/signals/:contentId
 * Deactivate a signal (soft delete).
 * Only the signal's creator can deactivate it.
 * Rate limited: 60 req/15min (write operations)
 */
router.delete(
  "/:contentId",
  authenticate,
  writeRateLimiter,
  validate(getSignalByContentIdSchema, "params"),
  deactivateSignal
);

/**
 * POST /api/signals/:contentId/expire
 * Manually expire a signal (sets expiresAt to now).
 * Unlike deactivation, expired signals have their content made PUBLIC.
 * Use case: Prediction came true early, predictor wants to showcase it.
 * Rate limited: 60 req/15min (write operations)
 */
router.post(
  "/:contentId/expire",
  authenticate,
  writeRateLimiter,
  validate(getSignalByContentIdSchema, "params"),
  expireSignal
);

export const signalRoutes = router;
