/**
 * Application Router
 *
 * Defines all routes for the SignalFriend application using React Router v6.
 * Routes are organized into public, authenticated, predictor, and admin sections.
 *
 * @module router
 *
 * ROUTE STRUCTURE:
 * ```
 * / (RootLayout)
 * ├── /                      [PUBLIC]     Home / Landing page
 * ├── /signals               [PUBLIC]     Signal marketplace
 * ├── /signals/:contentId    [PUBLIC]     Signal detail page
 * ├── /predictors            [PUBLIC]     Predictor listing
 * ├── /predictors/:address   [PUBLIC]     Predictor profile
 * │
 * ├── /my-signals            [AUTH]       User's purchased signals
 * ├── /profile               [AUTH]       User profile settings
 * ├── /become-predictor      [AUTH]       Predictor registration
 * │
 * ├── /dashboard             [PREDICTOR]  Predictor dashboard
 * ├── /dashboard/create      [VERIFIED]   Create new signal (verified only)
 * │
 * └── /admin                 [ADMIN]      Admin panel
 * ```
 *
 * ROUTE GUARDS:
 * - ProtectedRoute: Requires wallet + SIWE authentication
 * - PredictorRoute: Requires predictor registration
 * - PredictorRoute (requireVerified): Requires verified predictor status
 * - AdminRoute: Requires admin wallet address
 *
 * LAYOUTS:
 * - RootLayout: Wraps all routes with Header, Footer, and Suspense boundary
 *
 * CODE SPLITTING:
 * Pages can be lazy-loaded for better performance:
 * ```tsx
 * const HomePage = lazy(() => import('../features/home/pages/HomePage'));
 * ```
 *
 * USAGE:
 * ```tsx
 * // In main.tsx
 * import { router } from '@/router';
 *
 * <RouterProvider router={router} />
 * ```
 *
 * @see router/guards for route protection components
 * @see https://reactrouter.com/en/main
 */

import { createBrowserRouter, Navigate } from 'react-router-dom';
import RootLayout from './RootLayout';
import { ProtectedRoute, AdminRoute, PredictorRoute } from './guards';
import { HomePage } from '@/features/home';
import { SignalsPage, SignalDetailPage, MyPurchasedSignalsPage } from '@/features/signals';
import { PredictorDashboardPage, PredictorsPage, PredictorProfilePage, BecomePredictorPage } from '@/features/predictors';

// Lazy load pages for code splitting (example for future pages)
// import { lazy } from 'react';
// const PredictorsPage = lazy(() => import('../features/predictors/pages/PredictorsPage'));

// Placeholder pages (to be replaced with actual pages)
const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="min-h-[70vh] flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-3xl font-bold text-fur-cream mb-2">{title}</h1>
      <p className="text-gray-main">Coming soon...</p>
    </div>
  </div>
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      // ===== PUBLIC ROUTES =====
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'signals',
        element: <SignalsPage />,
      },
      {
        path: 'signals/:contentId',
        element: <SignalDetailPage />,
      },
      {
        path: 'predictors',
        element: <PredictorsPage />,
      },
      {
        path: 'predictors/:address',
        element: <PredictorProfilePage />,
      },
      
      // ===== AUTHENTICATED ROUTES =====
      {
        path: 'my-signals',
        element: (
          <ProtectedRoute>
            <MyPurchasedSignalsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'dashboard',
        element: (
          <PredictorRoute>
            <PredictorDashboardPage />
          </PredictorRoute>
        ),
      },
      {
        path: 'dashboard/create-signal',
        element: (
          <PredictorRoute requireVerified>
            <PredictorDashboardPage />
          </PredictorRoute>
        ),
      },
      {
        path: 'profile',
        element: (
          <ProtectedRoute>
            <PlaceholderPage title="My Profile" />
          </ProtectedRoute>
        ),
      },
      {
        path: 'become-predictor',
        // No ProtectedRoute - page handles auth state internally
        // Shows connect/sign-in prompt to unauthenticated users
        element: <BecomePredictorPage />,
      },
      
      // ===== ADMIN ROUTES =====
      {
        path: 'admin',
        element: (
          <AdminRoute>
            <PlaceholderPage title="Admin Panel" />
          </AdminRoute>
        ),
      },
      
      // ===== CATCH ALL =====
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);

export default router;
