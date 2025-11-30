import type { Address } from "viem";

export interface NonceResponse {
  nonce: string;
}

export interface VerifyResponse {
  token: string;
  address: Address;
}

// In-memory nonce store (use Redis in production)
export interface NonceStore {
  [address: string]: {
    nonce: string;
    expiresAt: number;
  };
}
