/**
 * Smart Contract Addresses
 *
 * Deployed contract addresses for SignalFriend on BNB Chain.
 * Contains addresses for all chains the app supports.
 *
 * @module shared/config/contracts
 *
 * CONTRACTS:
 * - SignalFriendMarket   - Main marketplace contract (purchases, subscriptions)
 * - PredictorAccessPass  - ERC-721 NFT for predictor registration
 * - SignalKeyNFT         - ERC-721 receipt NFTs for signal purchases
 * - USDT                 - Payment token (MockUSDT on testnet, real on mainnet)
 *
 * CHAIN SUPPORT:
 * - BNB Chain Testnet (97)  - Development & testing
 * - BNB Chain Mainnet (56)  - Production (addresses TBD)
 *
 * USAGE EXAMPLES:
 * ```tsx
 * import { getContractAddresses, CONTRACT_ADDRESSES } from '@/shared/config';
 *
 * // Get addresses for current chain
 * function useContracts() {
 *   const { chainId } = useAccount();
 *   const addresses = getContractAddresses(chainId || 97);
 *   return addresses;
 * }
 *
 * // Direct access (when you know the chain)
 * const testnetMarket = CONTRACT_ADDRESSES[97].SignalFriendMarket;
 *
 * // With wagmi/viem
 * const { data } = useReadContract({
 *   address: addresses.SignalFriendMarket,
 *   abi: marketAbi,
 *   functionName: 'getSignalPrice',
 * });
 * ```
 *
 * UPDATING ADDRESSES:
 * When deploying new contracts:
 * 1. Update addresses in this file
 * 2. Update backend contracts/addresses.ts to match
 * 3. Verify contracts on BscScan
 *
 * @see deployment-addresses.txt in contracts/ for deployment history
 */

import { CHAIN_IDS } from './wagmi';

type ContractAddresses = {
  SignalFriendMarket: `0x${string}`;
  PredictorAccessPass: `0x${string}`;
  SignalKeyNFT: `0x${string}`;
  USDT: `0x${string}`;
};

/**
 * Contract addresses per chain
 */
export const CONTRACT_ADDRESSES: Record<number, ContractAddresses> = {
  // BNB Chain Testnet (97)
  [CHAIN_IDS.BNB_TESTNET]: {
    SignalFriendMarket: '0x5133397a4B9463c5270beBa05b22301e6dD184ca',
    PredictorAccessPass: '0x10EB1A238Db78b763ec97e326b800D7A7AcA3fC4',
    SignalKeyNFT: '0xfb26Df6101e1a52f9477f52F54b91b99fb016aed',
    USDT: '0xF87d17a5ca95F3f992f82Baabf4eBC5301A178a5', // MockUSDT on testnet
  },
  
  // BNB Chain Mainnet (56) - Deployed December 15, 2025
  [CHAIN_IDS.BNB_MAINNET]: {
    SignalFriendMarket: '0xAebec2Cd5c2dB4c0875de215515B3060a7a652FB',
    PredictorAccessPass: '0x198Cd0549A0Dba09Aa3aB88e0B51CEb8dd335d07',
    SignalKeyNFT: '0x2A5F920133e584773Ef4Ac16260c2F954824491f',
    USDT: '0x55d398326f99059fF775485246999027B3197955', // Real USDT on BSC
  },
} as const;

/**
 * Get contract addresses for the current chain
 */
export function getContractAddresses(chainId: number): ContractAddresses {
  const addresses = CONTRACT_ADDRESSES[chainId];
  
  if (!addresses) {
    throw new Error(`No contract addresses configured for chain ${chainId}`);
  }
  
  return addresses;
}
