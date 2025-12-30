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
  /** Filter by main category group (e.g., "Crypto", "Traditional Finance") */
  mainGroup: z.string().optional(),
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
  /** Only show active signals (default: true) - DEPRECATED, use 'status' instead */
  active: z
    .string()
    .optional()
    .default("true")
    .transform((val) => val === "true"),
  /** Signal status filter: 'active' (default), 'inactive', or 'all' */
  status: z.enum(["active", "inactive", "all"]).optional().default("active"),
  /** Sort field (undefined = quality-first default sort) */
  sortBy: z
    .enum(["createdAt", "totalSales", "averageRating", "priceUsdt"])
    .optional(),
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
  /** Minimum confidence level filter */
  minConfidence: z.coerce.number().min(1).max(100).optional(),
  /** Maximum confidence level filter */
  maxConfidence: z.coerce.number().min(1).max(100).optional(),
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
  content: z.string().min(1).max(3000),
  /** Category ID */
  categoryId: z.string(),
  /** Price in USDT (min from env, default 1 USDT, max 2 decimal places) */
  priceUsdt: z
    .number()
    .min(env.MIN_SIGNAL_PRICE_USDT)
    .max(100000)
    .refine(
      (val) => Math.abs(Math.round(val * 100) - val * 100) < 0.0001,
      "Price can have at most 2 decimal places"
    ),
  /** Expiration date for the signal (must be 1-90 days from now) */
  expiresAt: z
    .string()
    .datetime()
    .refine((date) => {
      const expiry = new Date(date);
      const now = new Date();
      const minDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 1 day from now
      const maxDate = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000); // 90 days from now
      return expiry >= minDate && expiry <= maxDate;
    }, "Expiration must be between 1 and 90 days from now"),
  /** Predictor's confidence level in this prediction (1-100%) */
  confidenceLevel: z.number().int().min(1).max(100),
  /** Optional URL to the prediction market event */
  eventUrl: z
    .string()
    .url("Must be a valid URL")
    .max(500)
    .optional()
    .or(z.literal("")),
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
  content: z.string().min(1).max(3000).optional(),
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
