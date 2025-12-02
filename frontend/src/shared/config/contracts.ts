/**
 * Smart Contract Addresses
 * 
 * Contract addresses for SignalFriend on BNB Chain.
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
  
  // BNB Chain Mainnet (56) - TO BE DEPLOYED
  [CHAIN_IDS.BNB_MAINNET]: {
    SignalFriendMarket: '0x0000000000000000000000000000000000000000',
    PredictorAccessPass: '0x0000000000000000000000000000000000000000',
    SignalKeyNFT: '0x0000000000000000000000000000000000000000',
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
