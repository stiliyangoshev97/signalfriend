/**
 * @fileoverview Purchase Modal Component
 * @module features/signals/components/PurchaseModal
 * @description
 * Multi-step modal for purchasing a signal. Handles:
 * 1. Balance check
 * 2. USDT approval (if needed)
 * 3. Purchase execution
 * 4. Success/error states
 *
 * FLOW:
 * ```
 * [Loading] → [Insufficient Balance] (if not enough USDT)
 *          → [Approve USDT] → [Approving...] → [Ready to Purchase]
 *          → [Purchasing...] → [Success!]
 * ```
 */

import { useState, useEffect, useMemo } from 'react';
import { Modal, Button, Spinner } from '@/shared/components/ui';
import { usePurchaseFlow } from '../hooks';
import { parseWalletError } from '@/shared/utils';

/** Props for PurchaseModal component */
interface PurchaseModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback when modal should close */
  onClose: () => void;
  /** Signal title for display */
  signalTitle: string;
  /** Signal price in USDT (not including access fee) */
  priceUsdt: number;
  /** Signal content ID */
  contentId: string;
  /** Predictor wallet address */
  predictorAddress: string;
  /** Callback after successful purchase */
  onSuccess?: () => void;
}

/**
 * Step indicator icons
 */
const StepIcon = ({ status }: { status: 'pending' | 'active' | 'complete' | 'error' }) => {
  if (status === 'complete') {
    return (
      <div className="w-8 h-8 rounded-full bg-success-500 flex items-center justify-center">
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
    );
  }

  if (status === 'active') {
    return (
      <div className="w-8 h-8 rounded-full bg-fur-light flex items-center justify-center">
        <Spinner size="sm" />
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="w-8 h-8 rounded-full bg-accent-red flex items-center justify-center">
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
    );
  }

  return (
    <div className="w-8 h-8 rounded-full bg-dark-600 border-2 border-dark-500 flex items-center justify-center">
      <div className="w-2 h-2 rounded-full bg-dark-500" />
    </div>
  );
};

/**
 * PurchaseModal component
 *
 * Handles the complete signal purchase flow with visual feedback
 * for each step (approval, purchase, confirmation).
 *
 * @param props - Component props
 * @returns Modal element for purchase flow
 *
 * @example
 * <PurchaseModal
 *   isOpen={showPurchaseModal}
 *   onClose={() => setShowPurchaseModal(false)}
 *   signalTitle="BTC Breakout Signal"
 *   priceUsdt={25}
 *   contentId="abc123"
 *   predictorAddress="0x..."
 *   onSuccess={() => refetchSignal()}
 * />
 */
