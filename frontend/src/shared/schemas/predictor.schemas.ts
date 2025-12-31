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
  _id: z.string().optional(),
  walletAddress: z.string(),
  tokenId: z.number().optional(),
  displayName: z.string().nullable(),
  displayNameChanged: z.boolean().optional(),
  bio: z.string().nullable(),
  avatarUrl: z.string().nullable(),
  socialLinks: z.object({
    twitter: z.string().optional(),
    telegram: z.string().optional(),
    discord: z.string().optional(),
  }).optional(),
  preferredContact: z.string().optional(),
  categoryIds: z.array(z.string()).optional(),
  totalSignals: z.number().optional(),
  totalSales: z.number().optional(),
  /** Total earnings from signal sales (95% of revenue) - for public display */
  totalEarnings: z.number().optional(),
  averageRating: z.number(),
  totalReviews: z.number(),
  isBlacklisted: z.boolean(),
  isVerified: z.boolean(),
  verificationStatus: verificationStatusSchema.optional(),
  salesAtLastApplication: z.number().optional(),
  earningsAtLastApplication: z.number().optional(),
  joinedAt: z.string(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  // Legacy field names (for backward compatibility)
  totalSalesCount: z.number().optional(),
  telegram: z.string().optional(),
  discord: z.string().optional(),
});

// ===========================================
// Update Profile Schema (for forms)
// ===========================================

/** Regex pattern to detect URLs/links in text */
const urlPattern = /(https?:\/\/|www\.|\.com|\.org|\.net|\.io|\.xyz|\.gg|t\.me|discord\.gg)/i;

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
    .refine((val) => !val || !urlPattern.test(val), 'Bio cannot contain links or URLs')
    .optional(),
  avatarUrl: z
    .string()
    .url('Must be a valid URL')
    .optional(),
  telegram: z
    .string()
    .max(32, 'Telegram handle must be at most 32 characters')
    .regex(/^[a-zA-Z0-9_]*$/, 'Telegram handle can only contain letters, numbers, and underscores')
    .optional(),
  discord: z
    .string()
    .max(32, 'Discord handle must be at most 32 characters')
    .optional(),
  preferredContact: z.enum(['telegram', 'discord']).optional(),
});

// ===========================================
// Inferred Types
// ===========================================

export type VerificationStatus = z.infer<typeof verificationStatusSchema>;
export type Predictor = z.infer<typeof predictorSchema>;
export type UpdateProfileData = z.infer<typeof updateProfileSchema>;
