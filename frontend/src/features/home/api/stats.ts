/**
 * @fileoverview Public statistics API functions and React Query hooks.
 *
 * Provides functions to fetch platform statistics for the homepage.
 * No authentication required.
 *
 * @module features/home/api/stats
 */

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/api';

/**
 * Public platform statistics type
 */
export interface PublicStats {
  /** Total number of signals created */
  totalSignals: number;
  /** Total number of registered predictors */
  totalPredictors: number;
  /** Total earnings paid out to predictors in USDT */
  totalPredictorEarnings: number;
  /** Total number of signal purchases */
  totalPurchases: number;
}

/**
 * Fetches public platform statistics.
 *
 * @returns Promise resolving to platform statistics
 *
 * @example
 * ```typescript
 * const stats = await fetchPublicStats();
 * console.log(stats.activeSignals); // 45
 * ```
 */
export async function fetchPublicStats(): Promise<PublicStats> {
  const response = await apiClient.get<{ success: boolean; data: PublicStats }>(
    '/api/stats'
  );
  return response.data.data;
}

/**
 * React Query hook for fetching public platform statistics.
 *
 * Caches data for 5 minutes with background refetch.
 * Ideal for homepage display.
 *
 * @returns Query result with stats data
 *
 * @example
 * ```tsx
 * function StatsDisplay() {
 *   const { data: stats, isLoading } = usePublicStats();
 *
 *   if (isLoading) return <Spinner />;
 *
 *   return (
 *     <div>
 *       <p>Active Signals: {stats?.activeSignals}</p>
 *       <p>Total Predictors: {stats?.totalPredictors}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function usePublicStats() {
  return useQuery({
    queryKey: ['public-stats'],
    queryFn: fetchPublicStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });
}
