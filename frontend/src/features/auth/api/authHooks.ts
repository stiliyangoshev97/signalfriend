/**
 * Auth Hooks
 * 
 * React hooks for SIWE authentication flow.
 */

import { useMutation } from '@tanstack/react-query';
import { useAccount, useSignMessage, useDisconnect } from 'wagmi';
import { SiweMessage } from 'siwe';
import { useAuthStore } from '../store';
import * as authApi from './authApi';

/**
 * Hook for SIWE authentication flow
 * 
 * Handles the complete flow:
 * 1. Get nonce from backend
 * 2. Create and sign SIWE message
 * 3. Verify signature and get JWT
 */
export function useAuth() {
  const { address, chainId } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { disconnect } = useDisconnect();
  const { setAuth, logout: clearAuth, isAuthenticated, predictor } = useAuthStore();

  const authMutation = useMutation({
    mutationFn: async () => {
      if (!address || !chainId) {
        throw new Error('Wallet not connected');
      }

      // 1. Get nonce from backend
      const { nonce } = await authApi.getNonce(address);

      // 2. Create SIWE message
      const message = new SiweMessage({
        domain: window.location.host,
        address,
        statement: 'Sign in to SignalFriend',
        uri: window.location.origin,
        version: '1',
        chainId,
        nonce,
      });

      const messageString = message.prepareMessage();

      // 3. Sign message with wallet
      const signature = await signMessageAsync({ message: messageString });

      // 4. Verify signature with backend
      const { token, predictor } = await authApi.verifySignature({
        message: messageString,
        signature,
      });

      // 5. Store auth data
      setAuth(token, predictor);

      return { token, predictor };
    },
    onError: (error) => {
      console.error('Auth error:', error);
    },
  });

  const logout = () => {
    clearAuth();
    disconnect();
  };

  return {
    login: authMutation.mutate,
    loginAsync: authMutation.mutateAsync,
    logout,
    isLoading: authMutation.isPending,
    error: authMutation.error,
    isAuthenticated,
    predictor,
    address,
  };
}

export default useAuth;
