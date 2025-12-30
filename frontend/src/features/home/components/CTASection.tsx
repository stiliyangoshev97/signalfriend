/**
 * CTASection Component
 *
 * Final call-to-action section at the bottom of the landing page.
 * Encourages users to get started with a prominent CTA.
 * Displays real platform statistics fetched from the backend.
 *
 * @module features/home/components/CTASection
 *
 * DESIGN:
 * - Full-width gradient background
 * - Centered text with strong headline
 * - Prominent CTA button
 * - Real stats from API below
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

export function CTASection() {
  const { data: stats, isLoading } = usePublicStats();

  return (
    <section className="py-16 md:py-24 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-brand-600/20 via-dark-800 to-brand-600/20" />
      
      {/* Decorative elements */}
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          {/* Heading */}
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-fur-cream mb-6">
            Ready to Predict with{' '}
            <span className="text-brand-200">Confidence</span>?
          </h2>

          {/* Description */}
          <p className="text-lg md:text-xl text-gray-main mb-8">
            Join the marketplace where predictors build reputation through results, 
            and buyers get transparent access to expert prediction signals.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link to="/signals">
              <Button size="lg" className="w-full sm:w-auto px-10 py-4 text-lg">
                Start Exploring
              </Button>
            </Link>
            <Link to="/predictors">
              <Button variant="outline" size="lg" className="w-full sm:w-auto px-10 py-4 text-lg">
                View Predictors
              </Button>
            </Link>
          </div>

          {/* Stats/Trust indicators */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 pt-8 border-t border-dark-600">
            <div>
              {isLoading ? (
                <div className="flex justify-center"><Spinner size="sm" /></div>
              ) : (
                <div className="text-2xl md:text-3xl font-bold text-fur-cream">
                  {stats?.totalPurchases ?? 0}
                </div>
              )}
              <div className="text-sm text-gray-main">Signals Purchased</div>
            </div>
            <div>
              {isLoading ? (
                <div className="flex justify-center"><Spinner size="sm" /></div>
              ) : (
                <div className="text-2xl md:text-3xl font-bold text-fur-cream">
                  {stats?.totalPredictors ?? 0}
                </div>
              )}
              <div className="text-sm text-gray-main">Total Predictors</div>
            </div>
            <div>
              {isLoading ? (
                <div className="flex justify-center"><Spinner size="sm" /></div>
              ) : (
                <div className="text-2xl md:text-3xl font-bold text-fur-cream">
                  {formatCurrency(stats?.totalPredictorEarnings ?? 0)}
                </div>
              )}
              <div className="text-sm text-gray-main">Predictor Earnings</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-bold text-fur-cream">BNB</div>
              <div className="text-sm text-gray-main">Chain Secured</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CTASection;
