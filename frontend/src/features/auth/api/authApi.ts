/**
 * Auth API Functions
 *
 * Low-level API calls for SIWE (Sign-In with Ethereum) authentication.
 * These functions are used by the useAuth hook.
 *
 * @module features/auth/api/authApi
 *
 * API ENDPOINTS:
 * - GET  /api/auth/nonce?address=0x...  - Get challenge nonce
 * - POST /api/auth/verify               - Verify signature, get JWT
 *
 * RESPONSE FORMAT:
 * All endpoints return: { success: boolean, data: T }
 * These functions unwrap the response and return just the data.
 *
 * USAGE:
 * These functions are typically not called directly.
 * Use the `useAuth` hook instead for the complete authentication flow.
 *
 * ```tsx
 * // Direct usage (not recommended)
 * import { getNonce, verifySignature } from '@/features/auth/api';
 *
 * const { nonce } = await getNonce('0x1234...');
 * const { token, predictor } = await verifySignature({
 *   message: siweMessage,
 *   signature: '0xsig...'
 * });
 *
 * // Recommended usage
 * import { useAuth } from '@/features/auth';
 *
 * const { login } = useAuth();
 * login(); // Handles everything
 * ```
 *
 * ERROR HANDLING:
 * Errors are thrown and should be caught by the calling code.
 * Common errors:
 * - Network errors (API unreachable)
 * - Invalid signature
 * - Expired nonce
 * - Rate limiting
 */

import { apiClient } from '../../../shared/api';
// ...existing code...
import { API_CONFIG } from '../../../shared/config';
import type { AuthNonceResponse, AuthVerifyRequest, AuthVerifyResponse, ApiResponse } from '../../../shared/types';

/**
 * Get a nonce for SIWE authentication
 */
export async function getNonce(address: string): Promise<AuthNonceResponse> {
  const response = await apiClient.get<ApiResponse<AuthNonceResponse>>(
    `${API_CONFIG.ENDPOINTS.AUTH_NONCE}?address=${address}`
  );
  return response.data.data;
}

/**
 * Verify SIWE signature and get JWT token
 */
export async function verifySignature(data: AuthVerifyRequest): Promise<AuthVerifyResponse> {
  const response = await apiClient.post<ApiResponse<AuthVerifyResponse>>(
    API_CONFIG.ENDPOINTS.AUTH_VERIFY,
    data
  );
  return response.data.data;
}
