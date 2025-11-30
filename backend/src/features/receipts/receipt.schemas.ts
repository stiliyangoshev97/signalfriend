/**
 * @fileoverview Zod validation schemas for Receipt API endpoints.
 *
 * Defines schemas for request validation including:
 * - Query parameters for listing/filtering receipts
 * - Path parameters for receipt lookup
 *
 * Note: Receipts are created via webhooks (SignalPurchased event),
 * not through direct API calls.
 *
 * @module features/receipts/receipt.schemas
 */
import { z } from "zod";

/** Regex pattern for valid Ethereum addresses */
const ethereumAddressRegex = /^0x[a-fA-F0-9]{40}$/;

/** Regex pattern for valid content IDs (UUID v4 format) */
const contentIdRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Schema for GET /api/receipts/mine query parameters.
 * Supports pagination for user's purchase history.
 */
export const listMyReceiptsSchema = z.object({
  /** Sort field */
  sortBy: z.enum(["purchasedAt", "priceUsdt"]).optional().default("purchasedAt"),
  /** Sort direction */
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
  /** Page number (1-based) */
  page: z.coerce.number().int().min(1).optional().default(1),
  /** Items per page (max 50) */
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
});

/**
 * Schema for GET /api/receipts/signal/:contentId query parameters.
 * Supports pagination for signal's purchase history (predictor view).
 */
export const listSignalReceiptsSchema = z.object({
  /** Page number (1-based) */
  page: z.coerce.number().int().min(1).optional().default(1),
  /** Items per page (max 50) */
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
});

/**
 * Schema for receipt tokenId path parameter.
 */
export const getReceiptByTokenIdSchema = z.object({
  /** SignalKeyNFT token ID */
  tokenId: z.coerce.number().int().min(0),
});

/**
 * Schema for signal contentId path parameter.
 */
export const getSignalContentIdSchema = z.object({
  /** Signal content ID (UUID v4) */
  contentId: z
    .string()
    .regex(contentIdRegex, "Invalid content ID format (must be UUID v4)"),
});

/**
 * Schema for internal receipt creation (via webhook).
 * Used when SignalPurchased event is received.
 */
export const createReceiptFromEventSchema = z.object({
  /** SignalKeyNFT token ID */
  tokenId: z.number().int().min(0),
  /** Signal content ID */
  contentId: z.string().regex(contentIdRegex),
  /** Buyer's wallet address */
  buyerAddress: z.string().regex(ethereumAddressRegex),
  /** Predictor's wallet address */
  predictorAddress: z.string().regex(ethereumAddressRegex),
  /** Price paid in USDT */
  priceUsdt: z.number().min(0),
  /** Purchase timestamp */
  purchasedAt: z.date(),
  /** Transaction hash */
  transactionHash: z.string().regex(/^0x[a-fA-F0-9]{64}$/),
});

/** Type for list my receipts query parameters */
export type ListMyReceiptsQuery = z.infer<typeof listMyReceiptsSchema>;
/** Type for list signal receipts query parameters */
export type ListSignalReceiptsQuery = z.infer<typeof listSignalReceiptsSchema>;
/** Type for get receipt by tokenId path parameters */
export type GetReceiptByTokenIdParams = z.infer<typeof getReceiptByTokenIdSchema>;
/** Type for get signal contentId path parameters */
export type GetSignalContentIdParams = z.infer<typeof getSignalContentIdSchema>;
/** Type for internal receipt creation */
export type CreateReceiptFromEventInput = z.infer<typeof createReceiptFromEventSchema>;
