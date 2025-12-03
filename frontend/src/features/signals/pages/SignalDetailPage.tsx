/**
 * @fileoverview Signal Detail Page
 * @module features/signals/pages/SignalDetailPage
 * @description
 * Full detail view for a single signal. Shows all public information,
 * purchase options, predictor info, and protected content (if owned).
 * 
 * Route: /signals/:contentId
 * 
 * FEATURES:
 * - Full signal information display
 * - Risk/reward badges
 * - Expiry countdown
 * - Predictor profile card
 * - Purchase flow (connect → sign in → approve → purchase)
 * - Protected content reveal for owners
 * - Related signals (TODO: future enhancement)
 * - Breadcrumb navigation
 * 
 * DATA FLOW:
 * 1. Extract contentId from URL params
 * 2. Fetch signal data with useSignal hook
 * 3. Check ownership status (TODO: implement with receipt check)
 * 4. Render appropriate UI based on loading/error/success states
 */

import { useParams, Link } from 'react-router-dom';
import { format, isValid, parseISO } from 'date-fns';
import { useSignal } from '../hooks';
import { SignalDetailSkeleton } from '../components/SignalDetailSkeleton';
import { PredictorInfoCard } from '../components/PredictorInfoCard';
import { PurchaseCard } from '../components/PurchaseCard';
import { SignalContent } from '../components/SignalContent';

/**
 * Risk level badge colors and labels
 */
const riskConfig: Record<string, { color: string; label: string }> = {
  low: {
    color: 'bg-green-500/20 text-green-400 border-green-500/30',
    label: 'Low Risk',
  },
  medium: {
    color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    label: 'Medium Risk',
  },
  high: {
    color: 'bg-red-500/20 text-red-400 border-red-500/30',
    label: 'High Risk',
  },
};

/**
 * Potential reward badge colors and labels
 */
const rewardConfig: Record<string, { color: string; label: string }> = {
  normal: {
    color: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    label: 'Normal Reward',
  },
  medium: {
    color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    label: 'Medium Reward',
  },
  high: {
    color: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    label: 'High Reward',
  },
};

/**
 * Safely parse and format dates
 */
function parseDate(dateString: string): Date | null {
  try {
    const date = parseISO(dateString);
    if (isValid(date)) return date;
    const fallback = new Date(dateString);
    if (isValid(fallback)) return fallback;
    return null;
  } catch {
    return null;
  }
}

/**
 * Format creation date
 */
function formatCreatedAt(createdAt: string): string {
  const date = parseDate(createdAt);
  if (!date) return 'Unknown';
  return format(date, 'MMM d, yyyy');
}

/**
 * Chevron right icon for breadcrumb
 */
function ChevronRightIcon(): React.ReactElement {
  return (
    <svg
      className="w-4 h-4 text-fur-cream/40"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 5l7 7-7 7"
      />
    </svg>
  );
}

/**
 * SignalDetailPage component
 * 
 * Main page component for displaying a single signal's full details.
 * 
 * @returns Signal detail page element
 * 
 * @example
 * // In router
 * { path: 'signals/:contentId', element: <SignalDetailPage /> }
 */
