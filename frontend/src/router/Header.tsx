/**
 * Header Component
 * 
 * Main navigation header with wallet connection.
 */

import { Link, NavLink } from 'react-router-dom';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { cn } from '../shared/utils/cn';

export function Header() {
  const { isConnected } = useAccount();

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'px-4 py-2.5 rounded-lg text-base font-medium transition-colors',
      isActive
        ? 'text-brand-200 bg-brand-200/15'
        : 'text-fur-cream hover:text-fur-light hover:bg-dark-700'
    );

  return (
    <header className="sticky top-0 z-40 border-b border-dark-600 bg-dark-800/95 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <img 
              src="/logo-bg-removed.png" 
              alt="SignalFriend Logo" 
              className="h-14 w-14 rounded-xl object-contain"
            />
            <span className="text-2xl font-bold text-fur-cream">SignalFriend</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            <NavLink to="/signals" className={navLinkClass}>
              Signals
            </NavLink>
            <NavLink to="/predictors" className={navLinkClass}>
              Predictors
            </NavLink>
            
            {isConnected && (
              <>
                <NavLink to="/my-signals" className={navLinkClass}>
                  My Signals
                </NavLink>
                <NavLink to="/dashboard" className={navLinkClass}>
                  Dashboard
                </NavLink>
              </>
            )}
          </nav>

          {/* Wallet Connection */}
          <div className="flex items-center gap-4">
            <ConnectButton
              chainStatus="icon"
              showBalance={false}
              accountStatus={{
                smallScreen: 'avatar',
                largeScreen: 'full',
              }}
            />
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
