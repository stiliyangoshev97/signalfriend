/**
 * @fileoverview Review API Functions
 * @module features/signals/api/reviews.api
 * @description
 * API functions for rating signals.
 * 
 * NOTE: Ratings are PERMANENT. Once submitted, they cannot be changed or deleted.
 * This ensures rating integrity and prevents manipulation.
 */

import { apiClient } from '@/shared/api/apiClient';

/** Check if user has already rated a purchase */
export interface CheckReviewResponse {
  tokenId: number;
  hasReview: boolean;
}

/** Review data returned from API */
export interface Review {
  _id: string;
  tokenId: number;
  signalId: string;
  contentId: string;
  buyerAddress: string;
  predictorAddress: string;
  score: number;
  createdAt: string;
  updatedAt: string;
}

/** Create review request */
export interface CreateReviewRequest {
  tokenId: number;
  score: number;
}

/**
 * Check if a review exists for a specific token ID.
 * 
 * @param tokenId - SignalKeyNFT token ID
 * @returns Whether the user has already reviewed this purchase
 */
export async function checkReviewExists(tokenId: number): Promise<CheckReviewResponse> {
  const response = await apiClient.get<{ success: boolean; data: CheckReviewResponse }>(
    `/api/reviews/check/${tokenId}`
  );
  return response.data.data;
}

/**
 * Get the user's review for a specific token ID.
 * 
 * @param tokenId - SignalKeyNFT token ID
 * @returns The review if it exists, null otherwise
 */
export async function getReviewByTokenId(tokenId: number): Promise<Review | null> {
  try {
    const response = await apiClient.get<{ success: boolean; data: Review }>(
      `/api/reviews/${tokenId}`
    );
    return response.data.data;
  } catch {
    return null;
  }
}

/**
 * Submit a rating for a purchased signal.
 * 
 * NOTE: Ratings are PERMANENT. Once submitted, they cannot be changed or deleted.
 * 
 * @param data - Token ID and score (1-5)
 * @returns The created review
 */
export async function createReview(data: CreateReviewRequest): Promise<Review> {
  const response = await apiClient.post<{ success: boolean; data: Review }>(
    '/api/reviews',
    data
  );
  return response.data.data;
}
