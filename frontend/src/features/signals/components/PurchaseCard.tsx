/**
 * @fileoverview Purchase Card for Signal Detail Page
 * @module features/signals/components/PurchaseCard
 * @description
 * Displays the signal price and purchase button.
 * Handles purchase flow: connect wallet → sign in → approve USDT → purchase.
 */

import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Button } from '@/shared/components/ui';
import { useAuth } from '@/features/auth';

/** Props for PurchaseCard component */
interface PurchaseCardProps {
  /** Signal price in USDT */
  priceUSDT: number;
  /** Whether the signal is expired */
  isExpired: boolean;
  /** Whether the signal is active */
  isActive: boolean;
  /** Whether the user already owns this signal */
  isOwned?: boolean;
  /** Whether the current user is the signal's predictor (seller) */
  isOwnSignal?: boolean;
  /** Whether the predictor is blacklisted */
  isPredictorBlacklisted?: boolean;
  /** Signal contentId for purchase */
  contentId: string;
  /** Callback when purchase is initiated */
  onPurchase?: () => void;
}

/**
 * PurchaseCard component
 * 
 * Displays:
 * - Signal price in large format
 * - Purchase button with appropriate state
 * - Status indicators (expired, owned, etc.)
 * 
 * Purchase flow states:
 * 1. Not connected → "Connect Wallet" button
 * 2. Connected but not signed in → "Sign In to Purchase" button
 * 3. Signed in → "Purchase Signal" button
 * 4. Already owned → "View Content" button
 * 5. Own signal (predictor) → Disabled with "This is your signal" message
 * 6. Expired → Disabled with "Signal Expired" message
 * 
 * @param props - Component props
 * @returns Purchase card element
 * 
 * @example
 * <PurchaseCard
 *   priceUSDT={25}
 *   isExpired={false}
 *   isOwned={false}
 *   contentId="abc123"
 *   onPurchase={() => setShowPurchaseModal(true)}
 * />
 */
