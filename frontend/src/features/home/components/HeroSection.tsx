/**
 * HeroSection Component
 *
 * Main hero/banner section for the landing page.
 * Features the app tagline, description, and call-to-action buttons.
 *
 * @module features/home/components/HeroSection
 *
 * LAYOUT:
 * ```
 * ┌──────────────────────────────────────────────────────────────┐
 * │                         Hero Section                         │
 * │  ┌─────────────────────┐    ┌─────────────────────────────┐ │
 * │  │      Text Content   │    │      Logo/Illustration      │ │
 * │  │  - Tagline          │    │      (Cute doggy mascot)    │ │
 * │  │  - Description      │    │                             │ │
 * │  │  - CTA Buttons      │    │                             │ │
 * │  └─────────────────────┘    └─────────────────────────────┘ │
 * └──────────────────────────────────────────────────────────────┘
 * ```
 *
 * CTA BUTTONS:
 * - Primary: "Browse Signals" → /signals
 * - Secondary: "Become a Predictor" → /become-predictor (auth required)
 *
 * RESPONSIVE:
 * - Mobile: Stacked layout (text above, image below)
 * - Desktop: Side-by-side layout
 */

import { Link } from 'react-router-dom';
import { Button, Spinner } from '@/shared/components/ui';
import { usePublicStats } from '../api/stats';

/**
 * Formats a number as currency (e.g., 1234.56 → "$1,234")
 */
function formatCurrency(amount: number): string {
  return `$${Math.floor(amount).toLocaleString()}`;
}

export function HeroSection() {
  const { data: stats, isLoading } = usePublicStats();
  return (
    <section className="relative overflow-hidden py-16 md:py-24 lg:py-32">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-dark-800 via-dark-700 to-dark-800" />
      
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25px 25px, rgba(255,255,255,0.2) 2px, transparent 0)`,
          backgroundSize: '50px 50px',
        }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Text Content */}
          <div className="flex-1 text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-500/10 border border-brand-500/20 mb-6">
              <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
              <span className="text-sm font-medium text-brand-200">
                Web3 Prediction Signals Marketplace
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-fur-cream mb-6 leading-tight">
              Predict Smarter with{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-200 to-fur-light">
                Expert Signals
              </span>
            </h1>

            {/* Description */}
            <p className="text-lg md:text-xl text-gray-main mb-8 max-w-2xl mx-auto lg:mx-0">
              Get expert analysis for prediction market events. Purchase signals as NFTs 
              and access premium insights on crypto, finance, politics, sports, and more. 
              Secured by smart contracts on BNB Chain.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link to="/signals">
                <Button size="lg" className="w-full sm:w-auto px-8">
                  Browse Signals
                </Button>
              </Link>
              <Link to="/become-predictor">
                <Button variant="outline" size="lg" className="w-full sm:w-auto px-8">
                  Become a Predictor
                </Button>
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap items-center gap-6 mt-10 justify-center lg:justify-start">
              <div className="flex items-center gap-2 text-sm text-gray-main">
                <svg className="w-5 h-5 text-success-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>NFT Receipts</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-main">
                <svg className="w-5 h-5 text-success-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>USDT Payments</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-main">
                <svg className="w-5 h-5 text-success-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>BNB Chain Secured</span>
              </div>
            </div>

            {/* Platform Stats */}
            <div className="grid grid-cols-3 gap-4 md:gap-6 mt-10 pt-8 border-t border-dark-600/50">
              <div className="text-center lg:text-left">
                {isLoading ? (
                  <div className="flex justify-center lg:justify-start"><Spinner size="sm" /></div>
                ) : (
                  <div className="text-2xl md:text-3xl font-bold text-fur-cream">
                    {stats?.totalPurchases ?? 0}
                  </div>
                )}
                <div className="text-xs md:text-sm text-gray-main">Signals Purchased</div>
              </div>
              <div className="text-center lg:text-left">
                {isLoading ? (
                  <div className="flex justify-center lg:justify-start"><Spinner size="sm" /></div>
                ) : (
                  <div className="text-2xl md:text-3xl font-bold text-fur-cream">
                    {stats?.totalPredictors ?? 0}
                  </div>
                )}
                <div className="text-xs md:text-sm text-gray-main">Total Predictors</div>
              </div>
              <div className="text-center lg:text-left">
                {isLoading ? (
                  <div className="flex justify-center lg:justify-start"><Spinner size="sm" /></div>
                ) : (
                  <div className="text-2xl md:text-3xl font-bold text-fur-cream">
                    {formatCurrency(stats?.totalPredictorEarnings ?? 0)}
                  </div>
                )}
                <div className="text-xs md:text-sm text-gray-main">Predictor Earnings</div>
              </div>
            </div>
          </div>

          {/* Hero Image/Logo */}
          <div className="flex-1 flex justify-center lg:justify-end">
            <div className="relative">
              {/* Glow effect behind logo */}
              <div className="absolute inset-0 bg-brand-500/20 rounded-full blur-3xl scale-110" />
              
              {/* Logo */}
              <img
                src="/logo-bg-removed.png"
                alt="SignalFriend Mascot"
                className="relative w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 object-contain drop-shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
