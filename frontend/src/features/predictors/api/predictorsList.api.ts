/**
 * @fileoverview Predictor List API functions
 * @module features/predictors/api/predictorsList
 * @description
 * API functions for fetching predictor listings and leaderboard.
 * Used with React Query for data fetching and caching.
 * 
 * ENDPOINTS:
 * - GET /api/predictors - List predictors with filters
 * - GET /api/predictors/top - Get top predictors leaderboard
 */

import { apiClient } from '@/shared/api';
import { API_CONFIG } from '@/shared/config';
import type { Predictor, ApiResponse } from '@/shared/types';

/**
 * Filters for the predictors list
 */
export interface PredictorFilters {
  /** Filter by category ID */
  categoryId?: string;
  /** Exclude blacklisted predictors (default: true) */
  active?: boolean;
  /** Filter by verified status (true = only verified, false = only unverified, undefined = all) */
  verified?: boolean;
  /** Sort field */
  sortBy?: 'totalSales' | 'averageRating' | 'joinedAt' | 'totalSignals';
  /** Sort direction */
  sortOrder?: 'asc' | 'desc';
  /** Search by display name */
  search?: string;
  /** Page number (1-based) */
  page?: number;
  /** Items per page */
  limit?: number;
}

/**
 * Response from predictors list endpoint (raw backend format)
 */
interface BackendPredictorsResponse {
  success: boolean;
  data: Predictor[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Normalized response for frontend use
 */
export interface PredictorsListResponse {
  predictors: Predictor[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Fetch paginated list of predictors with filters
 * 
 * @param filters - Filter and pagination options
 * @returns Paginated list of predictors
 * 
 * @example
 * // Fetch top selling predictors
 * const data = await fetchPredictors({ sortBy: 'totalSales', limit: 10 });
 * 
 * @example
 * // Search predictors by name
 * const data = await fetchPredictors({ search: 'crypto', page: 1 });
 */
export async function fetchPredictors(
  filters?: PredictorFilters
): Promise<PredictorsListResponse> {
  const params = new URLSearchParams();

  if (filters?.categoryId) params.append('categoryId', filters.categoryId);
  if (filters?.active !== undefined) params.append('active', String(filters.active));
  if (filters?.verified !== undefined) params.append('verified', String(filters.verified));
  if (filters?.sortBy) params.append('sortBy', filters.sortBy);
  if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);
  if (filters?.search) params.append('search', filters.search);
  if (filters?.page) params.append('page', String(filters.page));
  if (filters?.limit) params.append('limit', String(filters.limit));

  const queryString = params.toString();
  const url = queryString
    ? `${API_CONFIG.ENDPOINTS.PREDICTORS}?${queryString}`
    : API_CONFIG.ENDPOINTS.PREDICTORS;

  const response = await apiClient.get<BackendPredictorsResponse>(url);
  
  // Transform backend response to normalized format
  return {
    predictors: response.data.data,
    pagination: response.data.pagination,
  };
}

/**
 * Fetch top predictors for leaderboard
 * 
 * @param limit - Number of top predictors to fetch (default: 10)
 * @returns List of top predictors sorted by total sales
 * 
 * @example
 * const topPredictors = await fetchTopPredictors(5);
 */
export async function fetchTopPredictors(limit: number = 10): Promise<Predictor[]> {
  const response = await apiClient.get<ApiResponse<Predictor[]>>(
    `${API_CONFIG.ENDPOINTS.PREDICTORS}/top?limit=${limit}`
  );
  return response.data.data;
}