export function SignalDetailPage(): React.ReactElement {
  const { contentId } = useParams<{ contentId: string }>();
  const { data: signal, isLoading, error } = useSignal(contentId || '');

  // TODO: Check if user owns this signal (via receipt NFT)
  const isOwned = false; // Placeholder until receipt check is implemented

  // Loading state
  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <SignalDetailSkeleton />
      </div>
    );
  }

  // Error state
  if (error || !signal) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-dark-800 border border-dark-600 rounded-xl p-8 text-center">
          <svg
            className="w-16 h-16 text-accent-red/50 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h2 className="text-2xl font-bold text-fur-cream mb-2">
            Signal Not Found
          </h2>
          <p className="text-fur-cream/60 mb-6">
            {error?.message || "The signal you're looking for doesn't exist or has been removed."}
          </p>
          <Link
            to="/signals"
            className="inline-flex items-center gap-2 text-fur-light hover:text-fur-cream transition-colors"
          >
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
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  // Get status info - backend uses isActive, not expiresAt
  const isActive = signal.isActive !== false;
  const riskLevel = signal.riskLevel || 'medium';
  const potentialReward = signal.potentialReward || 'normal';

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm mb-6">
        <Link
          to="/signals"
          className="text-fur-cream/60 hover:text-fur-light transition-colors"
        >
          Marketplace
        </Link>
        <ChevronRightIcon />
        {signal.category && (
          <>
            <Link
              to={`/signals?category=${signal.categoryId}`}
              className="text-fur-cream/60 hover:text-fur-light transition-colors"
            >
              {signal.category.name}
            </Link>
            <ChevronRightIcon />
          </>
        )}
        <span className="text-fur-cream truncate max-w-[200px]">
          {signal.title}
        </span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content (2/3 width on large screens) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Signal Header */}
          <div className="bg-dark-800 border border-dark-600 rounded-xl p-6">
            {/* Category and Status Badges */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {signal.category && (
                <span className="text-xs font-medium text-fur-light bg-fur-light/10 px-3 py-1 rounded-full">
                  {signal.category.name}
                </span>
              )}
              {!isActive ? (
                <span className="text-xs font-medium text-accent-red bg-accent-red/10 px-3 py-1 rounded-full">
                  Inactive
                </span>
              ) : (
                <span className="text-xs font-medium text-success-400 bg-success-400/10 px-3 py-1 rounded-full">
                  Active
                </span>
              )}
            </div>

            {/* Title - backend uses 'title' not 'name' */}
            <h1 className="text-2xl sm:text-3xl font-bold text-fur-cream mb-4">
              {signal.title}
            </h1>

            {/* Description */}
            <p className="text-fur-cream/70 leading-relaxed mb-6">
              {signal.description}
            </p>

            {/* Risk & Reward Badges */}
            <div className="flex flex-wrap gap-3">
              <span
                className={`inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg border ${riskConfig[riskLevel]?.color || riskConfig.medium.color}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {riskConfig[riskLevel]?.label || 'Medium Risk'}
              </span>
              <span
                className={`inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg border ${rewardConfig[potentialReward]?.color || rewardConfig.normal.color}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                {rewardConfig[potentialReward]?.label || 'Normal Reward'}
              </span>
            </div>
          </div>

          {/* Signal Details */}
          <div className="bg-dark-800 border border-dark-600 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-fur-cream mb-4">
              Signal Details
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {/* Created Date */}
              <div>
                <p className="text-xs text-fur-cream/50 uppercase tracking-wide mb-1">
                  Created
                </p>
                <p className="text-sm font-medium text-fur-cream">
                  {formatCreatedAt(signal.createdAt)}
                </p>
              </div>

              {/* Status */}
              <div>
                <p className="text-xs text-fur-cream/50 uppercase tracking-wide mb-1">
                  Status
                </p>
                <p
                  className={`text-sm font-medium ${
                    !isActive ? 'text-accent-red' : 'text-success-400'
                  }`}
                >
                  {isActive ? 'Active' : 'Inactive'}
                </p>
              </div>

              {/* Total Sales */}
              <div>
                <p className="text-xs text-fur-cream/50 uppercase tracking-wide mb-1">
                  Sales
                </p>
                <p className="text-sm font-medium text-fur-cream">
                  {signal.totalSales ?? 0}
                </p>
              </div>

              {/* Content ID */}
              <div>
                <p className="text-xs text-fur-cream/50 uppercase tracking-wide mb-1">
                  Signal ID
                </p>
                <p className="text-sm font-medium text-fur-cream/70 font-mono truncate" title={signal.contentId}>
                  {signal.contentId.slice(0, 8)}...
                </p>
              </div>
            </div>
          </div>

          {/* Signal Content (locked or unlocked) */}
          <SignalContent
            isOwned={isOwned}
            fullContent={signal.content}
            reasoning={undefined}
            priceUSDT={signal.priceUsdt}
          />
        </div>

        {/* Sidebar (1/3 width on large screens) */}
        <div className="space-y-6">
          {/* Purchase Card */}
          <PurchaseCard
            priceUSDT={signal.priceUsdt}
            isExpired={!isActive}
            isOwned={isOwned}
            contentId={signal.contentId}
            onPurchase={() => {
              // TODO: Implement purchase flow modal
              console.log('Purchase clicked for:', signal.contentId);
            }}
          />

          {/* Predictor Info Card */}
          {signal.predictor ? (
            <PredictorInfoCard
              predictor={signal.predictor}
              walletAddress={signal.predictorAddress}
            />
          ) : (
            <div className="bg-dark-800 border border-dark-600 rounded-xl p-6">
              <h3 className="text-sm font-medium text-fur-cream/60 uppercase tracking-wide mb-4">
                Predictor
              </h3>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-dark-400 to-dark-600 flex items-center justify-center text-lg font-bold text-fur-cream">
                  P
                </div>
                <div>
                  <p className="font-semibold text-fur-cream">
                    {signal.predictorAddress
                      ? `${signal.predictorAddress.slice(0, 6)}...${signal.predictorAddress.slice(-4)}`
                      : 'Unknown Predictor'}
                  </p>
                  <p className="text-sm text-fur-cream/50">Predictor</p>
                </div>
              </div>
            </div>
          )}

          {/* Share Card */}
          <div className="bg-dark-800 border border-dark-600 rounded-xl p-6">
            <h3 className="text-sm font-medium text-fur-cream/60 uppercase tracking-wide mb-4">
              Share Signal
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  // TODO: Add toast notification
                }}
                className="flex-1 flex items-center justify-center gap-2 bg-dark-700 hover:bg-dark-600 text-fur-cream/80 hover:text-fur-cream px-3 py-2 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy Link
              </button>
              <a
                href={`https://twitter.com/intent/tweet?text=Check out this signal on SignalFriend!&url=${encodeURIComponent(window.location.href)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-dark-700 hover:bg-dark-600 text-fur-cream/80 hover:text-fur-cream px-3 py-2 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignalDetailPage;
