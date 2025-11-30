import type { Address } from "viem";

export type { Address };

export type HexString = `0x${string}`;

export interface BlockchainEvent {
  blockNumber: bigint;
  transactionHash: HexString;
  logIndex: number;
}
