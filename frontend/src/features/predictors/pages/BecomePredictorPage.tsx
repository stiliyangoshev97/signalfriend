/**
 * @fileoverview Become a Predictor Page
 * @module features/predictors/pages/BecomePredictorPage
 * @description
 * Registration page for users who want to become predictors.
 * Handles the complete flow:
 * 1. Show connect wallet prompt if not connected
 * 2. Show sign in prompt if connected but not authenticated
 * 3. Check if already a predictor (show dashboard link)
 * 4. Show benefits and requirements
 * 5. USDT approval if needed
 * 6. Call joinAsPredictor contract
 * 7. Wait for confirmation and redirect
 *
 * This page is publicly accessible - handles auth state internally.
 */

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { isAddress, getAddress } from 'viem';
import { Card, Button, Spinner, Badge } from '@/shared/components/ui';
import { useAuth } from '@/features/auth/api/authHooks';
import { useAuthStore } from '@/features/auth/store';
import { useBecomePredictor } from '../hooks';
import { parseWalletError } from '@/shared/utils/walletErrors';
import { checkPredictorStatus } from '../api/predictors.api';

/**
 * Check if a string is a valid Ethereum address format.
 * More lenient than viem's isAddress - accepts any valid hex address
 * regardless of EIP-55 checksum casing.
 */
function isValidAddressFormat(address: string): boolean {
  // Check basic format: starts with 0x and has 40 hex characters
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return false;
  }
  // Double-check with viem using lowercase (bypasses checksum validation)
  return isAddress(address.toLowerCase());
}

/**
 * Normalize an address to proper checksum format.
 * Returns null if the address is invalid.
 */
function normalizeAddress(address: string): string | null {
  try {
    return getAddress(address);
  } catch {
    return null;
  }
}

/** Step in the registration flow */
type RegistrationStep = 'info' | 'approve' | 'join' | 'success';

/**
 * Feature card component for benefits section
 */
function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 w-12 h-12 bg-accent-gold/10 rounded-lg flex items-center justify-center text-accent-gold">
        {icon}
      </div>
      <div>
        <h3 className="font-semibold text-fur-cream mb-1">{title}</h3>
        <p className="text-sm text-fur-cream/70">{description}</p>
      </div>
    </div>
  );
}

/**
 * Step indicator component
 */
