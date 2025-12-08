/**
 * @fileoverview Report Card component
 * @module features/admin/components/ReportCard
 * @description
 * Displays a signal report for admin review with status management.
 */

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';
import { Button, Badge, CopyableAddress } from '@/shared/components/ui';
import type { AdminReport, ReportStatus } from '../types';

interface ReportCardProps {
  report: AdminReport;
  onUpdateStatus: (
    reportId: string,
    status: ReportStatus,
    adminNotes?: string
  ) => Promise<void>;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

/**
 * Get badge variant for report status
 */
function getStatusVariant(status: ReportStatus): 'default' | 'warning' | 'success' | 'error' {
  switch (status) {
    case 'pending':
      return 'error';
    case 'reviewed':
      return 'warning';
    case 'resolved':
      return 'success';
    case 'dismissed':
      return 'default';
    default:
      return 'default';
  }
}

/**
 * Format report reason for display
 */
function formatReason(reason: string): string {
  return reason
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * ReportCard Component
 * 
 * Displays:
 * - Report reason and status
 * - Signal info (title, price)
 * - Reporter and predictor addresses
 * - Admin notes (editable)
 * - Status update buttons
 */
export function ReportCard({
  report,
  onUpdateStatus,
  isExpanded,
  onToggleExpand,
}: ReportCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [adminNotes, setAdminNotes] = useState(report.adminNotes);
  const [showNotes, setShowNotes] = useState(false);

  const handleStatusUpdate = async (newStatus: ReportStatus) => {
    setIsUpdating(true);
    try {
      await onUpdateStatus(report._id, newStatus, adminNotes);
    } finally {
      setIsUpdating(false);
    }
  };

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
              <Badge variant={getStatusVariant(report.status)}>
                {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
              </Badge>
              <Badge variant="error">{formatReason(report.reason)}</Badge>
            </div>
            
            <h4 className="text-fur-cream font-medium">
              {report.signal?.title || 'Unknown Signal'}
            </h4>
            
            <div className="flex items-center gap-4 text-xs text-gray-dim mt-1">
              <span>Token #{report.tokenId}</span>
              <span>
                {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}
              </span>
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
          {/* Signal Info */}
          {report.signal && (
            <div>
              <h5 className="text-xs font-medium text-gray-dim uppercase tracking-wide mb-2">
                Signal
              </h5>
              <div className="flex items-center justify-between">
                <Link
                  to={`/signals/${report.contentId}`}
                  className="text-brand-400 hover:text-brand-300 transition-colors"
                >
                  {report.signal.title}
                </Link>
                <span className="text-fur-cream font-mono">
                  ${report.signal.priceUsdt.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {/* Reporter */}
          <div>
            <h5 className="text-xs font-medium text-gray-dim uppercase tracking-wide mb-2">
              Reporter
            </h5>
            <CopyableAddress address={report.reporterAddress} className="text-sm" />
          </div>

          {/* Predictor */}
          <div>
            <h5 className="text-xs font-medium text-gray-dim uppercase tracking-wide mb-2">
              Predictor
            </h5>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-fur-cream text-sm">
                  {report.predictor?.displayName || 'Unknown'}
                </p>
                <CopyableAddress address={report.predictorAddress} className="text-sm" />
              </div>
              {report.predictor?.preferredContact && (
                <span className="text-xs text-gray-dim">
                  Contact: {report.predictor.preferredContact}
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          {report.description && (
            <div>
              <h5 className="text-xs font-medium text-gray-dim uppercase tracking-wide mb-2">
                Description
              </h5>
              <p className="text-gray-main text-sm">{report.description}</p>
            </div>
          )}

          {/* Admin Notes */}
          <div>
            <button
              className="text-xs font-medium text-gray-dim uppercase tracking-wide mb-2 flex items-center gap-1 hover:text-gray-main"
              onClick={() => setShowNotes(!showNotes)}
            >
              Admin Notes
              <svg
                className={`w-3 h-3 transition-transform ${showNotes ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {showNotes && (
              <div className="space-y-2">
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add internal notes..."
                  className="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 text-sm text-fur-cream placeholder-gray-dim focus:outline-none focus:border-brand-500 resize-none"
                  rows={2}
                />
                {adminNotes !== report.adminNotes && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleStatusUpdate(report.status)}
                    isLoading={isUpdating}
                  >
                    Save Notes
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 pt-2">
            {report.status === 'pending' && (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => handleStatusUpdate('reviewed')}
                isLoading={isUpdating}
              >
                Mark Reviewed
              </Button>
            )}
            
            {(report.status === 'pending' || report.status === 'reviewed') && (
              <>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => handleStatusUpdate('resolved')}
                  isLoading={isUpdating}
                >
                  Resolve
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleStatusUpdate('dismissed')}
                  isLoading={isUpdating}
                >
                  Dismiss
                </Button>
              </>
            )}
            
            {report.predictor && (
              <Link
                to={`/predictors/${report.predictorAddress}`}
                className="ml-auto"
              >
                <Button size="sm" variant="ghost">
                  View Predictor
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
