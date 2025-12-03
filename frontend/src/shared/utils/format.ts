/**
 * Format Utilities
 *
 * Helper functions for formatting data in the UI.
 * Provides consistent formatting for addresses, currencies, numbers, and dates.
 *
 * @module shared/utils/format
 *
 * EXPORTS:
 * - `formatAddress`      - Shorten Ethereum addresses (0x1234...5678)
 * - `formatUSD`          - Format as USD currency ($1,234.56)
 * - `formatNumber`       - Add thousand separators (1,234,567)
 * - `formatRelativeTime` - Relative time (5 minutes ago, 2 days ago)
 * - `formatDate`         - Short date format (Dec 3, 2025)
 * - `formatDateTime`     - Date with time (Dec 3, 2025, 2:30 PM)
 * - `getTimeRemaining`   - Countdown format (2d 5h 30m)
 *
 * USAGE EXAMPLES:
 * ```tsx
 * // Wallet addresses
 * formatAddress('0x1234567890abcdef1234567890abcdef12345678')
 * // → "0x1234...5678"
 *
 * formatAddress('0x1234...', 6)  // Custom character count
 * // → "0x123456...345678"
 *
 * // Currency
 * formatUSD(1234.5)      // → "$1,234.50"
 * formatUSD(0.99)        // → "$0.99"
 *
 * // Numbers
 * formatNumber(1000000)  // → "1,000,000"
 *
 * // Relative times
 * formatRelativeTime(new Date(Date.now() - 30000))      // → "just now"
 * formatRelativeTime(new Date(Date.now() - 3600000))    // → "1 hour ago"
 * formatRelativeTime(new Date(Date.now() - 86400000))   // → "1 day ago"
 *
 * // Dates
 * formatDate(new Date())       // → "Dec 3, 2025"
 * formatDateTime(new Date())   // → "Dec 3, 2025, 2:30 PM"
 *
 * // Countdown
 * getTimeRemaining(futureDate) // → "2d 5h 30m" or "Expired"
 * ```
 *
 * LOCALIZATION:
 * All functions use 'en-US' locale by default.
 * Modify the locale parameter in Intl formatters to support other locales.
 */

/**
 * Shorten an Ethereum address for display
 * @param address - Full Ethereum address (0x...)
 * @param chars - Number of characters to show on each side (default: 4)
 * @returns Shortened address like "0x1234...5678"
 * @example formatAddress("0x1234567890abcdef1234567890abcdef12345678") => "0x1234...5678"
 */
export function formatAddress(address: string, chars = 4): string {
  if (!address) return '';
  if (address.length < chars * 2 + 2) return address;
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

/**
 * Format a number as USD currency
 * @example formatUSD(123.456) => "$123.46"
 */
export function formatUSD(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format a number with commas
 * @example formatNumber(1234567) => "1,234,567"
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

/**
 * Format a date relative to now
 * @example formatRelativeTime(new Date(Date.now() - 3600000)) => "1 hour ago"
 */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

/**
 * Format a date for display
 * @example formatDate(new Date()) => "Dec 3, 2025"
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Format a date with time
 * @example formatDateTime(new Date()) => "Dec 3, 2025, 2:30 PM"
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/**
 * Get time remaining until a date
 * @example getTimeRemaining(futureDate) => "2d 5h 30m"
 */
export function getTimeRemaining(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  
  if (diffMs <= 0) return 'Expired';
  
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  if (diffDays > 0) return `${diffDays}d ${diffHours}h`;
  if (diffHours > 0) return `${diffHours}h ${diffMins}m`;
  return `${diffMins}m`;
}

/**
 * Format a rating score to 1 decimal place
 * @example formatRating(4.567) => "4.6"
 */
export function formatRating(rating: number): string {
  return rating.toFixed(1);
}

/**
 * Pluralize a word based on count
 * @example pluralize(5, 'signal') => "5 signals"
 */
export function pluralize(count: number, singular: string, plural?: string): string {
  const word = count === 1 ? singular : (plural || `${singular}s`);
  return `${formatNumber(count)} ${word}`;
}
