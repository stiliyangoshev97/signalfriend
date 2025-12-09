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
        {/* Show error if any - user rejection shown as yellow, other errors as red */}
        {parsedError && (
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
        {isAdmin && (
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
        
        {/* Sign In button */}
        <Button
          onClick={handleLogin}
          disabled={isLoading}
          variant="primary"
          size="sm"
        >
          {isLoading ? 'Signing...' : 'Sign In'}
        </Button>
        
        {/* Disconnect option */}
        <ConnectButton.Custom>
          {({ openAccountModal }) => (
            <button
              onClick={openAccountModal}
              className="text-sm text-gray-main hover:text-fur-cream transition-colors"
              title="Wallet options"
            >
              ⋮
            </button>
          )}
        </ConnectButton.Custom>
      </div>
    );
  }

  // Fully authenticated - show user info with logout
  return (
    <div className="flex items-center gap-3">
      {/* Admin wallet indicator */}
      {isAdmin && (
        <span 
          className="px-2 py-1 text-xs font-medium bg-fur-main/20 text-fur-main border border-fur-main/30 rounded-lg"
          title="Connected with admin wallet"
        >
          🔐 Admin
        </span>
      )}
      
      {/* User avatar/address via RainbowKit for wallet management */}
      <ConnectButton.Custom>
        {({ account, chain, openAccountModal, openChainModal }) => (
          <div className="flex items-center gap-2">
            {/* Chain indicator */}
            {chain && (
              <button
                onClick={openChainModal}
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-dark-600 hover:bg-dark-500 transition-colors"
              >
                {chain.hasIcon && chain.iconUrl && (
                  <img
                    src={chain.iconUrl}
                    alt={chain.name ?? 'Chain icon'}
                    className="w-4 h-4"
                  />
                )}
              </button>
            )}
            
            {/* Account button */}
            <button
              onClick={openAccountModal}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-dark-600 hover:bg-dark-500 transition-colors"
            >
              {account?.displayName && (
                <span className="text-sm text-fur-cream">
                  {account.displayName}
                </span>
              )}
            </button>
          </div>
        )}
      </ConnectButton.Custom>
      
      {/* Sign Out button */}
      <Button
        onClick={logout}
        variant="ghost"
        size="sm"
      >
        Sign Out
      </Button>
    </div>
  );
}

export default AuthButton;