function StepIndicator({
  currentStep,
  needsApproval,
}: {
  currentStep: RegistrationStep;
  needsApproval: boolean;
}) {
  const steps = needsApproval
    ? [
        { key: 'info', label: 'Review' },
        { key: 'approve', label: 'Approve USDT' },
        { key: 'join', label: 'Register' },
        { key: 'success', label: 'Complete' },
      ]
    : [
        { key: 'info', label: 'Review' },
        { key: 'join', label: 'Register' },
        { key: 'success', label: 'Complete' },
      ];

  const currentIndex = steps.findIndex((s) => s.key === currentStep);

  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {steps.map((step, index) => (
        <div key={step.key} className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
              index <= currentIndex
                ? 'bg-accent-gold text-dark-900'
                : 'bg-dark-700 text-fur-cream/50'
            }`}
          >
            {index < currentIndex ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              index + 1
            )}
          </div>
          {index < steps.length - 1 && (
            <div
              className={`w-12 h-0.5 mx-2 transition-colors ${
                index < currentIndex ? 'bg-accent-gold' : 'bg-dark-700'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

/**
 * Info step content - shows benefits and requirements
 */
function InfoStepContent({
  joinFeeFormatted,
  referralPayoutFormatted,
  usdtBalance,
  hasEnoughBalance,
  onContinue,
  hasReferrer,
  setHasReferrer,
  referrerAddress,
  setReferrerAddress,
  referrerError,
  isValidatingReferrer,
}: {
  joinFeeFormatted?: string;
  referralPayoutFormatted?: string;
  usdtBalance: number;
  hasEnoughBalance: boolean;
  onContinue: () => void;
  hasReferrer: boolean;
  setHasReferrer: (value: boolean) => void;
  referrerAddress: string;
  setReferrerAddress: (value: string) => void;
  referrerError: string | null;
  isValidatingReferrer: boolean;
}) {
  return (
    <div className="space-y-6">
      {/* Benefits section */}
      <div>
        <h2 className="text-xl font-semibold text-fur-cream mb-4">Why become a Predictor?</h2>
        <div className="grid gap-4">
          <FeatureCard
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            title="Earn from your signals"
            description="Set your own prices and earn USDT for every signal sold. Keep up to 95% of each sale."
          />
          <FeatureCard
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            }
            title="Build your reputation"
            description="Get rated by buyers, earn verification badges, and climb the leaderboard."
          />
          <FeatureCard
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
            title="Earn referral rewards"
            description={`Invite other predictors and earn ${referralPayoutFormatted || '5'} USDT for each referral.`}
          />
          <FeatureCard
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            }
            title="Exclusive NFT Access Pass"
            description="Receive a unique PredictorAccessPass NFT that proves your predictor status on-chain."
          />
        </div>
      </div>

      {/* Registration fee */}
      <Card className="bg-dark-800 border-dark-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-fur-cream/70 mb-1">One-time registration fee</p>
            <p className="text-2xl font-bold text-fur-cream">
              {joinFeeFormatted || '20'} <span className="text-lg font-normal">USDT</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-fur-cream/70 mb-1">Your balance</p>
            <p className={`text-lg font-semibold ${hasEnoughBalance ? 'text-status-success' : 'text-status-error'}`}>
              {usdtBalance.toFixed(2)} USDT
            </p>
          </div>
        </div>
      </Card>

      {/* Insufficient balance warning */}
      {!hasEnoughBalance && (
        <div className="p-4 bg-status-error/10 border border-status-error/30 rounded-lg">
          <div className="flex gap-3">
            <svg className="w-5 h-5 text-status-error flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="font-medium text-status-error">Insufficient USDT balance</p>
              <p className="text-sm text-fur-cream/70 mt-1">
                You need at least {joinFeeFormatted || '20'} USDT to register as a predictor.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Referral toggle and input */}
      <div className="space-y-3">
        <label className="flex items-center gap-3 cursor-pointer group">
          <button
            type="button"
            role="switch"
            aria-checked={hasReferrer}
            onClick={() => setHasReferrer(!hasReferrer)}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-accent-gold focus:ring-offset-2 focus:ring-offset-dark-900 ${
              hasReferrer ? 'bg-accent-gold' : 'bg-dark-600'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                hasReferrer ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
          <span className="text-fur-cream/80 group-hover:text-fur-cream transition-colors">
            I have a referral code
          </span>
        </label>

        {hasReferrer && (
          <div className="space-y-2">
            <div className="relative">
              <input
                type="text"
                value={referrerAddress}
                onChange={(e) => setReferrerAddress(e.target.value)}
                placeholder="Enter referrer wallet address (0x...)"
                className={`w-full px-4 py-3 bg-dark-700 border rounded-lg text-fur-cream placeholder-fur-cream/40 focus:outline-none focus:ring-2 focus:ring-accent-gold focus:border-transparent font-mono text-sm ${
                  referrerError ? 'border-status-error' : 'border-dark-600'
                }`}
              />
              {isValidatingReferrer && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Spinner size="sm" />
                </div>
              )}
            </div>
            {referrerError && (
              <p className="text-sm text-status-error">{referrerError}</p>
            )}
            <p className="text-xs text-fur-cream/50">
              If you were referred by another predictor, enter their wallet address to give them a {referralPayoutFormatted || '5'} USDT reward.
            </p>
          </div>
        )}
      </div>

      {/* Continue button */}
      <Button
        onClick={onContinue}
        disabled={!hasEnoughBalance || isValidatingReferrer || !!referrerError}
        size="lg"
        className="w-full"
      >
        Continue to Registration
      </Button>
    </div>
  );
}

/**
 * Transaction step content (approval or join)
 */
function TransactionStepContent({
  step,
  isProcessing,
  error,
  onAction,
  onCancel,
  joinFeeFormatted,
}: {
  step: 'approve' | 'join';
  isProcessing: boolean;
  error: Error | null;
  onAction: () => void;
  onCancel: () => void;
  joinFeeFormatted?: string;
}) {
  const parsedError = error ? parseWalletError(error) : null;
  const isUserAction = parsedError?.isUserAction || false;

  return (
    <div className="space-y-6 text-center">
      {isProcessing ? (
        <>
          <div className="flex justify-center">
            <Spinner size="lg" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-fur-cream mb-2">
              {step === 'approve' ? 'Approving USDT...' : 'Registering as Predictor...'}
            </h2>
            <p className="text-fur-cream/70">
              {step === 'approve'
                ? 'Please confirm the approval in your wallet'
                : 'Please confirm the transaction in your wallet'}
            </p>
          </div>
        </>
      ) : error ? (
        <>
          <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${
            isUserAction ? 'bg-status-warning/10' : 'bg-status-error/10'
          }`}>
            <svg
              className={`w-8 h-8 ${isUserAction ? 'text-status-warning' : 'text-status-error'}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isUserAction ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              )}
            </svg>
          </div>
          <div>
            <h2 className={`text-xl font-semibold mb-2 ${isUserAction ? 'text-status-warning' : 'text-status-error'}`}>
              {parsedError?.title || 'Transaction Failed'}
            </h2>
            <p className="text-fur-cream/70">
              {parsedError?.message || 'An error occurred. Please try again.'}
            </p>
          </div>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={onCancel}>
              Go Back
            </Button>
            <Button onClick={onAction}>Try Again</Button>
          </div>
        </>
      ) : (
        <>
          <div className="w-16 h-16 mx-auto bg-accent-gold/10 rounded-full flex items-center justify-center">
            {step === 'approve' ? (
              <svg className="w-8 h-8 text-accent-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-8 h-8 text-accent-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            )}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-fur-cream mb-2">
              {step === 'approve' ? 'Approve USDT Spending' : 'Complete Registration'}
            </h2>
            <p className="text-fur-cream/70">
              {step === 'approve'
                ? `Allow the contract to spend ${joinFeeFormatted || '20'} USDT for your registration fee.`
                : 'Click below to complete your predictor registration and receive your NFT.'}
            </p>
          </div>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={onAction}>
              {step === 'approve' ? 'Approve USDT' : 'Register Now'}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Success step content
 */
function SuccessStepContent({ onGoToDashboard }: { onGoToDashboard: () => void }) {
  return (
    <div className="space-y-6 text-center">
      <div className="w-20 h-20 mx-auto bg-status-success/10 rounded-full flex items-center justify-center">
        <svg className="w-10 h-10 text-status-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <div>
        <h2 className="text-2xl font-bold text-fur-cream mb-2">
          Welcome to SignalFriend! 🎉
        </h2>
        <p className="text-fur-cream/70">
          You're now a registered predictor! Your PredictorAccessPass NFT has been minted to your wallet.
          Head to your dashboard to start creating signals.
        </p>
      </div>
      <Button onClick={onGoToDashboard} size="lg">
        Go to Dashboard
      </Button>
    </div>
  );
}

/**
 * Already predictor content
 */
function AlreadyPredictorContent({ onGoToDashboard }: { onGoToDashboard: () => void }) {
  return (
    <div className="space-y-6 text-center">
      <div className="w-16 h-16 mx-auto bg-accent-gold/10 rounded-full flex items-center justify-center">
        <svg className="w-8 h-8 text-accent-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <div>
        <h2 className="text-xl font-semibold text-fur-cream mb-2">
          You're already a Predictor!
        </h2>
        <p className="text-fur-cream/70">
          Your wallet already owns a PredictorAccessPass NFT. Head to your dashboard to start creating signals.
        </p>
      </div>
      <Button onClick={onGoToDashboard} size="lg">
        Go to Dashboard
      </Button>
    </div>
  );
}

/**
 * Connect wallet / Sign in prompt for unauthenticated users
 */
function AuthPromptContent({
  isConnected,
  onSignIn,
  isSigningIn,
  signInError,
  isUserRejection,
  onResetError,
}: {
  isConnected: boolean;
  onSignIn: () => void;
  isSigningIn: boolean;
  signInError: { title: string; message: string } | null;
  isUserRejection: boolean;
  onResetError: () => void;
}) {
  return (
    <div className="space-y-6 text-center">
      <div className="w-16 h-16 mx-auto bg-accent-gold/10 rounded-full flex items-center justify-center">
        <svg className="w-8 h-8 text-accent-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </div>
      <div>
        <h2 className="text-xl font-semibold text-fur-cream mb-2">
          {isConnected ? 'Sign In Required' : 'Connect Your Wallet'}
        </h2>
        <p className="text-fur-cream/70 mb-6">
          {isConnected
            ? 'Please sign in with your wallet to become a predictor and start sharing your trading signals.'
            : 'Connect your wallet to become a predictor and start earning from your trading insights.'}
        </p>
      </div>

      {/* Sign-in error message */}
      {signInError && (
        <div className={`p-4 rounded-lg border ${
          isUserRejection 
            ? 'bg-status-warning/10 border-status-warning/30' 
            : 'bg-status-error/10 border-status-error/30'
        }`}>
          <div className="flex items-start gap-3">
            <svg 
              className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isUserRejection ? 'text-status-warning' : 'text-status-error'}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              {isUserRejection ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              )}
            </svg>
            <div className="text-left">
              <p className={`font-medium ${isUserRejection ? 'text-status-warning' : 'text-status-error'}`}>
                {signInError.title}
              </p>
              <p className="text-sm text-fur-cream/70 mt-1">{signInError.message}</p>
            </div>
          </div>
        </div>
      )}
      
      {isConnected ? (
        <Button 
          onClick={() => {
            onResetError();
            onSignIn();
          }} 
          disabled={isSigningIn} 
          size="lg"
        >
          {isSigningIn ? (
            <>
              <Spinner size="sm" className="mr-2" />
              Signing In...
            </>
          ) : signInError ? (
            'Try Again'
          ) : (
            'Sign In with Wallet'
          )}
        </Button>
      ) : (
        <div className="flex justify-center">
          <ConnectButton />
        </div>
      )}
    </div>
  );
}

/**
 * Become a Predictor Page Component
 */
export default function BecomePredictorPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlReferrer = searchParams.get('ref');

  const [step, setStep] = useState<RegistrationStep>('info');
  
  // Referral state - initialize from URL param if present
  const [hasReferrer, setHasReferrer] = useState(!!urlReferrer);
  const [referrerAddress, setReferrerAddress] = useState(urlReferrer || '');
  const [isValidatingReferrer, setIsValidatingReferrer] = useState(false);
  const [referrerValidationError, setReferrerValidationError] = useState<string | null>(null);

  // Validate referrer address when it changes (debounced)
  useEffect(() => {
    // Clear error when referrer is disabled or empty
    if (!hasReferrer || !referrerAddress.trim()) {
      setReferrerValidationError(null);
      setIsValidatingReferrer(false);
      return;
    }

    // First check if it's a valid address format (lenient - ignores checksum)
    if (!isValidAddressFormat(referrerAddress)) {
      setReferrerValidationError('Invalid address format. Please enter a valid wallet address (0x...)');
      setIsValidatingReferrer(false);
      return;
    }

    // Normalize the address to proper checksum format for API call
    const normalizedAddress = normalizeAddress(referrerAddress);
    if (!normalizedAddress) {
      setReferrerValidationError('Invalid address format. Please enter a valid wallet address (0x...)');
      setIsValidatingReferrer(false);
      return;
    }

    // Address format is valid - clear any format errors and show loading state
    // while we check if this address is actually a registered predictor
    setReferrerValidationError(null);
    setIsValidatingReferrer(true);

    // Debounce the API call to check if address is a registered predictor
    const timeoutId = setTimeout(async () => {
      try {
        const { isPredictor } = await checkPredictorStatus(normalizedAddress);
        if (!isPredictor) {
          setReferrerValidationError('This address is not a registered predictor. Only existing predictors can be used as referrers.');
        } else {
          setReferrerValidationError(null);
        }
      } catch {
        // If API fails, don't block - just clear the error
        setReferrerValidationError(null);
      } finally {
        setIsValidatingReferrer(false);
      }
    }, 500); // 500ms debounce

    return () => {
      clearTimeout(timeoutId);
      setIsValidatingReferrer(false);
    };
  }, [hasReferrer, referrerAddress]);

  // Combined referrer error (format error or validation error)
  const referrerError = referrerValidationError;

  // Auth state - check if user is connected and authenticated
  const { isConnected } = useAccount();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { login, isLoading: isSigningIn, parsedError: signInParsedError, isUserRejection, resetError } = useAuth();

  const {
    isPredictor,
    isCheckingNFT,
    joinFeeFormatted,
    joinFeeNumber,
    referralPayoutFormatted,
    usdtBalance,
    hasEnoughBalance,
    needsApproval,
    refetchAllowance,
    isLoading,
    approve,
    isApproving,
    isConfirmingApproval,
    isApprovalConfirmed,
    approvalError,
    join,
    isJoining,
    isConfirmingJoin,
    isJoinConfirmed,
    joinError,
    reset,
  } = useBecomePredictor();

  // Validate referrer address and get the final value to use
  const getValidReferrer = (): `0x${string}` | undefined => {
    if (!hasReferrer || !referrerAddress.trim()) {
      return undefined; // No referrer - will use zeroAddress in contract
    }
    if (isAddress(referrerAddress)) {
      return referrerAddress as `0x${string}`;
    }
    return undefined;
  };

  // Handle approval confirmation - transition to join step
  useEffect(() => {
    if (isApprovalConfirmed && step === 'approve') {
      refetchAllowance();
      // eslint-disable-next-line react-hooks/set-state-in-effect -- State transition needed for multi-step flow
      setStep('join');
    }
  }, [isApprovalConfirmed, step, refetchAllowance]);

  // Handle join confirmation - transition to success step
  useEffect(() => {
    if (isJoinConfirmed && step === 'join') {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- State transition needed for multi-step flow
      setStep('success');
    }
  }, [isJoinConfirmed, step]);

  // Handle continue from info step
  const handleContinue = () => {
    // Don't proceed if there's a referrer error or still validating
    if (referrerError || isValidatingReferrer) {
      return;
    }
    
    // Validate referrer address format if provided
    if (hasReferrer && referrerAddress.trim() && !isAddress(referrerAddress)) {
      return;
    }
    
    if (needsApproval) {
      setStep('approve');
    } else {
      setStep('join');
    }
  };

  // Handle approval
  const handleApprove = async () => {
    if (!joinFeeNumber) return;
    try {
      await approve(joinFeeNumber);
    } catch (err) {
      // Error is handled by the hook
      console.error('Approval error:', err);
    }
  };

  // Handle join
  const handleJoin = async () => {
    try {
      await join(getValidReferrer());
    } catch (err) {
      // Error is handled by the hook
      console.error('Join error:', err);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    reset();
    setStep('info');
  };

  // Handle navigation to dashboard
  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  // Loading state - only show when authenticated and checking NFT/data
  if (isConnected && isAuthenticated && (isLoading || isCheckingNFT)) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="p-8">
          <div className="flex flex-col items-center justify-center py-12">
            <Spinner size="lg" />
            <p className="mt-4 text-fur-cream/70">Loading...</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-fur-cream mb-2">Become a Predictor</h1>
        <p className="text-fur-cream/70">
          Share your trading insights and earn USDT for your signals
        </p>
      </div>

      {/* Referral badge - show if URL param was provided */}
      {urlReferrer && isAddress(urlReferrer) && step === 'info' && (
        <div className="mb-6 p-3 bg-accent-gold/10 border border-accent-gold/30 rounded-lg flex items-center gap-3">
          <Badge variant="default" className="bg-accent-gold text-dark-900">
            Referral
          </Badge>
          <p className="text-sm text-fur-cream/80">
            You were referred by{' '}
            <span className="font-mono text-accent-gold">
              {urlReferrer.slice(0, 6)}...{urlReferrer.slice(-4)}
            </span>
          </p>
        </div>
      )}

      <Card className="p-6">
        {/* Not connected or not authenticated - show auth prompt */}
        {!isConnected || !isAuthenticated ? (
          <AuthPromptContent
            isConnected={isConnected}
            onSignIn={login}
            isSigningIn={isSigningIn}
            signInError={signInParsedError}
            isUserRejection={isUserRejection}
            onResetError={resetError}
          />
        ) : /* Show success step if we just completed registration */ step === 'success' ? (
          <SuccessStepContent onGoToDashboard={handleGoToDashboard} />
        ) : /* Already predictor (came to page when already registered) */ isPredictor ? (
          <AlreadyPredictorContent onGoToDashboard={handleGoToDashboard} />
        ) : (
          <>
            {/* Step indicator */}
            <StepIndicator currentStep={step} needsApproval={needsApproval} />

            {/* Step content */}
            {step === 'info' && (
              <InfoStepContent
                joinFeeFormatted={joinFeeFormatted}
                referralPayoutFormatted={referralPayoutFormatted}
                usdtBalance={usdtBalance}
                hasEnoughBalance={hasEnoughBalance}
                onContinue={handleContinue}
                hasReferrer={hasReferrer}
                setHasReferrer={setHasReferrer}
                referrerAddress={referrerAddress}
                setReferrerAddress={setReferrerAddress}
                referrerError={referrerError}
                isValidatingReferrer={isValidatingReferrer}
              />
            )}

            {step === 'approve' && (
              <TransactionStepContent
                step="approve"
                isProcessing={isApproving || isConfirmingApproval}
                error={approvalError}
                onAction={handleApprove}
                onCancel={handleCancel}
                joinFeeFormatted={joinFeeFormatted}
              />
            )}

            {step === 'join' && (
              <TransactionStepContent
                step="join"
                isProcessing={isJoining || isConfirmingJoin}
                error={joinError}
                onAction={handleJoin}
                onCancel={handleCancel}
                joinFeeFormatted={joinFeeFormatted}
              />
            )}
          </>
        )}
      </Card>

      {/* Help text */}
      {isConnected && isAuthenticated && step === 'info' && !isPredictor && (
        <p className="text-center text-sm text-fur-cream/50 mt-6">
          Need help?{' '}
          <Link
            to="/faq"
            className="text-accent-gold hover:underline"
          >
            Check our FAQ
          </Link>
        </p>
      )}
    </div>
  );
}
