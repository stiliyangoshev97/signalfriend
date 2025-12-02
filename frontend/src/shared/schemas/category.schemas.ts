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
  mainGroup: z.string(),
  description: z.string(),
  isActive: z.boolean(),
});

// ===========================================
// Inferred Types
// ===========================================

export type Category = z.infer<typeof categorySchema>;
