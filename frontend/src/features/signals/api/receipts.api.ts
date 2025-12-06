/**
 * @fileoverview Receipt API Functions
 * @module features/signals/api/receipts.api
 * @description
 * API functions for fetching user's purchase receipts.
 */

import { apiClient } from '@/shared/api/apiClient';
import { API_CONFIG } from '@/shared/config/api.config';

/** Receipt from the API with full signal info (for My Signals page) */
export interface ReceiptWithSignalInfo {
  _id: string;
  tokenId: number;
  contentId: string;
  buyerAddress: string;
  predictorAddress: string;
  pricePaid: string;
  purchasedAt: string;
  transactionHash: string;
  signalId?: {
    _id: string;
    title: string;
    description?: string;
    categoryId?: {
      _id: string;
      name: string;
      slug: string;
      icon?: string;
    };
    predictorAddress: string;
  };
}

/** Pagination metadata */
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/** Response from getMyReceipts */
export interface MyReceiptsResponse {
  receipts: ReceiptWithSignalInfo[];
  pagination: PaginationMeta;
}

/** Query params for fetching receipts */
export interface GetMyReceiptsParams {
  page?: number;
  limit?: number;
  sortBy?: 'purchasedAt' | 'pricePaid';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Get the current user's purchase receipts.
 * Requires authentication.
 * 
 * @param params - Optional query parameters for pagination and sorting
 * @returns User's purchase receipts with pagination
 */
export async function getMyReceipts(params?: GetMyReceiptsParams): Promise<MyReceiptsResponse> {
  const response = await apiClient.get<{ success: boolean; data: ReceiptWithSignalInfo[]; pagination: PaginationMeta }>(
    API_CONFIG.ENDPOINTS.RECEIPTS_MINE,
    { params }
  );
  return {
    receipts: response.data.data,
    pagination: response.data.pagination,
  };
}

/**
 * Get all content IDs the user has purchased.
 * Useful for displaying "Purchased" badges on signal cards.
 * Handles pagination to fetch all receipts.
 * 
 * @returns Array of purchased content IDs
 */
export async function getMyPurchasedContentIds(): Promise<string[]> {
  const allContentIds: string[] = [];
  let page = 1;
  const limit = 50; // Backend max limit
  let hasMore = true;
  
  while (hasMore) {
    const response = await apiClient.get<{ success: boolean; data: ReceiptWithSignalInfo[]; pagination: PaginationMeta }>(
      API_CONFIG.ENDPOINTS.RECEIPTS_MINE,
      { params: { limit, page } }
    );
    
    const receipts = response.data.data;
    allContentIds.push(...receipts.map(receipt => receipt.contentId));
    
    // Check if there are more pages
    const pagination = response.data.pagination;
    hasMore = page < pagination.totalPages;
    page++;
  }
  
  return allContentIds;
}
