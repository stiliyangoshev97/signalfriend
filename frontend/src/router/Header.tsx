/**
 * Header Component
 *
 * Main navigation header with logo, nav links, and authentication controls.
 * Sticky positioned at the top of the viewport with backdrop blur.
 *
 * @module router/Header
 *
 * LAYOUT:
 * ```
 * ┌─────────────────────────────────────────────────────────────┐
 * │  [Logo] SignalFriend    Signals  Predictors  ...   [Auth]  │
 * └─────────────────────────────────────────────────────────────┘
 * ```
 *
 * RESPONSIVE BEHAVIOR:
 * - Desktop (md+): Full horizontal nav with all links
 * - Mobile (<md): Nav links hidden (TODO: hamburger menu)
 *
 * NAVIGATION LINKS:
 * Public (always visible):
 * - Signals - Browse marketplace
 * - Predictors - View all predictors
 *
 * Authenticated (when signed in):
 * - My Signals - User's purchased signals
 * - Dashboard - Predictor dashboard
 *
 * ACTIVE STATE:
 * Active nav links are highlighted with:
 * - brand-200 text color
 * - brand-200/15 background
 *
 * STYLING:
 * - Sticky top-0 with z-40 for proper layering
 * - Semi-transparent background (bg-dark-800/95)
 * - Backdrop blur for frosted glass effect
 * - Border bottom for visual separation
 * - Container with responsive padding
 *
 * DEPENDENCIES:
 * - AuthButton - Handles wallet connection and SIWE auth
 * - useAccount (wagmi) - Wallet connection state
 * - useAuthStore - SIWE authentication state
 *
 * @see AuthButton for authentication flow details
 */

import { Link, NavLink } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { useAuthStore } from '@/features/auth/store';
import { AuthButton } from '@/features/auth';
import { cn } from '../shared/utils/cn';

export function Header() {
  const { isConnected } = useAccount();
  const { isAuthenticated } = useAuthStore();

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
            
            {/* Show user-specific nav items when authenticated */}
            {isConnected && isAuthenticated && (
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

          {/* Auth Button (Connect Wallet / Sign In / User Menu) */}
          <div className="flex items-center gap-4">
            <AuthButton />
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