export function PurchaseModal({
  isOpen,
  onClose,
  signalTitle,
  priceUsdt,
  contentId,
  predictorAddress,
  onSuccess,
}: PurchaseModalProps): React.ReactElement {
  const [hasStarted, setHasStarted] = useState(false);

  const {
    step,
    totalCost,
    balance,
    hasEnoughBalance,
    needsApproval,
    handleApprove,
    handlePurchase,
    isApproving,
    isApprovalConfirmed,
    isPurchasing,
    isPurchaseConfirmed,
    error,
  } = usePurchaseFlow({
    contentId,
    priceUsdt,
    predictorAddress: predictorAddress as `0x${string}`,
  });

  // Parse error into user-friendly message
  const parsedError = useMemo(() => {
    if (!error) return null;
    return parseWalletError(error);
  }, [error]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setHasStarted(false);
    }
  }, [isOpen]);

  // Call onSuccess when purchase is confirmed
  useEffect(() => {
    if (isPurchaseConfirmed && onSuccess) {
      onSuccess();
    }
  }, [isPurchaseConfirmed, onSuccess]);

  /**
   * Handle the primary action button click
   */
  const handleAction = async () => {
    setHasStarted(true);

    try {
      if (needsApproval && !isApprovalConfirmed) {
        await handleApprove();
      } else {
        await handlePurchase();
      }
    } catch (err) {
      console.error('Purchase flow error:', err);
    }
  };

  /**
   * Get button text based on current step
   */
  const getButtonText = () => {
    if (step === 'loading') return 'Loading...';
    if (step === 'insufficient-balance') return 'Insufficient USDT Balance';
    if (step === 'approve') return 'Approve USDT';
    if (step === 'approving') return 'Approving...';
    if (step === 'ready') return 'Purchase Signal';
    if (step === 'purchasing') return 'Purchasing...';
    if (step === 'success') return 'Done';
    return 'Purchase';
  };

  /**
   * Determine if button should be disabled
   */
  const isButtonDisabled = () => {
    return (
      step === 'loading' ||
      step === 'insufficient-balance' ||
      step === 'approving' ||
      step === 'purchasing'
    );
  };

  /**
   * Determine step statuses for the progress indicator
   */
  const getStepStatus = (stepName: 'approve' | 'purchase' | 'confirm') => {
    if (error) {
      if (stepName === 'approve' && (step === 'approve' || step === 'approving')) return 'error';
      if (stepName === 'purchase' && (step === 'ready' || step === 'purchasing')) return 'error';
    }

    switch (stepName) {
      case 'approve':
        if (isApprovalConfirmed || !needsApproval) return 'complete';
        if (isApproving) return 'active';
        return 'pending';

      case 'purchase':
        if (isPurchaseConfirmed) return 'complete';
        if (isPurchasing) return 'active';
        if (isApprovalConfirmed || !needsApproval) return 'pending';
        return 'pending';

      case 'confirm':
        if (isPurchaseConfirmed) return 'complete';
        return 'pending';

      default:
        return 'pending';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Purchase Signal" size="md">
      <div className="space-y-6">
        {/* Signal Info */}
        <div className="bg-dark-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-fur-cream mb-2 line-clamp-2">
            {signalTitle}
          </h3>
          <div className="flex justify-between items-center text-sm">
            <span className="text-fur-cream/60">Signal Price</span>
            <span className="text-fur-cream">${priceUsdt} USDT</span>
          </div>
          <div className="flex justify-between items-center text-sm mt-1">
            <span className="text-fur-cream/60">Access Fee</span>
            <span className="text-fur-cream">$0.50 USDT</span>
          </div>
          <div className="border-t border-dark-600 mt-2 pt-2 flex justify-between items-center">
            <span className="text-fur-cream/80 font-medium">Total</span>
            <span className="text-xl font-bold text-fur-light">${totalCost.toFixed(2)} USDT</span>
          </div>
        </div>

        {/* Balance Warning */}
        {!hasEnoughBalance && step !== 'loading' && (
          <div className="bg-accent-red/10 border border-accent-red/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-accent-red mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="text-accent-red font-medium">Insufficient Balance</p>
                <p className="text-sm text-fur-cream/60 mt-1">
                  You need ${totalCost.toFixed(2)} USDT but only have ${balance.toFixed(2)} USDT.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Progress Steps */}
        {hasStarted && hasEnoughBalance && (
          <div className="space-y-4">
            {/* Step 1: Approve (only show if needed) */}
            {needsApproval && (
              <div className="flex items-center gap-4">
                <StepIcon status={getStepStatus('approve')} />
                <div className="flex-1">
                  <p className="text-fur-cream font-medium">Approve USDT</p>
                  <p className="text-sm text-fur-cream/60">
                    {isApprovalConfirmed
                      ? 'USDT approved for spending'
                      : isApproving
                      ? 'Waiting for approval confirmation...'
                      : 'Allow the contract to spend your USDT'}
                  </p>
                </div>
              </div>
            )}

            {/* Step 2: Purchase */}
            <div className="flex items-center gap-4">
              <StepIcon status={getStepStatus('purchase')} />
              <div className="flex-1">
                <p className="text-fur-cream font-medium">Purchase Signal</p>
                <p className="text-sm text-fur-cream/60">
                  {isPurchaseConfirmed
                    ? 'Signal purchased successfully!'
                    : isPurchasing
                    ? 'Processing your purchase...'
                    : 'Execute the purchase transaction'}
                </p>
              </div>
            </div>

            {/* Step 3: Confirmation */}
            <div className="flex items-center gap-4">
              <StepIcon status={getStepStatus('confirm')} />
              <div className="flex-1">
                <p className="text-fur-cream font-medium">Receive NFT Receipt</p>
                <p className="text-sm text-fur-cream/60">
                  {isPurchaseConfirmed
                    ? 'NFT receipt minted to your wallet'
                    : 'Your proof of purchase'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {parsedError && (
          <div className={`rounded-lg p-4 ${
            parsedError.isUserAction 
              ? 'bg-yellow-500/10 border border-yellow-500/30' 
              : 'bg-accent-red/10 border border-accent-red/30'
          }`}>
            <div className="flex items-start gap-3">
              {parsedError.isUserAction ? (
                <svg className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-accent-red mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              <div>
                <p className={`font-medium ${parsedError.isUserAction ? 'text-yellow-500' : 'text-accent-red'}`}>
                  {parsedError.title}
                </p>
                <p className="text-sm text-fur-cream/60 mt-1">
                  {parsedError.message}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Success Message */}
        {isPurchaseConfirmed && (
          <div className="bg-success-500/10 border border-success-500/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-success-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-success-500 font-medium">Purchase Successful!</p>
                <p className="text-sm text-fur-cream/60 mt-1">
                  You now own this signal. The full content is now unlocked.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          {isPurchaseConfirmed ? (
            <Button className="w-full" onClick={onClose}>
              View Signal Content
            </Button>
          ) : (
            <>
              <Button
                variant="ghost"
                className="flex-1"
                onClick={onClose}
                disabled={isApproving || isPurchasing}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleAction}
                disabled={isButtonDisabled()}
              >
                {getButtonText()}
              </Button>
            </>
          )}
        </div>

        {/* Helpful Info */}
        {!hasStarted && hasEnoughBalance && (
          <p className="text-xs text-fur-cream/50 text-center">
            {needsApproval
              ? 'You will need to approve USDT spending first, then confirm the purchase.'
              : 'Click "Purchase Signal" to proceed with the transaction.'}
          </p>
        )}
      </div>
    </Modal>
  );
}
