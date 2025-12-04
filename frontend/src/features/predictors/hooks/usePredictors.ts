/**
 * @fileoverview React hooks for predictor listings
 * @module features/predictors/hooks/usePredictors
 * @description
 * Custom hooks for predictor list functionality:
 * - Fetch paginated predictors with filters
 * - Fetch top predictors leaderboard
 * 
 * QUERY KEY PATTERNS:
 * - ['predictors', 'list', filters] - Paginated predictor list
 * - ['predictors', 'top', limit] - Top predictors leaderboard
 */

import { useQuery } from '@tanstack/react-query';
import {
  fetchPredictors,
  fetchTopPredictors,
  type PredictorFilters,
} from '../api';

/** Query key factory for predictor list queries */
export const predictorListKeys = {
  all: ['predictors'] as const,
  list: (filters?: PredictorFilters) => 
    [...predictorListKeys.all, 'list', filters] as const,
  top: (limit: number) => 
    [...predictorListKeys.all, 'top', limit] as const,
};

/**
 * Hook to fetch paginated predictors with filters
 * 
 * @param filters - Filter and pagination options
 * @returns Query result with predictors and pagination
 * 
 * @example
 * // Fetch top selling predictors
 * const { data, isLoading } = usePredictors({ sortBy: 'totalSales' });
 * 
 * @example
 * // Search predictors
 * const { data } = usePredictors({ search: 'crypto', page: 1 });
 */
export function usePredictors(filters?: PredictorFilters) {
  return useQuery({
    queryKey: predictorListKeys.list(filters),
    queryFn: () => fetchPredictors(filters),
    staleTime: 1000 * 60 * 2, // 2 minutes
    placeholderData: (previousData) => previousData, // Keep previous data while fetching
  });
}

/**
 * Hook to fetch top predictors for leaderboard
 * 
 * @param limit - Number of top predictors to fetch (default: 10)
 * @returns Query result with top predictors
 * 
 * @example
 * const { data: topPredictors } = useTopPredictors(5);
 */
export function useTopPredictors(limit: number = 10) {
  return useQuery({
    queryKey: predictorListKeys.top(limit),
    queryFn: () => fetchTopPredictors(limit),
    staleTime: 1000 * 60 * 5, // 5 minutes - leaderboard doesn't change often
  });
}
