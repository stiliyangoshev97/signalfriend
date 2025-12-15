/**
 * @fileoverview Contract addresses by chain ID.
 *
 * Defines contract addresses for each supported network.
 * The active addresses are selected based on CHAIN_ID env variable.
 *
 * Supported Networks:
 * - 97: BNB Testnet (tBNB)
 * - 56: BNB Mainnet
 *
 * @module contracts/addresses
 */
import type { Address } from "viem";
import { env } from "../shared/config/env.js";

/** Supported chain IDs */
export type ChainId = 97 | 56;

/** Network names for display */
export const NETWORK_NAMES: Record<ChainId, string> = {
  97: "BNB Testnet",
  56: "BNB Mainnet",
} as const;

/** Contract address structure */
export interface ContractAddresses {
  signalFriendMarket: Address;
  predictorAccessPass: Address;
  signalKeyNFT: Address;
  usdt: Address; // MockUSDT on testnet, real USDT on mainnet
}

/**
 * Contract addresses for each supported network.
 *
 * IMPORTANT: Update mainnet addresses after mainnet deployment!
 */
export const contractAddresses: Record<ChainId, ContractAddresses> = {
  // BNB Testnet (Chain ID 97)
  97: {
    signalFriendMarket: "0x5133397a4B9463c5270beBa05b22301e6dD184ca",
    predictorAccessPass: "0x10EB1A238Db78b763ec97e326b800D7A7AcA3fC4",
    signalKeyNFT: "0xfb26Df6101e1a52f9477f52F54b91b99fb016aed",
    usdt: "0xF87d17a5ca95F3f992f82Baabf4eBC5301A178a5", // MockUSDT
  },
  // BNB Mainnet (Chain ID 56) - Deployed December 15, 2025
  56: {
    signalFriendMarket: "0xAebec2Cd5c2dB4c0875de215515B3060a7a652FB",
    predictorAccessPass: "0x198Cd0549A0Dba09Aa3aB88e0B51CEb8dd335d07",
    signalKeyNFT: "0x2A5F920133e584773Ef4Ac16260c2F954824491f",
    usdt: "0x55d398326f99059fF775485246999027B3197955", // Official BSC USDT
  },
};

/** Zero address for validation */
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

/**
 * Checks if the current network is testnet.
 * @returns True if running on BNB Testnet (chain ID 97)
 */
export function isTestnet(): boolean {
  return env.CHAIN_ID === 97;
}

/**
 * Checks if the current network is mainnet.
 * @returns True if running on BNB Mainnet (chain ID 56)
 */
export function isMainnet(): boolean {
  return env.CHAIN_ID === 56;
}

/**
 * Gets the current network name.
 * @returns Human-readable network name
 */
export function getNetworkName(): string {
  return NETWORK_NAMES[env.CHAIN_ID as ChainId] || `Unknown (${env.CHAIN_ID})`;
}

/**
 * Gets contract addresses for the specified chain ID.
 * Validates that addresses are properly configured for mainnet.
 *
 * @param chainId - The blockchain chain ID
 * @returns Contract addresses for the specified chain
 * @throws Error if chain ID is unsupported or mainnet addresses not configured
 */
export function getAddresses(chainId: number): ContractAddresses {
  const addresses = contractAddresses[chainId as ChainId];

  if (!addresses) {
    throw new Error(
      `Unsupported chain ID: ${chainId}. Supported: ${Object.keys(contractAddresses).join(", ")}`
    );
  }

  // Validate mainnet addresses are not zeros (except USDT which is pre-configured)
  if (chainId === 56) {
    const unsetContracts: string[] = [];

    if (addresses.signalFriendMarket === ZERO_ADDRESS) {
      unsetContracts.push("signalFriendMarket");
    }
    if (addresses.predictorAccessPass === ZERO_ADDRESS) {
      unsetContracts.push("predictorAccessPass");
    }
    if (addresses.signalKeyNFT === ZERO_ADDRESS) {
      unsetContracts.push("signalKeyNFT");
    }

    if (unsetContracts.length > 0) {
      throw new Error(
        `Mainnet contract addresses not configured: ${unsetContracts.join(", ")}. ` +
        `Please deploy contracts to mainnet and update addresses.ts`
      );
    }
  }

  return addresses;
}

/**
 * Gets contract addresses for the current environment.
 * Uses CHAIN_ID from environment variables.
 *
 * @returns Contract addresses for the current chain
 */
export function getCurrentAddresses(): ContractAddresses {
  return getAddresses(env.CHAIN_ID);
}
