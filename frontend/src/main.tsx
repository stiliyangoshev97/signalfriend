/**
 * Application Entry Point
 *
 * Sets up React root and wraps the app with global providers.
 * This is the first file executed when the application starts.
 *
 * @module main
 *
 * PROVIDER HIERARCHY (outside → inside):
 * ```
 * StrictMode         - React development checks
 * └── SentryProvider - Error tracking & boundary
 *     └── QueryProvider - React Query (server state)
 *         └── Web3Provider - Wagmi + RainbowKit
 *             └── App - Router and UI
 * ```
 *
 * WHY THIS ORDER?
 * 1. SentryProvider outermost to catch all errors, including from providers
 * 2. QueryProvider before Web3Provider because RainbowKit requires React Query
 * 3. Web3Provider wraps App to provide wallet context to all routes
 *
 * STRICT MODE:
 * React.StrictMode is enabled in development to:
 * - Detect legacy API usage
 * - Warn about unsafe lifecycles
 * - Double-invoke effects to catch side-effect bugs
 *
 * STYLES:
 * Global CSS (Tailwind base, utilities, custom styles) imported from index.css
 *
 * @see providers/ for individual provider documentation
 * @see App.tsx for router setup
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { SentryProvider, QueryProvider, Web3Provider } from './providers';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SentryProvider>
      <QueryProvider>
        <Web3Provider>
          <App />
        </Web3Provider>
      </QueryProvider>
    </SentryProvider>
  </StrictMode>
);
