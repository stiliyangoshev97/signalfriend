/**
 * PredictorRoute Component
 *
 * Route guard that requires predictor registration.
 * Extends ProtectedRoute with additional predictor status check.
 *
 * @module router/guards/PredictorRoute
 *
 * REQUIREMENTS:
 * - Wallet must be connected
 * - User must be authenticated (SIWE)
 * - User must be a registered predictor (owns PredictorAccessPass NFT)
 *
 * OPTIONS:
 * - requireVerified: If true, also requires predictor to be verified by admin
 *
 * BEHAVIOR:
 * - If not authenticated → Redirect to home
 * - If authenticated but not predictor → Redirect to become-predictor page
 * - If predictor but not verified (when required) → Show verification pending message
 * - If all checks pass → Render children
 *
 * USAGE:
 * ```tsx
 * // Basic predictor route (any predictor)
 * {
 *   path: 'dashboard',
 *   element: (
 *     <PredictorRoute>
 *       <PredictorDashboard />
 *     </PredictorRoute>
 *   ),
 * }
 *
 * // Verified predictor only (for creating signals)
 * {
 *   path: 'dashboard/create-signal',
 *   element: (
 *     <PredictorRoute requireVerified>
 *       <CreateSignalPage />
 *     </PredictorRoute>
 *   ),
 * }
 * ```
 *
 * PREDICTOR REGISTRATION FLOW:
 * 1. User connects wallet
 * 2. User authenticates (SIWE)
 * 3. User mints PredictorAccessPass NFT
 * 4. Backend records predictor registration
 * 5. Admin verifies predictor (optional, for full access)
 *
 * @see ProtectedRoute for basic authentication guard
 * @see useIsPredictor for predictor status check
 */

import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { useAuthStore } from '@/features/auth/store';
import { useSessionSync } from '@/features/auth';
import { useIsPredictor, useIsVerifiedPredictor } from '@/shared/hooks';
import { Spinner } from '@/shared/components/ui';

interface PredictorRouteProps {
  /** Child components to render when authorized */
  children?: React.ReactNode;
  /** Require predictor to be verified by admin */
  requireVerified?: boolean;
  /** Custom redirect path for non-predictors (default: '/become-predictor') */
  redirectTo?: string;
}

export function PredictorRoute({ 
  children, 
  requireVerified = false,
  redirectTo = '/' 
}: PredictorRouteProps) {
  const location = useLocation();
  const { isConnected, status } = useAccount();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasHydrated = useAuthStore((state) => state._hasHydrated);
  const isPredictor = useIsPredictor();
  const isVerified = useIsVerifiedPredictor();
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

  // Authenticated but not a predictor - redirect to become-predictor
  if (!isPredictor) {
    return (
      <Navigate 
        to="/become-predictor"
        state={{ 
          from: location.pathname,
          message: 'You need to register as a predictor to access this page.' 
        }} 
        replace 
      />
    );
  }

  // Predictor but not verified (when verification required)
  if (requireVerified && !isVerified) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="text-6xl mb-4">⏳</div>
          <h1 className="text-2xl font-bold text-fur-cream mb-2">
            Verification Required
          </h1>
          <p className="text-gray-main mb-4">
            Your predictor account is pending verification. 
            Once an admin verifies your account, you'll be able to access this feature.
          </p>
          <a 
            href="/dashboard" 
            className="text-brand-200 hover:text-brand-100 underline"
          >
            Return to Dashboard
          </a>
        </div>
      </div>
    );
  }

  // Authorized predictor - render children or outlet
  return children ? <>{children}</> : <Outlet />;
}

export default PredictorRoute;
