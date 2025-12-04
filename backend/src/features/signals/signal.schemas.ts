/**
 * @fileoverview Zod validation schemas for Signal API endpoints.
 *
 * Defines schemas for request validation including:
 * - Query parameters for listing/filtering signals
 * - Path parameters for signal lookup by contentId
 * - Request body schemas for signal creation and updates
 *
 * @module features/signals/signal.schemas
 */
import { z } from "zod";
import { env } from "../../shared/config/env.js";

/** Regex pattern for valid Ethereum addresses */
const ethereumAddressRegex = /^0x[a-fA-F0-9]{40}$/;

/** Regex pattern for valid content IDs (UUID v4 format) */
const contentIdRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Schema for GET /api/signals query parameters.
 * Supports filtering, pagination, and sorting.
 */
export const listSignalsSchema = z.object({
  /** Filter by category ID */
  categoryId: z.string().optional(),
  /** Filter by predictor address */
  predictorAddress: z
    .string()
    .regex(ethereumAddressRegex, "Invalid Ethereum address")
    .optional(),
  /** Exclude signals already purchased by this address */
  excludeBuyerAddress: z
    .string()
    .regex(ethereumAddressRegex, "Invalid Ethereum address")
    .optional(),
  /** Only show active signals (default: true) */
  active: z
    .string()
    .optional()
    .default("true")
    .transform((val) => val === "true"),
  /** Sort field */
  sortBy: z
    .enum(["createdAt", "totalSales", "averageRating", "priceUsdt"])
    .optional()
    .default("createdAt"),
  /** Sort direction */
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
  /** Page number (1-based) */
  page: z.coerce.number().int().min(1).optional().default(1),
  /** Items per page (max 50) */
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
  /** Search by title */
  search: z.string().max(100).optional(),
  /** Minimum price filter */
  minPrice: z.coerce.number().min(0).optional(),
  /** Maximum price filter */
  maxPrice: z.coerce.number().min(0).optional(),
  /** Filter by risk level */
  riskLevel: z.enum(["low", "medium", "high"]).optional(),
  /** Filter by potential reward */
  potentialReward: z.enum(["normal", "medium", "high"]).optional(),
});

/**
 * Schema for signal contentId path parameter.
 * Validates UUID v4 format.
 */
export const getSignalByContentIdSchema = z.object({
  /** Signal content ID (UUID v4) */
  contentId: z
    .string()
    .regex(contentIdRegex, "Invalid content ID format (must be UUID v4)"),
});

/**
 * Schema for POST /api/signals request body.
 * Creates a new signal for sale.
 */
export const createSignalSchema = z.object({
  /** Signal title (1-100 characters) */
  title: z.string().min(1).max(100),
  /** Public description (1-1000 characters) */
  description: z.string().min(1).max(1000),
  /** Protected signal content (revealed after purchase) */
  content: z.string().min(1).max(10000),
  /** Category ID */
  categoryId: z.string(),
  /** Price in USDT (min from env, default 5 USDT, max 2 decimal places) */
  priceUsdt: z
    .number()
    .min(env.MIN_SIGNAL_PRICE_USDT)
    .max(100000)
    .refine(
      (val) => Number.isInteger(val * 100),
      "Price can have at most 2 decimal places"
    ),
  /** Number of days until signal expires (1-30 days) */
  expiryDays: z.number().int().min(1).max(30),
  /** Risk level assessment */
  riskLevel: z.enum(["low", "medium", "high"]),
  /** Potential reward assessment */
  potentialReward: z.enum(["normal", "medium", "high"]),
});

/**
 * Schema for PUT /api/signals/:contentId request body.
 * All fields optional for partial updates.
 * Note: Price cannot be updated once sales have occurred.
 */
export const updateSignalSchema = z.object({
  /** Signal title */
  title: z.string().min(1).max(100).optional(),
  /** Public description */
  description: z.string().min(1).max(1000).optional(),
  /** Protected signal content */
  content: z.string().min(1).max(10000).optional(),
  /** Category ID */
  categoryId: z.string().optional(),
  /** Active status (soft delete) */
  isActive: z.boolean().optional(),
});

/** Type for list signals query parameters */
export type ListSignalsQuery = z.infer<typeof listSignalsSchema>;
/** Type for get signal by contentId path parameters */
export type GetSignalByContentIdParams = z.infer<typeof getSignalByContentIdSchema>;
/** Type for create signal request body */
export type CreateSignalInput = z.infer<typeof createSignalSchema>;
/** Type for update signal request body */
export type UpdateSignalInput = z.infer<typeof updateSignalSchema>;
