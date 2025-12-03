/**
 * @fileoverview My Purchased Signals Page
 * @module features/signals/pages/MyPurchasedSignalsPage
 * @description
 * Page showing all signals purchased by the authenticated user.
 * Displays receipts with links to view unlocked signal content.
 *
 * Route: /my-signals (requires authentication)
 *
 * FEATURES:
 * - Grid of purchased signals (receipts)
 * - Sort by purchase date or price
 * - Empty state with CTA to marketplace
 * - Loading skeleton
 * - Error handling
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMyReceipts } from '../hooks';
import { PurchasedSignalCard } from '../components/PurchasedSignalCard';

/**
 * Sort options for purchased signals
 */
type SortOption = 'newest' | 'oldest' | 'price-high' | 'price-low';

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'price-high', label: 'Highest Price' },
  { value: 'price-low', label: 'Lowest Price' },
];

/**
 * Convert sort option to API params
 */
function getSortParams(sort: SortOption): {
  sortBy: 'purchasedAt' | 'priceUsdt';
  sortOrder: 'asc' | 'desc';
} {
  switch (sort) {
    case 'newest':
      return { sortBy: 'purchasedAt', sortOrder: 'desc' };
    case 'oldest':
      return { sortBy: 'purchasedAt', sortOrder: 'asc' };
    case 'price-high':
      return { sortBy: 'priceUsdt', sortOrder: 'desc' };
    case 'price-low':
      return { sortBy: 'priceUsdt', sortOrder: 'asc' };
    default:
      return { sortBy: 'purchasedAt', sortOrder: 'desc' };
  }
}

/**
 * Shopping bag icon for empty state
 */
function ShoppingBagIcon(): React.ReactElement {
  return (
    <svg
      className="w-16 h-16 text-fur-cream/30"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
      />
    </svg>
  );
}

/**
 * Loading skeleton for purchased signal cards
 */
function PurchasedSignalSkeleton(): React.ReactElement {
  return (
    <div className="bg-dark-800 border border-dark-600 rounded-xl p-5 animate-pulse">
      <div className="flex justify-between mb-3">
        <div className="h-6 w-20 bg-dark-600 rounded-full" />
        <div className="h-6 w-16 bg-dark-600 rounded-full" />
      </div>
      <div className="h-6 w-3/4 bg-dark-600 rounded mb-2" />
      <div className="h-4 w-full bg-dark-600 rounded mb-4" />
      <div className="grid grid-cols-2 gap-3 mb-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-16 bg-dark-700 rounded-lg" />
        ))}
      </div>
      <div className="flex gap-3 pt-4 border-t border-dark-600">
        <div className="flex-1 h-10 bg-dark-600 rounded-lg" />
        <div className="w-24 h-10 bg-dark-600 rounded-lg" />
      </div>
    </div>
  );
}

/**
 * MyPurchasedSignalsPage component
 *
 * Shows the user's purchased signals with options to:
 * - Sort by date or price
 * - View signal details (unlocked content)
 * - View transaction on explorer
 *
 * @returns My purchased signals page
 *
 * @example
 * // In router
 * <Route path="/my-signals" element={<ProtectedRoute><MyPurchasedSignalsPage /></ProtectedRoute>} />
 */
export function MyPurchasedSignalsPage(): React.ReactElement {
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  const sortParams = getSortParams(sortBy);
  const { data: receipts, isLoading, error } = useMyReceipts(sortParams);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-fur-cream mb-2">My Signals</h1>
        <p className="text-fur-cream/60">
          View and access all the trading signals you've purchased.
        </p>
      </div>

      {/* Sort Controls */}
      {!isLoading && receipts && receipts.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <p className="text-fur-cream/70">
            <span className="text-fur-light font-semibold">{receipts.length}</span>{' '}
            {receipts.length === 1 ? 'signal' : 'signals'} purchased
          </p>

          <div className="flex items-center gap-3">
            <label htmlFor="sort-select" className="text-sm text-fur-cream/60">
              Sort by:
            </label>
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-dark-700 border border-dark-600 text-fur-cream rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-fur-light/50"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <PurchasedSignalSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="bg-accent-red/10 border border-accent-red/30 rounded-xl p-6 text-center">
          <p className="text-accent-red font-medium mb-2">Failed to load your signals</p>
          <p className="text-fur-cream/60 text-sm">
            {error instanceof Error ? error.message : 'An unexpected error occurred'}
          </p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && receipts && receipts.length === 0 && (
        <div className="bg-dark-800 border border-dark-600 rounded-xl p-12 text-center">
          <div className="flex justify-center mb-4">
            <ShoppingBagIcon />
          </div>
          <h2 className="text-xl font-semibold text-fur-cream mb-2">
            No signals purchased yet
          </h2>
          <p className="text-fur-cream/60 mb-6 max-w-md mx-auto">
            Browse our marketplace to find trading signals from verified predictors.
            Once you purchase a signal, you'll see it here with full access to the content.
          </p>
          <Link
            to="/signals"
            className="inline-flex items-center gap-2 px-6 py-3 bg-fur-light text-dark-900 font-semibold rounded-lg hover:bg-fur-main transition-colors"
          >
            Browse Signals
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </Link>
        </div>
      )}

      {/* Signals Grid */}
      {!isLoading && !error && receipts && receipts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {receipts.map((receipt) => (
            <PurchasedSignalCard key={receipt.tokenId} receipt={receipt} />
          ))}
        </div>
      )}

      {/* Marketplace CTA */}
      {!isLoading && !error && receipts && receipts.length > 0 && (
        <div className="mt-12 bg-gradient-to-r from-fur-light/10 to-fur-main/10 border border-fur-light/20 rounded-xl p-6 text-center">
          <h3 className="text-lg font-semibold text-fur-cream mb-2">
            Looking for more signals?
          </h3>
          <p className="text-fur-cream/60 mb-4">
            Check out our marketplace for the latest trading signals from top predictors.
          </p>
          <Link
            to="/signals"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-fur-light text-dark-900 font-semibold rounded-lg hover:bg-fur-main transition-colors"
          >
            Browse Marketplace
          </Link>
        </div>
      )}
    </div>
  );
}

export default MyPurchasedSignalsPage;
