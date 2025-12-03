/**
 * @fileoverview Purchase-related API functions
 * @module features/signals/api/purchase
 * @description
 * API functions for the signal purchase flow including:
 * - Getting bytes32 content identifier for on-chain purchase
 * - Checking if user has purchased a signal
 * - Getting user's purchase receipts
 */

import { apiClient } from '@/shared/api';
import { API_CONFIG } from '@/shared/config';
import type { ApiResponse } from '@/shared/types';

/**
 * Response from content-identifier endpoint
 */
export interface ContentIdentifierResponse {
  contentIdentifier: `0x${string}`;
}

/**
 * Response from check purchase endpoint
 */
export interface CheckPurchaseResponse {
  hasPurchased: boolean;
  receipt?: {
    tokenId: number;
    contentId: string;
    purchasedAt: string;
    transactionHash: string;
  };
}

/**
 * Receipt from user's purchases
 */
export interface Receipt {
  tokenId: number;
  contentId: string;
  buyerAddress: string;
  predictorAddress: string;
  priceUsdt: number;
  purchasedAt: string;
  transactionHash: string;
  signal?: {
    title: string;
    description: string;
    category?: { name: string };
  };
}

/**
 * Fetch the bytes32 content identifier for on-chain purchase.
 * This is needed to call buySignalNFT on the smart contract.
 *
 * @param contentId - Signal's UUID content ID
 * @returns Promise resolving to the bytes32 hex string
 *
 * @example
 * const { contentIdentifier } = await fetchContentIdentifier('abc123-def456');
 * // Returns: '0x616263313233...'
 */
export async function fetchContentIdentifier(
  contentId: string
): Promise<ContentIdentifierResponse> {
  const response = await apiClient.get<ApiResponse<ContentIdentifierResponse>>(
    API_CONFIG.ENDPOINTS.SIGNAL_CONTENT_IDENTIFIER(contentId)
  );
  return response.data.data;
}

/**
 * Check if the authenticated user has purchased a specific signal.
 *
 * @param contentId - Signal's UUID content ID
 * @returns Promise resolving to purchase status and optional receipt
 *
 * @example
 * const { hasPurchased, receipt } = await checkPurchase('abc123');
 * if (hasPurchased) {
 *   console.log('Purchased at:', receipt?.purchasedAt);
 * }
 */
export async function checkPurchase(
  contentId: string
): Promise<CheckPurchaseResponse> {
  const response = await apiClient.get<ApiResponse<CheckPurchaseResponse>>(
    API_CONFIG.ENDPOINTS.RECEIPTS_CHECK(contentId)
  );
  return response.data.data;
}

/**
 * Fetch the authenticated user's purchase receipts.
 *
 * @param params - Optional pagination and sorting params
 * @returns Promise resolving to array of receipts
 *
 * @example
 * const receipts = await fetchMyReceipts({ page: 1, limit: 10 });
 */
export async function fetchMyReceipts(params?: {
  page?: number;
  limit?: number;
  sortBy?: 'purchasedAt' | 'priceUsdt';
  sortOrder?: 'asc' | 'desc';
}): Promise<Receipt[]> {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

  const url = queryParams.toString()
    ? `${API_CONFIG.ENDPOINTS.RECEIPTS_MINE}?${queryParams}`
    : API_CONFIG.ENDPOINTS.RECEIPTS_MINE;

  const response = await apiClient.get<ApiResponse<Receipt[]>>(url);
  return response.data.data;
}
