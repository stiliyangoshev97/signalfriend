/**
 * Predictor Schemas
 * 
 * Zod schemas for predictor data.
 * Types are inferred from schemas - single source of truth.
 */

import { z } from 'zod';

// ===========================================
// Predictor Schema
// ===========================================

export const verificationStatusSchema = z.enum(['none', 'pending', 'verified', 'rejected']);

export const predictorSchema = z.object({
  walletAddress: z.string(),
  displayName: z.string().nullable(),
  bio: z.string().nullable(),
  avatarUrl: z.string().nullable(),
  isBlacklisted: z.boolean(),
  isVerified: z.boolean(),
  verificationStatus: verificationStatusSchema,
  totalSalesCount: z.number(),
  averageRating: z.number(),
  totalReviews: z.number(),
  joinedAt: z.string(),
  // Hidden fields (only visible to owner/admin)
  telegram: z.string().optional(),
  discord: z.string().optional(),
  preferredContact: z.enum(['telegram', 'discord']).optional(),
});

// ===========================================
// Update Profile Schema (for forms)
// ===========================================

export const updateProfileSchema = z.object({
  displayName: z
    .string()
    .min(3, 'Display name must be at least 3 characters')
    .max(30, 'Display name must be at most 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Display name can only contain letters, numbers, and underscores')
    .optional(),
  bio: z
    .string()
    .max(500, 'Bio must be at most 500 characters')
    .optional(),
  avatarUrl: z
    .string()
    .url('Must be a valid URL')
    .optional(),
  telegram: z
    .string()
    .max(100)
    .optional(),
  discord: z
    .string()
    .max(100)
    .optional(),
  preferredContact: z.enum(['telegram', 'discord']).optional(),
});

// ===========================================
// Inferred Types
// ===========================================

export type VerificationStatus = z.infer<typeof verificationStatusSchema>;
export type Predictor = z.infer<typeof predictorSchema>;
export type UpdateProfileData = z.infer<typeof updateProfileSchema>;
