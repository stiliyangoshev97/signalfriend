/**
 * Auth API Functions
 * 
 * API calls for SIWE authentication.
 */

import { apiClient } from '../../../shared/api';
import { API_CONFIG } from '../../../shared/config';
import type { AuthNonceResponse, AuthVerifyRequest, AuthVerifyResponse } from '../../../shared/types';

/**
 * Get a nonce for SIWE authentication
 */
export async function getNonce(address: string): Promise<AuthNonceResponse> {
  const response = await apiClient.get<AuthNonceResponse>(
    `${API_CONFIG.ENDPOINTS.AUTH_NONCE}?address=${address}`
  );
  return response.data;
}

/**
 * Verify SIWE signature and get JWT token
 */
export async function verifySignature(data: AuthVerifyRequest): Promise<AuthVerifyResponse> {
  const response = await apiClient.post<AuthVerifyResponse>(
    API_CONFIG.ENDPOINTS.AUTH_VERIFY,
    data
  );
  return response.data;
}
