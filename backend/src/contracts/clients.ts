import { createPublicClient, http } from "viem";
import { bscTestnet, bsc } from "viem/chains";
import { env } from "../shared/config/env.js";

const chains = {
  97: bscTestnet,
  56: bsc,
} as const;

export function getPublicClient() {
  const chain = chains[env.CHAIN_ID as keyof typeof chains];
  
  if (!chain) {
    throw new Error(`Unsupported chain ID: ${env.CHAIN_ID}`);
  }

  return createPublicClient({
    chain,
    transport: http(env.RPC_URL),
  });
}

export const publicClient = getPublicClient();
