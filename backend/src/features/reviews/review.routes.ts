/**
 * @fileoverview Express router configuration for Review endpoints.
 *
 * Route definitions:
 * - GET /api/reviews/mine - Auth required, get user's reviews
 * - GET /api/reviews/signal/:contentId - Public, get signal reviews
 * - GET /api/reviews/predictor/:address - Public, get predictor reviews
 * - GET /api/reviews/check/:tokenId - Public, check if review exists
 * - GET /api/reviews/:tokenId - Public, get review by token ID
 * - POST /api/reviews - Auth required, create review
 * - PUT /api/reviews/:tokenId - Auth required, update own review
 * - DELETE /api/reviews/:tokenId - Auth required, delete own review
 *
 * @module features/reviews/review.routes
 */
import { Router } from "express";
import {
  getSignalReviews,
  getPredictorReviews,
  getMyReviews,
  getReviewByTokenId,
  createReview,
  updateReview,
  deleteReview,
  checkReviewExists,
} from "./review.controller.js";
import { validate } from "../../shared/middleware/validation.js";
import { authenticate } from "../../shared/middleware/auth.js";
import {
  listSignalReviewsSchema,
  listPredictorReviewsSchema,
  signalContentIdSchema,
  predictorAddressSchema,
  createReviewSchema,
  updateReviewSchema,
  reviewTokenIdSchema,
} from "./review.schemas.js";

/** Express router instance for review routes */
const router = Router();

// ============================================================================
// Protected Routes (Authentication Required) - Must be before param routes
// ============================================================================

/**
 * GET /api/reviews/mine
 * Get the authenticated user's reviews.
 * Query params: page, limit
 */
router.get("/mine", authenticate, getMyReviews);

// ============================================================================
// Public Routes
// ============================================================================

/**
 * GET /api/reviews/signal/:contentId
 * Get reviews for a specific signal.
 * Query params: page, limit
 */
router.get(
  "/signal/:contentId",
  validate(signalContentIdSchema, "params"),
  validate(listSignalReviewsSchema, "query"),
  getSignalReviews
);

/**
 * GET /api/reviews/predictor/:address
 * Get reviews for a specific predictor.
 * Query params: page, limit
 */
router.get(
  "/predictor/:address",
  validate(predictorAddressSchema, "params"),
  validate(listPredictorReviewsSchema, "query"),
  getPredictorReviews
);

/**
 * GET /api/reviews/check/:tokenId
 * Check if a review exists for a token ID.
 */
router.get(
  "/check/:tokenId",
  validate(reviewTokenIdSchema, "params"),
  checkReviewExists
);

/**
 * GET /api/reviews/:tokenId
 * Get a specific review by SignalKeyNFT token ID.
 */
router.get(
  "/:tokenId",
  validate(reviewTokenIdSchema, "params"),
  getReviewByTokenId
);

// ============================================================================
// Protected Routes (Authentication Required)
// ============================================================================

/**
 * POST /api/reviews
 * Create a new review for a purchased signal.
 * Caller must own the SignalKeyNFT (tokenId).
 */
router.post("/", authenticate, validate(createReviewSchema), createReview);

/**
 * PUT /api/reviews/:tokenId
 * Update an existing review.
 * Only the original reviewer can update.
 */
router.put(
  "/:tokenId",
  authenticate,
  validate(reviewTokenIdSchema, "params"),
  validate(updateReviewSchema),
  updateReview
);

/**
 * DELETE /api/reviews/:tokenId
 * Delete a review.
 * Only the original reviewer can delete.
 */
router.delete(
  "/:tokenId",
  authenticate,
  validate(reviewTokenIdSchema, "params"),
  deleteReview
);

export const reviewRoutes = router;
