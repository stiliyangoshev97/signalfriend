/**
 * Zod Schemas Barrel Export
 *
 * Central export point for all Zod validation schemas.
 * Schemas are the single source of truth for data types in the app.
 *
 * @module shared/schemas
 *
 * WHY ZOD?
 * - Runtime validation (API responses, form data)
 * - Type inference (z.infer<typeof schema>)
 * - Single source of truth (no type drift)
 * - Composable and extendable schemas
 *
 * SCHEMA CATEGORIES:
 * - API       - Response wrappers, pagination, errors
 * - Auth      - SIWE, JWT, user profiles
 * - Category  - Signal categories
 * - Predictor - Predictor profiles, verification
 * - Signal    - Prediction signals, filters
 * - Review    - Signal reviews/ratings
 * - Receipt   - Purchase receipts (NFT)
 *
 * USAGE EXAMPLES:
 * ```tsx
 * import { signalSchema, type Signal } from '@/shared/schemas';
 *
 * // Validate API response
 * const result = signalSchema.safeParse(apiData);
 * if (result.success) {
 *   const signal: Signal = result.data;
 * }
 *
 * // Form validation with React Hook Form
 * import { zodResolver } from '@hookform/resolvers/zod';
 * const form = useForm({ resolver: zodResolver(createSignalSchema) });
 * ```
 *
 * @see shared/types for TypeScript type exports
 */

// ============================================================================
// API Response schemas
export * from './api.schemas';

// Domain schemas
export * from './auth.schemas';
export * from './category.schemas';
export * from './predictor.schemas';
export * from './signal.schemas';
export * from './review.schemas';
export * from './receipt.schemas';
