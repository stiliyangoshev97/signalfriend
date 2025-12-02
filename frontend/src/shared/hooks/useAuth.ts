/**
 * useAuth Hook
 * 
 * Custom hook for authentication state and actions.
 * Combines Zustand auth store with wagmi wallet state.
 */

import { useCallback, useState } from 'react';
import { useAccount, useDisconnect, useSignMessage } from 'wagmi';
import { useAuthStore } from '@/features/auth/store';
import { apiClient } from '@/shared/api';
import type { AuthNonceResponse, AuthVerifyResponse } from '@/shared/types';

/**
 * Authentication hook that provides:
 * - Current auth state (isAuthenticated, predictor, token)
 * - Wallet connection state
 * - Login/logout actions
 */
export function useAuth() {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { disconnect } = useDisconnect();
  
  // Local loading and error state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const {
    token,
    predictor,
    isAuthenticated,
    setAuth,
    logout: storeLogout,
  } = useAuthStore();

  /**
   * Login with wallet signature
   * 1. Get nonce from backend
   * 2. Sign message with wallet
   * 3. Verify signature and get JWT
   */
  const login = useCallback(async () => {
    if (!address || !isConnected) {
      setError('Wallet not connected');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Step 1: Get nonce
      const nonceResponse = await apiClient.get<{ data: AuthNonceResponse }>(
        `/auth/nonce?walletAddress=${address}`
      );
      const { nonce } = nonceResponse.data.data;

      // Step 2: Create and sign message
      const message = `Sign this message to authenticate with SignalFriend.\n\nNonce: ${nonce}\nWallet: ${address}`;
      const signature = await signMessageAsync({ message });

      // Step 3: Verify signature
      const verifyResponse = await apiClient.post<{ data: AuthVerifyResponse }>(
        '/auth/verify',
        { message, signature }
      );

      const { token: authToken, predictor: predictorData } = verifyResponse.data.data;

      // Step 4: Store auth state
      setAuth(authToken, predictorData);

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [address, isConnected, signMessageAsync, setAuth]);

  /**
   * Logout - clear auth state and disconnect wallet
   */
  const logout = useCallback(() => {
    storeLogout();
    disconnect();
  }, [storeLogout, disconnect]);

  /**
   * Check if current user is a verified predictor
   */
  const isPredictor = predictor?.isVerified ?? false;

  /**
   * Check if wallet address matches an admin address
   * Note: Admin check should be done server-side for security
   */
  const isAdmin = false; // TODO: Implement admin check

  return {
    // State
    address,
    isConnected,
    isAuthenticated,
    isLoading,
    error,
    predictor,
    token,
    isPredictor,
    isAdmin,
    
    // Actions
    login,
    logout,
    clearError: () => setError(null),
  };
}
