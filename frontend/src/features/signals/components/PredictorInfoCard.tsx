/**
 * @fileoverview Predictor Info Card for Signal Detail Page
 * @module features/signals/components/PredictorInfoCard
 * @description
 * Displays predictor information including avatar, name, stats, and verification status.
 * Used in the signal detail page sidebar.
 */

import { Link } from 'react-router-dom';
import type { Predictor } from '@/shared/types';
import { CopyableAddress } from '@/shared/components/ui';

/** Props for PredictorInfoCard component */
interface PredictorInfoCardProps {
  /** Predictor data */
  predictor: Predictor;
  /** Predictor wallet address (fallback if predictor data incomplete) */
  walletAddress: string;
}

/**
 * Verified badge icon component
 */
function VerifiedBadge(): React.ReactElement {
  return (
    <svg className="w-5 h-5 text-fur-light" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
        clipRule="evenodd"
      />
    </svg>
  );
}

/**
 * Star rating icon component
 */
function StarIcon({ filled }: { filled: boolean }): React.ReactElement {
  return (
    <svg
      className={`w-4 h-4 ${filled ? 'text-yellow-400' : 'text-dark-600'}`}
      fill="currentColor"
      viewBox="0 0 20 20"
    >
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

/**
 * Format wallet address to shortened version
 * @param address - Full wallet address
 * @returns Shortened address (0x1234...5678)
 */
function formatAddress(address: string): string {
  if (!address || address.length < 10) return address || 'Unknown';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * PredictorInfoCard component
 * 
 * Displays:
 * - Avatar with initials fallback
 * - Display name or wallet address
 * - Verification badge if verified
 * - Stats: Total sales, average rating, total reviews
 * - Link to predictor profile
 * 
 * @param props - Component props
 * @returns Predictor info card element
 * 
 * @example
 * <PredictorInfoCard
 *   predictor={signal.predictor}
 *   walletAddress={signal.predictorWallet}
 * />
 */
export function PredictorInfoCard({
  predictor,
  walletAddress,
}: PredictorInfoCardProps): React.ReactElement {
  const displayName = predictor.displayName || formatAddress(walletAddress);
  const initial = predictor.displayName?.charAt(0).toUpperCase() || 'P';
  // Check both isVerified boolean and verificationStatus enum for compatibility
  const isVerified = predictor.isVerified || predictor.verificationStatus === 'verified';
  const rating = predictor.averageRating || 0;
  const fullStars = Math.floor(rating);

  return (
    <div className="bg-dark-800 border border-dark-600 rounded-xl p-6">
      <h3 className="text-sm font-medium text-fur-cream/60 uppercase tracking-wide mb-4">
        Predictor
      </h3>

      {/* Predictor Profile Link */}
      <Link
        to={`/predictors/${walletAddress}`}
        className="flex items-center gap-3 mb-4 group"
      >
        {/* Avatar */}
        {predictor.avatarUrl ? (
          <img
            src={predictor.avatarUrl}
            alt={displayName}
            className="w-12 h-12 rounded-full object-cover border-2 border-dark-600 group-hover:border-fur-light/50 transition-colors"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-fur-light to-fur-main flex items-center justify-center text-lg font-bold text-dark-900 border-2 border-dark-600 group-hover:border-fur-light/50 transition-colors">
            {initial}
          </div>
        )}

        {/* Name and Verification */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-fur-cream truncate group-hover:text-fur-light transition-colors">
              {displayName}
            </span>
            {isVerified && <VerifiedBadge />}
          </div>
          <div onClick={(e) => e.preventDefault()}>
            <CopyableAddress address={walletAddress} size="sm" />
          </div>
        </div>

        {/* Arrow */}
        <svg
          className="w-5 h-5 text-fur-cream/40 group-hover:text-fur-light group-hover:translate-x-1 transition-all"
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
      </Link>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 pt-4 border-t border-dark-600">
        {/* Total Sales */}
        <div className="text-center">
          <p className="text-lg font-bold text-fur-cream">
            {predictor.totalSales ?? predictor.totalSalesCount ?? 0}
          </p>
          <p className="text-xs text-fur-cream/50">Sales</p>
        </div>

        {/* Average Rating */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-0.5 mb-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <StarIcon key={star} filled={star <= fullStars} />
            ))}
          </div>
          <p className="text-xs text-fur-cream/50">
            {rating > 0 ? rating.toFixed(1) : 'N/A'}
          </p>
        </div>

        {/* Total Reviews */}
        <div className="text-center">
          <p className="text-lg font-bold text-fur-cream">
            {predictor.totalReviews ?? 0}
          </p>
          <p className="text-xs text-fur-cream/50">Reviews</p>
        </div>
      </div>

      {/* Bio (if available) */}
      {predictor.bio && (
        <div className="mt-4 pt-4 border-t border-dark-600">
          <p className="text-sm text-fur-cream/70 line-clamp-3 break-all">
            {predictor.bio}
          </p>
        </div>
      )}
    </div>
  );
}

export default PredictorInfoCard;
