/**
 * API Response Schemas
 *
 * Zod schemas for API response structures.
 * These wrap domain data with standard success/error formats.
 *
 * @module shared/schemas/api.schemas
 *
 * RESPONSE FORMAT:
 * All API endpoints return a consistent structure:
 *
 * Success:
 * ```json
 * { "success": true, "data": { ... } }
 * ```
 *
 * Error:
 * ```json
 * { "success": false, "error": "Error message", "message": "Details" }
 * ```
 *
 * Paginated:
 * ```json
 * {
 *   "success": true,
 *   "data": [...],
 *   "pagination": { "page": 1, "limit": 10, "total": 100, "totalPages": 10 }
 * }
 * ```
 *
 * USAGE:
 * ```tsx
 * import { apiResponseSchema, signalSchema } from '@/shared/schemas';
 *
 * const responseSchema = apiResponseSchema(signalSchema);
 * const result = responseSchema.safeParse(apiResponse);
 * ```
 *
 * EXPORTS:
 * - apiResponseSchema       - Generic success wrapper factory
 * - apiErrorResponseSchema  - Error response format
 * - paginationSchema        - Pagination metadata
 * - paginatedResponseSchema - Paginated success wrapper factory
 */

import { z } from 'zod';

// ===========================================
// Base Response Schemas
// ===========================================

export const apiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    data: dataSchema,
  });

/** Schema for field-level validation errors from backend */
export const apiFieldErrorSchema = z.object({
  field: z.string(),
  message: z.string(),
});

export const apiErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.string(),
  message: z.string().optional(),
  maintenanceEnd: z.string().optional(),
  /** Field-level validation errors (e.g., from Zod validation) */
  details: z.array(apiFieldErrorSchema).optional(),
});

export type ApiFieldError = z.infer<typeof apiFieldErrorSchema>;

export const paginationSchema = z.object({
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  totalPages: z.number(),
});

export const paginatedResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    data: z.array(dataSchema),
    pagination: paginationSchema,
  });

// ===========================================
// Inferred Types
// ===========================================

export type ApiErrorResponse = z.infer<typeof apiErrorResponseSchema>;
export type Pagination = z.infer<typeof paginationSchema>;
