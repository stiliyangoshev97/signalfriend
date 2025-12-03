/**
 * @fileoverview Signal Card component
 * @module features/signals/components/SignalCard
 * @description
 * Displays a signal's public information in a card format.
 * Used in the marketplace grid to show available signals.
 */

import { Link } from 'react-router-dom';
import type { Signal } from '@/shared/types';
import { formatDistanceToNow, isValid, parseISO } from 'date-fns';

/** Props for SignalCard component */
interface SignalCardProps {
  /** The signal to display */
  signal: Signal;
}

/**
 * Risk level badge colors
 */
const riskColors: Record<string, string> = {
  low: 'bg-green-500/20 text-green-400 border-green-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  high: 'bg-red-500/20 text-red-400 border-red-500/30',
};

/**
 * Potential reward badge colors
 */
const rewardColors: Record<string, string> = {
  normal: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  medium: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  high: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
};

/**
 * Safely parse and format expiry date
 * @param expiresAt - Date string from API
 * @returns Object with isExpired flag and display text
 */
function getExpiryInfo(expiresAt: string): { isExpired: boolean; text: string } {
  try {
    // Try parsing as ISO string first, then as regular Date
    const date = parseISO(expiresAt);
    
    if (!isValid(date)) {
      // Fallback: try direct Date constructor
      const fallbackDate = new Date(expiresAt);
      if (!isValid(fallbackDate)) {
        return { isExpired: false, text: 'Unknown expiry' };
      }
      const isExpired = fallbackDate < new Date();
      return {
        isExpired,
        text: isExpired ? 'Expired' : `Expires ${formatDistanceToNow(fallbackDate, { addSuffix: true })}`,
      };
    }
    
    const isExpired = date < new Date();
    return {
      isExpired,
      text: isExpired ? 'Expired' : `Expires ${formatDistanceToNow(date, { addSuffix: true })}`,
    };
  } catch {
    return { isExpired: false, text: 'Unknown expiry' };
  }
}

/**
 * Capitalize first letter of a string
 * @param str - String to capitalize
 * @returns Capitalized string or empty string if invalid
 */
function capitalize(str: string | undefined | null): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * SignalCard component
 * 
 * Displays a signal's key information:
 * - Title and description
 * - Category badge
 * - Risk level and potential reward (if available)
 * - Price in USDT
 * - Active status
 * - Predictor info
 * - Total sales
 * 
 * @param props - Component props
 * @returns Signal card element
 * 
 * @example
 * <SignalCard signal={signalData} />
 */
export function SignalCard({ signal }: SignalCardProps): React.ReactElement {
  // Use createdAt for display since backend doesn't have expiresAt yet
  const createdDate = signal.createdAt;
  const { text: createdText } = getExpiryInfo(createdDate);
  
  // Safe defaults for risk and reward (optional fields)
  const riskLevel = signal.riskLevel || 'medium';
  const potentialReward = signal.potentialReward || 'normal';
  // Backend uses predictorAddress, not predictorWallet
  const predictorAddress = signal.predictorAddress || '';
  // Backend uses isActive for status
  const isActive = signal.isActive !== false;

  return (
    <Link
      to={`/signals/${signal.contentId}`}
      className="group block bg-dark-800 border border-dark-600 rounded-xl p-5 hover:border-fur-light/50 hover:shadow-lg hover:shadow-fur-light/10 transition-all duration-300"
    >
      {/* Header: Category & Status */}
      <div className="flex items-center justify-between mb-3">
        {signal.category && (
          <span className="text-xs font-medium text-fur-light bg-fur-light/10 px-2 py-1 rounded-full">
            {signal.category.name}
          </span>
        )}
        {!isActive ? (
          <span className="text-xs font-medium text-accent-red bg-accent-red/10 px-2 py-1 rounded-full">
            Inactive
          </span>
        ) : (
          <span className="text-xs font-medium text-success-400 bg-success-400/10 px-2 py-1 rounded-full">
            Active
          </span>
        )}
      </div>

      {/* Title - backend uses 'title' not 'name' */}
      <h3 className="text-lg font-semibold text-fur-cream mb-2 line-clamp-2 group-hover:text-fur-light transition-colors">
        {signal.title || 'Untitled Signal'}
      </h3>

      {/* Description */}
      <p className="text-sm text-fur-cream/60 mb-4 line-clamp-2">
        {signal.description || 'No description available'}
      </p>

      {/* Risk & Reward Badges */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span
          className={`text-xs font-medium px-2 py-1 rounded border ${riskColors[riskLevel] || riskColors.medium}`}
        >
          {capitalize(riskLevel)} Risk
        </span>
        <span
          className={`text-xs font-medium px-2 py-1 rounded border ${rewardColors[potentialReward] || rewardColors.normal}`}
        >
          {capitalize(potentialReward)} Reward
        </span>
      </div>

      {/* Predictor Info */}
      {signal.predictor ? (
        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-fur-light to-fur-main flex items-center justify-center text-xs font-bold text-dark-900">
            {signal.predictor.displayName?.charAt(0) || 'P'}
          </div>
          <span className="text-sm text-fur-cream/80 truncate">
            {signal.predictor.displayName || (predictorAddress ? `${predictorAddress.slice(0, 6)}...${predictorAddress.slice(-4)}` : 'Unknown')}
          </span>
          {signal.predictor.verificationStatus === 'verified' && (
            <svg className="w-4 h-4 text-fur-light" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </div>
      ) : predictorAddress ? (
        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-dark-400 to-dark-600 flex items-center justify-center text-xs font-bold text-fur-cream">
            P
          </div>
          <span className="text-sm text-fur-cream/80 truncate">
            {`${predictorAddress.slice(0, 6)}...${predictorAddress.slice(-4)}`}
          </span>
        </div>
      ) : null}

      {/* Footer: Price, Created, Sales */}
      <div className="flex items-center justify-between pt-4 border-t border-dark-600">
        <div>
          <span className="text-2xl font-bold text-fur-light">
            ${signal.priceUsdt ?? 0}
          </span>
          <span className="text-sm text-fur-cream/50 ml-1">USDT</span>
        </div>
        <div className="text-right">
          <p className="text-xs text-fur-cream/50">{createdText}</p>
          <p className="text-xs text-fur-cream/60">
            {signal.totalSales ?? 0} {(signal.totalSales ?? 0) === 1 ? 'sale' : 'sales'}
          </p>
        </div>
      </div>
    </Link>
  );
}

export default SignalCard;
