/**
 * @fileoverview Signal Card component
 * @module features/signals/components/SignalCard
 * @description
 * Displays a signal's public information in a card format.
 * Used in the marketplace grid to show available signals.
 */

import { Link } from 'react-router-dom';
import type { Signal } from '@/shared/types';
import { isValid, parseISO } from 'date-fns';

/** Props for SignalCard component */
interface SignalCardProps {
  /** The signal to display */
  signal: Signal;
  /** Whether the current user has purchased this signal */
  isPurchased?: boolean;
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
 * Potential reward badge colors - matches filter panel theme
 */
const rewardColors: Record<string, string> = {
  normal: 'bg-fur-cream/10 text-fur-cream border-fur-cream/30',
  medium: 'bg-fur-light/20 text-fur-light border-fur-light/30',
  high: 'bg-fur-main/20 text-fur-main border-fur-main/30',
};

/**
 * Safely parse and format expiry date
 * @param expiresAt - Date string from API
 * @returns Object with isExpired flag and display text
 * 
 * @note Currently unused - will be used when backend adds expiresAt field.
 *       To use: const { isExpired, text } = getExpiryInfo(signal.expiresAt);
 */
export function getExpiryInfo(expiresAt: string): { isExpired: boolean; text: string } {
  try {
    const date = parseISO(expiresAt);
    const targetDate = isValid(date) ? date : new Date(expiresAt);
    
    if (!isValid(targetDate)) {
      return { isExpired: false, text: 'Unknown' };
    }
    
    const now = new Date();
    const isExpired = targetDate < now;
    
    if (isExpired) {
      return { isExpired: true, text: 'Expired' };
    }
    
    // Calculate time difference for abbreviated format
    const diffMs = targetDate.getTime() - now.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    let timeText: string;
    if (diffDays > 0) {
      timeText = `${diffDays}d`;
    } else if (diffHours > 0) {
      timeText = `${diffHours}h`;
    } else {
      timeText = `${diffMins}m`;
    }
    
    return {
      isExpired: false,
      text: `Expires in ${timeText}`,
    };
  } catch {
    return { isExpired: false, text: 'Unknown' };
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
 * - Title (description shown on detail page)
 * - Category badge
 * - Risk level and potential reward
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
export function SignalCard({ signal, isPurchased = false }: SignalCardProps): React.ReactElement {
  // Get expiry info for display
  const { isExpired, text: expiryText } = getExpiryInfo(signal.expiresAt);
  
  // Safe defaults for risk and reward (optional fields)
  const riskLevel = signal.riskLevel || 'medium';
  const potentialReward = signal.potentialReward || 'normal';
  // Backend uses predictorAddress, not predictorWallet
  const predictorAddress = signal.predictorAddress || '';
  // Backend uses isActive for status - also check expiry
  const isActive = signal.isActive !== false && !isExpired;

  return (
    <Link
      to={`/signals/${signal.contentId}`}
      className="group flex flex-col h-full bg-dark-800 border border-dark-600 rounded-xl p-5 hover:border-fur-light/50 hover:shadow-lg hover:shadow-fur-light/10 transition-all duration-300"
    >
      {/* Header: Category & Status */}
      <div className="flex items-center justify-between mb-3">
        {signal.category ? (
          <span className="text-xs font-medium text-fur-light bg-fur-light/10 px-2 py-1 rounded-full truncate max-w-[60%]" title={`${signal.category.mainGroup || signal.mainGroup} > ${signal.category.name}`}>
            {signal.category.mainGroup || signal.mainGroup} &gt; {signal.category.name}
          </span>
        ) : (
          <span className="text-xs font-medium text-fur-cream/50 bg-dark-700 px-2 py-1 rounded-full">
            Uncategorized
          </span>
        )}
        {/* Status Badge - Purchased takes priority over Active/Inactive */}
        {isPurchased ? (
          <span className="text-xs font-medium text-green-400 bg-green-500/20 px-2 py-1 rounded-full flex items-center gap-1 border border-green-500/30">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Purchased
          </span>
        ) : !isActive ? (
          <span className="text-xs font-medium text-accent-red bg-accent-red/10 px-2 py-1 rounded-full">
            Inactive
          </span>
        ) : (
          <span className="text-xs font-medium text-success-400 bg-success-400/10 px-2 py-1 rounded-full">
            Active
          </span>
        )}
      </div>

      {/* Title - fixed height for 2 lines */}
      <h3 className="text-lg font-semibold text-fur-cream mb-3 line-clamp-2 min-h-[3.5rem] group-hover:text-fur-light transition-colors break-words">
        {signal.title || 'Untitled Signal'}
      </h3>

      {/* Risk & Reward Badges */}
      <div className="flex flex-wrap gap-2 mb-3">
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
      <div className="flex items-center gap-2 mb-4">
        {signal.predictor ? (
          <>
            {signal.predictor.avatarUrl ? (
              <img 
                src={signal.predictor.avatarUrl} 
                alt={signal.predictor.displayName || 'Predictor'} 
                className="w-6 h-6 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-fur-light to-fur-main flex items-center justify-center text-xs font-bold text-dark-900 flex-shrink-0">
                {signal.predictor.displayName?.charAt(0) || 'P'}
              </div>
            )}
            <span className="text-sm text-fur-cream/80 truncate">
              {signal.predictor.displayName || (predictorAddress ? `${predictorAddress.slice(0, 6)}...${predictorAddress.slice(-4)}` : 'Unknown')}
            </span>
            {signal.predictor.isVerified && (
              <svg className="w-4 h-4 text-fur-light flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </>
        ) : predictorAddress ? (
          <>
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-dark-400 to-dark-600 flex items-center justify-center text-xs font-bold text-fur-cream flex-shrink-0">
              P
            </div>
            <span className="text-sm text-fur-cream/80 truncate">
              {`${predictorAddress.slice(0, 6)}...${predictorAddress.slice(-4)}`}
            </span>
          </>
        ) : (
          <span className="text-sm text-fur-cream/50">Unknown predictor</span>
        )}
      </div>

      {/* Footer: Price, Expiry, Sales - pushed to bottom */}
      <div className="flex items-center justify-between pt-4 mt-auto border-t border-dark-600">
        <div>
          <span className="text-2xl font-bold text-fur-light">
            ${signal.priceUsdt ?? 0}
          </span>
          <span className="text-sm text-fur-cream/50 ml-1">USDT</span>
        </div>
        <div className="text-right text-xs">
          <p className={`whitespace-nowrap ${isExpired ? 'text-accent-red' : 'text-fur-cream/50'}`}>
            {expiryText}
          </p>
          <p className="text-fur-cream/60 whitespace-nowrap">
            {signal.totalSales ?? 0} {(signal.totalSales ?? 0) === 1 ? 'sale' : 'sales'}
          </p>
        </div>
      </div>
    </Link>
  );
}

export default SignalCard;