export function PurchaseCard({
  priceUSDT,
  isExpired,
  isActive,
  isOwned = false,
  isOwnSignal = false,
  isPredictorBlacklisted = false,
  contentId: _contentId, // Will be used for purchase flow
  onPurchase,
}: PurchaseCardProps): React.ReactElement {
  const { isConnected } = useAccount();
  const { isAuthenticated, login, isLoading: isSigningIn } = useAuth();

  /**
   * Determine button state and text
   * Returns action type to handle different click behaviors
   */
  const getButtonState = () => {
    if (isExpired) {
      return {
        text: 'Signal Expired',
        disabled: true,
        variant: 'secondary' as const,
        actionType: 'none' as const,
      };
    }

    // Check if signal is inactive (deactivated by predictor)
    if (!isActive) {
      return {
        text: 'Signal Unavailable',
        disabled: true,
        variant: 'secondary' as const,
        actionType: 'none' as const,
      };
    }

    // Check if predictor is blacklisted
    if (isPredictorBlacklisted) {
      return {
        text: 'Predictor Blacklisted',
        disabled: true,
        variant: 'secondary' as const,
        actionType: 'none' as const,
      };
    }

    // Predictor cannot buy their own signal
    if (isOwnSignal) {
      return {
        text: 'This Is Your Signal',
        disabled: true,
        variant: 'secondary' as const,
        actionType: 'none' as const,
      };
    }

    if (!isConnected) {
      return {
        text: 'Connect Wallet to Purchase',
        disabled: false,
        variant: 'primary' as const,
        actionType: 'connect' as const,
      };
    }

    if (!isAuthenticated) {
      return {
        text: isSigningIn ? 'Signing In...' : 'Sign In to Purchase',
        disabled: isSigningIn,
        variant: 'primary' as const,
        actionType: 'signin' as const,
      };
    }

    return {
      text: 'Purchase Signal',
      disabled: false,
      variant: 'primary' as const,
      actionType: 'purchase' as const,
    };
  };

  const buttonState = getButtonState();

  // Special layout for owned signals - centered price with owned message, no button
  if (isOwned) {
    return (
      <div className="bg-dark-800 border border-dark-600 rounded-xl p-6">
        {/* Centered Price Display */}
        <div className="text-center">
          <p className="text-sm text-fur-cream/60 mb-1">Price</p>
          <div className="flex items-baseline justify-center gap-2">
            <span className="text-4xl font-bold text-fur-light">
              ${priceUSDT}
            </span>
            <span className="text-lg text-fur-cream/60">USDT</span>
          </div>
        </div>

        {/* Owned Message */}
        <div className="mt-4">
          <p className="text-sm text-success-400 text-center">
            ✓ You own this signal
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-dark-800 border border-dark-600 rounded-xl p-6">
      {/* Price Display */}
      <div className="mb-4">
        <p className="text-sm text-fur-cream/60 mb-1">Price</p>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold text-fur-light">
            ${priceUSDT}
          </span>
          <span className="text-lg text-fur-cream/60">USDT</span>
        </div>
      </div>

      {/* Purchase Button - Different rendering based on action type */}
      {buttonState.actionType === 'connect' ? (
        // Use RainbowKit's ConnectButton.Custom to open connect modal
        <ConnectButton.Custom>
          {({ openConnectModal }) => (
            <Button
              className="w-full"
              size="lg"
              variant={buttonState.variant}
              disabled={buttonState.disabled}
              onClick={openConnectModal}
            >
              {buttonState.text}
            </Button>
          )}
        </ConnectButton.Custom>
      ) : buttonState.actionType === 'signin' ? (
        // Trigger sign-in flow
        <Button
          className="w-full"
          size="lg"
          variant={buttonState.variant}
          disabled={buttonState.disabled}
          onClick={() => login()}
        >
          {buttonState.text}
        </Button>
      ) : buttonState.actionType === 'purchase' ? (
        // Trigger purchase modal
        <Button
          className="w-full"
          size="lg"
          variant={buttonState.variant}
          disabled={buttonState.disabled}
          onClick={onPurchase}
        >
          {buttonState.text}
        </Button>
      ) : (
        // Disabled state (expired, unavailable, etc.)
        <Button
          className="w-full"
          size="lg"
          variant={buttonState.variant}
          disabled={buttonState.disabled}
        >
          {buttonState.text}
        </Button>
      )}

      {/* Additional Info */}
      <div className="mt-4 space-y-2">
        {isExpired && (
          <p className="text-sm text-accent-red text-center">
            This signal has expired and is no longer available for purchase.
          </p>
        )}

        {!isExpired && !isActive && (
          <p className="text-sm text-accent-red text-center">
            This signal has been deactivated by the predictor.
          </p>
        )}

        {isPredictorBlacklisted && !isExpired && isActive && (
          <p className="text-sm text-accent-red text-center">
            This signal cannot be purchased because the predictor has been blacklisted.
          </p>
        )}

        {isOwnSignal && !isExpired && (
          <p className="text-sm text-fur-light text-center">
            You cannot purchase your own signal. View it from your dashboard.
          </p>
        )}

        {!isExpired && isActive && !isOwned && !isOwnSignal && !isPredictorBlacklisted && (
          <div className="text-xs text-fur-cream/50 space-y-1">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-success-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Instant access after purchase</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-success-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>NFT receipt as proof of purchase</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-success-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Secure on-chain transaction</span>
            </div>
          </div>
        )}
      </div>

      {/* Not Connected Message */}
      {!isConnected && !isExpired && isActive && !isPredictorBlacklisted && (
        <p className="mt-4 text-sm text-fur-cream/50 text-center">
          Click the button above to connect your wallet and start the purchase process.
        </p>
      )}

      {/* Not Authenticated Message */}
      {isConnected && !isAuthenticated && !isExpired && isActive && !isPredictorBlacklisted && (
        <p className="mt-4 text-sm text-fur-cream/50 text-center">
          Click the button above to sign in and verify your identity.
        </p>
      )}
    </div>
  );
}

export default PurchaseCard;
