/**
 * Explorer URL Utilities
 *
 * Provides functions to generate correct BscScan explorer URLs
 * based on the configured chain ID (mainnet vs testnet).
 *
 * @module shared/utils/explorer
 *
 * USAGE:
 * ```tsx
 * import { getExplorerTxUrl, getExplorerAddressUrl } from '@/shared/utils/explorer';
 *
 * // Transaction link
 * <a href={getExplorerTxUrl(txHash)}>View Transaction</a>
 *
 * // Address link
 * <a href={getExplorerAddressUrl(address)}>View Address</a>
 * ```
 */

import { env } from '@/shared/config/env';

/**
 * Gets the base explorer URL for the configured chain.
 *
 * @returns Base BscScan URL (mainnet or testnet)
 */
export function getExplorerBaseUrl(): string {
  return env.CHAIN_ID === 56
    ? 'https://bscscan.com'
    : 'https://testnet.bscscan.com';
}

/**
 * Generates a BscScan transaction URL.
 *
 * @param txHash - Transaction hash
 * @returns Full URL to view the transaction on BscScan
 *
 * @example
 * ```typescript
 * const url = getExplorerTxUrl('0x123...');
 * // Mainnet: https://bscscan.com/tx/0x123...
 * // Testnet: https://testnet.bscscan.com/tx/0x123...
 * ```
 */
export function getExplorerTxUrl(txHash: string): string {
  return `${getExplorerBaseUrl()}/tx/${txHash}`;
}

/**
 * Generates a BscScan address URL.
 *
 * @param address - Wallet or contract address
 * @returns Full URL to view the address on BscScan
 *
 * @example
 * ```typescript
 * const url = getExplorerAddressUrl('0xABC...');
 * // Mainnet: https://bscscan.com/address/0xABC...
 * // Testnet: https://testnet.bscscan.com/address/0xABC...
 * ```
 */
export function getExplorerAddressUrl(address: string): string {
  return `${getExplorerBaseUrl()}/address/${address}`;
}

/**
 * Generates a BscScan token URL.
 *
 * @param tokenAddress - Token contract address
 * @returns Full URL to view the token on BscScan
 */
export function getExplorerTokenUrl(tokenAddress: string): string {
  return `${getExplorerBaseUrl()}/token/${tokenAddress}`;
}
