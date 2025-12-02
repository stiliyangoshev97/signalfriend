/**
 * Root Layout
 * 
 * Main layout wrapper with header, footer, and navigation.
 * Wraps all pages with consistent layout.
 */

import { Outlet } from 'react-router-dom';
import { Suspense } from 'react';
import { Spinner } from '../shared/components/ui';
import Header from './Header';

export function RootLayout() {
  return (
    <div className="min-h-screen bg-dark-700 flex flex-col">
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
            
            <div className="flex items-center gap-4">
              <a
                href="https://discord.gg/signalfriend"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-main hover:text-fur-cream transition-colors"
              >
                Discord
              </a>
              <a
                href="https://twitter.com/signalfriend"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-main hover:text-fur-cream transition-colors"
              >
                Twitter
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default RootLayout;
