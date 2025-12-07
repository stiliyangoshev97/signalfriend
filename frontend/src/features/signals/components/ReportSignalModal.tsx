/**
 * @fileoverview Report Signal Modal Component
 * @module features/signals/components/ReportSignalModal
 * @description
 * Modal for buyers to report a purchased signal.
 * Requires reason selection and optional description.
 */

import { useState } from 'react';
import { Modal, Button } from '@/shared/components/ui';
import { useCreateReport } from '../hooks/useReports';
import { REPORT_REASONS, getReportReasonLabel } from '../api/reports.api';
import type { ReportReason } from '../api/reports.api';

interface ReportSignalModalProps {
  isOpen: boolean;
  onClose: () => void;
  tokenId: number;
  signalTitle: string;
  onSuccess?: () => void;
}

/**
 * ReportSignalModal Component
 * 
 * Allows buyers to report signals they've purchased with a reason and description.
 */
export function ReportSignalModal({
  isOpen,
  onClose,
  tokenId,
  signalTitle,
  onSuccess,
}: ReportSignalModalProps) {
  const [reason, setReason] = useState<ReportReason | ''>('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const createReport = useCreateReport();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!reason) {
      setError('Please select a reason for the report');
      return;
    }
    
    if (reason === 'other' && !description.trim()) {
      setError('Please provide a description when selecting "Other"');
      return;
    }
    
    try {
      await createReport.mutateAsync({
        tokenId,
        reason,
        description: description.trim() || undefined,
      });
      
      // Reset form
      setReason('');
      setDescription('');
      
      onSuccess?.();
      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit report';
      setError(errorMessage);
    }
  };
  
  const handleClose = () => {
    if (!createReport.isPending) {
      setReason('');
      setDescription('');
      setError(null);
      onClose();
    }
  };
  
  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Report Signal">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Signal Info */}
        <div className="bg-dark-700 rounded-lg p-3">
          <p className="text-sm text-gray-main">Reporting signal:</p>
          <p className="text-fur-cream font-medium truncate">{signalTitle}</p>
        </div>
        
        {/* Warning Notice */}
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
          <p className="text-sm text-yellow-400">
            <strong>⚠️ Important:</strong> Reports are reviewed by admins. 
            False reports may result in action against your account.
          </p>
        </div>
        
        {/* Reason Selection */}
        <div>
          <label htmlFor="reason" className="block text-sm font-medium text-fur-cream mb-2">
            Reason for Report *
          </label>
          <select
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value as ReportReason | '')}
            className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-fur-cream focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
            disabled={createReport.isPending}
          >
            <option value="">Select a reason...</option>
            {REPORT_REASONS.map((r) => (
              <option key={r} value={r}>
                {getReportReasonLabel(r)}
              </option>
            ))}
          </select>
        </div>
        
        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-fur-cream mb-2">
            Description {reason === 'other' ? '*' : '(Optional)'}
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Provide additional details about your report..."
            rows={4}
            maxLength={1000}
            className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-fur-cream placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent resize-none"
            disabled={createReport.isPending}
          />
          <p className="text-xs text-gray-main mt-1 text-right">
            {description.length}/1000
          </p>
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}
        
        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            disabled={createReport.isPending}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="danger"
            disabled={createReport.isPending || !reason}
            className="flex-1"
          >
            {createReport.isPending ? 'Submitting...' : 'Submit Report'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
