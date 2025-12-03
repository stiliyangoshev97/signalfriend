/**
 * CTASection Component
 *
 * Final call-to-action section at the bottom of the landing page.
 * Encourages users to get started with a prominent CTA.
 *
 * @module features/home/components/CTASection
 *
 * DESIGN:
 * - Full-width gradient background
 * - Centered text with strong headline
 * - Prominent CTA button
 * - Trust badge/stats below
 */

import { Link } from 'react-router-dom';
import { Button } from '@/shared/components/ui';

export function CTASection() {
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
            Ready to Trade with{' '}
            <span className="text-brand-200">Confidence</span>?
          </h2>

          {/* Description */}
          <p className="text-lg md:text-xl text-gray-main mb-8">
            Join the marketplace where predictors put their money where their mouth is, 
            and buyers are protected by smart contracts.
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
              <div className="text-2xl md:text-3xl font-bold text-fur-cream">100+</div>
              <div className="text-sm text-gray-main">Active Signals</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-bold text-fur-cream">50+</div>
              <div className="text-sm text-gray-main">Verified Predictors</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-bold text-fur-cream">$10K+</div>
              <div className="text-sm text-gray-main">Refunds Processed</div>
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
