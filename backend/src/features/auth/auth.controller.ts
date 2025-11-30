/**
 * @fileoverview Express route handlers for Authentication endpoints.
 *
 * Provides controllers for SIWE authentication:
 * - GET /api/auth/nonce - Generate nonce for wallet
 * - POST /api/auth/verify - Verify signature, get JWT
 * - GET /api/auth/me - Get current authenticated user
 *
 * @module features/auth/auth.controller
 */
// filepath: /Users/stiliyangoshev/Desktop/Coding/Full Projects/SignalFriend/backend/src/features/auth/auth.controller.ts
import type { Request, Response } from "express";
import { AuthService } from "./auth.service.js";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import type { GetNonceInput, VerifyInput } from "./auth.schemas.js";

/**
 * GET /api/auth/nonce
 * Generates a cryptographic nonce for SIWE authentication.
 * The nonce is stored server-side and expires after 5 minutes.
 *
 * @query {string} address - Ethereum wallet address (0x format)
 * @returns {Object} JSON response with nonce string
 */
export const getNonce = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { address } = req.query as unknown as GetNonceInput;

  const result = AuthService.generateNonce(address);

  res.json({
    success: true,
    data: result,
  });
});

/**
 * POST /api/auth/verify
 * Verifies a SIWE message signature and returns a JWT token.
 * The nonce is consumed after successful verification.
 *
 * @body {string} message - The SIWE message that was signed
 * @body {string} signature - The cryptographic signature (0x format)
 * @returns {Object} JSON response with JWT token and verified address
 * @throws {401} If nonce is missing, expired, or invalid
 * @throws {400} If chain ID doesn't match expected network
 */
export const verify = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { message, signature } = req.body as VerifyInput;

  const result = await AuthService.verify(message, signature);

  res.json({
    success: true,
    data: result,
  });
});

/**
 * GET /api/auth/me
 * Returns the current authenticated user's wallet address.
 * Requires valid JWT token in Authorization header.
 *
 * @requires Authentication - Bearer token required
 * @returns {Object} JSON response with user's wallet address
 */
export const me = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  res.json({
    success: true,
    data: {
      address: req.user?.address,
    },
  });
});
