/**
 * @fileoverview Purchased Signal Card component
 * @module features/signals/components/PurchasedSignalCard
 * @description
 * Displays a purchased signal (receipt) in a card format.
 * Shows ownership status and links to the signal detail page
 * where users can view the unlocked content.
 */

import { Link } from 'react-router-dom';
import { format, parseISO, isValid } from 'date-fns';
import { getExplorerTxUrl } from '@/shared/utils';
import type { Receipt } from '../api/purchase.api';

/** Props for PurchasedSignalCard component */
interface PurchasedSignalCardProps {
  /** The receipt/purchase data */
  receipt: Receipt;
}

/**
 * Safely parse and format date
 * @param dateString - Date string from API
 * @returns Formatted date or fallback
 */
function formatDate(dateString: string): string {
  try {
    const date = parseISO(dateString);
    if (isValid(date)) {
      return format(date, 'MMM d, yyyy');
    }
    const fallback = new Date(dateString);
    if (isValid(fallback)) {
      return format(fallback, 'MMM d, yyyy');
    }
    return 'Unknown date';
  } catch {
    return 'Unknown date';
  }
}

/**
 * Truncate address for display
 */
function truncateAddress(address: string): string {
  if (!address || address.length < 10) return address || 'Unknown';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Key/unlock icon for owned signals
 */
function KeyIcon(): React.ReactElement {
  return (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
      />
    </svg>
  );
}

/**
 * External link icon
 */
function ExternalLinkIcon(): React.ReactElement {
  return (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
      />
    </svg>
  );
}

/**
 * PurchasedSignalCard component
 *
 * Displays a purchased signal with:
 * - Signal title and category
 * - Purchase date and price paid
 * - Token ID (NFT)
 * - Link to view full content
 * - Transaction hash link to explorer
 *
 * @param props - Component props
 * @returns Purchased signal card element
 *
 * @example
 * <PurchasedSignalCard receipt={receiptData} />
 */
export function PurchasedSignalCard({ receipt }: PurchasedSignalCardProps): React.ReactElement {
  const signalTitle = receipt.signal?.title || 'Untitled Signal';
  const categoryName = receipt.signal?.category?.name;
  const purchaseDate = formatDate(receipt.purchasedAt);
  const explorerUrl = getExplorerTxUrl(receipt.transactionHash);

  return (
    <div className="bg-dark-800 border border-dark-600 rounded-xl p-5 hover:border-fur-light/30 transition-all duration-300 flex flex-col h-full">
      {/* Variable content area - grows to fill space */}
      <div className="flex-grow">
        {/* Header: Category & Owned Badge */}
        <div className="flex items-center justify-between mb-3">
          {categoryName ? (
            <span className="text-xs font-medium text-fur-light bg-fur-light/10 px-2 py-1 rounded-full">
              {categoryName}
            </span>
          ) : (
            <span className="text-xs font-medium text-fur-cream/50 bg-dark-700 px-2 py-1 rounded-full">
              Uncategorized
            </span>
          )}
          <span className="flex items-center gap-1.5 text-xs font-medium text-success-400 bg-success-400/10 px-2 py-1 rounded-full">
            <KeyIcon />
            Owned
          </span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-fur-cream mb-2 line-clamp-2">
          {signalTitle}
        </h3>

        {/* Signal Description (if available) */}
        {receipt.signal?.description && (
          <p className="text-sm text-fur-cream/60 mb-4 line-clamp-2">
            {receipt.signal.description}
          </p>
        )}
      </div>

      {/* Fixed content area - always at bottom */}
      {/* Purchase Info Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-dark-900/50 rounded-lg p-3">
          <p className="text-xs text-fur-cream/50 mb-1">Purchased</p>
          <p className="text-sm font-medium text-fur-cream">{purchaseDate}</p>
        </div>
        <div className="bg-dark-900/50 rounded-lg p-3">
          <p className="text-xs text-fur-cream/50 mb-1">Price Paid</p>
          <p className="text-sm font-medium text-fur-light">${receipt.priceUsdt} USDT</p>
        </div>
        <div className="bg-dark-900/50 rounded-lg p-3">
          <p className="text-xs text-fur-cream/50 mb-1">Token ID</p>
          <p className="text-sm font-medium text-fur-cream">#{receipt.tokenId}</p>
        </div>
        <div className="bg-dark-900/50 rounded-lg p-3">
          <p className="text-xs text-fur-cream/50 mb-1">Predictor</p>
          <p className="text-sm font-medium text-fur-cream">
            {truncateAddress(receipt.predictorAddress)}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-dark-600">
        <Link
          to={`/signals/${receipt.contentId}`}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-fur-light text-dark-900 font-semibold rounded-lg hover:bg-fur-main transition-colors"
        >
          <KeyIcon />
          View Signal
        </Link>
        <a
          href={explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-dark-700 text-fur-cream font-medium rounded-lg hover:bg-dark-600 transition-colors"
        >
          <ExternalLinkIcon />
          <span className="hidden sm:inline">View TX</span>
          <span className="sm:hidden">TX</span>
        </a>
      </div>
    </div>
  );
}

export default PurchasedSignalCard;
