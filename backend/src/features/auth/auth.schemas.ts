/**
 * @fileoverview Zod validation schemas for Authentication endpoints.
 *
 * Defines schemas for SIWE (Sign-In with Ethereum) authentication:
 * - Nonce request validation (wallet address format)
 * - Signature verification request validation
 *
 * @module features/auth/auth.schemas
 */
// filepath: /Users/stiliyangoshev/Desktop/Coding/Full Projects/SignalFriend/backend/src/features/auth/auth.schemas.ts
import { z } from "zod";

/**
 * Schema for GET /api/auth/nonce query parameters.
 * Validates the Ethereum address format (0x + 40 hex characters).
 */
export const getNonceSchema = z.object({
  /** Ethereum wallet address requesting a nonce */
  address: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address"),
});

/**
 * Schema for POST /api/auth/verify request body.
 * Validates SIWE message and signature for authentication.
 */
export const verifySchema = z.object({
  /** The SIWE message that was signed */
  message: z.string().min(1, "Message is required"),
  /** The cryptographic signature of the message (0x + hex) */
  signature: z
    .string()
    .regex(/^0x[a-fA-F0-9]+$/, "Invalid signature format"),
});

/** Type for nonce request query parameters */
export type GetNonceInput = z.infer<typeof getNonceSchema>;
/** Type for verify request body */
export type VerifyInput = z.infer<typeof verifySchema>;
