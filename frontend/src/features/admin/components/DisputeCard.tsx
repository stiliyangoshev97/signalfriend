/**
 * @fileoverview Dispute Card component
 * @module features/admin/components/DisputeCard
 * @description
 * Displays a blacklist dispute for admin review with status management.
 * Disputes are created by blacklisted predictors to appeal their status.
 */

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';
import { Button, Badge, CopyableAddress } from '@/shared/components/ui';
import type { AdminDispute, DisputeStatus } from '../types';

interface DisputeCardProps {
  dispute: AdminDispute;
  onUpdateStatus: (
    disputeId: string,
    status: DisputeStatus,
    adminNotes?: string
  ) => Promise<void>;
  onResolve: (disputeId: string, adminNotes?: string) => Promise<void>;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

/**
 * Get badge variant for dispute status
 */
function getStatusVariant(status: DisputeStatus): 'default' | 'warning' | 'success' | 'error' | 'info' {
  switch (status) {
    case 'pending':
      return 'error';
    case 'contacted':
      return 'info';
    case 'resolved':
      return 'success';
    case 'rejected':
      return 'default';
    default:
      return 'default';
  }
}

/**
 * Contact icon component
 */
function ContactIcon({ type }: { type: string }) {
  if (type === 'telegram') {
    return (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.832.94z"/>
      </svg>
    );
  }
  if (type === 'discord') {
    return (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
      </svg>
    );
  }
  return null;
}

/**
 * DisputeCard Component
 * 
 * Displays:
 * - Dispute status
 * - Predictor info and contact details
 * - Admin notes (editable)
 * - Status update and resolve buttons
 */
export function DisputeCard({
  dispute,
  onUpdateStatus,
  onResolve,
  isExpanded,
  onToggleExpand,
}: DisputeCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [adminNotes, setAdminNotes] = useState(dispute.adminNotes);

  const handleStatusUpdate = async (newStatus: DisputeStatus) => {
    setIsUpdating(true);
    try {
      await onUpdateStatus(dispute._id, newStatus, adminNotes);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleResolve = async () => {
    setIsUpdating(true);
    try {
      await onResolve(dispute._id, adminNotes);
    } finally {
      setIsUpdating(false);
    }
  };

  const isActive = dispute.status === 'pending' || dispute.status === 'contacted';

  return (
    <div className="bg-dark-800 border border-dark-700 rounded-xl overflow-hidden shadow-md">
      {/* Header */}
      <div
        className="p-4 cursor-pointer hover:bg-dark-700/50 transition-colors"
        onClick={onToggleExpand}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant={getStatusVariant(dispute.status)}>
                {dispute.status.charAt(0).toUpperCase() + dispute.status.slice(1)}
              </Badge>
              {dispute.predictor && (
                <span className="text-fur-cream font-medium">
                  {dispute.predictor.displayName}
                </span>
              )}
            </div>
            
            <CopyableAddress address={dispute.predictorAddress} className="text-sm" />
            
            <div className="flex items-center gap-4 text-xs text-gray-dim mt-1">
              <span>
                Submitted {formatDistanceToNow(new Date(dispute.createdAt), { addSuffix: true })}
              </span>
              {dispute.resolvedAt && (
                <span>
                  Resolved {formatDistanceToNow(new Date(dispute.resolvedAt), { addSuffix: true })}
                </span>
              )}
            </div>
          </div>
          
          <svg
            className={`w-5 h-5 text-gray-main transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="border-t border-dark-700 p-4 space-y-4">
          {/* Predictor Info */}
          {dispute.predictor && (
            <div>
              <h5 className="text-xs font-medium text-gray-dim uppercase tracking-wide mb-2">
                Predictor Info
              </h5>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-dim">Name:</span>
                  <span className="text-fur-cream ml-2">{dispute.predictor.displayName}</span>
                </div>
                <div>
                  <span className="text-gray-dim">Signals:</span>
                  <span className="text-fur-cream ml-2">{dispute.predictor.totalSignals}</span>
                </div>
                <div>
                  <span className="text-gray-dim">Sales:</span>
                  <span className="text-fur-cream ml-2">{dispute.predictor.totalSales}</span>
                </div>
                <div>
                  <span className="text-gray-dim">Prefers:</span>
                  <span className="text-fur-cream ml-2 capitalize">
                    {dispute.predictor.preferredContact}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Contact Links */}
          {dispute.predictor && (dispute.predictor.socialLinks.telegram || dispute.predictor.socialLinks.discord) && (
            <div>
              <h5 className="text-xs font-medium text-gray-dim uppercase tracking-wide mb-2">
                Contact Predictor
              </h5>
              <div className="flex gap-4">
                {dispute.predictor.socialLinks.telegram && (
                  <a
                    href={`https://t.me/${dispute.predictor.socialLinks.telegram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 transition-colors text-sm"
                  >
                    <ContactIcon type="telegram" />
                    <span>{dispute.predictor.socialLinks.telegram}</span>
                  </a>
                )}
                {dispute.predictor.socialLinks.discord && (
                  <span className="flex items-center gap-1.5 text-indigo-400 text-sm">
                    <ContactIcon type="discord" />
                    <span>{dispute.predictor.socialLinks.discord}</span>
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Admin Notes */}
          <div>
            <h5 className="text-xs font-medium text-gray-dim uppercase tracking-wide mb-2">
              Admin Notes
            </h5>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Add internal notes (e.g., 'Contacted via TG on 12/6')..."
              className="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 text-sm text-fur-cream placeholder-gray-dim focus:outline-none focus:border-brand-500 resize-none"
              rows={2}
            />
          </div>

          {/* Actions */}
          {isActive && (
            <div className="flex flex-wrap gap-2 pt-2">
              {dispute.status === 'pending' && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleStatusUpdate('contacted')}
                  isLoading={isUpdating}
                >
                  Mark Contacted
                </Button>
              )}
              
              <Button
                size="sm"
                variant="primary"
                onClick={handleResolve}
                isLoading={isUpdating}
              >
                Resolve & Unblacklist
              </Button>
              
              <Button
                size="sm"
                variant="danger"
                onClick={() => handleStatusUpdate('rejected')}
                isLoading={isUpdating}
              >
                Reject
              </Button>
              
              <Link
                to={`/predictors/${dispute.predictorAddress}`}
                className="ml-auto"
              >
                <Button size="sm" variant="ghost">
                  View Profile
                </Button>
              </Link>
            </div>
          )}
          
          {!isActive && (
            <div className="pt-2">
              <Link to={`/predictors/${dispute.predictorAddress}`}>
                <Button size="sm" variant="ghost">
                  View Profile
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
