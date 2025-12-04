/**
 * @fileoverview Predictor API functions
 * @module features/predictors/api
 * @description
 * API functions for predictor-related operations including:
 * - Fetching predictor profile and signals
 * - Dashboard statistics
 * - Profile updates
 * 
 * Used with React Query for data fetching and caching.
 */

import { apiClient } from '@/shared/api';
import { API_CONFIG } from '@/shared/config';
import type { Predictor, Signal, ApiResponse } from '@/shared/types';

/**
 * Predictor dashboard statistics
 */
export interface PredictorStats {
  totalSignals: number;
  activeSignals: number;
  totalSales: number;
  totalEarnings: number;
  averageRating: number;
  totalReviews: number;
}

/**
 * Predictor earnings breakdown
 */
export interface PredictorEarnings {
  totalEarnings: number;
  signalCount: number;
  breakdown: {
    contentId: string;
    title: string;
    sales: number;
    earnings: number;
  }[];
}

/**
 * Fetch the current user's predictor profile
 * 
 * @returns Current predictor profile
 * @throws ApiError if user is not a predictor
 * 
 * @example
 * const profile = await fetchMyProfile();
 * console.log(profile.displayName);
 */
export async function fetchMyProfile(): Promise<Predictor> {
  const response = await apiClient.get<ApiResponse<Predictor>>(
    API_CONFIG.ENDPOINTS.PREDICTOR_PROFILE
  );
  return response.data.data;
}

/**
 * Fetch a predictor's public profile by wallet address
 * 
 * @param address - Predictor's wallet address
 * @returns Predictor profile
 * 
 * @example
 * const predictor = await fetchPredictorByAddress('0x123...');
 */
export async function fetchPredictorByAddress(address: string): Promise<Predictor> {
  const response = await apiClient.get<ApiResponse<Predictor>>(
    API_CONFIG.ENDPOINTS.PREDICTOR_BY_ADDRESS(address)
  );
  return response.data.data;
}

/**
 * Fetch signals created by a specific predictor
 * 
 * @param address - Predictor's wallet address
 * @param params - Optional query parameters
 * @returns List of signals (not paginated)
 * 
 * @example
 * // Fetch all signals including inactive
 * const signals = await fetchPredictorSignals('0x123...', { includeInactive: true });
 */
export async function fetchPredictorSignals(
  address: string,
  params?: { 
    includeInactive?: boolean;
    sortBy?: 'createdAt' | 'priceUsdt' | 'totalSales';
    sortOrder?: 'asc' | 'desc';
  }
): Promise<Signal[]> {
  const queryParams = new URLSearchParams();
  
  if (params?.includeInactive !== undefined) {
    queryParams.append('includeInactive', params.includeInactive.toString());
  }
  if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);
  
  const queryString = queryParams.toString();
  const url = queryString 
    ? `${API_CONFIG.ENDPOINTS.PREDICTOR_SIGNALS(address)}?${queryString}`
    : API_CONFIG.ENDPOINTS.PREDICTOR_SIGNALS(address);
  
  const response = await apiClient.get<ApiResponse<Signal[]>>(url);
  return response.data.data;
}

/**
 * Fetch current predictor's signals (convenience wrapper)
 * 
 * @param address - Current user's wallet address
 * @param params - Optional query parameters
 * @returns List of own signals
 */
export async function fetchMySignals(
  address: string,
  params?: {
    includeInactive?: boolean;
    sortBy?: 'createdAt' | 'priceUsdt' | 'totalSales';
    sortOrder?: 'asc' | 'desc';
  }
): Promise<Signal[]> {
  return fetchPredictorSignals(address, params);
}

/**
 * Fetch predictor earnings breakdown
 * 
 * @param address - Predictor's wallet address
 * @returns Earnings breakdown by signal
 * 
 * @example
 * const earnings = await fetchPredictorEarnings('0x123...');
 * console.log(`Total earnings: $${earnings.totalEarnings}`);
 */
export async function fetchPredictorEarnings(address: string): Promise<PredictorEarnings> {
  const response = await apiClient.get<ApiResponse<PredictorEarnings>>(
    `${API_CONFIG.ENDPOINTS.PREDICTOR_BY_ADDRESS(address)}/earnings`
  );
  return response.data.data;
}

/**
 * Update predictor profile
 * 
 * @param address - Predictor's wallet address (must match authenticated user)
 * @param data - Profile update data
 * @returns Updated predictor profile
 * 
 * @example
 * const updated = await updatePredictorProfile('0x123...', {
 *   displayName: 'NewName',
 *   bio: 'Trading expert since 2020'
 * });
 */
export async function updatePredictorProfile(
  address: string,
  data: {
    displayName?: string;
    bio?: string;
    telegram?: string;
    discord?: string;
    preferredContact?: 'telegram' | 'discord';
  }
): Promise<Predictor> {
  const response = await apiClient.put<ApiResponse<Predictor>>(
    API_CONFIG.ENDPOINTS.PREDICTOR_BY_ADDRESS(address),
    data
  );
  return response.data.data;
}

/**
 * Apply for verification badge
 * Requires 100+ total sales
 * 
 * @param address - Predictor's wallet address
 * @returns Updated predictor profile with pending verification
 * 
 * @example
 * const result = await applyForVerification('0x123...');
 * console.log(result.verificationStatus); // 'pending'
 */
export async function applyForVerification(address: string): Promise<Predictor> {
  const response = await apiClient.post<ApiResponse<Predictor>>(
    `${API_CONFIG.ENDPOINTS.PREDICTOR_BY_ADDRESS(address)}/apply-verification`
  );
  return response.data.data;
}
