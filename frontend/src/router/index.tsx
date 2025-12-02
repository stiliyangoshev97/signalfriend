/**
 * Application Router
 * 
 * Defines all routes for the SignalFriend application.
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
