/**
 * @fileoverview Express router configuration for Review endpoints.
 *
 * Route definitions:
 * - GET /api/reviews/mine - Auth required, get user's reviews
 * - GET /api/reviews/signal/:contentId - Public, get signal reviews
 * - GET /api/reviews/predictor/:address - Public, get predictor reviews
 * - GET /api/reviews/check/:tokenId - Public, check if review exists
 * - GET /api/reviews/:tokenId - Public, get review by token ID
 * - POST /api/reviews - Auth required, create review (PERMANENT - no updates/deletes)
 *
 * NOTE: Ratings are PERMANENT. PUT and DELETE endpoints have been intentionally
 * removed to ensure rating integrity and prevent manipulation.
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
 * 
 * NOTE: Ratings are PERMANENT. Once submitted, they cannot be updated or deleted.
 * This ensures rating integrity and prevents manipulation.
 */
router.post("/", authenticate, validate(createReviewSchema), createReview);

// NOTE: PUT and DELETE endpoints have been intentionally removed.
// Ratings are permanent to ensure integrity and prevent manipulation.
// Once a buyer rates a signal, that rating is final.

export const reviewRoutes = router;
