/**
 * @fileoverview React Query hooks for predictor dispute management
 * @module features/predictors/hooks/useDispute
 * @description
 * Custom hooks for blacklisted predictors to create and track their dispute.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createDispute, getMyDispute } from '../api';

// ============================================
// Query Keys
// ============================================

export const disputeKeys = {
  all: ['predictor-dispute'] as const,
  mine: () => [...disputeKeys.all, 'mine'] as const,
};

// ============================================
// Hooks
// ============================================

/**
 * Hook to fetch the current predictor's dispute status
 * @returns React Query result with dispute data or null
 */
export function useMyDispute() {
  return useQuery({
    queryKey: disputeKeys.mine(),
    queryFn: getMyDispute,
    staleTime: 1000 * 60 * 2, // 2 minutes
    retry: false, // Don't retry on 404
  });
}

/**
 * Hook to create a dispute for the authenticated predictor
 * @returns Mutation for creating a dispute
 */
export function useCreateDispute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createDispute,
    onSuccess: () => {
      // Invalidate and refetch the dispute status
      queryClient.invalidateQueries({ queryKey: disputeKeys.mine() });
    },
  });
}
