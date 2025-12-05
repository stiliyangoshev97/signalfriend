/**
 * @fileoverview Express route handlers for Review endpoints.
 *
 * Provides controllers for:
 * - GET /api/reviews/signal/:contentId - Get reviews for a signal
 * - GET /api/reviews/predictor/:address - Get reviews for a predictor
 * - GET /api/reviews/mine - Get user's own reviews
 * - GET /api/reviews/:tokenId - Get review by token ID
 * - GET /api/reviews/check/:tokenId - Check if review exists
 * - POST /api/reviews - Create review (auth required, PERMANENT)
 *
 * NOTE: Ratings are PERMANENT. PUT and DELETE endpoints have been intentionally
 * removed to ensure rating integrity and prevent manipulation.
 *
 * @module features/reviews/review.controller
 */
import type { Request, Response } from "express";
import { ReviewService } from "./review.service.js";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import type {
  ListSignalReviewsQuery,
  ListPredictorReviewsQuery,
  SignalContentIdParams,
  PredictorAddressParams,
  CreateReviewInput,
  ReviewTokenIdParams,
} from "./review.schemas.js";

/**
 * GET /api/reviews/signal/:contentId
 * Retrieves reviews for a specific signal.
 * Public endpoint.
 *
 * @param {string} contentId - Signal content ID (UUID v4)
 * @query {number} [page=1] - Page number
 * @query {number} [limit=20] - Items per page
 * @returns {Object} JSON response with reviews array and pagination
 */
export const getSignalReviews = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { contentId } = req.params as SignalContentIdParams;
    const query = req.query as unknown as ListSignalReviewsQuery;

    const result = await ReviewService.getSignalReviews(contentId, query);

    res.json({
      success: true,
      data: result.reviews,
      pagination: result.pagination,
    });
  }
);

/**
 * GET /api/reviews/predictor/:address
 * Retrieves reviews for a specific predictor.
 * Public endpoint.
 *
 * @param {string} address - Predictor wallet address
 * @query {number} [page=1] - Page number
 * @query {number} [limit=20] - Items per page
 * @returns {Object} JSON response with reviews array and pagination
 */
export const getPredictorReviews = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { address } = req.params as PredictorAddressParams;
    const query = req.query as unknown as ListPredictorReviewsQuery;

    const result = await ReviewService.getPredictorReviews(address, query);

    res.json({
      success: true,
      data: result.reviews,
      pagination: result.pagination,
    });
  }
);

/**
 * GET /api/reviews/mine
 * Retrieves the authenticated user's reviews.
 * Requires authentication.
 *
 * @query {number} [page=1] - Page number
 * @query {number} [limit=20] - Items per page
 * @returns {Object} JSON response with reviews array and pagination
 */
export const getMyReviews = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const buyerAddress = req.user!.address;
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);

    const result = await ReviewService.getMyReviews(buyerAddress, page, limit);

    res.json({
      success: true,
      data: result.reviews,
      pagination: result.pagination,
    });
  }
);

/**
 * GET /api/reviews/:tokenId
 * Retrieves a single review by SignalKeyNFT token ID.
 * Public endpoint.
 *
 * @param {number} tokenId - SignalKeyNFT token ID
 * @returns {Object} JSON response with review data
 * @throws {404} If review not found
 */
export const getReviewByTokenId = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { tokenId } = req.params as unknown as ReviewTokenIdParams;

    const review = await ReviewService.getByTokenId(tokenId);

    if (!review) {
      res.status(404).json({
        success: false,
        error: `Review with tokenId '${tokenId}' not found`,
      });
      return;
    }

    res.json({
      success: true,
      data: review,
    });
  }
);

/**
 * POST /api/reviews
 * Creates a new review for a purchased signal.
 * Requires authentication. Caller must own the SignalKeyNFT.
 * 
 * NOTE: Ratings are PERMANENT. Once submitted, they cannot be changed or deleted.
 *
 * @body {CreateReviewInput} Review data including tokenId and score
 * @returns {Object} JSON response with created review
 * @throws {404} If receipt not found
 * @throws {403} If caller doesn't own the receipt
 * @throws {409} If review already exists
 */
export const createReview = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const data = req.body as CreateReviewInput;
    const reviewerAddress = req.user!.address;

    const review = await ReviewService.create(data, reviewerAddress);

    res.status(201).json({
      success: true,
      data: review,
    });
  }
);

// ============================================================================
// REMOVED: updateReview and deleteReview
// Ratings are PERMANENT to ensure integrity and prevent manipulation.
// Once a buyer submits a rating, it cannot be changed or deleted.
// ============================================================================

/**
 * GET /api/reviews/check/:tokenId
 * Checks if a review exists for a specific token ID.
 * Public endpoint.
 *
 * @param {number} tokenId - SignalKeyNFT token ID
 * @returns {Object} JSON response with hasReview boolean
 */
export const checkReviewExists = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { tokenId } = req.params as unknown as ReviewTokenIdParams;

    const exists = await ReviewService.exists(tokenId);

    res.json({
      success: true,
      data: {
        tokenId,
        hasReview: exists,
      },
    });
  }
);
