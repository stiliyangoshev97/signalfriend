/**
 * Providers Barrel Export
 *
 * Central export point for all application providers.
 * These providers wrap the app with necessary context and functionality.
 *
 * @module providers
 *
 * PROVIDER NESTING ORDER (outermost to innermost):
 * ```tsx
 * <SentryProvider>      // Error tracking (outermost for full coverage)
 *   <QueryProvider>     // React Query (required by RainbowKit)
 *     <Web3Provider>    // Wagmi + RainbowKit (wallet connections)
 *       <App />
 *     </Web3Provider>
 *   </QueryProvider>
 * </SentryProvider>
 * ```
 *
 * USAGE:
 * ```tsx
 * import { SentryProvider, QueryProvider, Web3Provider } from '@/providers';
 *
 * // Or import all at once
 * import * as Providers from '@/providers';
 * ```
 *
 * AVAILABLE PROVIDERS:
 * - Web3Provider    - Wallet connection (Wagmi + RainbowKit)
 * - QueryProvider   - Server state management (TanStack Query)
 * - SentryProvider  - Error tracking and boundary (Sentry)
 */

// Providers barrel export
export { Web3Provider } from './Web3Provider';
export { QueryProvider } from './QueryProvider';
export { SentryProvider } from './SentryProvider';
