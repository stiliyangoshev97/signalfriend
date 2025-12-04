/**
 * @fileoverview React hooks for predictor dashboard
 * @module features/predictors/hooks/usePredictorDashboard
 * @description
 * Custom hooks for predictor dashboard functionality:
 * - Fetch own signals
 * - Fetch earnings
 * - Create/update/deactivate signals
 * 
 * QUERY KEY PATTERNS:
 * - ['predictor', 'signals', address, params] - Predictor's signals
 * - ['predictor', 'earnings', address] - Predictor's earnings
 * - ['predictor', 'profile', address] - Predictor profile
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import {
  fetchMySignals,
  fetchPredictorEarnings,
  fetchPredictorByAddress,
  updatePredictorProfile,
  applyForVerification,
  createSignal,
  updateSignal,
  deactivateSignal,
  reactivateSignal,
} from '../api';
import type { CreateSignalData } from '@/shared/types';

/** Query key factory for predictor queries */
export const predictorKeys = {
  all: ['predictor'] as const,
  signals: (address: string, params?: object) => 
    [...predictorKeys.all, 'signals', address, params] as const,
  earnings: (address: string) => 
    [...predictorKeys.all, 'earnings', address] as const,
  profile: (address: string) => 
    [...predictorKeys.all, 'profile', address] as const,
};

/**
 * Hook to fetch predictor's own signals
 * 
 * @param params - Optional query parameters
 * @returns Query result with signals
 * 
 * @example
 * const { data, isLoading } = useMySignals({ includeInactive: true });
 */
export function useMySignals(params?: {
  includeInactive?: boolean;
  sortBy?: 'createdAt' | 'priceUsdt' | 'totalSales';
  sortOrder?: 'asc' | 'desc';
}) {
  const { address, isConnected } = useAccount();

  return useQuery({
    queryKey: predictorKeys.signals(address ?? '', params),
    queryFn: () => fetchMySignals(address!, params),
    enabled: isConnected && !!address,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Hook to fetch predictor's earnings breakdown
 * 
 * @returns Query result with earnings
 * 
 * @example
 * const { data: earnings } = useMyEarnings();
 * console.log(`Total: $${earnings?.totalEarnings}`);
 */
export function useMyEarnings() {
  const { address, isConnected } = useAccount();

  return useQuery({
    queryKey: predictorKeys.earnings(address ?? ''),
    queryFn: () => fetchPredictorEarnings(address!),
    enabled: isConnected && !!address,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to fetch predictor's profile
 * 
 * @param address - Optional address (defaults to connected wallet)
 * @returns Query result with predictor profile
 */
export function usePredictorProfile(address?: string) {
  const { address: connectedAddress, isConnected } = useAccount();
  const targetAddress = address ?? connectedAddress;

  return useQuery({
    queryKey: predictorKeys.profile(targetAddress ?? ''),
    queryFn: () => fetchPredictorByAddress(targetAddress!),
    enabled: isConnected && !!targetAddress,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to update predictor profile
 * 
 * @returns Mutation for updating profile
 * 
 * @example
 * const { mutate: updateProfile } = useUpdateProfile();
 * updateProfile({ displayName: 'NewName' });
 */
export function useUpdateProfile() {
  const { address } = useAccount();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Parameters<typeof updatePredictorProfile>[1]) =>
      updatePredictorProfile(address!, data),
    onSuccess: () => {
      // Invalidate profile query
      queryClient.invalidateQueries({
        queryKey: predictorKeys.profile(address!),
      });
      // Note: Auth store predictor data should be updated by the component
    },
  });
}

/**
 * Hook to apply for verification
 * 
 * @returns Mutation for applying for verification
 */
export function useApplyForVerification() {
  const { address } = useAccount();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => applyForVerification(address!),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: predictorKeys.profile(address!),
      });
    },
  });
}

/**
 * Hook to create a new signal
 * 
 * @returns Mutation for creating signals
 * 
 * @example
 * const { mutate: create, isPending } = useCreateSignal();
 * create({
 *   title: 'BTC Alert',
 *   description: '...',
 *   content: '...',
 *   categoryId: '...',
 *   priceUsdt: 25,
 *   expiryDays: 7
 * });
 */
export function useCreateSignal() {
  const { address } = useAccount();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSignalData) => createSignal(data),
    onSuccess: () => {
      // Invalidate signals list
      queryClient.invalidateQueries({
        queryKey: predictorKeys.signals(address!, {}),
      });
      // Invalidate earnings (new signal may affect stats)
      queryClient.invalidateQueries({
        queryKey: predictorKeys.earnings(address!),
      });
    },
  });
}

/**
 * Hook to update an existing signal
 * 
 * @returns Mutation for updating signals
 */
export function useUpdateSignal() {
  const { address } = useAccount();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ contentId, data }: { 
      contentId: string; 
      data: Partial<Omit<CreateSignalData, 'expiryDays'>> 
    }) => updateSignal(contentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: predictorKeys.signals(address!, {}),
      });
    },
  });
}

/**
 * Hook to deactivate a signal
 * 
 * @returns Mutation for deactivating signals
 */
export function useDeactivateSignal() {
  const { address } = useAccount();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (contentId: string) => deactivateSignal(contentId),
    onSuccess: () => {
      // Invalidate ALL predictor signals queries (any params)
      queryClient.invalidateQueries({
        queryKey: [...predictorKeys.all, 'signals', address!],
      });
      // Also invalidate marketplace signals list so deactivated signal is removed
      queryClient.invalidateQueries({
        queryKey: ['signals', 'list'],
      });
      // Invalidate signal detail page cache
      queryClient.invalidateQueries({
        queryKey: ['signals', 'detail'],
      });
    },
  });
}

/**
 * Hook to reactivate a deactivated signal
 * 
 * @returns Mutation for reactivating signals
 */
export function useReactivateSignal() {
  const { address } = useAccount();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (contentId: string) => reactivateSignal(contentId),
    onSuccess: () => {
      // Invalidate ALL predictor signals queries (any params)
      queryClient.invalidateQueries({
        queryKey: [...predictorKeys.all, 'signals', address!],
      });
      // Also invalidate marketplace signals list so reactivated signal appears
      queryClient.invalidateQueries({
        queryKey: ['signals', 'list'],
      });
      // Invalidate signal detail page cache
      queryClient.invalidateQueries({
        queryKey: ['signals', 'detail'],
      });
    },
  });
}
