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

import { useMutation, useQuery } from '@tanstack/react-query';
import { useAccount, useSignMessage, useDisconnect } from 'wagmi';
import { SiweMessage } from 'siwe';
import { useAuthStore } from '../store';
import * as authApi from './authApi';
import { useEffect, useRef } from 'react';
import { router } from '@/router';

/**
 * Hook to validate and sync session on app mount/reconnect
 * 
 * Handles the case where:
 * - Page refreshes and zustand has stored auth
 * - But wagmi is still reconnecting
 * - Or the token might have expired
 * - Or user switched wallets without disconnecting
 * 
 * This hook:
 * 1. Waits for wagmi to finish connecting
 * 2. Validates the stored token with the backend
 * 3. Clears auth if token is invalid or wallet changed
 * 4. IMMEDIATELY clears auth AND redirects to home if wallet address changes
 *    (prevents JWT/wallet mismatch and stale data from previous wallet)
 */
export function useSessionSync() {
  const { address, isConnected, status } = useAccount();
  const { token, logout } = useAuthStore();
  
  // Track the previous address to detect wallet switches
  // Only track when user is authenticated to avoid false positives
  const previousAddressRef = useRef<string | undefined>(undefined);
  
  // Track if we've already handled a wallet change (to prevent duplicate redirects)
  const hasHandledWalletChangeRef = useRef<boolean>(false);
  
  // Check if wagmi is still initializing (connecting/reconnecting)
  const isWagmiInitializing = status === 'connecting' || status === 'reconnecting';
  
  // CRITICAL: Auto-logout on wallet address change
  // This prevents JWT/wallet mismatch where backend auth uses old wallet
  // but blockchain transactions use new wallet
  useEffect(() => {
    // Skip during initial connection
    if (isWagmiInitializing) return;
    
    // Reset the wallet change handler when user signs in again
    if (token && hasHandledWalletChangeRef.current) {
      hasHandledWalletChangeRef.current = false;
    }
    
    // Only track addresses when user is authenticated
    // This prevents false wallet change detection when browsing without auth
    if (token && address) {
      // Initialize previous address when first authenticated
      if (previousAddressRef.current === undefined) {
        previousAddressRef.current = address.toLowerCase();
        return;
      }
      
      // Detect wallet switch: address changed while authenticated
      if (
        previousAddressRef.current !== address.toLowerCase() &&
        !hasHandledWalletChangeRef.current
      ) {
        console.log('[Auth] Wallet changed while authenticated, logging out');
        console.log(`[Auth] Previous: ${previousAddressRef.current}, New: ${address.toLowerCase()}`);
        hasHandledWalletChangeRef.current = true;
        logout();
        // Navigate to home page to force fresh data load with new wallet
        router.navigate('/');
        return;
      }
    }
    
    // Clear previous address when user logs out (no token)
    // This ensures we don't falsely detect a "wallet change" when navigating
    // between pages without being authenticated
    if (!token) {
      previousAddressRef.current = undefined;
    }
  }, [address, token, logout, isWagmiInitializing]);
  
  // Validate token with backend when we have a token and are connected
  const { data: sessionData, isError: sessionInvalid, isLoading: isValidating } = useQuery({
    queryKey: ['auth', 'session', token],
    queryFn: () => authApi.validateSession(),
    enabled: !!token && isConnected && !isWagmiInitializing,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime)
  });
  
  // Clear auth if session is invalid (token expired, etc.)
  useEffect(() => {
    if (sessionInvalid && token) {
      logout();
    }
  }, [sessionInvalid, token, logout]);
  
  // Clear auth if wallet address from JWT doesn't match connected wallet
  // This is a secondary check after backend validation
  useEffect(() => {
    if (
      isConnected && 
      !isWagmiInitializing && 
      sessionData?.address && 
      address &&
      sessionData.address.toLowerCase() !== address.toLowerCase()
    ) {
      console.log('[Auth] JWT address mismatch with connected wallet, logging out');
      logout();
    }
  }, [isConnected, isWagmiInitializing, sessionData?.address, address, logout]);
  
  // Clear auth if wallet disconnected but we still have auth state
  // IMPORTANT: Only do this AFTER wagmi has finished initializing
  useEffect(() => {
    if (!isWagmiInitializing && !isConnected && token) {
      logout();
    }
  }, [isWagmiInitializing, isConnected, token, logout]);
  
  return {
    /** True while wagmi is reconnecting or we're validating the session */
    isLoading: isWagmiInitializing || (!!token && isValidating),
    /** True if session validation failed */
    isSessionInvalid: sessionInvalid,
  };
}

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
