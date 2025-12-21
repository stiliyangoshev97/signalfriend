

/**
 * Main App Component
 *
 * Root component that renders the React Router.
 * All global providers are configured in main.tsx.
 *
 * @module App
 *
 * ARCHITECTURE:
 * ```
 * main.tsx (Providers)
 * └── App.tsx (Router + Auth Sync)
 *     └── RootLayout (Header, Footer, Outlet)
 *         └── Page Components
 * ```
 *
 * This component is intentionally minimal - it only renders the router.
 * Global state, Web3, and error tracking are handled by providers in main.tsx.
 *
 * AUTH SYNC:
 * The useSessionSync hook runs here to detect wallet changes globally.
 * When a user switches wallets (without disconnecting), the auth state
 * is cleared to prevent JWT/wallet address mismatch.
 *
 * MAINTENANCE MODE:
 * Set VITE_MAINTENANCE_MODE=true in .env.local to show maintenance page.
 * See RUNBOOK.md for full instructions.
 *
 * @see main.tsx for provider configuration
 * @see router/index.tsx for route definitions
 */

import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { useSessionSync } from './features/auth';
import { MaintenancePage } from './features/maintenance';
import { RegionDisclaimerModal } from './shared/components/RegionDisclaimerModal';

/**
 * Check if maintenance mode is enabled via environment variable.
 * Only "true" (case-insensitive) enables maintenance mode.
 */
const isMaintenanceMode =
  import.meta.env.VITE_MAINTENANCE_MODE?.toLowerCase() === 'true';

function App() {
  // Run session sync globally to detect wallet changes on any page
  // This prevents JWT/wallet mismatch when user switches accounts
  useSessionSync();

  // Show maintenance page if maintenance mode is enabled
  if (isMaintenanceMode) {
    return <MaintenancePage />;
  }
  
  return (
    <>
      <RegionDisclaimerModal />
      <RouterProvider router={router} />
    </>
  );
}

export default App;