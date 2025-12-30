/**
 * @fileoverview Predictor Profile API functions
 * @module features/predictors/api/predictorProfile
 * @description
 * API functions for fetching predictor profile data including:
 * - Public predictor profile
 * - Predictor's signals (with filtering/pagination)
 */

import { apiClient } from '@/shared/api';
import { API_CONFIG } from '@/shared/config';
import type { Predictor, Signal, ApiResponse, PaginatedResponse, SignalFilters } from '@/shared/types';

/**
 * Fetch a predictor's public profile by wallet address
 * 
 * @param address - Predictor's wallet address
 * @returns Predictor profile data
 * 
 * @example
 * const predictor = await fetchPredictorProfile('0x123...');
 */
export async function fetchPredictorProfile(address: string): Promise<Predictor> {
  const response = await apiClient.get<ApiResponse<Predictor>>(
    API_CONFIG.ENDPOINTS.PREDICTOR_BY_ADDRESS(address)
  );
  return response.data.data;
}

/**
 * Fetch signals created by a specific predictor with filters
 * 
 * @param address - Predictor's wallet address
 * @param filters - Optional filter parameters
 * @returns Paginated signals response
 * 
 * @example
 * const signals = await fetchPredictorSignalsPublic('0x123...', { page: 1, limit: 12 });
 */
export async function fetchPredictorSignalsPublic(
  address: string,
  filters: SignalFilters = {}
): Promise<PaginatedResponse<Signal>> {
  const params = new URLSearchParams();

  // Add predictor address filter
  params.append('predictorAddress', address.toLowerCase());

  // Add status filter (active, inactive, or all)
  if (filters.status) params.append('status', filters.status);

  // Add other filters
  if (filters.category) params.append('categoryId', filters.category);
  if (filters.minConfidence !== undefined) params.append('minConfidence', filters.minConfidence.toString());
  if (filters.maxConfidence !== undefined) params.append('maxConfidence', filters.maxConfidence.toString());
  if (filters.minPrice !== undefined) params.append('minPrice', filters.minPrice.toString());
  if (filters.maxPrice !== undefined) params.append('maxPrice', filters.maxPrice.toString());
  if (filters.excludeBuyerAddress) params.append('excludeBuyerAddress', filters.excludeBuyerAddress);
  
  // Sort mapping
  if (filters.sortBy) {
    const sortMapping: Record<string, { sortBy: string; sortOrder: string }> = {
      'newest': { sortBy: 'createdAt', sortOrder: 'desc' },
      'price-low': { sortBy: 'priceUsdt', sortOrder: 'asc' },
      'price-high': { sortBy: 'priceUsdt', sortOrder: 'desc' },
      'popular': { sortBy: 'totalSales', sortOrder: 'desc' },
    };
    const sort = sortMapping[filters.sortBy];
    if (sort) {
      params.append('sortBy', sort.sortBy);
      params.append('sortOrder', sort.sortOrder);
    }
  }

  if (filters.page) params.append('page', filters.page.toString());
  if (filters.limit) params.append('limit', filters.limit.toString());

  const queryString = params.toString();
  const url = `${API_CONFIG.ENDPOINTS.SIGNALS}?${queryString}`;

  const response = await apiClient.get<PaginatedResponse<Signal>>(url);
  return response.data;
}
