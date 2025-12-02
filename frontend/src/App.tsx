

/**
 * Main App Component
 * 
 * Root component that renders the router.
 * All providers are set up in main.tsx.
 */

import { RouterProvider } from 'react-router-dom';
import { router } from './router';

function App() {
  return <RouterProvider router={router} />;
}

export default App;