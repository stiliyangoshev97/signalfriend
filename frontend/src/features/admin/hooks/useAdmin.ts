/**
 * @fileoverview React Query hooks for admin operations
 * @module features/admin/hooks
 * @description
 * Custom hooks for fetching and mutating admin data using React Query.
 * Provides caching, background refetching, and optimistic updates.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchPlatformEarnings,
  fetchReports,
  fetchReportById,
  updateReport,
  fetchDisputes,
  fetchDisputeCounts,
  updateDispute,
  resolveDispute,
  fetchPendingVerifications,
  updateVerification,
  updateBlacklist,
} from '../api';
import type {
  ListReportsQuery,
  UpdateReportRequest,
  ListDisputesQuery,
  UpdateDisputeRequest,
} from '../types';

// ============================================
// Query Key Factories
// ============================================

export const adminKeys = {
  all: ['admin'] as const,
  earnings: () => [...adminKeys.all, 'earnings'] as const,
  
  // Reports
  reports: () => [...adminKeys.all, 'reports'] as const,
  reportsList: (query: ListReportsQuery) => [...adminKeys.reports(), 'list', query] as const,
  reportDetail: (id: string) => [...adminKeys.reports(), 'detail', id] as const,
  
  // Disputes
  disputes: () => [...adminKeys.all, 'disputes'] as const,
  disputesList: (query: ListDisputesQuery) => [...adminKeys.disputes(), 'list', query] as const,
  disputeCounts: () => [...adminKeys.disputes(), 'counts'] as const,
  
  // Verifications
  verifications: () => [...adminKeys.all, 'verifications'] as const,
  pendingVerifications: () => [...adminKeys.verifications(), 'pending'] as const,
};

// ============================================
// Platform Earnings Hooks
// ============================================

/**
 * Hook to fetch platform earnings breakdown
 * @returns React Query result with earnings data
 */
export function usePlatformEarnings() {
  return useQuery({
    queryKey: adminKeys.earnings(),
    queryFn: fetchPlatformEarnings,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// ============================================
// Reports Hooks
// ============================================

/**
 * Hook to fetch paginated reports with optional filters
 * @param query - Pagination and filter options
 */
export function useReports(query: ListReportsQuery = {}) {
  return useQuery({
    queryKey: adminKeys.reportsList(query),
    queryFn: () => fetchReports(query),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Hook to fetch a single report by ID
 * @param reportId - Report document ID
 */
export function useReport(reportId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: adminKeys.reportDetail(reportId),
    queryFn: () => fetchReportById(reportId),
    enabled: options?.enabled !== false && !!reportId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to update a report's status
 */
export function useUpdateReport() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ reportId, data }: { reportId: string; data: UpdateReportRequest }) =>
      updateReport(reportId, data),
    onSuccess: (_data, variables) => {
      // Invalidate all report lists
      queryClient.invalidateQueries({ queryKey: adminKeys.reports() });
      // Also update the specific report in cache
      queryClient.invalidateQueries({ 
        queryKey: adminKeys.reportDetail(variables.reportId) 
      });
    },
  });
}

// ============================================
// Disputes Hooks
// ============================================

/**
 * Hook to fetch paginated disputes with optional filters
 * @param query - Pagination and filter options
 */
export function useDisputes(query: ListDisputesQuery = {}) {
  return useQuery({
    queryKey: adminKeys.disputesList(query),
    queryFn: () => fetchDisputes(query),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Hook to fetch dispute counts by status
 */
export function useDisputeCounts() {
  return useQuery({
    queryKey: adminKeys.disputeCounts(),
    queryFn: fetchDisputeCounts,
    staleTime: 1000 * 60 * 1, // 1 minute
  });
}

/**
 * Hook to update a dispute's status
 */
export function useUpdateDispute() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ disputeId, data }: { disputeId: string; data: UpdateDisputeRequest }) =>
      updateDispute(disputeId, data),
    onSuccess: () => {
      // Invalidate all dispute queries
      queryClient.invalidateQueries({ queryKey: adminKeys.disputes() });
    },
  });
}

/**
 * Hook to resolve a dispute (also unblacklists predictor)
 */
export function useResolveDispute() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ disputeId, adminNotes }: { disputeId: string; adminNotes?: string }) =>
      resolveDispute(disputeId, adminNotes),
    onSuccess: () => {
      // Invalidate all dispute queries
      queryClient.invalidateQueries({ queryKey: adminKeys.disputes() });
    },
  });
}

// ============================================
// Verifications Hooks
// ============================================

/**
 * Hook to fetch pending verification requests
 */
export function usePendingVerifications() {
  return useQuery({
    queryKey: adminKeys.pendingVerifications(),
    queryFn: fetchPendingVerifications,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Hook to approve or reject a verification request
 */
export function useUpdateVerification() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ address, approved }: { address: string; approved: boolean }) =>
      updateVerification(address, approved),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.pendingVerifications() });
    },
  });
}

// ============================================
// Blacklist Hooks
// ============================================

/**
 * Hook to update a predictor's blacklist status
 */
export function useUpdateBlacklist() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ address, isBlacklisted }: { address: string; isBlacklisted: boolean }) =>
      updateBlacklist(address, isBlacklisted),
    onSuccess: () => {
      // Invalidate disputes since blacklist status affects them
      queryClient.invalidateQueries({ queryKey: adminKeys.disputes() });
    },
  });
}
