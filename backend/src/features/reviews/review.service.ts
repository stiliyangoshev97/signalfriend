/**
 * @fileoverview Business logic service for Rating operations.
 *
 * Provides operations for ratings including:
 * - Listing ratings for signals and predictors
 * - Creating ratings (one per purchase, enforced by tokenId)
 * - Updating and deleting own ratings
 * - Statistics calculation for signals and predictors
 *
 * Key constraint: Only buyers who own a SignalKeyNFT can rate.
 * One rating per tokenId ensures one rating per purchase.
 * Note: This is RATING only (1-5 stars), no text reviews.
 *
 * @module features/reviews/review.service
 */
import { Review, IReview } from "./review.model.js";
import { Receipt } from "../receipts/receipt.model.js";
import { Signal } from "../signals/signal.model.js";
import { Predictor } from "../predictors/predictor.model.js";
import { ApiError } from "../../shared/utils/ApiError.js";
import type {
  ListSignalReviewsQuery,
  ListPredictorReviewsQuery,
  CreateReviewInput,
  UpdateReviewInput,
} from "./review.schemas.js";

/** Review list response with pagination metadata */
export interface ReviewListResponse {
  reviews: IReview[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Service class for Review business logic.
 * All methods are static for stateless operation.
 */
export class ReviewService {
  /**
   * Retrieves reviews for a specific signal with pagination.
   *
   * @param contentId - The signal's content ID
   * @param query - Query parameters for pagination
   * @returns Promise resolving to reviews array with pagination metadata
   */
  static async getSignalReviews(
    contentId: string,
    query: ListSignalReviewsQuery
  ): Promise<ReviewListResponse> {
    const { page, limit } = query;

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Execute query with pagination
    const [reviews, total] = await Promise.all([
      Review.find({ contentId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Review.countDocuments({ contentId }),
    ]);

    return {
      reviews,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Retrieves reviews for a specific predictor with pagination.
   *
   * @param predictorAddress - The predictor's wallet address
   * @param query - Query parameters for pagination
   * @returns Promise resolving to reviews array with pagination metadata
   */
  static async getPredictorReviews(
    predictorAddress: string,
    query: ListPredictorReviewsQuery
  ): Promise<ReviewListResponse> {
    const { page, limit } = query;
    const normalizedAddress = predictorAddress.toLowerCase();

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Execute query with pagination
    const [reviews, total] = await Promise.all([
      Review.find({ predictorAddress: normalizedAddress })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("signalId", "title contentId"),
      Review.countDocuments({ predictorAddress: normalizedAddress }),
    ]);

    return {
      reviews,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Creates a new review for a purchased signal.
   * Validates that the caller owns the receipt (SignalKeyNFT).
   *
   * @param data - Review creation data
   * @param reviewerAddress - Address of the reviewer (must own tokenId)
   * @returns Promise resolving to the created review
   * @throws {ApiError} 404 if receipt not found
   * @throws {ApiError} 403 if caller doesn't own the receipt
   * @throws {ApiError} 409 if review already exists for this tokenId
   */
  static async create(
    data: CreateReviewInput,
    reviewerAddress: string
  ): Promise<IReview> {
    const normalizedReviewer = reviewerAddress.toLowerCase();

    // Find the receipt to verify ownership
    const receipt = await Receipt.findOne({ tokenId: data.tokenId });
    if (!receipt) {
      throw ApiError.notFound(
        `Receipt with tokenId '${data.tokenId}' not found`
      );
    }

    // Verify caller owns the receipt
    if (receipt.buyerAddress !== normalizedReviewer) {
      throw ApiError.forbidden(
        "You can only review signals you have purchased"
      );
    }

    // Check if review already exists (should be caught by unique index too)
    const existing = await Review.findOne({ tokenId: data.tokenId });
    if (existing) {
      throw ApiError.conflict(
        "You have already reviewed this purchase. Use PUT to update."
      );
    }

    // Get signal info
    const signal = await Signal.findOne({ contentId: receipt.contentId });
    if (!signal) {
      throw ApiError.notFound("Signal associated with this receipt not found");
    }

    // Create rating
    const review = new Review({
      tokenId: data.tokenId,
      signalId: signal._id,
      contentId: receipt.contentId,
      buyerAddress: normalizedReviewer,
      predictorAddress: receipt.predictorAddress,
      score: data.score,
    });

    await review.save();

    // Update signal rating statistics
    await ReviewService.updateSignalRating(receipt.contentId);

    // Update predictor rating statistics
    await ReviewService.updatePredictorRating(receipt.predictorAddress);

    return review;
  }

  /**
   * Updates an existing rating.
   * Only the original rater can update their rating.
   *
   * @param tokenId - The SignalKeyNFT token ID
   * @param data - Fields to update (score only)
   * @param callerAddress - Address of the caller (must be rater)
   * @returns Promise resolving to the updated rating
   * @throws {ApiError} 404 if rating not found
   * @throws {ApiError} 403 if caller is not the rater
   */
  static async update(
    tokenId: number,
    data: UpdateReviewInput,
    callerAddress: string
  ): Promise<IReview> {
    const normalizedCaller = callerAddress.toLowerCase();

    const review = await Review.findOne({ tokenId });
    if (!review) {
      throw ApiError.notFound(`Rating with tokenId '${tokenId}' not found`);
    }

    if (review.buyerAddress !== normalizedCaller) {
      throw ApiError.forbidden("You can only update your own ratings");
    }

    const oldScore = review.score;

    // Update score
    if (data.score !== undefined) review.score = data.score;

    await review.save();

    // If score changed, recalculate ratings
    if (data.score !== undefined && data.score !== oldScore) {
      await ReviewService.updateSignalRating(review.contentId);
      await ReviewService.updatePredictorRating(review.predictorAddress);
    }

    return review;
  }

  /**
   * Deletes a rating.
   * Only the original rater can delete their rating.
   *
   * @param tokenId - The SignalKeyNFT token ID
   * @param callerAddress - Address of the caller (must be rater)
   * @throws {ApiError} 404 if rating not found
   * @throws {ApiError} 403 if caller is not the rater
   */
  static async delete(tokenId: number, callerAddress: string): Promise<void> {
    const normalizedCaller = callerAddress.toLowerCase();

    const review = await Review.findOne({ tokenId });
    if (!review) {
      throw ApiError.notFound(`Rating with tokenId '${tokenId}' not found`);
    }

    if (review.buyerAddress !== normalizedCaller) {
      throw ApiError.forbidden("You can only delete your own ratings");
    }

    const { contentId, predictorAddress } = review;

    await review.deleteOne();

    // Recalculate ratings after deletion
    await ReviewService.updateSignalRating(contentId);
    await ReviewService.updatePredictorRating(predictorAddress);
  }

  /**
   * Gets a review by token ID.
   *
   * @param tokenId - The SignalKeyNFT token ID
   * @returns Promise resolving to the review or null
   */
  static async getByTokenId(tokenId: number): Promise<IReview | null> {
    return Review.findOne({ tokenId });
  }

  /**
   * Checks if a review exists for a token ID.
   *
   * @param tokenId - The SignalKeyNFT token ID
   * @returns Promise resolving to true if review exists
   */
  static async exists(tokenId: number): Promise<boolean> {
    const count = await Review.countDocuments({ tokenId });
    return count > 0;
  }

  /**
   * Updates a signal's rating statistics based on all its reviews.
   *
   * @param contentId - The signal's content ID
   */
  private static async updateSignalRating(contentId: string): Promise<void> {
    const result = await Review.aggregate([
      { $match: { contentId } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$score" },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    if (result.length === 0) {
      // No reviews, reset to defaults
      await Signal.updateOne(
        { contentId },
        { averageRating: 0, totalReviews: 0 }
      );
    } else {
      await Signal.updateOne(
        { contentId },
        {
          averageRating: Math.round(result[0].averageRating * 10) / 10,
          totalReviews: result[0].totalReviews,
        }
      );
    }
  }

  /**
   * Updates a predictor's rating statistics based on all their reviews.
   *
   * @param predictorAddress - The predictor's wallet address
   */
  private static async updatePredictorRating(
    predictorAddress: string
  ): Promise<void> {
    const normalizedAddress = predictorAddress.toLowerCase();

    const result = await Review.aggregate([
      { $match: { predictorAddress: normalizedAddress } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$score" },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    if (result.length === 0) {
      // No reviews, reset to defaults
      await Predictor.updateOne(
        { walletAddress: normalizedAddress },
        { averageRating: 0, totalReviews: 0 }
      );
    } else {
      await Predictor.updateOne(
        { walletAddress: normalizedAddress },
        {
          averageRating: Math.round(result[0].averageRating * 10) / 10,
          totalReviews: result[0].totalReviews,
        }
      );
    }
  }

  /**
   * Gets the user's reviews with pagination.
   *
   * @param buyerAddress - The user's wallet address
   * @param page - Page number
   * @param limit - Items per page
   * @returns Promise resolving to reviews array with pagination
   */
  static async getMyReviews(
    buyerAddress: string,
    page: number = 1,
    limit: number = 20
  ): Promise<ReviewListResponse> {
    const normalizedAddress = buyerAddress.toLowerCase();
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      Review.find({ buyerAddress: normalizedAddress })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("signalId", "title contentId"),
      Review.countDocuments({ buyerAddress: normalizedAddress }),
    ]);

    return {
      reviews,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
