/**
 * @fileoverview Signal creation and management API functions
 * @module features/predictors/api/signals
 * @description
 * API functions for signal CRUD operations for predictors:
 * - Create new signals
 * - Update existing signals
 * - Deactivate signals
 * 
 * Used by predictors from their dashboard.
 */

import { apiClient } from '@/shared/api';
import { API_CONFIG } from '@/shared/config';
import type { Signal, ApiResponse, CreateSignalData } from '@/shared/types';

/**
 * Create a new signal
 * 
 * @param data - Signal creation data
 * @returns Created signal object
 * 
 * @example
 * const signal = await createSignal({
 *   title: 'BTC Breakout Alert',
 *   description: 'Analysis shows potential breakout...',
 *   content: 'Full analysis with entry, target, stop-loss...',
 *   categoryId: '507f1f77bcf86cd799439011',
 *   priceUsdt: 25,
 *   expiryDays: 7
 * });
 */
export async function createSignal(data: CreateSignalData): Promise<Signal> {
  const response = await apiClient.post<ApiResponse<Signal>>(
    API_CONFIG.ENDPOINTS.SIGNALS,
    data
  );
  return response.data.data;
}

/**
 * Update an existing signal
 * Can only update signals you own
 * 
 * @param contentId - Signal's content ID
 * @param data - Fields to update
 * @returns Updated signal object
 * 
 * @example
 * const updated = await updateSignal('abc123', {
 *   description: 'Updated description',
 *   priceUsdt: 30
 * });
 */
export async function updateSignal(
  contentId: string,
  data: Partial<Omit<CreateSignalData, 'expiryDays'>>
): Promise<Signal> {
  const response = await apiClient.put<ApiResponse<Signal>>(
    API_CONFIG.ENDPOINTS.SIGNAL_BY_ID(contentId),
    data
  );
  return response.data.data;
}

/**
 * Deactivate a signal (soft delete)
 * Signal is hidden from marketplace but data is preserved
 * Buyers who purchased can still access content
 * 
 * @param contentId - Signal's content ID
 * @returns Success message
 * 
 * @example
 * await deactivateSignal('abc123');
 */
export async function deactivateSignal(contentId: string): Promise<{ message: string }> {
  const response = await apiClient.delete<ApiResponse<{ message: string }>>(
    API_CONFIG.ENDPOINTS.SIGNAL_BY_ID(contentId)
  );
  return response.data.data;
}

/**
 * Reactivate a deactivated signal
 * Signal becomes visible on marketplace again
 * 
 * @param contentId - Signal's content ID
 * @returns Updated signal object
 * 
 * @example
 * const reactivated = await reactivateSignal('abc123');
 */
export async function reactivateSignal(contentId: string): Promise<Signal> {
  const response = await apiClient.put<ApiResponse<Signal>>(
    API_CONFIG.ENDPOINTS.SIGNAL_BY_ID(contentId),
    { isActive: true }
  );
  return response.data.data;
}

/**
 * Manually expire a signal (sets expiresAt to now)
 * Unlike deactivation, expired signals have their content made PUBLIC
 * for transparency and track record verification.
 * 
 * Use case: Prediction came true early, predictor wants to showcase it.
 * 
 * @param contentId - Signal's content ID
 * @returns Success message
 * 
 * @example
 * await expireSignal('abc123');
 */
export async function expireSignal(contentId: string): Promise<{ message: string }> {
  const response = await apiClient.post<ApiResponse<{ message: string }>>(
    `${API_CONFIG.ENDPOINTS.SIGNAL_BY_ID(contentId)}/expire`
  );
  return response.data.data;
}
