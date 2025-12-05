/**
 * @fileoverview Receipt Hooks
 * @module features/signals/hooks/useReceipts
 * @description
 * React Query hooks for managing user's purchase receipts.
 */

import { useQuery } from '@tanstack/react-query';
import { getMyPurchasedContentIds } from '../api/receipts.api';

/**
 * Hook to fetch all content IDs the user has purchased.
 * Useful for showing "Purchased" badges on signal cards.
 * 
 * @param enabled - Whether the query should run (e.g., only when authenticated)
 * @returns Query result with array of purchased content IDs
 * 
 * @example
 * const { data: purchasedIds } = useMyPurchasedContentIds(isAuthenticated);
 * <SignalGrid signals={signals} purchasedContentIds={purchasedIds} />
 */
export function useMyPurchasedContentIds(enabled: boolean = true) {
  return useQuery({
    queryKey: ['receipts', 'my-purchased-content-ids'],
    queryFn: getMyPurchasedContentIds,
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes - purchases don't change often
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
  });
}
