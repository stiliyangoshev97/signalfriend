/**
 * @fileoverview Blacklisted Predictor Card Component
 * @module features/admin/components/BlacklistedPredictorCard
 * @description
 * Card component displaying a blacklisted predictor with option to unblacklist.
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, CopyableAddress } from '@/shared/components/ui';
import { formatAddress } from '@/shared/utils/format';
import type { BlacklistedPredictor } from '../types';

interface BlacklistedPredictorCardProps {
  predictor: BlacklistedPredictor;
  onUnblacklist: (address: string) => Promise<void>;
  isProcessing?: boolean;
}

/**
 * BlacklistedPredictorCard Component
 * 
 * Displays blacklisted predictor info with unblacklist action.
 */
export function BlacklistedPredictorCard({
  predictor,
  onUnblacklist,
  isProcessing = false,
}: BlacklistedPredictorCardProps) {
  const [isConfirming, setIsConfirming] = useState(false);

  const handleUnblacklist = async () => {
    if (!isConfirming) {
      setIsConfirming(true);
      return;
    }
    
    await onUnblacklist(predictor.walletAddress);
    setIsConfirming(false);
  };

  const displayName = predictor.displayName || formatAddress(predictor.walletAddress);
  const blacklistedDate = new Date(predictor.updatedAt).toLocaleDateString();

  return (
    <div className="bg-dark-800 border border-red-500/30 rounded-xl p-4 hover:border-red-500/50 transition-colors">
      <div className="flex items-start justify-between gap-4">
        {/* Predictor Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Link
              to={`/predictors/${predictor.walletAddress}`}
              className="text-fur-cream font-medium hover:text-brand-400 transition-colors truncate"
            >
              {displayName}
            </Link>
            <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full">
              Blacklisted
            </span>
          </div>
          
          <div className="mb-3">
            <CopyableAddress address={predictor.walletAddress} />
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-4 text-sm text-gray-main">
            <div>
              <span className="text-fur-cream/60">Signals:</span>{' '}
              <span className="text-fur-cream">{predictor.totalSignals}</span>
            </div>
            <div>
              <span className="text-fur-cream/60">Sales:</span>{' '}
              <span className="text-fur-cream">{predictor.totalSales}</span>
            </div>
            <div>
              <span className="text-fur-cream/60">Rating:</span>{' '}
              <span className="text-fur-cream">
                {predictor.averageRating ? `${predictor.averageRating.toFixed(1)} ⭐` : 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-fur-cream/60">Blacklisted:</span>{' '}
              <span className="text-fur-cream">{blacklistedDate}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          {isConfirming ? (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setIsConfirming(false)}
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                variant="primary"
                onClick={handleUnblacklist}
                isLoading={isProcessing}
                disabled={isProcessing}
              >
                Confirm
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              variant="secondary"
              onClick={handleUnblacklist}
              disabled={isProcessing}
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Unblacklist
            </Button>
          )}
          
          <Link to={`/predictors/${predictor.walletAddress}`}>
            <Button size="sm" variant="ghost" className="w-full">
              View Profile
            </Button>
          </Link>
        </div>
      </div>

      {/* Warning Note */}
      <div className="mt-3 pt-3 border-t border-dark-700">
        <p className="text-xs text-yellow-400/80">
          ⚠️ Remember to also unblacklist on-chain via MultiSig on BscScan for full effect.
        </p>
      </div>
    </div>
  );
}
