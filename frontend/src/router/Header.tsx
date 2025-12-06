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

import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { useAuthStore } from '@/features/auth/store';
import { AuthButton } from '@/features/auth';
import { cn } from '../shared/utils/cn';

export function Header() {
  const { isConnected } = useAccount();
  const { isAuthenticated } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'px-4 py-2.5 rounded-lg text-base font-medium transition-colors',
      isActive
        ? 'text-brand-200 bg-brand-200/15'
        : 'text-fur-cream hover:text-fur-light hover:bg-dark-700'
    );

  const mobileNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'block px-4 py-3 rounded-lg text-base font-medium transition-colors',
      isActive
        ? 'text-brand-200 bg-brand-200/15'
        : 'text-fur-cream hover:text-fur-light hover:bg-dark-700'
    );

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-40 border-b border-dark-600 bg-dark-800/95 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 md:gap-3 shrink-0">
            <img 
              src="/logo-bg-removed.png" 
              alt="SignalFriend Logo" 
              className="h-10 w-10 md:h-14 md:w-14 rounded-xl object-contain"
            />
            <span className="text-lg md:text-2xl font-bold text-fur-cream">SignalFriend</span>
          </Link>

          {/* Desktop Navigation */}
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

          {/* Right side: Auth Button + Mobile Menu Toggle */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Auth Button - smaller on mobile */}
            <div className="scale-90 md:scale-100 origin-right">
              <AuthButton />
            </div>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-fur-cream hover:bg-dark-700 transition-colors"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                // X icon
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                // Hamburger icon
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-dark-600 space-y-1">
            <NavLink to="/signals" className={mobileNavLinkClass} onClick={closeMobileMenu}>
              Signals
            </NavLink>
            <NavLink to="/predictors" className={mobileNavLinkClass} onClick={closeMobileMenu}>
              Predictors
            </NavLink>
            
            {/* Show user-specific nav items when authenticated */}
            {isConnected && isAuthenticated && (
              <>
                <NavLink to="/my-signals" className={mobileNavLinkClass} onClick={closeMobileMenu}>
                  My Signals
                </NavLink>
                <NavLink to="/dashboard" className={mobileNavLinkClass} onClick={closeMobileMenu}>
                  Dashboard
                </NavLink>
              </>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}

export default Header;
