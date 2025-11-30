/**
 * @fileoverview Express router configuration for Signal endpoints.
 *
 * Route definitions:
 * - GET /api/signals - Public, list signals with filters
 * - GET /api/signals/predictor/:address - Public, get predictor's signals
 * - GET /api/signals/:contentId - Public, get signal metadata
 * - GET /api/signals/:contentId/content - Auth required, get protected content
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
  createSignal,
  updateSignal,
  deactivateSignal,
  getSignalsByPredictor,
} from "./signal.controller.js";
import { validate } from "../../shared/middleware/validation.js";
import { authenticate } from "../../shared/middleware/auth.js";
import {
  listSignalsSchema,
  getSignalByContentIdSchema,
  createSignalSchema,
  updateSignalSchema,
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

// ============================================================================
// Protected Routes (Authentication Required)
// ============================================================================

/**
 * GET /api/signals/:contentId/content
 * Get the protected content of a purchased signal.
 * Only accessible to users who own a receipt for this signal.
 */
router.get(
  "/:contentId/content",
  authenticate,
  validate(getSignalByContentIdSchema, "params"),
  getSignalContent
);

/**
 * POST /api/signals
 * Create a new signal for sale.
 * Only active predictors can create signals.
 */
router.post("/", authenticate, validate(createSignalSchema), createSignal);

/**
 * PUT /api/signals/:contentId
 * Update a signal's metadata.
 * Only the signal's creator can update it.
 */
router.put(
  "/:contentId",
  authenticate,
  validate(getSignalByContentIdSchema, "params"),
  validate(updateSignalSchema),
  updateSignal
);

/**
 * DELETE /api/signals/:contentId
 * Deactivate a signal (soft delete).
 * Only the signal's creator can deactivate it.
 */
router.delete(
  "/:contentId",
  authenticate,
  validate(getSignalByContentIdSchema, "params"),
  deactivateSignal
);

export const signalRoutes = router;
