/**
 * AuthButton Component
 * 
 * Smart button that handles the full authentication flow:
 * - Shows RainbowKit ConnectButton when not connected
 * - Shows "Sign In" button after wallet connection (pre-auth)
 * - Shows user info when authenticated
 */

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAuth } from '../api';
import { Button } from '@/shared/components/ui';
import { formatAddress } from '@/shared/utils';

export function AuthButton() {
  const { 
    address,
    isConnected, 
    isAuthenticated, 
    isLoading, 
    login, 
    logout,
    error,
  } = useAuth();

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
        {/* Show error if any */}
        {error && (
          <span
            className="text-sm text-error-500 max-w-[200px] truncate"
            title={error.message}
          >
            {error.message}
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
