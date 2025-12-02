/**
 * Signal Schemas
 * 
 * Zod schemas for signal data.
 * Types are inferred from schemas - single source of truth.
 */

import { z } from 'zod';
import { predictorSchema } from './predictor.schemas';
import { categorySchema } from './category.schemas';

// ===========================================
// Enums
// ===========================================

export const riskLevelSchema = z.enum(['low', 'medium', 'high']);
export const potentialRewardSchema = z.enum(['normal', 'medium', 'high']);
export const signalStatusSchema = z.enum(['active', 'expired', 'deactivated']);

// ===========================================
// Signal Schema
// ===========================================

export const signalSchema = z.object({
  contentId: z.string(),
  predictorWallet: z.string(),
  name: z.string(),
  description: z.string(),
  categoryId: z.string(),
  riskLevel: riskLevelSchema,
  potentialReward: potentialRewardSchema,
  priceUSDT: z.number(),
  expiresAt: z.string(),
  status: signalStatusSchema,
  totalBuyers: z.number(),
  createdAt: z.string(),
  // Protected content (only after purchase)
  fullContent: z.string().optional(),
  reasoning: z.string().optional(),
  // Populated fields
  category: categorySchema.optional(),
  predictor: predictorSchema.optional(),
});

// ===========================================
// Create Signal Schema (for forms)
// ===========================================

export const createSignalSchema = z.object({
  name: z
    .string()
    .min(10, 'Title must be at least 10 characters')
    .max(100, 'Title must be at most 100 characters'),
  description: z
    .string()
    .min(20, 'Description must be at least 20 characters')
    .max(500, 'Description must be at most 500 characters'),
  categoryId: z.string().min(1, 'Please select a category'),
  riskLevel: riskLevelSchema,
  potentialReward: potentialRewardSchema,
  priceUSDT: z
    .number()
    .min(5, 'Minimum price is $5 USDT')
    .max(10000, 'Maximum price is $10,000 USDT'),
  expiresAt: z.string().refine((val) => new Date(val) > new Date(), {
    message: 'Expiry date must be in the future',
  }),
  fullContent: z
    .string()
    .min(50, 'Full content must be at least 50 characters')
    .max(5000, 'Full content must be at most 5000 characters'),
  reasoning: z
    .string()
    .min(50, 'Reasoning must be at least 50 characters')
    .max(5000, 'Reasoning must be at most 5000 characters'),
});

// ===========================================
// Filter Schema
// ===========================================

export const signalFiltersSchema = z.object({
  category: z.string().optional(),
  riskLevel: riskLevelSchema.optional(),
  potentialReward: potentialRewardSchema.optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  predictor: z.string().optional(),
  status: signalStatusSchema.optional(),
  sortBy: z.enum(['newest', 'price-low', 'price-high', 'popular']).optional(),
  page: z.number().optional(),
  limit: z.number().optional(),
});

// ===========================================
// Inferred Types
// ===========================================

export type RiskLevel = z.infer<typeof riskLevelSchema>;
export type PotentialReward = z.infer<typeof potentialRewardSchema>;
export type SignalStatus = z.infer<typeof signalStatusSchema>;
export type Signal = z.infer<typeof signalSchema>;
export type CreateSignalData = z.infer<typeof createSignalSchema>;
export type SignalFilters = z.infer<typeof signalFiltersSchema>;
