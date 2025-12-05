/**
 * @fileoverview React hooks for predictor profile page
 * @module features/predictors/hooks/usePredictorProfile
 * @description
 * Custom hooks for fetching public predictor profile data:
 * - Profile info
 * - Signals with filters
 * 
 * QUERY KEY PATTERNS:
 * - ['predictor', 'public-profile', address] - Public predictor profile
 * - ['predictor', 'public-signals', address, filters] - Predictor's signals
 */

import { useQuery } from '@tanstack/react-query';
import {
  fetchPredictorProfile,
  fetchPredictorSignalsPublic,
} from '../api/predictorProfile.api';
import type { SignalFilters } from '@/shared/types';

/** Query key factory for public predictor queries */
export const publicPredictorKeys = {
  all: ['predictor'] as const,
  profile: (address: string) => 
    [...publicPredictorKeys.all, 'public-profile', address.toLowerCase()] as const,
  signals: (address: string, filters?: SignalFilters) => 
    [...publicPredictorKeys.all, 'public-signals', address.toLowerCase(), filters] as const,
};

/**
 * Hook to fetch a predictor's public profile
 * 
 * @param address - Predictor's wallet address
 * @returns Query result with predictor profile
 * 
 * @example
 * const { data: predictor, isLoading } = usePublicPredictorProfile('0x123...');
 */
export function usePublicPredictorProfile(address: string | undefined) {
  return useQuery({
    queryKey: publicPredictorKeys.profile(address ?? ''),
    queryFn: () => fetchPredictorProfile(address!),
    enabled: !!address,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Hook to fetch a predictor's signals with filters
 * 
 * @param address - Predictor's wallet address
 * @param filters - Optional filter parameters
 * @returns Query result with paginated signals
 * 
 * @example
 * const { data, isLoading } = usePublicPredictorSignals('0x123...', { page: 1, limit: 12 });
 */
export function usePublicPredictorSignals(
  address: string | undefined,
  filters: SignalFilters = {}
) {
  return useQuery({
    queryKey: publicPredictorKeys.signals(address ?? '', filters),
    queryFn: () => fetchPredictorSignalsPublic(address!, filters),
    enabled: !!address,
    staleTime: 1000 * 30, // 30 seconds
  });
}
