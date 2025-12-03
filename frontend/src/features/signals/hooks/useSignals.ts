/**
 * @fileoverview React Query hooks for signals
 * @module features/signals/hooks
 * @description
 * Custom hooks for fetching and managing signal data using React Query.
 * Provides caching, background refetching, and loading states.
 */

import { useQuery } from '@tanstack/react-query';
import { fetchSignals, fetchSignalById, fetchCategories } from '../api';
import type { SignalFilters } from '@/shared/types';

/** Query key factory for signals */
export const signalKeys = {
  all: ['signals'] as const,
  lists: () => [...signalKeys.all, 'list'] as const,
  list: (filters: SignalFilters) => [...signalKeys.lists(), filters] as const,
  details: () => [...signalKeys.all, 'detail'] as const,
  detail: (id: string) => [...signalKeys.details(), id] as const,
};

/** Query key factory for categories */
export const categoryKeys = {
  all: ['categories'] as const,
};

/**
 * Hook to fetch paginated signals with filters
 * 
 * @param filters - Optional filter parameters
 * @returns React Query result with signals data
 * 
 * @example
 * const { data, isLoading, error } = useSignals({ category: 'crypto' });
 * 
 * if (isLoading) return <Spinner />;
 * if (error) return <Error message={error.message} />;
 * 
 * return data.data.map(signal => <SignalCard key={signal.contentId} signal={signal} />);
 */
export function useSignals(filters: SignalFilters = {}) {
  return useQuery({
    queryKey: signalKeys.list(filters),
    queryFn: () => fetchSignals(filters),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Hook to fetch a single signal by contentId
 * 
 * @param contentId - Unique identifier for the signal
 * @param options - Optional query options
 * @returns React Query result with signal data
 * 
 * @example
 * const { data: signal, isLoading } = useSignal('abc123');
 */
export function useSignal(
  contentId: string,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: signalKeys.detail(contentId),
    queryFn: () => fetchSignalById(contentId),
    enabled: options?.enabled !== false && !!contentId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to fetch all categories
 * 
 * @returns React Query result with categories data
 * 
 * @example
 * const { data: categories } = useCategories();
 * 
 * return (
 *   <select>
 *     {categories?.map(cat => (
 *       <option key={cat._id} value={cat._id}>{cat.name}</option>
 *     ))}
 *   </select>
 * );
 */
export function useCategories() {
  return useQuery({
    queryKey: categoryKeys.all,
    queryFn: fetchCategories,
    staleTime: 1000 * 60 * 30, // 30 minutes (categories rarely change)
  });
}
