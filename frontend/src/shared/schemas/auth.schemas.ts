import { z } from 'zod';

// ============================================================================
// Auth Schemas
// ============================================================================

/**
 * Login/Register request schema
 */
export const authRequestSchema = z.object({
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid wallet address'),
  signature: z.string(),
  message: z.string(),
});

export type AuthRequest = z.infer<typeof authRequestSchema>;

/**
 * Auth response schema
 */
export const authResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresIn: z.number(),
  user: z.object({
    id: z.string(),
    walletAddress: z.string(),
    role: z.enum(['user', 'predictor', 'admin']),
    createdAt: z.string().datetime(),
  }),
});

export type AuthResponse = z.infer<typeof authResponseSchema>;

/**
 * Refresh token request schema
 */
export const refreshTokenRequestSchema = z.object({
  refreshToken: z.string(),
});

export type RefreshTokenRequest = z.infer<typeof refreshTokenRequestSchema>;

/**
 * Nonce response schema (for wallet signing)
 */
export const nonceResponseSchema = z.object({
  nonce: z.string(),
  message: z.string(),
  expiresAt: z.string().datetime(),
});

export type NonceResponse = z.infer<typeof nonceResponseSchema>;

/**
 * User profile schema
 */
export const userProfileSchema = z.object({
  id: z.string(),
  walletAddress: z.string(),
  role: z.enum(['user', 'predictor', 'admin']),
  username: z.string().nullable(),
  avatarUrl: z.string().url().nullable(),
  bio: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type UserProfile = z.infer<typeof userProfileSchema>;

/**
 * Update profile request schema
 */
export const updateProfileRequestSchema = z.object({
  username: z.string().min(3).max(30).optional(),
  bio: z.string().max(500).optional(),
  avatarUrl: z.string().url().optional(),
});

export type UpdateProfileRequest = z.infer<typeof updateProfileRequestSchema>;
