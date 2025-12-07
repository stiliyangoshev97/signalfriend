/**
 * @fileoverview Reports API functions for buyers
 * @module features/signals/api/reports
 * @description
 * API functions for buyers to report signals they've purchased.
 * One report per purchase (tokenId) - can report each signal bought.
 */

import { apiClient } from '@/shared/api';
import { API_CONFIG } from '@/shared/config';
import type { ApiResponse } from '@/shared/types';

// ============================================
// Types
// ============================================

export const REPORT_REASONS = [
  'false_signal',
  'misleading_info',
  'scam',
  'duplicate_content',
  'other',
] as const;

export type ReportReason = (typeof REPORT_REASONS)[number];

export interface CreateReportInput {
  /** SignalKeyNFT token ID (proves ownership) */
  tokenId: number;
  /** Reason for the report */
  reason: ReportReason;
  /** Optional description (required if reason is "other") */
  description?: string;
}

export interface Report {
  _id: string;
  tokenId: number;
  contentId: string;
  reporterAddress: string;
  predictorAddress: string;
  reason: ReportReason;
  description: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  createdAt: string;
  updatedAt: string;
}

export interface ReportExistsResponse {
  exists: boolean;
  report?: Report;
}

// ============================================
// API Functions
// ============================================

/**
 * Create a report for a purchased signal
 * @param data - Report data with tokenId, reason, and optional description
 * @returns Created report
 */
export async function createReport(data: CreateReportInput): Promise<Report> {
  const response = await apiClient.post<ApiResponse<Report>>(
    API_CONFIG.ENDPOINTS.REPORTS,
    data
  );
  return response.data.data;
}

/**
 * Check if a report exists for a specific token ID
 * @param tokenId - SignalKeyNFT token ID
 * @returns Whether a report exists and the report if so
 */
export async function checkReportExists(tokenId: number): Promise<ReportExistsResponse> {
  const response = await apiClient.get<ApiResponse<ReportExistsResponse>>(
    API_CONFIG.ENDPOINTS.REPORT_CHECK(tokenId)
  );
  return response.data.data;
}

/**
 * Get human-readable label for report reason
 */
export function getReportReasonLabel(reason: ReportReason): string {
  const labels: Record<ReportReason, string> = {
    false_signal: 'False Signal',
    misleading_info: 'Misleading Information',
    scam: 'Scam',
    duplicate_content: 'Duplicate Content',
    other: 'Other',
  };
  return labels[reason];
}
