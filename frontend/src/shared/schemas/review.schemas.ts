/**
 * Review Schemas
 * 
 * Zod schemas for review data.
 * Types are inferred from schemas - single source of truth.
 */

import { z } from 'zod';

// ===========================================
// Review Schema
// ===========================================

export const reviewSchema = z.object({
  tokenId: z.number(),
  predictorWallet: z.string(),
  buyerWallet: z.string(),
  score: z.number().min(1).max(5),
  reviewText: z.string().optional(),
  createdAt: z.string(),
});

// ===========================================
// Create Review Schema (for forms)
// ===========================================

export const createReviewSchema = z.object({
  tokenId: z.number(),
  score: z
    .number()
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating must be at most 5'),
  reviewText: z
    .string()
    .max(1000, 'Review must be at most 1000 characters')
    .optional(),
});

// ===========================================
// Inferred Types
// ===========================================

export type Review = z.infer<typeof reviewSchema>;
export type CreateReviewData = z.infer<typeof createReviewSchema>;
