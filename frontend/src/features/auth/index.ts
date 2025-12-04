/**
 * Auth Feature Barrel Export
 *
 * Central export point for the authentication feature.
 * Provides SIWE (Sign-In with Ethereum) authentication functionality.
 *
 * @module features/auth
 *
 * USAGE:
 * ```tsx
 * import { useAuth, useAuthStore, AuthButton } from '@/features/auth';
 * ```
 *
 * EXPORTS:
 * - useAuthStore       - Zustand store for auth state (direct access)
 * - useAuth            - Hook for auth flow (login, logout, state)
 * - getNonce           - API function to get nonce
 * - verifySignature    - API function to verify SIWE signature
 * - AuthButton         - UI component for auth flow
 *
 * ARCHITECTURE:
 * ```
 * AuthButton (UI)
 *     │
 *     └──> useAuth (Hook)
 *              │
 *              ├──> authApi (API calls)
 *              │       └──> Backend (/api/auth/*)
 *              │
 *              └──> useAuthStore (State)
 *                      └──> localStorage (Persistence)
 * ```
 */

// Auth feature exports
export { useAuthStore } from './store';
// ...existing code...
export { useAuth, useSessionSync, getNonce, verifySignature, validateSession } from './api';
export { AuthButton } from './components';
