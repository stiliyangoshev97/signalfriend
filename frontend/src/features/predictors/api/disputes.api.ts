/**
 * @fileoverview Dispute API functions for predictors
 * @module features/predictors/api/disputes
 * @description
 * API functions for predictors to create and check their own dispute status.
 * Used when a predictor is blacklisted and wants to contest the decision.
 */

import { apiClient } from '@/shared/api';
import { API_CONFIG } from '@/shared/config';
import type { ApiResponse } from '@/shared/types';

// ============================================
// Types
// ============================================

export type DisputeStatus = 'pending' | 'contacted' | 'resolved' | 'rejected';

export interface PredictorDispute {
  _id: string;
  predictorAddress: string;
  status: DisputeStatus;
  createdAt: string;
  resolvedAt?: string;
}

// ============================================
// API Functions
// ============================================

/**
 * Create a dispute for the authenticated predictor
 * Only available to blacklisted predictors
 * @returns Created dispute record
 */
export async function createDispute(): Promise<PredictorDispute> {
  const response = await apiClient.post<ApiResponse<PredictorDispute>>(
    API_CONFIG.ENDPOINTS.DISPUTES
  );
  return response.data.data;
}

/**
 * Get the authenticated predictor's dispute status
 * @returns Dispute record or null if no dispute exists
 */
export async function getMyDispute(): Promise<PredictorDispute | null> {
  try {
    const response = await apiClient.get<ApiResponse<PredictorDispute | null>>(
      API_CONFIG.ENDPOINTS.DISPUTE_ME
    );
    return response.data.data;
  } catch (error) {
    // 404 means no dispute exists
    return null;
  }
}
