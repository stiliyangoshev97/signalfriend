/**
 * @fileoverview Blacklisted Predictor Card Component
 * @module features/admin/components/BlacklistedPredictorCard
 * @description
 * Card component displaying a blacklisted predictor with option to propose unblacklist.
 * 
 * IMPORTANT: Unblacklist is a MultiSig action requiring 3 signatures.
 * - This component only creates the PROPOSAL (1st signature)
 * - The predictor remains blacklisted until all 3 signatures are collected
 * - Database is updated automatically by webhook when PredictorBlacklisted event fires
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, CopyableAddress, Modal } from '@/shared/components/ui';
import { formatAddress, getExplorerTxUrl } from '@/shared/utils';
import { useProposeBlacklist } from '../hooks/useProposeBlacklist';
import type { BlacklistedPredictor } from '../types';

interface BlacklistedPredictorCardProps {
  predictor: BlacklistedPredictor;
}

/**
 * BlacklistedPredictorCard Component
 * 
 * Displays blacklisted predictor info with unblacklist proposal action.
 * 
 * Unblacklist flow (MultiSig - requires 3 signatures):
 * 1. User clicks "Propose Unblacklist" button
 * 2. Confirmation modal opens explaining MultiSig process
 * 3. On confirm, smart contract proposeBlacklist(address, false) is called
 * 4. Proposal is created, predictor REMAINS BLACKLISTED
 * 5. Two more signers must approve on BscScan
 * 6. On 3rd approval, smart contract executes unblacklist and emits event
 * 7. Backend webhook receives event and updates database
 * 8. Predictor is now unblacklisted
 */
export function BlacklistedPredictorCard({
  predictor,
}: BlacklistedPredictorCardProps) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [contractSuccess, setContractSuccess] = useState<{
    txHash: string;
    actionId?: string;
  } | null>(null);
  
  // Smart contract hook for unblacklist proposal
  const { 
    proposeUnblacklist, 
    state: contractState,
    reset: resetContract,
  } = useProposeBlacklist();

  const handleUnblacklistClick = () => {
    setShowConfirmModal(true);
    setContractSuccess(null);
    resetContract();
  };

  const handleConfirmUnblacklist = async () => {
    try {
      // Call smart contract to propose unblacklist (1st of 3 required signatures)
      // NOTE: Database is NOT updated here - it will be updated by the backend webhook
      // when the PredictorBlacklisted event is emitted after all 3 signatures
      const result = await proposeUnblacklist(predictor.walletAddress as `0x${string}`);
      
      // Show success with transaction details and Action ID for other signers
      setContractSuccess({
        txHash: result.transactionHash,
        actionId: result.actionId,
      });
    } catch (error) {
      // Error is handled by the hook, modal stays open to show error
      console.error('Unblacklist proposal failed:', error);
    }
  };

  const handleCloseModal = () => {
    setShowConfirmModal(false);
    setContractSuccess(null);
    resetContract();
  };

  const displayName = predictor.displayName || formatAddress(predictor.walletAddress);
  const blacklistedDate = new Date(predictor.updatedAt).toLocaleDateString();
  const isProcessing = contractState.isPending || contractState.isConfirming;

  return (
    <>
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
            <Button
              size="sm"
              variant="secondary"
              onClick={handleUnblacklistClick}
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Unblacklist
            </Button>
            
            <Link to={`/predictors/${predictor.walletAddress}`}>
              <Button size="sm" variant="ghost" className="w-full">
                View Profile
              </Button>
            </Link>
          </div>
        </div>

        {/* Info Note */}
        <div className="mt-3 pt-3 border-t border-dark-700">
          <p className="text-xs text-fur-cream/60">
            ℹ️ Unblacklist requires a MultiSig proposal on the smart contract.
          </p>
        </div>
      </div>

      {/* Unblacklist Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={handleCloseModal}
        title={contractSuccess ? '✅ Unblacklist Proposal Created' : 'Confirm Unblacklist'}
      >
        <div className="space-y-4">
          {contractSuccess ? (
            // Success state
            <>
              <div className="bg-success-500/10 border border-success-500/30 rounded-lg p-4">
                <p className="text-success-400 font-medium">
                  Unblacklist proposal submitted successfully!
                </p>
                <p className="text-success-300/80 text-sm mt-2">
                  The predictor <strong>remains blacklisted</strong> until 2 more MultiSig signers approve on BscScan.
                </p>
              </div>

              <div className="bg-dark-700 rounded-lg p-4 space-y-3">
                <div>
                  <p className="text-xs text-fur-cream/50 mb-1">Transaction Hash</p>
                  <a
                    href={getExplorerTxUrl(contractSuccess.txHash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-brand-200 hover:underline break-all"
                  >
                    {contractSuccess.txHash}
                  </a>
                </div>
                {contractSuccess.actionId && (
                  <div>
                    <p className="text-xs text-fur-cream/50 mb-1">Action ID (for approvals)</p>
                    <p className="text-sm text-fur-cream/80 break-all font-mono">
                      {contractSuccess.actionId}
                    </p>
                  </div>
                )}
              </div>

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <p className="text-blue-300 text-sm">
                  <strong>Next Steps:</strong>
                </p>
                <ol className="list-decimal list-inside text-blue-200/80 text-sm mt-2 space-y-1">
                  <li>Share the Action ID with 2 other MultiSig signers</li>
                  <li>Each signer calls <code className="bg-dark-800 px-1 rounded">approveAction(actionId)</code> on BscScan</li>
                  <li>On 3rd approval, the unblacklist is executed on-chain</li>
                </ol>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleCloseModal}>
                  Done
                </Button>
              </div>
            </>
          ) : (
            // Confirmation state
            <>
              <div className="bg-dark-700 rounded-lg p-4">
                <p className="text-fur-cream/80 text-sm">
                  You are about to propose unblacklisting:
                </p>
                <p className="text-fur-cream font-medium mt-2">
                  {displayName}
                </p>
                <p className="text-fur-cream/60 text-xs mt-1 font-mono">
                  {predictor.walletAddress}
                </p>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <p className="text-blue-300 text-sm">
                  <strong>⚠️ MultiSig Required</strong>
                </p>
                <p className="text-blue-200/80 text-sm mt-2">
                  This will create a proposal on the smart contract. You'll automatically approve as the first signer. 
                  Two more MultiSig signers must approve on BscScan for the unblacklist to take effect on-chain.
                </p>
              </div>

              {/* Error display */}
              {contractState.error && !contractState.isUserRejection && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                  <p className="text-red-400 text-sm">{contractState.error}</p>
                </div>
              )}

              {contractState.isUserRejection && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                  <p className="text-yellow-400 text-sm">Transaction was rejected. Please try again.</p>
                </div>
              )}

              <div className="flex justify-end gap-3">
                <Button
                  variant="secondary"
                  onClick={handleCloseModal}
                  disabled={isProcessing}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleConfirmUnblacklist}
                  isLoading={isProcessing}
                  disabled={isProcessing}
                >
                  {contractState.isPending ? 'Waiting for wallet...' : 
                   contractState.isConfirming ? 'Confirming...' : 
                   'Confirm & Sign'}
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </>
  );
}
