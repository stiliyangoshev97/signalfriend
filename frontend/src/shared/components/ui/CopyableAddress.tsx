/**
 * @fileoverview Copyable Address Component
 * @module shared/components/ui/CopyableAddress
 * @description
 * Displays a truncated wallet address with a copy-to-clipboard button.
 * Shows visual feedback when copied.
 */

import { useState, useCallback } from 'react';
import { formatAddress } from '@/shared/utils/format';
import { cn } from '@/shared/utils/cn';

interface CopyableAddressProps {
  /** Full wallet address */
  address: string;
  /** Whether to show the full address (default: false, shows truncated) */
  showFull?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Size variant */
  size?: 'sm' | 'md';
}

/**
 * CopyableAddress component
 * 
 * Displays a wallet address with copy functionality.
 * 
 * Features:
 * - Truncated display by default (0x1234...5678)
 * - Copy button with visual feedback
 * - Tooltip shows "Copied!" on success
 * 
 * @example
 * <CopyableAddress address="0x1234567890abcdef..." />
 */
export function CopyableAddress({
  address,
  showFull = false,
  className,
  size = 'md',
}: CopyableAddressProps): React.ReactElement {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy address:', err);
    }
  }, [address]);

  const displayAddress = showFull ? address : formatAddress(address);

  return (
    <div className={cn('inline-flex items-center gap-1.5', className)}>
      <span
        className={cn(
          'font-mono text-fur-cream/50',
          size === 'sm' ? 'text-xs' : 'text-sm'
        )}
      >
        {displayAddress}
      </span>
      <button
        onClick={handleCopy}
        className={cn(
          'p-1 rounded transition-all',
          'text-fur-cream/40 hover:text-fur-cream hover:bg-dark-600',
          copied && 'text-success-400 hover:text-success-400'
        )}
        title={copied ? 'Copied!' : 'Copy address'}
        aria-label={copied ? 'Address copied' : 'Copy address to clipboard'}
      >
        {copied ? (
          // Checkmark icon
          <svg
            className={cn('w-4 h-4', size === 'sm' && 'w-3.5 h-3.5')}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        ) : (
          // Copy icon
          <svg
            className={cn('w-4 h-4', size === 'sm' && 'w-3.5 h-3.5')}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
        )}
      </button>
    </div>
  );
}

export default CopyableAddress;
