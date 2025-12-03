/**
 * Environment Configuration
 *
 * Centralized access to all environment variables with type safety.
 * Uses Vite's import.meta.env for environment variable access.
 *
 * @module shared/config/env
 *
 * VITE ENVIRONMENT VARIABLES:
 * All custom env vars must be prefixed with VITE_ to be exposed to the client.
 *
 * REQUIRED VARIABLES (Production):
 * - VITE_WALLETCONNECT_PROJECT_ID - WalletConnect Cloud project ID
 *
 * OPTIONAL VARIABLES:
 * - VITE_API_BASE_URL      - Backend API URL (default: http://localhost:3001)
 * - VITE_CHAIN_ID          - Default chain ID (default: 97 for BSC Testnet)
 * - VITE_SENTRY_DSN        - Sentry error tracking DSN
 * - VITE_ENABLE_TESTNET    - Enable testnet chains (default: false)
 *
 * USAGE EXAMPLES:
 * ```tsx
 * import { env } from '@/shared/config';
 *
 * // API calls
 * fetch(`${env.API_BASE_URL}/api/signals`);
 *
 * // Conditional features
 * if (env.IS_DEV) {
 *   console.log('Debug info...');
 * }
 *
 * // Feature flags
 * if (env.ENABLE_TESTNET) {
 *   // Show testnet warning banner
 * }
 * ```
 *
 * SETUP:
 * 1. Copy .env.example to .env
 * 2. Fill in required values
 * 3. Restart dev server after changes
 *
 * SECURITY:
 * - Never put secrets in VITE_ variables (they're exposed to the browser)
 * - API keys should be for client-side only services (WalletConnect, Sentry)
 * - Sensitive operations should go through the backend
 */

export const env = {
// ...existing code...
  // API
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001',
  
  // Web3
  WALLETCONNECT_PROJECT_ID: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || '',
  CHAIN_ID: Number(import.meta.env.VITE_CHAIN_ID) || 97,
  
  // Sentry
  SENTRY_DSN: import.meta.env.VITE_SENTRY_DSN || '',
  
  // Feature Flags
  ENABLE_TESTNET: import.meta.env.VITE_ENABLE_TESTNET === 'true',
  
  // Environment
  IS_DEV: import.meta.env.DEV,
  IS_PROD: import.meta.env.PROD,
} as const;

// Validate required environment variables in production
if (env.IS_PROD) {
  const required = ['VITE_WALLETCONNECT_PROJECT_ID'] as const;
  
  for (const key of required) {
    if (!import.meta.env[key]) {
      console.error(`Missing required environment variable: ${key}`);
    }
  }
}
