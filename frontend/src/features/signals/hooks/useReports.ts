/**
 * @fileoverview React Query hooks for signal reports
 * @module features/signals/hooks/useReports
 * @description
 * Hooks for buyers to report signals they've purchased.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createReport, checkReportExists } from '../api/reports.api';
import type { CreateReportInput } from '../api/reports.api';
import { useAuthStore } from '@/features/auth/store';

// ============================================
// Query Key Factory
// ============================================

export const reportKeys = {
  all: ['reports'] as const,
  check: (tokenId: number) => [...reportKeys.all, 'check', tokenId] as const,
};

// ============================================
// Hooks
// ============================================

/**
 * Hook to check if a report exists for a token ID
 * @param tokenId - SignalKeyNFT token ID
 */
export function useCheckReport(tokenId: number | undefined) {
  const hasHydrated = useAuthStore((s) => s._hasHydrated);
  const token = useAuthStore((s) => s.token);
  
  return useQuery({
    queryKey: reportKeys.check(tokenId ?? 0),
    queryFn: () => checkReportExists(tokenId!),
    enabled: hasHydrated && !!token && tokenId !== undefined && tokenId > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to create a report for a purchased signal
 */
export function useCreateReport() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateReportInput) => createReport(data),
    onSuccess: (_data, variables) => {
      // Invalidate the check query for this token
      queryClient.invalidateQueries({ 
        queryKey: reportKeys.check(variables.tokenId) 
      });
      // Invalidate admin reports list so it refreshes
      queryClient.invalidateQueries({ 
        queryKey: ['admin', 'reports'] 
      });
    },
  });
}
