/**
 * @fileoverview Rating Section Component
 * @module features/signals/components/RatingSection
 * @description
 * Allows users to rate purchased signals.
 * 
 * NOTE: Ratings are PERMANENT. Once submitted, they cannot be changed or deleted.
 * This ensures rating integrity and prevents manipulation.
 */

import { useState } from 'react';
import { StarRating } from '@/shared/components/ui';
import { useCheckReview, useGetReview, useCreateReview } from '../hooks';

interface RatingSectionProps {
  /** SignalKeyNFT token ID from purchase receipt */
  tokenId: number;
  /** Signal title for display */
  signalTitle: string;
  /** Signal's content ID (for cache invalidation) */
  contentId?: string;
  /** Predictor's wallet address (for cache invalidation) */
  predictorAddress?: string;
}

/**
 * RatingSection component for rating purchased signals.
 * 
 * Shows either:
 * - Interactive rating form (if not yet rated)
 * - Read-only display of existing rating (if already rated)
 */
export function RatingSection({ tokenId, signalTitle, contentId, predictorAddress }: RatingSectionProps): React.ReactElement {
  const [selectedRating, setSelectedRating] = useState(0);
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  const { data: checkData, isLoading: isCheckingReview } = useCheckReview(tokenId);
  const { data: existingReview } = useGetReview(tokenId);
  const { mutate: submitRating, isPending: isSubmitting, isSuccess, error } = useCreateReview({
    contentId,
    predictorAddress,
  });

  const hasReview = checkData?.hasReview || isSuccess;

  /**
   * Handle rating selection
   */
  const handleRatingChange = (value: number) => {
    setSelectedRating(value);
    setShowConfirmation(true);
  };

  /**
   * Submit the rating
   */
  const handleSubmit = () => {
    if (selectedRating < 1 || selectedRating > 5) return;
    
    submitRating(
      { tokenId, score: selectedRating },
      {
        onSuccess: () => {
          setShowConfirmation(false);
        },
      }
    );
  };

  /**
   * Cancel rating submission
   */
  const handleCancel = () => {
    setSelectedRating(0);
    setShowConfirmation(false);
  };

  // Loading state
  if (isCheckingReview) {
    return (
      <div className="bg-dark-800 border border-dark-600 rounded-xl p-6">
        <div className="animate-pulse">
          <div className="h-5 bg-dark-600 rounded w-1/3 mb-4"></div>
          <div className="h-8 bg-dark-600 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  // Already rated - show read-only rating
  if (hasReview) {
    const displayRating = existingReview?.score || selectedRating;
    
    return (
      <div className="bg-dark-800 border border-dark-600 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-3">
          <svg
            className="w-5 h-5 text-success-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          <h3 className="text-lg font-semibold text-fur-cream">
            Your Rating
          </h3>
        </div>
        
        <div className="flex items-center gap-3">
          <StarRating value={displayRating} readOnly size="lg" />
          <span className="text-fur-cream/70">
            You rated this signal {displayRating} star{displayRating !== 1 ? 's' : ''}
          </span>
        </div>
        
        <p className="text-sm text-fur-cream/50 mt-3">
          Thank you for your feedback! Ratings are permanent and help other users make informed decisions.
        </p>
      </div>
    );
  }

  // Interactive rating form
  return (
    <div className="bg-dark-800 border border-dark-600 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-fur-cream mb-2">
        Rate This Signal
      </h3>
      <p className="text-sm text-fur-cream/60 mb-4">
        How would you rate "{signalTitle}"? Your rating helps other users.
      </p>

      {/* Star Rating Input */}
      <div className="flex items-center gap-4 mb-4">
        <StarRating
          value={selectedRating}
          onChange={handleRatingChange}
          size="lg"
          disabled={isSubmitting}
        />
        {selectedRating > 0 && !showConfirmation && (
          <span className="text-fur-cream/70">
            {selectedRating} star{selectedRating !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Confirmation Dialog */}
      {showConfirmation && (
        <div className="bg-dark-700 border border-fur-light/20 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-fur-light mt-0.5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div className="flex-1">
              <p className="text-fur-cream font-medium mb-1">
                Confirm your rating: {selectedRating} star{selectedRating !== 1 ? 's' : ''}
              </p>
              <p className="text-sm text-fur-cream/60 mb-3">
                <strong>Warning:</strong> Ratings are permanent and cannot be changed or deleted.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-fur-light hover:bg-fur-main text-dark-900 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Rating'}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-dark-600 hover:bg-dark-500 text-fur-cream font-medium rounded-lg transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-accent-red/10 border border-accent-red/30 rounded-lg p-3 text-accent-red text-sm">
          {error.message || 'Failed to submit rating. Please try again.'}
        </div>
      )}

      {/* Info Text */}
      {!showConfirmation && (
        <p className="text-xs text-fur-cream/40">
          Click on the stars to rate. Ratings are permanent to ensure integrity.
        </p>
      )}
    </div>
  );
}

export default RatingSection;
