/**
 * @fileoverview Zod validation schemas for Rating API endpoints.
 *
 * Defines schemas for request validation including:
 * - Query parameters for listing ratings
 * - Path parameters for rating lookup
 * - Request body schemas for rating creation
 *
 * Key constraint: One rating per purchase (enforced by tokenId uniqueness)
 * Note: This is RATING only (1-5 stars), no text reviews.
 *
 * @module features/reviews/review.schemas
 */
import { z } from "zod";

/** Regex pattern for valid Ethereum addresses */
const ethereumAddressRegex = /^0x[a-fA-F0-9]{40}$/;

/** Regex pattern for valid content IDs (UUID v4 format) */
const contentIdRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Schema for GET /api/reviews/signal/:contentId query parameters.
 * Supports pagination for signal ratings.
 */
export const listSignalReviewsSchema = z.object({
  /** Page number (1-based) */
  page: z.coerce.number().int().min(1).optional().default(1),
  /** Items per page (max 50) */
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
});

/**
 * Schema for GET /api/reviews/predictor/:address query parameters.
 * Supports pagination for predictor ratings.
 */
export const listPredictorReviewsSchema = z.object({
  /** Page number (1-based) */
  page: z.coerce.number().int().min(1).optional().default(1),
  /** Items per page (max 50) */
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
});

/**
 * Schema for signal contentId path parameter.
 */
export const signalContentIdSchema = z.object({
  /** Signal content ID (UUID v4) */
  contentId: z
    .string()
    .regex(contentIdRegex, "Invalid content ID format (must be UUID v4)"),
});

/**
 * Schema for predictor address path parameter.
 */
export const predictorAddressSchema = z.object({
  /** Predictor wallet address */
  address: z.string().regex(ethereumAddressRegex, "Invalid Ethereum address"),
});

/**
 * Schema for POST /api/reviews request body.
 * Creates a new rating for a purchased signal.
 */
export const createReviewSchema = z.object({
  /** SignalKeyNFT token ID (proves ownership of purchase) */
  tokenId: z.number().int().min(0),
  /** Rating score (1-5 stars) */
  score: z.number().int().min(1).max(5),
});

/**
 * Schema for PUT /api/reviews/:tokenId request body.
 * Updates an existing rating.
 */
export const updateReviewSchema = z.object({
  /** Rating score (1-5 stars) */
  score: z.number().int().min(1).max(5),
});

/**
 * Schema for review tokenId path parameter.
 */
export const reviewTokenIdSchema = z.object({
  /** SignalKeyNFT token ID */
  tokenId: z.coerce.number().int().min(0),
});

/** Type for list signal reviews query parameters */
export type ListSignalReviewsQuery = z.infer<typeof listSignalReviewsSchema>;
/** Type for list predictor reviews query parameters */
export type ListPredictorReviewsQuery = z.infer<typeof listPredictorReviewsSchema>;
/** Type for signal contentId path parameters */
export type SignalContentIdParams = z.infer<typeof signalContentIdSchema>;
/** Type for predictor address path parameters */
export type PredictorAddressParams = z.infer<typeof predictorAddressSchema>;
/** Type for create review request body */
export type CreateReviewInput = z.infer<typeof createReviewSchema>;
/** Type for update review request body */
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;
/** Type for review tokenId path parameters */
export type ReviewTokenIdParams = z.infer<typeof reviewTokenIdSchema>;
