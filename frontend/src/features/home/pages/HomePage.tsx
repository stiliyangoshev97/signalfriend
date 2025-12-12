/**
 * @fileoverview Home page component for SignalFriend
 * @module features/home/pages/HomePage
 * @description
 * Main landing page that combines all home sections into a cohesive
 * marketing page. Showcases the platform's value proposition, features,
 * how it works, and calls to action for both signal buyers and predictors.
 *
 * @example
 * // Usage in router
 * <Route path="/" element={<HomePage />} />
 */

import type { ReactElement } from 'react';
import {
  HeroSection,
  FeaturesSection,
  HowItWorksSection,
  CTASection,
} from '../components';
import { useSEO, getSEOUrl } from '@/shared/hooks';

/**
 * HomePage component - Main landing page for SignalFriend
 *
 * @description
 * Assembles all landing page sections in the correct order:
 * 1. Hero - Main value proposition and CTAs
 * 2. Features - Key platform features grid
 * 3. How It Works - Step-by-step guides for users and predictors
 * 4. CTA - Final call to action with trust indicators
 *
 * The page is designed for:
 * - Signal buyers looking for verified trading signals
 * - Predictors wanting to monetize their expertise
 * - New users learning about the platform
 *
 * @returns {ReactElement} The complete home page
 *
 * @example
 * function App() {
 *   return (
 *     <Routes>
 *       <Route path="/" element={<HomePage />} />
 *     </Routes>
 *   );
 * }
 */
export function HomePage(): ReactElement {
  // SEO for home page - uses defaults from index.html, just sets canonical URL
  useSEO({
    url: getSEOUrl('/'),
  });

  return (
    <main className="min-h-screen">
      {/* Hero Section - Main value proposition */}
      <HeroSection />

      {/* Features Section - Platform highlights */}
      <FeaturesSection />

      {/* How It Works - User and Predictor guides */}
      <HowItWorksSection />

      {/* Final CTA - Conversion focus */}
      <CTASection />
    </main>
  );
}

export default HomePage;
