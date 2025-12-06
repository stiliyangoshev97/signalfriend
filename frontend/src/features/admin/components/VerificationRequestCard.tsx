/**
 * @fileoverview Verification Request Card component
 * @module features/admin/components/VerificationRequestCard
 * @description
 * Displays a pending predictor verification request for admin review.
 */

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Button, Badge, CopyableAddress } from '@/shared/components/ui';
import type { PendingVerification } from '../types';

interface VerificationRequestCardProps {
  verification: PendingVerification;
  onApprove: (address: string) => Promise<void>;
  onReject: (address: string) => Promise<void>;
  isProcessing?: boolean;
}

/**
 * Get icon for contact method
 */
function ContactIcon({ type }: { type: string }) {
  switch (type) {
    case 'telegram':
      return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.832.94z"/>
        </svg>
      );
    case 'discord':
      return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
        </svg>
      );
    default:
      return null;
  }
}

/**
 * VerificationRequestCard Component
 * 
 * Displays:
 * - Predictor display name and wallet
 * - Bio and contact info
 * - Social links
 * - Approve/Reject buttons
 */
export function VerificationRequestCard({
  verification,
  onApprove,
  onReject,
  isProcessing,
}: VerificationRequestCardProps) {
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);

  const handleApprove = async () => {
    setAction('approve');
    try {
      await onApprove(verification.walletAddress);
    } finally {
      setAction(null);
    }
  };

  const handleReject = async () => {
    setAction('reject');
    try {
      await onReject(verification.walletAddress);
    } finally {
      setAction(null);
    }
  };

  return (
    <div className="bg-dark-800 border border-dark-700 rounded-xl p-5 shadow-md">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h4 className="text-lg font-semibold text-fur-cream">
            {verification.displayName}
          </h4>
          <CopyableAddress address={verification.walletAddress} className="text-sm mt-1" />
        </div>
        <Badge variant="warning">Pending</Badge>
      </div>

      {/* Bio */}
      {verification.bio && (
        <p className="text-gray-main text-sm mb-4 line-clamp-2">{verification.bio}</p>
      )}

      {/* Contact Info */}
      <div className="flex flex-wrap gap-4 text-sm mb-4">
        <div className="flex items-center gap-1.5 text-gray-main">
          <span className="text-gray-dim">Prefers:</span>
          <span className="capitalize text-fur-cream">
            {verification.preferredContact}
          </span>
        </div>
        
        {verification.socialLinks.telegram && (
          <a
            href={`https://t.me/${verification.socialLinks.telegram.replace('@', '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 transition-colors"
          >
            <ContactIcon type="telegram" />
            <span>{verification.socialLinks.telegram}</span>
          </a>
        )}
        
        {verification.socialLinks.discord && (
          <span className="flex items-center gap-1.5 text-indigo-400">
            <ContactIcon type="discord" />
            <span>{verification.socialLinks.discord}</span>
          </span>
        )}
      </div>

      {/* Stats & Timestamps */}
      <div className="flex items-center gap-4 text-xs text-gray-dim mb-4">
        <span>{verification.totalSignals} signals</span>
        <span>{verification.totalSales} sales</span>
        <span>
          Requested {formatDistanceToNow(new Date(verification.verificationRequestedAt), { addSuffix: true })}
        </span>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          variant="primary"
          size="sm"
          onClick={handleApprove}
          isLoading={action === 'approve'}
          disabled={isProcessing}
        >
          Approve
        </Button>
        <Button
          variant="danger"
          size="sm"
          onClick={handleReject}
          isLoading={action === 'reject'}
          disabled={isProcessing}
        >
          Reject
        </Button>
      </div>
    </div>
  );
}
