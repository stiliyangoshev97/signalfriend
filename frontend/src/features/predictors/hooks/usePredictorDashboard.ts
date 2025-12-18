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
import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/features/auth/store/authStore';
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
  checkFieldUniqueness,
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
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasHydrated = useAuthStore((state) => state._hasHydrated);
  const hasToken = typeof window !== 'undefined' && !!localStorage.getItem('authToken');

  return useQuery({
    queryKey: predictorKeys.signals(address ?? '', params),
    queryFn: () => fetchMySignals(address!, params),
    // Only fetch when authenticated to prevent 401 errors
    enabled: isConnected && !!address && hasHydrated && isAuthenticated && hasToken,
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
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasHydrated = useAuthStore((state) => state._hasHydrated);
  const hasToken = typeof window !== 'undefined' && !!localStorage.getItem('authToken');

  return useQuery({
    queryKey: predictorKeys.earnings(address ?? ''),
    queryFn: () => fetchPredictorEarnings(address!),
    // Only fetch when authenticated to prevent 401 errors
    enabled: isConnected && !!address && hasHydrated && isAuthenticated && hasToken,
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
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasHydrated = useAuthStore((state) => state._hasHydrated);
  const hasToken = typeof window !== 'undefined' && !!localStorage.getItem('authToken');
  const targetAddress = address ?? connectedAddress;

  return useQuery({
    queryKey: predictorKeys.profile(targetAddress ?? ''),
    queryFn: () => fetchPredictorByAddress(targetAddress!),
    // Only fetch when authenticated to prevent 401 errors
    enabled: isConnected && !!targetAddress && hasHydrated && isAuthenticated && hasToken,
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
 * updateProfile({
 *   displayName: 'NewName',
 *   bio: 'Trading expert',
 *   avatarUrl: 'https://...',
 *   socialLinks: { twitter: 'myhandle' }
 * });
 */
export function useUpdateProfile() {
  const { address } = useAccount();
  const queryClient = useQueryClient();
  const setPredictor = useAuthStore((state) => state.setPredictor);

  return useMutation({
    mutationFn: (data: Parameters<typeof updatePredictorProfile>[1]) =>
      updatePredictorProfile(address!, data),
    onSuccess: (updatedPredictor) => {
      // Update auth store with new predictor data
      setPredictor(updatedPredictor);
      
      // Invalidate dashboard profile query
      queryClient.invalidateQueries({
        queryKey: predictorKeys.profile(address!),
      });
      // Invalidate public predictor profile (used on /predictors/:address page)
      // Note: Uses lowercase address to match publicPredictorKeys.profile() pattern
      queryClient.invalidateQueries({
        queryKey: ['predictor', 'public-profile', address!.toLowerCase()],
      });
      // Invalidate public predictor signals (in case predictor info is displayed)
      queryClient.invalidateQueries({
        queryKey: ['predictor', 'public-signals', address!.toLowerCase()],
        exact: false, // Match all filter variations
      });
      // Invalidate predictor list (in case name/avatar changed)
      queryClient.invalidateQueries({
        queryKey: ['predictors', 'list'],
      });
      // Invalidate signals list (signal cards display predictor avatar/name)
      queryClient.invalidateQueries({
        queryKey: ['signals', 'list'],
        exact: false, // Match all filter variations
      });
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
  const setPredictor = useAuthStore((state) => state.setPredictor);

  return useMutation({
    mutationFn: () => applyForVerification(address!),
    onSuccess: (updatedPredictor) => {
      // Update the auth store with the new predictor data (including pending status)
      // This will immediately update the UI to show "Verification Pending" badge
      setPredictor(updatedPredictor);
      
      // Invalidate queries to refetch predictor data for consistency
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

/**
 * Hook for real-time field uniqueness checking with debounce
 * 
 * @param field - Field to check: displayName, telegram, or discord
 * @param value - Value to check
 * @param debounceMs - Debounce delay in milliseconds (default: 500)
 * @returns Object with isAvailable, isChecking, and error states
 * 
 * @example
 * const { isAvailable, isChecking } = useCheckFieldUniqueness('displayName', formValue);
 * if (!isAvailable) {
 *   setError('Display name is already taken');
 * }
 */
export function useCheckFieldUniqueness(
  field: 'displayName' | 'telegram' | 'discord',
  value: string,
  debounceMs = 500
) {
  const { address } = useAccount();
  const [debouncedValue, setDebouncedValue] = useState(value);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounce the value
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [value, debounceMs]);

  // Check uniqueness when debounced value changes
  const checkUniqueness = useCallback(async () => {
    // Don't check empty values
    if (!debouncedValue || debouncedValue.trim().length === 0) {
      setIsAvailable(null);
      setError(null);
      return;
    }

    // Minimum length check
    if (field === 'displayName' && debouncedValue.length < 3) {
      setIsAvailable(null);
      setError(null);
      return;
    }

    setIsChecking(true);
    setError(null);

    try {
      const result = await checkFieldUniqueness(field, debouncedValue, address);
      setIsAvailable(result.available);
      if (!result.available) {
        const fieldLabel = field === 'displayName' ? 'Display name' : 
                          field === 'telegram' ? 'Telegram handle' : 'Discord handle';
        setError(`${fieldLabel} is already taken`);
      }
    } catch (err) {
      console.error('Error checking field uniqueness:', err);
      setError('Failed to check availability');
      setIsAvailable(null);
    } finally {
      setIsChecking(false);
    }
  }, [debouncedValue, field, address]);

  useEffect(() => {
    checkUniqueness();
  }, [checkUniqueness]);

  return { isAvailable, isChecking, error };
}
