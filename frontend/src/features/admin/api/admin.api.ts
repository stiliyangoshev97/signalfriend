/**
 * @fileoverview Admin API functions
 * @module features/admin/api
 * @description
 * API functions for admin dashboard operations.
 * Used with React Query for data fetching and caching.
 */

import { apiClient } from '@/shared/api';
import { API_CONFIG } from '@/shared/config';
import type { ApiResponse } from '@/shared/types';
import type {
  PlatformEarnings,
  AdminReportsResponse,
  AdminReport,
  ListReportsQuery,
  UpdateReportRequest,
  AdminDisputesResponse,
  AdminDispute,
  DisputeCounts,
  ListDisputesQuery,
  UpdateDisputeRequest,
  PendingVerification,
} from '../types';

// ============================================
// Platform Earnings
// ============================================

/**
 * Fetch platform earnings breakdown
 * @returns Platform earnings data
 */
export async function fetchPlatformEarnings(): Promise<PlatformEarnings> {
  const response = await apiClient.get<ApiResponse<PlatformEarnings>>(
    '/api/admin/stats'
  );
  return response.data.data;
}

// ============================================
// Reports API
// ============================================

/**
 * Build query string for reports list
 */
function buildReportsQueryString(query: ListReportsQuery): string {
  const params = new URLSearchParams();
  if (query.page) params.append('page', query.page.toString());
  if (query.limit) params.append('limit', query.limit.toString());
  if (query.status) params.append('status', query.status);
  if (query.predictorAddress) params.append('predictorAddress', query.predictorAddress);
  return params.toString();
}

/**
 * Fetch all reports for admin review
 * @param query - Pagination and filter options
 */
export async function fetchReports(query: ListReportsQuery = {}): Promise<AdminReportsResponse> {
  const queryString = buildReportsQueryString(query);
  const url = queryString ? `/api/admin/reports?${queryString}` : '/api/admin/reports';
  const response = await apiClient.get<ApiResponse<AdminReportsResponse>>(url);
  return response.data.data;
}

/**
 * Fetch a single report by ID
 * @param reportId - Report document ID
 */
export async function fetchReportById(reportId: string): Promise<AdminReport> {
  const response = await apiClient.get<ApiResponse<AdminReport>>(
    `/api/admin/reports/${reportId}`
  );
  return response.data.data;
}

/**
 * Update a report's status
 * @param reportId - Report document ID
 * @param data - New status and optional admin notes
 */
export async function updateReport(
  reportId: string,
  data: UpdateReportRequest
): Promise<AdminReport> {
  const response = await apiClient.put<ApiResponse<AdminReport>>(
    `/api/admin/reports/${reportId}`,
    data
  );
  return response.data.data;
}

// ============================================
// Disputes API
// ============================================

/**
 * Build query string for disputes list
 */
function buildDisputesQueryString(query: ListDisputesQuery): string {
  const params = new URLSearchParams();
  if (query.page) params.append('page', query.page.toString());
  if (query.limit) params.append('limit', query.limit.toString());
  if (query.status) params.append('status', query.status);
  return params.toString();
}

/**
 * Fetch all disputes for admin review
 * @param query - Pagination and filter options
 */
export async function fetchDisputes(query: ListDisputesQuery = {}): Promise<AdminDisputesResponse> {
  const queryString = buildDisputesQueryString(query);
  const url = queryString ? `/api/admin/disputes?${queryString}` : '/api/admin/disputes';
  const response = await apiClient.get<ApiResponse<AdminDisputesResponse>>(url);
  return response.data.data;
}

/**
 * Fetch dispute counts by status
 */
export async function fetchDisputeCounts(): Promise<DisputeCounts> {
  const response = await apiClient.get<ApiResponse<DisputeCounts>>(
    '/api/admin/disputes/counts'
  );
  return response.data.data;
}

/**
 * Update a dispute's status
 * @param disputeId - Dispute document ID
 * @param data - New status and optional admin notes
 */
export async function updateDispute(
  disputeId: string,
  data: UpdateDisputeRequest
): Promise<AdminDispute> {
  const response = await apiClient.put<ApiResponse<AdminDispute>>(
    `/api/admin/disputes/${disputeId}`,
    data
  );
  return response.data.data;
}

/**
 * Resolve a dispute (unblacklists predictor)
 * @param disputeId - Dispute document ID
 * @param adminNotes - Optional admin notes
 */
export async function resolveDispute(
  disputeId: string,
  adminNotes?: string
): Promise<AdminDispute> {
  const response = await apiClient.post<ApiResponse<AdminDispute>>(
    `/api/admin/disputes/${disputeId}/resolve`,
    { adminNotes }
  );
  return response.data.data;
}

// ============================================
// Verifications API
// ============================================

/**
 * Fetch pending verification requests
 */
export async function fetchPendingVerifications(): Promise<PendingVerification[]> {
  const response = await apiClient.get<ApiResponse<PendingVerification[]>>(
    API_CONFIG.ENDPOINTS.ADMIN_PENDING_VERIFICATIONS
  );
  return response.data.data;
}

/**
 * Approve or reject a predictor's verification request
 * @param address - Predictor wallet address
 * @param approved - Whether to approve
 */
export async function updateVerification(
  address: string,
  approved: boolean
): Promise<void> {
  await apiClient.post(API_CONFIG.ENDPOINTS.ADMIN_VERIFY(address), { approved });
}

// ============================================
// Predictor Blacklist API
// ============================================

/**
 * Toggle a predictor's blacklist status
 * @param address - Predictor wallet address
 * @param isBlacklisted - New blacklist status
 */
export async function updateBlacklist(
  address: string,
  isBlacklisted: boolean
): Promise<void> {
  await apiClient.put(API_CONFIG.ENDPOINTS.ADMIN_BLACKLIST(address), { isBlacklisted });
}
