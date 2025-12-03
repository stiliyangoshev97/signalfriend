/**
 * Configuration Module Barrel Export
 *
 * Central export point for all application configuration.
 * Includes environment variables, API settings, and Web3 config.
 *
 * @module shared/config
 *
 * USAGE:
 * ```tsx
 * import { env, API_CONFIG, wagmiConfig, CHAIN_IDS } from '@/shared/config';
 *
 * // Environment
 * if (env.IS_DEV) console.log('Dev mode');
 *
 * // API calls
 * fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SIGNALS}`);
 *
 * // Chain IDs
 * if (chainId === CHAIN_IDS.BNB_TESTNET) { ... }
 *
 * // Contract addresses
 * const { market, predictorPass } = getContractAddresses(chainId);
 * ```
 *
 * EXPORTS:
 * - env                 - Environment variables (VITE_*)
 * - API_CONFIG          - API base URL and endpoints
 * - wagmiConfig         - Wagmi/RainbowKit configuration
 * - chains              - Configured blockchain chains
 * - CHAIN_IDS           - Chain ID constants (BNB_MAINNET, BNB_TESTNET)
 * - CONTRACT_ADDRESSES  - Deployed contract addresses by chain
 * - getContractAddresses - Helper to get addresses for current chain
 */

// Shared config exports
export { env } from './env';
export { API_CONFIG } from './api.config';
export { wagmiConfig, chains, CHAIN_IDS } from './wagmi';
export { CONTRACT_ADDRESSES, getContractAddresses } from './contracts';
export * from './abis';
