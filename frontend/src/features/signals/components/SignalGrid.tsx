/**
 * @fileoverview Signal Grid component
 * @module features/signals/components/SignalGrid
 * @description
 * Grid layout for displaying signal cards with loading and empty states.
 */

import type { Signal } from '@/shared/types';
import { SignalCard } from './SignalCard';

/** Props for SignalGrid component */
interface SignalGridProps {
  /** Array of signals to display */
  signals: Signal[];
  /** Whether signals are loading */
  isLoading?: boolean;
  /** Error message if fetch failed */
  error?: string | null;
}

/**
 * Loading skeleton for signal cards
 */
function SignalCardSkeleton() {
  return (
    <div className="bg-dark-800 border border-dark-600 rounded-xl p-5 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="h-5 w-20 bg-dark-600 rounded-full" />
        <div className="h-5 w-16 bg-dark-600 rounded-full" />
      </div>
      {/* Title */}
      <div className="h-6 w-3/4 bg-dark-600 rounded mb-2" />
      {/* Description */}
      <div className="space-y-2 mb-4">
        <div className="h-4 w-full bg-dark-600 rounded" />
        <div className="h-4 w-2/3 bg-dark-600 rounded" />
      </div>
      {/* Badges */}
      <div className="flex gap-2 mb-4">
        <div className="h-6 w-20 bg-dark-600 rounded" />
        <div className="h-6 w-24 bg-dark-600 rounded" />
      </div>
      {/* Predictor */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-6 h-6 bg-dark-600 rounded-full" />
        <div className="h-4 w-24 bg-dark-600 rounded" />
      </div>
      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-dark-600">
        <div className="h-8 w-20 bg-dark-600 rounded" />
        <div className="space-y-1">
          <div className="h-3 w-24 bg-dark-600 rounded" />
          <div className="h-3 w-16 bg-dark-600 rounded ml-auto" />
        </div>
      </div>
    </div>
  );
}

/**
 * Empty state when no signals found
 */
function EmptyState() {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
      <div className="w-24 h-24 mb-6 text-dark-500">
        <svg
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          className="w-full h-full"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <h3 className="text-xl font-semibold text-fur-cream mb-2">
        No signals found
      </h3>
      <p className="text-fur-cream/60 max-w-md">
        Try adjusting your filters or check back later for new signals from our
        verified predictors.
      </p>
    </div>
  );
}

/**
 * Error state when fetch fails
 */
function ErrorState({ message }: { message: string }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
      <div className="w-24 h-24 mb-6 text-accent-red/50">
        <svg
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          className="w-full h-full"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <h3 className="text-xl font-semibold text-fur-cream mb-2">
        Failed to load signals
      </h3>
      <p className="text-fur-cream/60 max-w-md">{message}</p>
    </div>
  );
}

/**
 * SignalGrid component
 * 
 * Displays signals in a responsive grid layout with:
 * - Loading skeletons while fetching
 * - Empty state when no signals match filters
 * - Error state when fetch fails
 * - Signal cards when data is available
 * 
 * @param props - Component props
 * @returns Signal grid element
 * 
 * @example
 * <SignalGrid
 *   signals={signals}
 *   isLoading={isLoading}
 *   error={error?.message}
 * />
 */
export function SignalGrid({
  signals,
  isLoading,
  error,
}: SignalGridProps): React.ReactElement {
  // Loading state
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <SignalCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="grid grid-cols-1">
        <ErrorState message={error} />
      </div>
    );
  }

  // Empty state
  if (!signals.length) {
    return (
      <div className="grid grid-cols-1">
        <EmptyState />
      </div>
    );
  }

  // Signal cards
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {signals.map((signal) => (
        <SignalCard key={signal.contentId} signal={signal} />
      ))}
    </div>
  );
}

export default SignalGrid;
