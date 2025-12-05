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
 * - User must be a registered predictor (owns PredictorAccessPass NFT OR has backend record)
 *
 * OPTIONS:
 * - requireVerified: If true, also requires predictor to be verified by admin
 *
 * BEHAVIOR:
 * - If not authenticated → Redirect to home
 * - If has NFT → Allow access (trust on-chain state)
 * - If no NFT and no backend record → Redirect to become-predictor
 * - If predictor but not verified (when required) → Show verification pending message
 * - If all checks pass → Render children
 *
 * @see ProtectedRoute for basic authentication guard
 * @see useIsPredictor for predictor status check
 */

import { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { useAuthStore } from '@/features/auth/store';
import { useSessionSync } from '@/features/auth';
import { useIsPredictor, useIsVerifiedPredictor } from '@/shared/hooks';
import { Spinner } from '@/shared/components/ui';
import { usePredictorNFTBalance } from '@/features/predictors/hooks';
import { fetchPredictorByAddress } from '@/features/predictors/api';

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
  const { address, isConnected, status } = useAccount();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasHydrated = useAuthStore((state) => state._hasHydrated);
  const setPredictor = useAuthStore((state) => state.setPredictor);
  const isPredictor = useIsPredictor();
  const isVerified = useIsVerifiedPredictor();
  const { isLoading: isSessionLoading } = useSessionSync();
  
  // Check NFT ownership on-chain (this is the source of truth)
  const { balance: nftBalance, isLoading: isCheckingNFT } = usePredictorNFTBalance();
  const hasNFT = (nftBalance ?? 0n) > 0n;
  
  // Check if wagmi is still initializing
  const isWagmiInitializing = status === 'connecting' || status === 'reconnecting';

  // If user has NFT but no predictor in auth store, fetch and update it
  // This handles the case after becoming a predictor where auth store hasn't been updated yet
  useEffect(() => {
    if (hasNFT && !isPredictor && address && isAuthenticated) {
      // Fetch predictor profile and update auth store
      fetchPredictorByAddress(address)
        .then((predictor) => {
          if (predictor) {
            setPredictor(predictor);
          }
        })
        .catch((err) => {
          // Predictor might not be in backend yet (webhook delay)
          // This is fine - we still allow access based on NFT ownership
          console.log('[PredictorRoute] Could not fetch predictor profile:', err.message);
        });
    }
  }, [hasNFT, isPredictor, address, isAuthenticated, setPredictor]);

  // Show loading spinner while reconnecting, validating session, or waiting for store hydration
  if (isWagmiInitializing || isSessionLoading || !hasHydrated || isCheckingNFT) {
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

  // TRUST NFT OWNERSHIP: If user has NFT, they are a predictor - let them through
  // This provides instant access after becoming a predictor without needing to re-auth
  if (hasNFT) {
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

  // No NFT - also check backend predictor status (in case NFT check failed)
  if (isPredictor) {
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

  // Not a predictor at all - redirect to become-predictor
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

export default PredictorRoute;