

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
 * └── App.tsx (Router)
 *     └── RootLayout (Header, Footer, Outlet)
 *         └── Page Components
 * ```
 *
 * This component is intentionally minimal - it only renders the router.
 * Global state, Web3, and error tracking are handled by providers in main.tsx.
 *
 * @see main.tsx for provider configuration
 * @see router/index.tsx for route definitions
 */

import { RouterProvider } from 'react-router-dom';
import { router } from './router';

function App() {
  return <RouterProvider router={router} />;
}

export default App;