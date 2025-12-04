/**
 * Category Schemas
 * 
 * Zod schemas for category data.
 * Types are inferred from schemas - single source of truth.
 */

import { z } from 'zod';

// ===========================================
// Category Schema
// ===========================================

export const categorySchema = z.object({
  _id: z.string(),
  name: z.string(),
  slug: z.string().optional(),
  mainGroup: z.string(),
  description: z.string(),
  icon: z.string().optional(),
  isActive: z.boolean(),
  sortOrder: z.number().optional(),
});

// ===========================================
// Inferred Types
// ===========================================

export type Category = z.infer<typeof categorySchema>;
