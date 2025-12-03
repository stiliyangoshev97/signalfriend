/**
 * @fileoverview Signal API functions
 * @module features/signals/api
 * @description
 * API functions for fetching signals from the backend.
 * Used with React Query for data fetching and caching.
 */

import { apiClient } from '@/shared/api';
import { API_CONFIG } from '@/shared/config';
import type { Signal, SignalFilters, PaginatedResponse, Category, ApiResponse } from '@/shared/types';

/**
 * Build query string from SignalFilters object
 * @param filters - Filter options
 * @returns Query string for URL
 */
function buildQueryString(filters: SignalFilters): string {
  const params = new URLSearchParams();

  if (filters.category) params.append('categoryId', filters.category);
  if (filters.riskLevel) params.append('riskLevel', filters.riskLevel);
  if (filters.potentialReward) params.append('potentialReward', filters.potentialReward);
  if (filters.minPrice !== undefined) params.append('minPrice', filters.minPrice.toString());
  if (filters.maxPrice !== undefined) params.append('maxPrice', filters.maxPrice.toString());
  if (filters.predictor) params.append('predictorAddress', filters.predictor);
  if (filters.status) params.append('status', filters.status);
  if (filters.sortBy) {
    // Map frontend sort values to backend params
    // Backend uses priceUsdt (lowercase) and totalSales (not totalBuyers)
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

  return params.toString();
}

/**
 * Fetch paginated list of signals with optional filters
 * 
 * @param filters - Optional filter parameters
 * @returns Paginated response with signals
 * 
 * @example
 * const { data, pagination } = await fetchSignals({ category: 'crypto', riskLevel: 'low' });
 */
export async function fetchSignals(
  filters: SignalFilters = {}
): Promise<PaginatedResponse<Signal>> {
  const queryString = buildQueryString(filters);
  const url = queryString
    ? `${API_CONFIG.ENDPOINTS.SIGNALS}?${queryString}`
    : API_CONFIG.ENDPOINTS.SIGNALS;

  const response = await apiClient.get<PaginatedResponse<Signal>>(url);
  return response.data;
}

/**
 * Fetch a single signal by contentId
 * 
 * @param contentId - Unique identifier for the signal
 * @returns Signal object
 * 
 * @example
 * const signal = await fetchSignalById('abc123');
 */
export async function fetchSignalById(contentId: string): Promise<Signal> {
  const response = await apiClient.get<ApiResponse<Signal>>(
    API_CONFIG.ENDPOINTS.SIGNAL_BY_ID(contentId)
  );
  return response.data.data;
}

/**
 * Fetch all active categories
 * 
 * @returns Array of categories
 * 
 * @example
 * const categories = await fetchCategories();
 */
export async function fetchCategories(): Promise<Category[]> {
  const response = await apiClient.get<ApiResponse<Category[]>>(
    API_CONFIG.ENDPOINTS.CATEGORIES
  );
  return response.data.data;
}

/**
 * Fetch signals by predictor address
 * 
 * @param address - Predictor wallet address
 * @returns Array of signals
 * 
 * @example
 * const signals = await fetchSignalsByPredictor('0x123...');
 */
export async function fetchSignalsByPredictor(
  address: string
): Promise<Signal[]> {
  const response = await apiClient.get<ApiResponse<Signal[]>>(
    API_CONFIG.ENDPOINTS.PREDICTOR_SIGNALS(address)
  );
  return response.data.data;
}
