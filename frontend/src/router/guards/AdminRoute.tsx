/**
 * AdminRoute Component
 *
 * Route guard that requires admin privileges.
 * Extends ProtectedRoute with additional admin wallet check.
 *
 * @module router/guards/AdminRoute
 *
 * REQUIREMENTS:
 * - Wallet must be connected
 * - User must be authenticated (SIWE)
 * - Wallet address must be in admin whitelist
 *
 * BEHAVIOR:
 * - If not authenticated → Redirect to home (via ProtectedRoute logic)
 * - If authenticated but not admin → Redirect to home with "Access Denied"
 * - If admin → Render children
 *
 * ADMIN VERIFICATION:
 * Uses useIsAdmin hook which checks wallet address against a hardcoded
 * admin whitelist. This is client-side only - backend must also verify
 * admin status for any privileged operations.
 *
 * USAGE:
 * ```tsx
 * // In router configuration
 * {
 *   path: 'admin',
 *   element: (
 *     <AdminRoute>
 *       <AdminPanelPage />
 *     </AdminRoute>
 *   ),
 * }
 *
 * // With nested routes
 * {
 *   path: 'admin',
 *   element: <AdminRoute />,
 *   children: [
 *     { index: true, element: <AdminDashboard /> },
 *     { path: 'predictors', element: <ManagePredictors /> },
 *     { path: 'reports', element: <ViewReports /> },
 *   ],
 * }
 * ```
 *
 * SECURITY NOTE:
 * This is client-side protection for UX only. All admin operations
 * must be verified on the backend using JWT claims or on-chain role checks.
 *
 * @see ProtectedRoute for basic authentication guard
 * @see useIsAdmin for admin check logic
 */

import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { useAuthStore } from '@/features/auth/store';
import { useIsAdmin } from '@/shared/hooks';

interface AdminRouteProps {
  /** Child components to render when authorized */
  children?: React.ReactNode;
  /** Custom redirect path for non-admins (default: '/') */
  redirectTo?: string;
}

export function AdminRoute({ 
  children, 
  redirectTo = '/' 
}: AdminRouteProps) {
  const location = useLocation();
  const { isConnected } = useAccount();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isAdmin = useIsAdmin();

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

  // Authenticated but not admin - access denied
  if (!isAdmin) {
    return (
      <Navigate 
        to={redirectTo} 
        state={{ 
          from: location.pathname,
          message: 'Access denied. Admin privileges required.' 
        }} 
        replace 
      />
    );
  }

  // Authorized admin - render children or outlet
  return children ? <>{children}</> : <Outlet />;
}

export default AdminRoute;
