/**
 * Application Router
 *
 * Defines all routes for the SignalFriend application using React Router v6.
 * Routes are organized into public, authenticated, and admin sections.
 *
 * @module router
 *
 * ROUTE STRUCTURE:
 * ```
 * / (RootLayout)
 * ├── /                    [PUBLIC]  Home / Landing page
 * ├── /signals             [PUBLIC]  Signal marketplace
 * ├── /signals/:contentId  [PUBLIC]  Signal detail page
 * ├── /predictors          [PUBLIC]  Predictor listing
 * ├── /predictors/:address [PUBLIC]  Predictor profile
 * │
 * ├── /my-signals          [AUTH]    User's purchased signals
 * ├── /dashboard           [AUTH]    Predictor dashboard
 * ├── /dashboard/create    [AUTH]    Create new signal
 * ├── /profile             [AUTH]    User profile settings
 * │
 * └── /admin               [ADMIN]   Admin panel
 * ```
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
 * ROUTE PROTECTION:
 * Currently using placeholder pages. When implementing real pages:
 * - Create ProtectedRoute component for authenticated routes
 * - Create AdminRoute component for admin routes
 * - Check auth state and redirect unauthorized users
 *
 * USAGE:
 * ```tsx
 * // In main.tsx
 * import { router } from '@/router';
 *
 * <RouterProvider router={router} />
 * ```
 *
 * @see https://reactrouter.com/en/main
 */

import { createBrowserRouter, Navigate } from 'react-router-dom';
import RootLayout from './RootLayout';

// Lazy load pages for code splitting
// import { lazy } from 'react';
// const HomePage = lazy(() => import('../features/home/pages/HomePage'));

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
        element: <PlaceholderPage title="Home" />,
      },
      {
        path: 'signals',
        element: <PlaceholderPage title="Signal Marketplace" />,
      },
      {
        path: 'signals/:contentId',
        element: <PlaceholderPage title="Signal Details" />,
      },
      {
        path: 'predictors',
        element: <PlaceholderPage title="Predictors" />,
      },
      {
        path: 'predictors/:address',
        element: <PlaceholderPage title="Predictor Profile" />,
      },
      
      // ===== AUTHENTICATED ROUTES =====
      {
        path: 'my-signals',
        element: <PlaceholderPage title="My Signals" />,
      },
      {
        path: 'dashboard',
        element: <PlaceholderPage title="Predictor Dashboard" />,
      },
      {
        path: 'dashboard/create-signal',
        element: <PlaceholderPage title="Create Signal" />,
      },
      {
        path: 'profile',
        element: <PlaceholderPage title="My Profile" />,
      },
      
      // ===== ADMIN ROUTES =====
      {
        path: 'admin',
        element: <PlaceholderPage title="Admin Panel" />,
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
