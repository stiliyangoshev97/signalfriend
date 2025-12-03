/**
 * Shared Utilities Barrel Export
 *
 * Central export point for all shared utility functions.
 * Import utilities from this file for cleaner imports throughout the app.
 *
 * @module shared/utils
 *
 * USAGE:
 * ```tsx
 * import { cn, formatAddress, formatUSD } from '@/shared/utils';
 * ```
 *
 * AVAILABLE EXPORTS:
 * - cn                   - CSS class name utility
 * - formatAddress        - Shorten Ethereum addresses
 * - formatUSD            - Format as USD currency
 * - formatNumber         - Add thousand separators
 * - formatRelativeTime   - Relative time formatting
 * - formatDate           - Short date format
 * - formatDateTime       - Date with time
 * - getTimeRemaining     - Countdown timer format
 */

// Shared utilities exports
export * from './format';
export { cn } from './cn';
