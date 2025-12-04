/**
 * ProtectedRoute Component
 *
 * Route guard that requires user authentication (SIWE signed in).
 * Redirects unauthenticated users to the home page.
 *
 * @module router/guards/ProtectedRoute
 *
 * REQUIREMENTS:
 * - Wallet must be connected (via RainbowKit)
 * - User must be authenticated (SIWE signature verified, JWT obtained)
 *
 * BEHAVIOR:
 * - If wallet not connected → Redirect to home with message
 * - If connected but not authenticated → Redirect to home with message
 * - If authenticated → Render children
 *
 * USAGE:
 * ```tsx
 * // In router configuration
 * {
 *   path: 'dashboard',
 *   element: (
 *     <ProtectedRoute>
 *       <DashboardPage />
 *     </ProtectedRoute>
 *   ),
 * }
 *
 * // Or wrap multiple routes
 * {
 *   element: <ProtectedRoute />,
 *   children: [
 *     { path: 'dashboard', element: <DashboardPage /> },
 *     { path: 'my-signals', element: <MySignalsPage /> },
 *   ],
 * }
 * ```
 *
 * REDIRECT STATE:
 * The redirect includes state with the intended destination,
 * allowing the login flow to redirect back after authentication.
 *
 * @see AdminRoute for admin-only route protection
 * @see useAuth for authentication state
 */

import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { useAuthStore } from '@/features/auth/store';
import { useSessionSync } from '@/features/auth';
import { Spinner } from '@/shared/components/ui';

interface ProtectedRouteProps {
  /** Child components to render when authenticated */
  children?: React.ReactNode;
  /** Custom redirect path (default: '/') */
  redirectTo?: string;
}

export function ProtectedRoute({ 
  children, 
  redirectTo = '/' 
}: ProtectedRouteProps) {
  const location = useLocation();
  const { isConnected, status } = useAccount();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasHydrated = useAuthStore((state) => state._hasHydrated);
  const { isLoading: isSessionLoading } = useSessionSync();
  
  // Check if wagmi is still initializing
  const isWagmiInitializing = status === 'connecting' || status === 'reconnecting';

  // Show loading spinner while reconnecting, validating session, or waiting for store hydration
  if (isWagmiInitializing || isSessionLoading || !hasHydrated) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-fur-cream/60">Loading...</p>
        </div>
      </div>
    );
  }

  // Not connected - redirect to home
  if (!isConnected) {
    return (
      <Navigate 
        to={redirectTo} 
        state={{ 
          from: location.pathname,
          message: 'Please connect your wallet to access this page.' 
        }} 
        replace 
      />
    );
  }

  // Connected but not authenticated - redirect to home
  if (!isAuthenticated) {
    return (
      <Navigate 
        to={redirectTo} 
        state={{ 
          from: location.pathname,
          message: 'Please sign in with your wallet to access this page.' 
        }} 
        replace 
      />
    );
  }

  // Authenticated - render children or outlet
  return children ? <>{children}</> : <Outlet />;
}

export default ProtectedRoute;
