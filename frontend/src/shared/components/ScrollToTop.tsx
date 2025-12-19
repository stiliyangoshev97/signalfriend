/**
 * ScrollToTop Component
 *
 * Automatically scrolls to the top of the page when the route changes.
 * This is necessary because React Router preserves scroll position by default.
 *
 * @module shared/components/ScrollToTop
 *
 * USAGE:
 * Place this component inside your Router but outside your Routes:
 * ```tsx
 * <Router>
 *   <ScrollToTop />
 *   <Routes>...</Routes>
 * </Router>
 * ```
 *
 * Or in a layout component like RootLayout:
 * ```tsx
 * function RootLayout() {
 *   return (
 *     <>
 *       <ScrollToTop />
 *       <Header />
 *       <Outlet />
 *       <Footer />
 *     </>
 *   );
 * }
 * ```
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Scrolls to the top of the page on every route change.
 * Returns null as it doesn't render anything.
 */
export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll to top when pathname changes
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default ScrollToTop;
