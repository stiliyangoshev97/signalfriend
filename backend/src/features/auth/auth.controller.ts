import type { Request, Response } from "express";
import { AuthService } from "./auth.service.js";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import type { GetNonceInput, VerifyInput } from "./auth.schemas.js";

/**
 * GET /auth/nonce
 * Generate a nonce for SIWE authentication
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
 * POST /auth/verify
 * Verify SIWE signature and return JWT
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
 * GET /auth/me
 * Get current authenticated user
 */
export const me = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  res.json({
    success: true,
    data: {
      address: req.user?.address,
    },
  });
});
