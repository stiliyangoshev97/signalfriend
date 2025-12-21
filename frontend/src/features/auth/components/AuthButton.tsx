/**
 * AuthButton Component
 *
 * Smart authentication button that handles the complete auth lifecycle.
 * Displays different UI states based on wallet connection and authentication status.
 *
 * @module features/auth/components/AuthButton
 *
 * STATES:
 * 1. NOT CONNECTED   → Shows RainbowKit ConnectButton
 * 2. CONNECTED       → Shows "Sign In" button + address + wallet options
 * 3. AUTHENTICATED   → Shows chain selector + account button + "Sign Out"
 *
 * FEATURES:
 * - Seamless RainbowKit integration
 * - Three-state authentication flow
 * - Error display for failed authentication
 * - Chain switching support
 * - Responsive design (adapts to screen size)
 * - Loading state during signing
 *
 * USAGE EXAMPLES:
 * ```tsx
 * // In header/navigation
 * import { AuthButton } from '@/features/auth';
 *
 * function Header() {
 *   return (
 *     <header>
 *       <Logo />
 *       <nav>...</nav>
 *       <AuthButton />
 *     </header>
 *   );
 * }
 * ```
 *
 * STATE TRANSITIONS:
 * ```
 * [Not Connected] ---(Connect Wallet)---> [Connected/Not Auth]
 *                                                |
 *                                          (Sign In)
 *                                                |
 *                                                v
 *                                         [Authenticated]
 *                                                |
 *                                          (Sign Out)
 *                                                |
 *                                                v
 *                                         [Not Connected]
 * ```
 *
 * UI BREAKDOWN:
 *
 * State 1: Not Connected
 * ┌─────────────────────────────┐
 * │  [Connect Wallet]           │  ← RainbowKit button
 * └─────────────────────────────┘
 *
 * State 2: Connected, Not Authenticated
 * ┌─────────────────────────────────────────────────┐
 * │  (error)  0x1234...5678  [Sign In]  [⋮]        │
 * └─────────────────────────────────────────────────┘
 *
 * State 3: Authenticated
 * ┌─────────────────────────────────────────────────┐
 * │  [🔗]  [0x1234...5678]  [Sign Out]             │
 * │  chain  account button   logout button         │
 * └─────────────────────────────────────────────────┘
 *
 * DEPENDENCIES:
 * - @rainbow-me/rainbowkit - Wallet connection UI
 * - useAuth hook - Authentication logic
 * - Button component - Styled buttons
 * - formatAddress utility - Address shortening
 */

import { ConnectButton } from '@rainbow-me/rainbowkit';
// ...existing code...
import { useAuth } from '../api';
import { Button } from '@/shared/components/ui';
import { formatAddress } from '@/shared/utils';
import { useIsAdmin } from '@/shared/hooks/useIsAdmin';
import { useAccount, useDisconnect } from 'wagmi';
import { bsc } from 'wagmi/chains';

export function AuthButton() {
  const { 
    address,
    isConnected, 
    isAuthenticated, 
    isLoading, 
    login, 
    logout,
    parsedError,
    isUserRejection,
  } = useAuth();
  const isAdmin = useIsAdmin();
  const { chainId } = useAccount();
  const { disconnect } = useDisconnect();
  
  // Check if connected to wrong chain (not BNB Chain)
  const isWrongChain = isConnected && chainId !== bsc.id;

  // Not connected - show RainbowKit connect button
  if (!isConnected) {
    return (
      <ConnectButton
        chainStatus="icon"
        showBalance={false}
        accountStatus={{
          smallScreen: 'avatar',
          largeScreen: 'full',
        }}
      />
    );
  }

  // Handler for login button
  const handleLogin = () => {
    login();
  };

  // Connected but not authenticated - show sign in button
  if (!isAuthenticated) {
    return (
      <div className="flex items-center gap-3">
        {/* Wrong chain warning */}
        {isWrongChain && (
          <span 
            className="text-sm text-yellow-500 hidden sm:inline"
            title="Please switch to BNB Chain"
          >
            Wrong Network
          </span>
        )}
        
        {/* Show error if any - user rejection shown as yellow, other errors as red */}
        {parsedError && !isWrongChain && (
          <span
            className={`text-sm max-w-[200px] truncate ${
              isUserRejection ? 'text-yellow-500' : 'text-error-500'
            }`}
            title={parsedError.message}
          >
            {parsedError.title}
          </span>
        )}
        
        {/* Admin wallet indicator (before sign in) */}
        {isAdmin && !isWrongChain && (
          <span 
            className="px-2 py-1 text-xs font-medium bg-fur-main/20 text-fur-main border border-fur-main/30 rounded-lg hidden sm:inline"
            title="Admin wallet detected"
          >
            🔐 Admin
          </span>
        )}
        
        {/* Show connected address */}
        <span className="text-sm text-gray-main hidden sm:inline">
          {formatAddress(address!)}
        </span>
        
        {/* Sign In button - disabled on wrong chain */}
        {!isWrongChain ? (
          <Button
            onClick={handleLogin}
            disabled={isLoading}
            variant="primary"
            size="sm"
          >
            {isLoading ? 'Signing...' : 'Sign In'}
          </Button>
        ) : (
          <ConnectButton.Custom>
            {({ openChainModal }) => (
              <Button
                onClick={openChainModal}
                variant="primary"
                size="sm"
              >
                Switch Network
              </Button>
            )}
          </ConnectButton.Custom>
        )}
        
        {/* Direct Disconnect button - always works regardless of chain */}
        <button
          onClick={() => disconnect()}
          className="p-1.5 text-gray-main hover:text-fur-cream hover:bg-dark-600 rounded transition-colors"
          title="Disconnect wallet"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    );
  }

  // Fully authenticated - show user info with logout
  return (
    <div className="flex items-center gap-1 sm:gap-2">
      {/* Admin wallet indicator - hidden on mobile to save space */}
      {isAdmin && (
        <span 
          className="hidden sm:inline px-2 py-1 text-xs font-medium bg-fur-main/20 text-fur-main border border-fur-main/30 rounded-lg"
          title="Connected with admin wallet"
        >
          🔐 Admin
        </span>
      )}
      
      {/* User avatar/address via RainbowKit for wallet management */}
      <ConnectButton.Custom>
        {({ account, chain, openAccountModal, openChainModal }) => (
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Chain indicator */}
            {chain && (
              <button
                onClick={openChainModal}
                className="flex items-center p-1 sm:px-2 sm:py-1.5 rounded-lg bg-dark-600 hover:bg-dark-500 transition-colors"
              >
                {chain.hasIcon && chain.iconUrl && (
                  <img
                    src={chain.iconUrl}
                    alt={chain.name ?? 'Chain icon'}
                    className="w-4 h-4 sm:w-5 sm:h-5"
                  />
                )}
              </button>
            )}
            
            {/* Account button */}
            <button
              onClick={openAccountModal}
              className="flex items-center px-1.5 py-1 sm:px-3 sm:py-2 rounded-lg bg-dark-600 hover:bg-dark-500 transition-colors"
            >
              {account?.displayName && (
                <span className="text-xs sm:text-sm text-fur-cream">
                  {account.displayName}
                </span>
              )}
            </button>
          </div>
        )}
      </ConnectButton.Custom>
      
      {/* Sign Out button - icon only on mobile */}
      <Button
        onClick={logout}
        variant="ghost"
        size="sm"
        className="p-1 sm:px-3 sm:py-2"
        title="Sign Out"
      >
        <span className="hidden sm:inline">Sign Out</span>
        <svg className="w-4 h-4 sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      </Button>
    </div>
  );
}

export default AuthButton;
