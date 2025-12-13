/**
 * Root Layout
 *
 * Main layout component that wraps all pages with consistent structure.
 * Provides header, footer, and a Suspense boundary for lazy-loaded routes.
 *
 * @module router/RootLayout
 *
 * STRUCTURE:
 * ```
 * ┌────────────────────────────────────────┐
 * │               Header                   │ ← Sticky navigation
 * ├────────────────────────────────────────┤
 * │                                        │
 * │               Main                     │ ← flex-1 (fills remaining space)
 * │            <Outlet />                  │ ← Route content renders here
 * │                                        │
 * ├────────────────────────────────────────┤
 * │               Footer                   │ ← Logo, copyright, social links
 * └────────────────────────────────────────┘
 * ```
 *
 * FEATURES:
 * - Full viewport height (min-h-screen) with flexbox layout
 * - Header sticky at top
 * - Main content area expands to fill space (flex-1)
 * - Footer stays at bottom even with little content
 * - Suspense boundary with loading spinner for lazy routes
 *
 * SUSPENSE FALLBACK:
 * While lazy-loaded route components are loading, displays
 * a centered Spinner component. This prevents blank screens
 * during code-split chunk loading.
 *
 * USAGE:
 * Used as the root element in the router configuration:
 * ```tsx
 * createBrowserRouter([
 *   {
 *     path: '/',
 *     element: <RootLayout />,
 *     children: [
 *       { index: true, element: <HomePage /> },
 *       // ... other routes
 *     ],
 *   },
 * ]);
 * ```
 *
 * FOOTER CONTENT:
 * - Logo and app name
 * - Copyright notice (auto-updating year)
 * - Social links (Discord, Twitter, GitHub)
 *
 * @see https://reactrouter.com/en/main/components/outlet
 */

import { Outlet, Link } from 'react-router-dom';
import { Suspense } from 'react';
import { Spinner, AnnouncementBanner } from '../shared/components/ui';
import Header from './Header';
import { socialLinks } from '../shared/config/social';

export function RootLayout() {
  return (
    <div className="min-h-screen bg-dark-700 flex flex-col">
      {/* Announcement banner (controlled via env vars) */}
      <AnnouncementBanner />
      
      {/* Header with navigation */}
      <Header />
      
      {/* Main content */}
      <main className="flex-1">
        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-[50vh]">
              <Spinner size="lg" />
            </div>
          }
        >
          <Outlet />
        </Suspense>
      </main>
      
      {/* Footer */}
      <footer className="border-t border-dark-600 py-8 bg-dark-800">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <img 
                src="/logo-bg-removed.png" 
                alt="SignalFriend" 
                className="h-8 w-8 rounded-lg object-contain"
              />
              <span className="font-semibold text-fur-cream">SignalFriend</span>
            </div>
            
            <p className="text-sm text-gray-main">
              © {new Date().getFullYear()} SignalFriend. All rights reserved.
            </p>
            
            <div className="flex items-center gap-3">
              <Link
                to="/terms"
                className="text-gray-main hover:text-fur-cream transition-colors"
              >
                Terms
              </Link>
              <span className="text-gray-main/50">|</span>
              <a
                href={`mailto:${socialLinks.email}`}
                className="text-gray-main hover:text-fur-cream transition-colors"
              >
                Contact
              </a>
              <span className="text-gray-main/50">|</span>
              <a
                href={socialLinks.discord}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-main hover:text-fur-cream transition-colors"
              >
                Discord
              </a>
              <span className="text-gray-main/50">|</span>
              <a
                href={socialLinks.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-main hover:text-fur-cream transition-colors"
              >
                X
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default RootLayout;
