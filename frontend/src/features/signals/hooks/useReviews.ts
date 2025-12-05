/**
 * @fileoverview React hooks for signal ratings/reviews
 * @module features/signals/hooks/useReviews
 * @description
 * Custom hooks for handling signal ratings.
 * 
 * NOTE: Ratings are PERMANENT. Once submitted, they cannot be changed or deleted.
 * This ensures rating integrity and prevents manipulation.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { checkReviewExists, getReviewByTokenId, createReview } from '../api';
import { signalKeys } from './useSignals';
import { publicPredictorKeys } from '@/features/predictors/hooks/usePredictorProfilePage';
import type { CheckReviewResponse, Review, CreateReviewRequest } from '../api/reviews.api';

/** Query key factory for review-related queries */
export const reviewKeys = {
  all: ['reviews'] as const,
  check: (tokenId: number, address?: string) => [...reviewKeys.all, 'check', tokenId, address] as const,
  detail: (tokenId: number, address?: string) => [...reviewKeys.all, 'detail', tokenId, address] as const,
};

/**
 * Hook to check if the current user has already rated a purchase.
 * 
 * @param tokenId - SignalKeyNFT token ID
 * @returns Query result with review existence status
 * 
 * @example
 * const { data, isLoading } = useCheckReview(123);
 * if (data?.hasReview) {
 *   // User has already rated this purchase
 * }
 */
export function useCheckReview(tokenId: number | undefined) {
  const { address, isConnected } = useAccount();

  return useQuery<CheckReviewResponse>({
    queryKey: reviewKeys.check(tokenId ?? 0, address),
    queryFn: () => checkReviewExists(tokenId!),
    enabled: isConnected && !!tokenId && tokenId > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes - reviews are permanent so can cache longer
  });
}

/**
 * Hook to get the user's review for a specific purchase.
 * 
 * @param tokenId - SignalKeyNFT token ID
 * @returns Query result with the review data
 * 
 * @example
 * const { data: review } = useGetReview(123);
 * if (review) {
 *   console.log(`User rated: ${review.score} stars`);
 * }
 */
export function useGetReview(tokenId: number | undefined) {
  const { address, isConnected } = useAccount();

  return useQuery<Review | null>({
    queryKey: reviewKeys.detail(tokenId ?? 0, address),
    queryFn: () => getReviewByTokenId(tokenId!),
    enabled: isConnected && !!tokenId && tokenId > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to submit a rating for a purchased signal.
 * 
 * NOTE: Ratings are PERMANENT. Once submitted, they cannot be changed or deleted.
 * 
 * @param options.contentId - Signal's content ID (for cache invalidation)
 * @param options.predictorAddress - Predictor's address (for cache invalidation)
 * @returns Mutation for creating a review
 * 
 * @example
 * const { mutate: submitRating, isPending } = useCreateReview({
 *   contentId: 'abc123',
 *   predictorAddress: '0x...',
 * });
 * submitRating({ tokenId: 123, score: 5 }, {
 *   onSuccess: () => console.log('Rating submitted!'),
 * });
 */
export function useCreateReview(options?: {
  contentId?: string;
  predictorAddress?: string;
}) {
  const queryClient = useQueryClient();
  const { address } = useAccount();

  return useMutation<Review, Error, CreateReviewRequest>({
    mutationFn: createReview,
    onSuccess: (data, variables) => {
      // Invalidate check query to reflect new review
      queryClient.invalidateQueries({
        queryKey: reviewKeys.check(variables.tokenId, address),
      });
      // Update the detail cache with the new review
      queryClient.setQueryData(
        reviewKeys.detail(variables.tokenId, address),
        data
      );
      
      // Invalidate signal detail query to show updated rating on signal page
      // The rating affects signal's averageRating and totalReviews
      if (options?.contentId) {
        queryClient.invalidateQueries({
          queryKey: signalKeys.detail(options.contentId),
        });
      }
      
      // Invalidate predictor profile query to show updated average rating
      // The rating affects predictor's averageRating and totalReviews
      if (options?.predictorAddress) {
        queryClient.invalidateQueries({
          queryKey: publicPredictorKeys.profile(options.predictorAddress),
        });
      }
      
      // Also invalidate signal lists in case they show ratings
      queryClient.invalidateQueries({
        queryKey: signalKeys.lists(),
      });
    },
  });
}
