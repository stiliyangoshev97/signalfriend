/**
 * @fileoverview Predictor Grid component
 * @module features/predictors/components/PredictorGrid
 * @description
 * Grid layout for displaying predictor cards with loading,
 * empty, and error states.
 */

import type { Predictor } from '@/shared/types';
import { PredictorCard } from './PredictorCard';
import { Spinner } from '@/shared/components/ui';

/** Props for PredictorGrid component */
interface PredictorGridProps {
  /** Array of predictors to display */
  predictors: Predictor[];
  /** Whether data is currently loading */
  isLoading?: boolean;
  /** Error object if fetch failed */
  error?: Error | null;
  /** Show rank badges (for leaderboard) */
  showRanks?: boolean;
  /** Starting rank offset (for pagination) */
  rankOffset?: number;
}

/**
 * Skeleton loader for predictor cards
 */
function PredictorCardSkeleton(): React.ReactElement {
  return (
    <div className="bg-dark-800 border border-dark-600 rounded-xl p-5 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 bg-dark-600 rounded-full" />
        <div className="flex-1">
          <div className="h-5 bg-dark-600 rounded w-32 mb-2" />
          <div className="h-4 bg-dark-600 rounded w-24" />
        </div>
      </div>

      {/* Bio skeleton */}
      <div className="h-4 bg-dark-600 rounded w-full mb-2" />
      <div className="h-4 bg-dark-600 rounded w-3/4 mb-4" />

      {/* Stats skeleton */}
      <div className="grid grid-cols-3 gap-2 pt-4 border-t border-dark-600">
        {[1, 2, 3].map((i) => (
          <div key={i} className="text-center">
            <div className="h-6 bg-dark-600 rounded w-10 mx-auto mb-1" />
            <div className="h-3 bg-dark-600 rounded w-12 mx-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * PredictorGrid component
 * 
 * Displays predictors in a responsive grid layout with:
 * - Loading skeletons while fetching
 * - Empty state when no results
 * - Error state with retry option
 * - Optional rank badges for leaderboard
 * 
 * @param props - Component props
 * @returns Grid of predictor cards
 * 
 * @example
 * <PredictorGrid
 *   predictors={predictorData}
 *   isLoading={isLoading}
 *   showRanks
 * />
 */
export function PredictorGrid({
  predictors,
  isLoading = false,
  error = null,
  showRanks = false,
  rankOffset = 0,
}: PredictorGridProps): React.ReactElement {
  // Loading state
  if (isLoading && predictors.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <PredictorCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="text-6xl mb-4">😵</div>
        <h3 className="text-xl font-semibold text-fur-cream mb-2">
          Failed to load predictors
        </h3>
        <p className="text-gray-main text-center max-w-md">
          {error.message || 'An error occurred while fetching predictors. Please try again.'}
        </p>
      </div>
    );
  }

  // Empty state
  if (predictors.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-xl font-semibold text-fur-cream mb-2">
          No predictors found
        </h3>
        <p className="text-gray-main text-center max-w-md">
          Try adjusting your filters or search terms to find predictors.
        </p>
      </div>
    );
  }

  // Grid with predictors
  return (
    <div className="relative">
      {/* Loading overlay for pagination */}
      {isLoading && predictors.length > 0 && (
        <div className="absolute inset-0 bg-dark-700/50 flex items-center justify-center z-10 rounded-xl">
          <Spinner size="lg" />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {predictors.map((predictor, index) => (
          <PredictorCard
            key={predictor.walletAddress}
            predictor={predictor}
            rank={showRanks ? rankOffset + index + 1 : undefined}
          />
        ))}
      </div>
    </div>
  );
}
