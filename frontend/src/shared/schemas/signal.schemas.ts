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

/**
 * Signal schema matching backend API response.
 * 
 * Note: Backend field names differ from original design:
 * - title (not name)
 * - priceUsdt (not priceUSDT)
 * - predictorAddress (not predictorWallet)
 * - totalSales (not totalBuyers)
 */
export const signalSchema = z.object({
  _id: z.string().optional(),
  contentId: z.string(),
  predictorId: z.union([z.string(), z.object({ _id: z.string() }).passthrough()]).optional(),
  predictorAddress: z.string(),
  title: z.string(),
  description: z.string(),
  categoryId: z.union([z.string(), z.object({ _id: z.string() }).passthrough()]).optional(),
  priceUsdt: z.number(),
  expiresAt: z.string(), // Required - when signal expires (max 30 days from creation)
  totalSales: z.number().default(0),
  averageRating: z.number().default(0),
  totalReviews: z.number().default(0),
  isActive: z.boolean().default(true),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
  // Protected content (only after purchase)
  content: z.string().optional(),
  // Populated fields from backend
  category: categorySchema.optional(),
  predictor: predictorSchema.optional(),
  // Legacy fields for compatibility (optional)
  riskLevel: riskLevelSchema.optional(),
  potentialReward: potentialRewardSchema.optional(),
  status: signalStatusSchema.optional(),
});

// ===========================================
// Create Signal Schema (for forms)
// ===========================================

export const createSignalSchema = z.object({
  title: z
    .string()
    .min(10, 'Title must be at least 10 characters')
    .max(100, 'Title must be at most 100 characters'),
  description: z
    .string()
    .min(20, 'Description must be at least 20 characters')
    .max(1000, 'Description must be at most 1000 characters'),
  content: z
    .string()
    .min(50, 'Signal content must be at least 50 characters')
    .max(10000, 'Signal content must be at most 10000 characters'),
  categoryId: z.string().min(1, 'Please select a category'),
  priceUsdt: z
    .number()
    .min(5, 'Minimum price is $5 USDT')
    .max(100000, 'Maximum price is $100,000 USDT'),
  expiryDays: z
    .number()
    .int('Expiry must be a whole number of days')
    .min(1, 'Signal must be active for at least 1 day')
    .max(30, 'Signal can be active for at most 30 days'),
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
