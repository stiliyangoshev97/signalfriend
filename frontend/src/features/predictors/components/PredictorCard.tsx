/**
 * @fileoverview Predictor Card component
 * @module features/predictors/components/PredictorCard
 * @description
 * Displays a predictor's public profile in a card format.
 * Used in the leaderboard and predictor list pages.
 */

import { Link } from 'react-router-dom';
import type { Predictor } from '@/shared/types';
import { Avatar } from '@/shared/components/ui';
import { formatAddress } from '@/shared/utils/format';

/** Props for PredictorCard component */
interface PredictorCardProps {
  /** The predictor to display */
  predictor: Predictor;
  /** Optional rank number for leaderboard display */
  rank?: number;
}

/**
 * Get rank badge styling based on position
 * @param rank - Position in leaderboard (1-indexed)
 */
function getRankStyle(rank: number): string {
  switch (rank) {
    case 1:
      return 'bg-gradient-to-br from-yellow-400 to-amber-500 text-dark-900 font-bold';
    case 2:
      return 'bg-gradient-to-br from-gray-300 to-gray-400 text-dark-900 font-bold';
    case 3:
      return 'bg-gradient-to-br from-amber-600 to-amber-700 text-white font-bold';
    default:
      return 'bg-dark-600 text-fur-cream';
  }
}

/**
 * Format rating with star
 * @param rating - Average rating (0-5)
 */
function formatRating(rating: number | undefined): string {
  if (!rating || rating === 0) return 'No ratings';
  return `⭐ ${rating.toFixed(1)}`;
}

/**
 * PredictorCard component
 * 
 * Displays a predictor's key information:
 * - Avatar and display name
 * - Verification badge
 * - Total signals and sales
 * - Average rating
 * - Optional rank badge for leaderboard
 * 
 * @param props - Component props
 * @returns Predictor card element
 * 
 * @example
 * // Basic usage
 * <PredictorCard predictor={predictorData} />
 * 
 * @example
 * // With rank for leaderboard
 * <PredictorCard predictor={predictorData} rank={1} />
 */
export function PredictorCard({ predictor, rank }: PredictorCardProps): React.ReactElement {
  const displayName = predictor.displayName || formatAddress(predictor.walletAddress);
  const totalSignals = predictor.totalSignals ?? 0;
  const totalSales = predictor.totalSales ?? predictor.totalSalesCount ?? 0;

  return (
    <Link
      to={`/predictors/${predictor.walletAddress}`}
      className="group flex flex-col h-full bg-dark-800 border border-dark-600 rounded-xl p-5 hover:border-fur-light/50 hover:shadow-lg hover:shadow-fur-light/10 transition-all duration-300"
    >
      {/* Header: Avatar + Name + Rank */}
      <div className="flex items-start gap-4 mb-4">
        {/* Rank Badge */}
        {rank && (
          <div
            className={`flex items-center justify-center w-8 h-8 rounded-lg text-sm ${getRankStyle(rank)}`}
          >
            #{rank}
          </div>
        )}

        {/* Avatar */}
        <Avatar
          src={predictor.avatarUrl}
          name={predictor.displayNameChanged ? predictor.displayName : 'P'}
          address={predictor.walletAddress}
          size="lg"
        />

        {/* Name & Badges */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-fur-cream truncate group-hover:text-fur-light transition-colors">
              {displayName}
            </h3>
            {predictor.isVerified && (
              <span
                className="flex-shrink-0 text-brand-400"
                title="Verified Predictor"
              >
                ✓
              </span>
            )}
          </div>
          <p className="text-sm text-gray-main truncate">
            {formatAddress(predictor.walletAddress)}
          </p>
        </div>
      </div>

      {/* Bio (if available) */}
      {predictor.bio && (
        <p className="text-sm text-fur-cream/70 mb-4 line-clamp-2">
          {predictor.bio}
        </p>
      )}

      {/* Stats Grid */}
      <div className="mt-auto grid grid-cols-3 gap-2 pt-4 border-t border-dark-600">
        {/* Signals */}
        <div className="text-center">
          <div className="text-lg font-semibold text-fur-light">
            {totalSignals}
          </div>
          <div className="text-xs text-gray-main">Signals</div>
        </div>

        {/* Sales */}
        <div className="text-center">
          <div className="text-lg font-semibold text-fur-light">
            {totalSales}
          </div>
          <div className="text-xs text-gray-main">Sales</div>
        </div>

        {/* Rating */}
        <div className="text-center">
          <div className="text-lg font-semibold text-fur-light">
            {formatRating(predictor.averageRating)}
          </div>
          <div className="text-xs text-gray-main">
            {predictor.totalReviews > 0 ? `${predictor.totalReviews} reviews` : 'Rating'}
          </div>
        </div>
      </div>

      {/* Joined Date */}
      <div className="mt-3 text-xs text-gray-main text-center">
        Joined {new Date(predictor.joinedAt).toLocaleDateString('en-US', {
          month: 'short',
          year: 'numeric',
        })}
      </div>
    </Link>
  );
}
