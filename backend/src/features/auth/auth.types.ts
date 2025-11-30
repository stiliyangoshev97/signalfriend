/**
 * @fileoverview TypeScript type definitions for Authentication feature.
 *
 * Defines interfaces for:
 * - API response types (nonce, verify)
 * - Internal nonce storage structure
 *
 * @module features/auth/auth.types
 */
// filepath: /Users/stiliyangoshev/Desktop/Coding/Full Projects/SignalFriend/backend/src/features/auth/auth.types.ts
import type { Address } from "viem";

/**
 * Response type for GET /api/auth/nonce endpoint.
 */
export interface NonceResponse {
  /** Random nonce string for SIWE message */
  nonce: string;
}

/**
 * Response type for POST /api/auth/verify endpoint.
 */
export interface VerifyResponse {
  /** JWT token for authenticated requests */
  token: string;
  /** Verified wallet address */
  address: Address;
}

/**
 * In-memory nonce storage structure.
 * Maps wallet addresses to their nonce and expiration time.
 *
 * @note Use Redis in production for scalability and persistence
 */
export interface NonceStore {
  [address: string]: {
    /** The nonce value */
    nonce: string;
    /** Expiration timestamp in milliseconds */
    expiresAt: number;
  };
}
