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

export const signalStatusSchema = z.enum(['active', 'expired', 'deactivated']);
/** Filter status for API queries - different from display status */
export const signalFilterStatusSchema = z.enum(['active', 'inactive', 'all']);

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
  mainGroup: z.string().optional(), // Denormalized from category for efficient filtering
  priceUsdt: z.number(),
  expiresAt: z.string(), // Required - when signal expires (1-90 days from creation)
  confidenceLevel: z.number().min(1).max(100), // Predictor's confidence 1-100%
  eventUrl: z.string().optional(), // Optional link to prediction market event
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
  status: signalStatusSchema.optional(),
});

// ===========================================
// URL Detection Pattern
// ===========================================

/** Pattern to detect URLs/links in text */
const urlPattern = /(https?:\/\/|www\.)[^\s]+|(?:[a-zA-Z0-9-]+\.)+(?:com|net|org|io|co|gg|xyz|me|info|biz|dev|app|ai|tv|fm|ly|to|cc|link|click|site|online|store|shop|tech|cloud|digital|world|live|news|blog|page|space|zone|network|social|trade|finance|crypto|money|exchange|market|trading|invest|wallet|token|coin|nft|defi|dao|eth|btc|bnb|sol)[^\s]*/i;

// ===========================================
// Create Signal Schema (for forms)
// ===========================================

export const createSignalSchema = z.object({
  title: z
    .string()
    .min(10, 'Title must be at least 10 characters')
    .max(100, 'Title must be at most 100 characters')
    .refine(
      (val) => !urlPattern.test(val),
      'Title cannot contain links or URLs'
    ),
  description: z
    .string()
    .min(20, 'Description must be at least 20 characters')
    .max(1000, 'Description must be at most 1000 characters')
    .refine(
      (val) => !urlPattern.test(val),
      'Description cannot contain links or URLs'
    ),
  content: z
    .string()
    .min(50, 'Signal content must be at least 50 characters')
    .max(3000, 'Signal content must be at most 3000 characters')
    .refine(
      (val) => !urlPattern.test(val),
      'Signal content cannot contain links or URLs'
    ),
  categoryId: z.string().min(1, 'Please select a category'),
  priceUsdt: z
    .number()
    .min(1, 'Minimum price is $1 USDT')
    .max(100000, 'Maximum price is $100,000 USDT')
    .refine(
      (val) => Math.abs(Math.round(val * 100) - val * 100) < 0.0001,
      'Price can have at most 2 decimal places (e.g., 10.50)'
    ),
  expiresAt: z.string().min(1, 'Please select an expiration date'),
  confidenceLevel: z
    .number()
    .int('Confidence must be a whole number')
    .min(1, 'Confidence must be at least 1%')
    .max(100, 'Confidence cannot exceed 100%'),
  eventUrl: z
    .string()
    .url('Must be a valid URL')
    .max(500, 'URL too long')
    .optional()
    .or(z.literal('')),
});

// ===========================================
// Filter Schema
// ===========================================

export const signalFiltersSchema = z.object({
  category: z.string().optional(),
  /** Filter by main category group (e.g., "Crypto", "Finance", "Politics") */
  mainGroup: z.string().optional(),
  minConfidence: z.number().min(1).max(100).optional(),
  maxConfidence: z.number().min(1).max(100).optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  predictor: z.string().optional(),
  /** Filter status: 'active' (default), 'inactive' (expired/deactivated), or 'all' */
  status: signalFilterStatusSchema.optional(),
  sortBy: z.enum(['newest', 'price-low', 'price-high', 'popular', 'quality']).optional(),
  page: z.number().optional(),
  limit: z.number().optional(),
  /** Exclude signals already purchased by this address */
  excludeBuyerAddress: z.string().optional(),
});

// ===========================================
// Inferred Types
// ===========================================

export type SignalStatus = z.infer<typeof signalStatusSchema>;
export type SignalFilterStatus = z.infer<typeof signalFilterStatusSchema>;
export type Signal = z.infer<typeof signalSchema>;
export type CreateSignalData = z.infer<typeof createSignalSchema>;
export type SignalFilters = z.infer<typeof signalFiltersSchema>;
