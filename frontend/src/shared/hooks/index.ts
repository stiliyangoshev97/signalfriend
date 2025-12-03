/**
 * Shared Hooks Barrel Export
 *
 * Central export point for all shared React hooks.
 * Import hooks from this file for cleaner imports throughout the app.
 *
 * @module shared/hooks
 *
 * USAGE:
 * ```tsx
 * import { useAuth, useIsAdmin, useIsPredictor } from '@/shared/hooks';
 * ```
 *
 * AVAILABLE HOOKS:
 * - useAuth            - SIWE authentication flow (login, logout, state)
 * - useIsAdmin         - Check if wallet is admin (client-side only)
 * - useIsPredictor     - Check if user is registered predictor
 * - useIsVerifiedPredictor - Check if predictor is verified
 */

// Shared hooks exports
export { useAuth } from './useAuth';
// ...existing code...
export { useIsAdmin } from './useIsAdmin';
export { useIsPredictor, useIsVerifiedPredictor } from './useIsPredictor';
