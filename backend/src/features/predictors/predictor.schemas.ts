/**
 * @fileoverview Zod validation schemas for Predictor API endpoints.
 *
 * Defines schemas for request validation including:
 * - Query parameters for listing/filtering predictors
 * - Path parameters for predictor lookup by address
 * - Request body schemas for profile updates
 *
 * @module features/predictors/predictor.schemas
 */
import { z } from "zod";

/** Regex pattern for valid Ethereum addresses */
const ethereumAddressRegex = /^0x[a-fA-F0-9]{40}$/;

/**
 * Schema for GET /api/predictors query parameters.
 * Supports filtering, pagination, and sorting.
 */
export const listPredictorsSchema = z.object({
  /** Filter by category ID */
  categoryId: z.string().optional(),
  /** Exclude blacklisted predictors (default: true) */
  active: z
    .string()
    .optional()
    .default("true")
    .transform((val) => val === "true"),
  /** Sort field (totalSales, averageRating, joinedAt) */
  sortBy: z
    .enum(["totalSales", "averageRating", "joinedAt", "totalSignals"])
    .optional()
    .default("totalSales"),
  /** Sort direction */
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
  /** Page number (1-based) */
  page: z.coerce.number().int().min(1).optional().default(1),
  /** Items per page (max 50) */
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
  /** Search by display name */
  search: z.string().max(100).optional(),
});

/**
 * Schema for predictor wallet address path parameter.
 * Validates Ethereum address format.
 */
export const getPredictorByAddressSchema = z.object({
  /** Ethereum wallet address */
  address: z
    .string()
    .regex(ethereumAddressRegex, "Invalid Ethereum address"),
});

/**
 * Schema for PUT /api/predictors/:address request body.
 * All fields optional for partial profile updates.
 * Only the predictor themselves can update their profile.
 */

/** Allowed image extensions regex (security: no SVG!) */
const allowedImageExtensions = /\.(jpg|jpeg|png|gif)(\?.*)?$/i;

export const updatePredictorProfileSchema = z.object({
  /** Display name (1-50 characters) */
  displayName: z.string().min(1).max(50).optional(),
  /** Bio/description (max 500 characters) */
  bio: z.string().max(500).optional(),
  /** Avatar URL - only JPG, PNG, GIF allowed (no SVG for security) */
  avatarUrl: z
    .string()
    .url("Invalid URL format")
    .max(500)
    .refine(
      (val) => allowedImageExtensions.test(val),
      "Only JPG, PNG, and GIF images are allowed"
    )
    .optional()
    .or(z.literal("")),
  /** Social media links */
  socialLinks: z
    .object({
      twitter: z.string().max(100).optional().or(z.literal("")),
      telegram: z.string().max(100).optional().or(z.literal("")),
      discord: z.string().max(100).optional().or(z.literal("")),
    })
    .optional(),
  /** Preferred contact method for admin communication */
  preferredContact: z.enum(["telegram", "discord"]).optional(),
  /** Category IDs the predictor specializes in */
  categoryIds: z.array(z.string()).max(5).optional(),
});

/**
 * Schema for internal predictor creation (via webhook).
 * Used when PredictorJoined event is received.
 */
export const createPredictorFromEventSchema = z.object({
  /** Wallet address of the new predictor */
  walletAddress: z
    .string()
    .regex(ethereumAddressRegex, "Invalid Ethereum address"),
  /** Token ID of the PredictorAccessPass NFT */
  tokenId: z.number().int().min(0),
  /** Timestamp when they joined (from blockchain) */
  joinedAt: z.date(),
  /** Optional referrer address (if joined via referral) */
  referredBy: z.string().regex(ethereumAddressRegex).optional(),
  /** Whether referral bonus was paid */
  referralPaid: z.boolean().optional(),
});

/** Type for list predictors query parameters */
export type ListPredictorsQuery = z.infer<typeof listPredictorsSchema>;
/** Type for get predictor by address path parameters */
export type GetPredictorByAddressParams = z.infer<typeof getPredictorByAddressSchema>;
/** Type for update predictor profile request body */
export type UpdatePredictorProfileInput = z.infer<typeof updatePredictorProfileSchema>;
/** Type for create predictor from event input */
export type CreatePredictorFromEventInput = z.infer<typeof createPredictorFromEventSchema>;

/**
 * Schema for GET /api/predictors/check-unique query parameters.
 * Used for real-time field uniqueness validation.
 */
export const checkFieldUniquenessSchema = z.object({
  /** Field to check: displayName, telegram, or discord */
  field: z.enum(["displayName", "telegram", "discord"]),
  /** Value to check for uniqueness */
  value: z.string().min(1).max(100),
  /** Address to exclude from check (current user's address) */
  excludeAddress: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address")
    .optional(),
});

/** Type for check field uniqueness query parameters */
export type CheckFieldUniquenessQuery = z.infer<typeof checkFieldUniquenessSchema>;
