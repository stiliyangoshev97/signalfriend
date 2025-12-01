/**
 * @fileoverview Viem client configuration for blockchain interactions.
 *
 * Creates and exports a public client for read-only blockchain operations.
 * The client is configured based on CHAIN_ID environment variable.
 *
 * Supported Networks:
 * - 97: BNB Testnet
 * - 56: BNB Mainnet
 *
 * @module contracts/clients
 */
import { createPublicClient, http } from "viem";
import { bscTestnet, bsc } from "viem/chains";
import { env } from "../shared/config/env.js";
import { getNetworkName, type ChainId } from "./addresses.js";

/** Chain configuration mapping */
const chains = {
  97: bscTestnet,
  56: bsc,
} as const;

/**
 * Creates a viem public client for the current network.
 *
 * @returns Configured public client for blockchain reads
 * @throws Error if CHAIN_ID is not supported
 */
export function getPublicClient() {
  const chain = chains[env.CHAIN_ID as ChainId];

  if (!chain) {
    throw new Error(
      `Unsupported chain ID: ${env.CHAIN_ID}. Supported: ${Object.keys(chains).join(", ")}`
    );
  }

  return createPublicClient({
    chain,
    transport: http(env.RPC_URL),
  });
}

/**
 * Pre-configured public client for the current environment.
 * Use this for all read-only blockchain operations.
 */
export const publicClient = getPublicClient();

// Log network info on startup (only in development)
if (env.NODE_ENV === "development") {
  console.log(`🔗 Blockchain: ${getNetworkName()} (Chain ID: ${env.CHAIN_ID})`);
}
