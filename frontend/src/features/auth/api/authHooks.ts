/**
 * Auth Hooks
 *
 * React hooks for Sign-In with Ethereum (SIWE) authentication flow.
 * Handles the complete wallet authentication lifecycle.
 *
 * @module features/auth/api/authHooks
 *
 * AUTHENTICATION FLOW:
 * 1. User connects wallet via RainbowKit
 * 2. Frontend requests nonce from backend (GET /api/auth/nonce)
 * 3. Frontend creates SIWE message with nonce, domain, chainId, etc.
 * 4. User signs message with their wallet
 * 5. Frontend sends message + signature to backend (POST /api/auth/verify)
 * 6. Backend verifies signature and returns JWT + predictor data
 * 7. JWT and predictor stored in Zustand (persisted to localStorage)
 *
 * SIWE MESSAGE STRUCTURE:
 * ```
 * example.com wants you to sign in with your Ethereum account:
 * 0x1234...
 *
 * Sign in to SignalFriend - Web3 Signal Marketplace
 *
 * URI: https://example.com
 * Version: 1
 * Chain ID: 97
 * Nonce: abc123
 * Issued At: 2025-12-03T12:00:00.000Z
 * ```
 *
 * USAGE EXAMPLES:
 * ```tsx
 * function LoginButton() {
 *   const { isConnected, isAuthenticated, login, logout, isLoading } = useAuth();
 *
 *   if (!isConnected) {
 *     return <ConnectButton />;
 *   }
 *
 *   if (!isAuthenticated) {
 *     return (
 *       <Button onClick={() => login()} disabled={isLoading}>
 *         {isLoading ? 'Signing...' : 'Sign In'}
 *       </Button>
 *     );
 *   }
 *
 *   return <Button onClick={logout}>Sign Out</Button>;
 * }
 *
 * // Access predictor data
 * function Profile() {
 *   const { predictor, isAuthenticated } = useAuth();
 *
 *   if (!isAuthenticated) return <Redirect to="/login" />;
 *
 *   return <h1>Welcome, {predictor?.displayName}</h1>;
 * }
 * ```
 *
 * RETURN VALUES:
 * - address         - Connected wallet address (from wagmi)
 * - isConnected     - Wallet connection status (from wagmi)
 * - isAuthenticated - SIWE authentication status (from store)
 * - isLoading       - Authentication in progress
 * - error           - Last authentication error
 * - predictor       - Predictor profile (null if not registered)
 * - token           - JWT token (for API calls)
 * - login           - Trigger login flow (mutate)
 * - loginAsync      - Trigger login flow (returns promise)
 * - logout          - Clear auth and disconnect wallet
 *
 * SECURITY:
 * - Nonce prevents replay attacks
 * - Domain binding prevents phishing
 * - ChainId ensures correct network
 * - JWT has expiration (24h default)
 */

import { useMutation } from '@tanstack/react-query';
// ...existing code...
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
  const { address, chainId, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { disconnect } = useDisconnect();
  const { setAuth, logout: clearAuth, isAuthenticated, predictor, token } = useAuthStore();

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
        statement: 'Sign in to SignalFriend - Web3 Signal Marketplace',
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
    // State
    address,
    isConnected,
    isAuthenticated,
    isLoading: authMutation.isPending,
    error: authMutation.error,
    predictor,
    token,
    
    // Actions
    login: authMutation.mutate,
    loginAsync: authMutation.mutateAsync,
    logout,
  };
}

export default useAuth;
