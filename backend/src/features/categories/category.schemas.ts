/**
 * @fileoverview Zod validation schemas for Category API endpoints.
 *
 * Defines schemas for request validation including:
 * - Query parameters for listing categories
 * - Path parameters for category lookup by slug
 * - Request body schemas for create/update operations
 *
 * @module features/categories/category.schemas
 */
// filepath: /Users/stiliyangoshev/Desktop/Coding/Full Projects/SignalFriend/backend/src/features/categories/category.schemas.ts
import { z } from "zod";

/**
 * Schema for GET /api/categories query parameters.
 * Allows filtering categories by active status.
 */
export const listCategoriesSchema = z.object({
  /** Filter by active status (string "true" converted to boolean) */
  active: z
    .string()
    .optional()
    .transform((val) => val === "true"),
});

/**
 * Schema for category slug path parameter.
 * Validates slug format: lowercase alphanumeric with hyphens.
 */
export const getCategoryBySlugSchema = z.object({
  /** URL-friendly category identifier */
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(50)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
});

/**
 * Schema for POST /api/categories request body.
 * All fields required for creating a new category.
 */
export const createCategorySchema = z.object({
  /** Display name (1-50 characters) */
  name: z.string().min(1, "Name is required").max(50),
  /** URL-friendly slug (lowercase alphanumeric with hyphens) */
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(50)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  /** Main category group (e.g., "Crypto", "Traditional Finance", "Macro / Other") */
  mainGroup: z.string().min(1, "Main group is required").max(50),
  /** Category description (max 200 characters) */
  description: z.string().max(200).optional().default(""),
  /** Emoji or icon character (max 10 characters) */
  icon: z.string().max(10).optional().default(""),
  /** Whether the category is active */
  isActive: z.boolean().optional().default(true),
  /** Display order priority */
  sortOrder: z.number().int().min(0).optional().default(0),
});

/**
 * Schema for PUT /api/categories/:slug request body.
 * All fields optional for partial updates.
 */
export const updateCategorySchema = z.object({
  /** Updated display name */
  name: z.string().min(1).max(50).optional(),
  /** Updated main group */
  mainGroup: z.string().min(1).max(50).optional(),
  /** Updated description */
  description: z.string().max(200).optional(),
  /** Updated icon */
  icon: z.string().max(10).optional(),
  /** Updated active status */
  isActive: z.boolean().optional(),
  /** Updated sort order */
  sortOrder: z.number().int().min(0).optional(),
});

/** Type for list categories query parameters */
export type ListCategoriesQuery = z.infer<typeof listCategoriesSchema>;
/** Type for get category by slug path parameters */
export type GetCategoryBySlugParams = z.infer<typeof getCategoryBySlugSchema>;
/** Type for create category request body */
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
/** Type for update category request body */
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
