/**
 * @fileoverview Blacklist Banner Component
 * @module features/predictors/components/BlacklistBanner
 * @description
 * Shows a warning banner when a predictor is blacklisted.
 * Allows them to file a dispute if they haven't already.
 */

import { useState } from 'react';
import { Button, Modal } from '@/shared/components/ui';
import { useMyDispute, useCreateDispute } from '../hooks';
import type { DisputeStatus } from '../api';

/**
 * Props for BlacklistBanner component
 */
interface BlacklistBannerProps {
  /** Predictor's preferred contact method (for context) */
  preferredContact?: string;
}

/**
 * Get status badge styling and text
 */
function getStatusDisplay(status: DisputeStatus): { text: string; className: string } {
  switch (status) {
    case 'pending':
      return {
        text: 'Pending Review',
        className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      };
    case 'contacted':
      return {
        text: 'Admin Contacted You',
        className: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      };
    case 'resolved':
      return {
        text: 'Resolved - Unblacklisted',
        className: 'bg-green-500/20 text-green-400 border-green-500/30',
      };
    case 'rejected':
      return {
        text: 'Rejected',
        className: 'bg-red-500/20 text-red-400 border-red-500/30',
      };
    default:
      return {
        text: status,
        className: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
      };
  }
}

/**
 * BlacklistBanner Component
 * 
 * Displays:
 * - Warning message about blacklist status
 * - Dispute button if no dispute exists
 * - Dispute status if already filed
 */
export function BlacklistBanner({ preferredContact }: BlacklistBannerProps) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  
  const { data: dispute, isLoading: disputeLoading } = useMyDispute();
  const { mutate: createDispute, isPending: isCreating } = useCreateDispute();

  const handleFileDispute = () => {
    setShowConfirmModal(true);
  };

  const confirmDispute = () => {
    createDispute();
    setShowConfirmModal(false);
  };

  return (
    <>
      <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
        <div className="flex items-start gap-4">
          {/* Warning Icon */}
          <div className="flex-shrink-0 w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-red-400">Account Blacklisted</h3>
            <p className="mt-1 text-sm text-fur-cream/70">
              Your account has been blacklisted by platform administrators. While blacklisted, you cannot 
              create new signals, edit your profile, or receive new purchases.
            </p>
            
            {/* Show dispute status or button */}
            {disputeLoading ? (
              <div className="mt-3 flex items-center gap-2 text-sm text-fur-cream/50">
                <div className="w-4 h-4 border-2 border-fur-cream/30 border-t-transparent rounded-full animate-spin" />
                Loading dispute status...
              </div>
            ) : dispute ? (
              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-fur-cream/60">Dispute Status:</span>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getStatusDisplay(dispute.status).className}`}>
                    {getStatusDisplay(dispute.status).text}
                  </span>
                </div>
                {dispute.status === 'pending' && (
                  <p className="text-sm text-fur-cream/60">
                    An admin will review your dispute and contact you via your preferred method 
                    ({preferredContact || 'Telegram/Discord'}).
                  </p>
                )}
                {dispute.status === 'contacted' && (
                  <p className="text-sm text-fur-cream/60">
                    Please check your {preferredContact || 'Telegram/Discord'} for a message from the admin team.
                  </p>
                )}
                {dispute.status === 'rejected' && (
                  <p className="text-sm text-fur-cream/60">
                    Your dispute was reviewed and rejected. The blacklist remains in effect.
                  </p>
                )}
              </div>
            ) : (
              <div className="mt-3">
                <p className="text-sm text-fur-cream/60 mb-3">
                  If you believe this was a mistake, you can file a dispute. An admin will contact you 
                  via your preferred contact method ({preferredContact || 'Telegram/Discord'}).
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleFileDispute}
                  disabled={isCreating}
                >
                  {isCreating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                      Filing Dispute...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                      File Dispute
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="File a Dispute"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-fur-cream/80">
            By filing a dispute, you're requesting an admin review of your blacklist status.
          </p>
          <div className="bg-dark-700/50 border border-dark-600 rounded-lg p-4 space-y-2">
            <h4 className="text-sm font-medium text-fur-cream">What happens next:</h4>
            <ul className="text-sm text-fur-cream/70 space-y-1.5">
              <li className="flex items-start gap-2">
                <span className="text-brand-400 mt-0.5">1.</span>
                An admin will review your case
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand-400 mt-0.5">2.</span>
                They will contact you via {preferredContact || 'Telegram/Discord'}
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand-400 mt-0.5">3.</span>
                If approved, your account will be unblacklisted
              </li>
            </ul>
          </div>
          <p className="text-xs text-fur-cream/50">
            Note: You can only file one dispute. Make sure your contact information is up to date in your profile.
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setShowConfirmModal(false)}>
              Cancel
            </Button>
            <Button onClick={confirmDispute} disabled={isCreating}>
              {isCreating ? 'Filing...' : 'Confirm Dispute'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
