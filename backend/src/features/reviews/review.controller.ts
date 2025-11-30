/**
 * @fileoverview Express route handlers for Review endpoints.
 *
 * Provides controllers for:
 * - GET /api/reviews/signal/:contentId - Get reviews for a signal
 * - GET /api/reviews/predictor/:address - Get reviews for a predictor
 * - GET /api/reviews/mine - Get user's own reviews
 * - GET /api/reviews/:tokenId - Get review by token ID
 * - POST /api/reviews - Create review (auth required)
 * - PUT /api/reviews/:tokenId - Update review (auth required)
 * - DELETE /api/reviews/:tokenId - Delete review (auth required)
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
  UpdateReviewInput,
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

/**
 * PUT /api/reviews/:tokenId
 * Updates an existing review.
 * Requires authentication. Only the original reviewer can update.
 *
 * @param {number} tokenId - SignalKeyNFT token ID
 * @body {UpdateReviewInput} Fields to update
 * @returns {Object} JSON response with updated review
 * @throws {404} If review not found
 * @throws {403} If caller is not the reviewer
 */
export const updateReview = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { tokenId } = req.params as unknown as ReviewTokenIdParams;
    const data = req.body as UpdateReviewInput;
    const callerAddress = req.user!.address;

    const review = await ReviewService.update(tokenId, data, callerAddress);

    res.json({
      success: true,
      data: review,
    });
  }
);

/**
 * DELETE /api/reviews/:tokenId
 * Deletes a review.
 * Requires authentication. Only the original reviewer can delete.
 *
 * @param {number} tokenId - SignalKeyNFT token ID
 * @returns {Object} JSON response confirming deletion
 * @throws {404} If review not found
 * @throws {403} If caller is not the reviewer
 */
export const deleteReview = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { tokenId } = req.params as unknown as ReviewTokenIdParams;
    const callerAddress = req.user!.address;

    await ReviewService.delete(tokenId, callerAddress);

    res.json({
      success: true,
      message: "Review deleted successfully",
    });
  }
);

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
