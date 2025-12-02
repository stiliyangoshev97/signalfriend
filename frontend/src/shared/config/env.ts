/**
 * Environment Configuration
 * 
 * Centralized access to all environment variables with type safety.
 * Uses Vite's import.meta.env for environment variable access.
 */

export const env = {
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
