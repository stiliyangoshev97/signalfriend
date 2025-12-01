/**
 * @fileoverview Zod validation schemas for Report API endpoints.
 *
 * Defines schemas for request validation including:
 * - Query parameters for listing reports
 * - Path parameters for report lookup
 * - Request body schemas for report creation
 *
 * Key constraint: One report per purchase (enforced by tokenId uniqueness)
 *
 * @module features/reports/report.schemas
 */
import { z } from "zod";
import { REPORT_REASONS } from "./report.model.js";

/** Regex pattern for valid Ethereum addresses */
const ethereumAddressRegex = /^0x[a-fA-F0-9]{40}$/;

/** Regex pattern for valid content IDs (UUID v4 format) */
const contentIdRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Schema for POST /api/reports request body.
 * Creates a new report for a purchased signal.
 */
export const createReportSchema = z
  .object({
    /** SignalKeyNFT token ID (proves ownership of purchase) */
    tokenId: z.number().int().min(0),
    /** Reason for the report */
    reason: z.enum(REPORT_REASONS),
    /** Optional description (required if reason is "other") */
    description: z.string().max(1000).optional().default(""),
  })
  .refine(
    (data) => {
      // If reason is "other", description is required
      if (data.reason === "other" && (!data.description || data.description.trim() === "")) {
        return false;
      }
      return true;
    },
    {
      message: "Description is required when reason is 'other'",
      path: ["description"],
    }
  );

/**
 * Schema for GET /api/reports/signal/:contentId query parameters.
 * Supports pagination for signal reports.
 */
export const listSignalReportsSchema = z.object({
  /** Page number (1-based) */
  page: z.coerce.number().int().min(1).optional().default(1),
  /** Items per page (max 50) */
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
});

/**
 * Schema for GET /api/reports/predictor/:address query parameters.
 * Supports pagination for predictor reports.
 */
export const listPredictorReportsSchema = z.object({
  /** Page number (1-based) */
  page: z.coerce.number().int().min(1).optional().default(1),
  /** Items per page (max 50) */
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
  /** Filter by status */
  status: z.enum(["pending", "reviewed", "resolved", "dismissed"]).optional(),
});

/**
 * Schema for signal contentId path parameter.
 */
export const signalContentIdSchema = z.object({
  /** Signal content ID (UUID v4) */
  contentId: z
    .string()
    .regex(contentIdRegex, "Invalid content ID format (must be UUID v4)"),
});

/**
 * Schema for predictor address path parameter.
 */
export const predictorAddressSchema = z.object({
  /** Predictor wallet address */
  address: z.string().regex(ethereumAddressRegex, "Invalid Ethereum address"),
});

/**
 * Schema for report tokenId path parameter.
 */
export const reportTokenIdSchema = z.object({
  /** SignalKeyNFT token ID */
  tokenId: z.coerce.number().int().min(0),
});

/** Type for create report request body */
export type CreateReportInput = z.infer<typeof createReportSchema>;
/** Type for list signal reports query parameters */
export type ListSignalReportsQuery = z.infer<typeof listSignalReportsSchema>;
/** Type for list predictor reports query parameters */
export type ListPredictorReportsQuery = z.infer<typeof listPredictorReportsSchema>;
/** Type for signal contentId path parameters */
export type SignalContentIdParams = z.infer<typeof signalContentIdSchema>;
/** Type for predictor address path parameters */
export type PredictorAddressParams = z.infer<typeof predictorAddressSchema>;
/** Type for report tokenId path parameters */
export type ReportTokenIdParams = z.infer<typeof reportTokenIdSchema>;
