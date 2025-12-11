/**
 * ===== ANNOUNCEMENT BANNER COMPONENT =====
 * 
 * A dismissible banner for displaying site-wide announcements.
 * Controlled via environment variables for easy updates without code changes.
 * 
 * FEATURES:
 * - Configurable via env variables (no code changes needed)
 * - Multiple style variants (info, warning, success, error)
 * - Optional link button to /announcements page
 * - Dismissible (per page load - shows again on refresh)
 * - Smooth slide-down animation
 * - Responsive design
 * - Styled to match SignalFriend dark theme
 * 
 * ENVIRONMENT VARIABLES:
 * ```env
 * # Enable/disable the banner
 * VITE_ANNOUNCEMENT_ENABLED=true
 * 
 * # Banner content
 * VITE_ANNOUNCEMENT_MESSAGE=🎉 Welcome to SignalFriend! We're in beta.
 * 
 * # Style variant: info | warning | success | error
 * VITE_ANNOUNCEMENT_VARIANT=info
 * 
 * # Optional link button
 * VITE_ANNOUNCEMENT_LINK_TEXT=View All Updates
 * VITE_ANNOUNCEMENT_LINK_URL=/announcements
 * ```
 * 
 * USAGE:
 * Simply place in RootLayout above the Header:
 * ```tsx
 * <AnnouncementBanner />
 * <Header />
 * ```
 * 
 * DISMISSAL BEHAVIOR:
 * - User can click X to dismiss for current session
 * - Banner reappears on page refresh
 * - For full announcement history, link to /announcements page
 * 
 * @module shared/components/ui/AnnouncementBanner
 */

import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

// =============================================================================
// Configuration from environment variables
// =============================================================================

const config = {
  enabled: import.meta.env.VITE_ANNOUNCEMENT_ENABLED?.toLowerCase() === 'true',
  message: import.meta.env.VITE_ANNOUNCEMENT_MESSAGE || '',
  variant: (import.meta.env.VITE_ANNOUNCEMENT_VARIANT || 'info') as 'info' | 'warning' | 'success' | 'error',
  linkText: import.meta.env.VITE_ANNOUNCEMENT_LINK_TEXT || '',
  linkUrl: import.meta.env.VITE_ANNOUNCEMENT_LINK_URL || '',
};

// =============================================================================
// Variant Styles
// =============================================================================

const variantStyles = {
  info: {
    bg: 'bg-dark-700/95',
    border: 'border-b border-accent-gold/30',
    text: 'text-dark-50',
    button: 'bg-accent-gold/20 hover:bg-accent-gold/30 text-accent-gold',
    close: 'text-dark-50/70 hover:text-dark-50',
  },
  warning: {
    bg: 'bg-accent-gold/90',
    border: '',
    text: 'text-dark-900',
    button: 'bg-dark-900/20 hover:bg-dark-900/30 text-dark-900',
    close: 'text-dark-900/70 hover:text-dark-900',
  },
  success: {
    bg: 'bg-dark-600/95',
    border: 'border-b border-status-success/50',
    text: 'text-dark-50',
    button: 'bg-status-success/20 hover:bg-status-success/30 text-status-success',
    close: 'text-dark-50/70 hover:text-dark-50',
  },
  error: {
    bg: 'bg-dark-800/95',
    border: 'border-b border-accent-red/50',
    text: 'text-dark-50',
    button: 'bg-accent-red/20 hover:bg-accent-red/30 text-accent-red',
    close: 'text-dark-50/70 hover:text-dark-50',
  },
};

// =============================================================================
// Component
// =============================================================================

export function AnnouncementBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const location = useLocation();

  // Hide banner when on the news page (user is already viewing news)
  const isOnNewsPage = location.pathname === '/news';

  useEffect(() => {
    // Check if banner should be shown (not on news page)
    if (config.enabled && config.message && !isOnNewsPage) {
      // Small delay for smooth entrance animation
      const timer = setTimeout(() => {
        setIsVisible(true);
        setIsAnimating(true);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      // Hide if navigated to news page
      setIsVisible(false);
      setIsAnimating(false);
    }
  }, [isOnNewsPage]);

  const handleDismiss = () => {
    setIsAnimating(false);
    // Wait for animation to complete before hiding
    setTimeout(() => {
      setIsVisible(false);
    }, 300);
  };

  // Don't render if not enabled or already dismissed
  if (!isVisible) {
    return null;
  }

  const styles = variantStyles[config.variant] || variantStyles.info;
  const isExternalLink = config.linkUrl.startsWith('http');

  return (
    <div
      className={`
        ${styles.bg} ${styles.text} ${styles.border}
        transition-all duration-300 ease-out
        ${isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full'}
      `}
    >
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Message */}
          <p className="flex-1 text-sm font-medium text-center sm:text-left">
            {config.message}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Optional Link Button */}
            {config.linkText && config.linkUrl && (
              isExternalLink ? (
                <a
                  href={config.linkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`
                    ${styles.button}
                    px-3 py-1 rounded-md text-sm font-medium
                    transition-colors duration-200
                  `}
                >
                  {config.linkText}
                </a>
              ) : (
                <Link
                  to={config.linkUrl}
                  className={`
                    ${styles.button}
                    px-3 py-1 rounded-md text-sm font-medium
                    transition-colors duration-200
                  `}
                >
                  {config.linkText}
                </Link>
              )
            )}

            {/* Dismiss Button */}
            <button
              onClick={handleDismiss}
              className={`
                ${styles.close}
                p-1 rounded-md transition-colors duration-200
                focus:outline-none focus:ring-2 focus:ring-white/50
              `}
              aria-label="Dismiss announcement"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnnouncementBanner;
