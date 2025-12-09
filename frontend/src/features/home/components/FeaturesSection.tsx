/**
 * FeaturesSection Component
 *
 * Highlights the key features and benefits of SignalFriend.
 * Uses a card-based grid layout with icons.
 *
 * @module features/home/components/FeaturesSection
 *
 * FEATURES HIGHLIGHTED:
 * 1. Predictor Pass NFT - One-time registration for sellers
 * 2. NFT Receipts - Proof of purchase as SignalKey NFTs
 * 3. On-Chain Payments - USDT payments on BNB Chain
 * 4. Transparent Stats - Performance tracking via ratings
 * 5. Multi-Category Signals - Crypto, stocks, forex, etc.
 * 6. Rating System - Rate signals after purchase
 */

import { Card, CardContent } from '@/shared/components/ui';

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: 'Predictor Pass NFT',
    description: 'Predictors register with a one-time fee and receive a soulbound NFT. Top performers can earn verified status.',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
      </svg>
    ),
    title: 'NFT Receipts',
    description: 'Every purchase mints a SignalKey NFT as proof. Access your signals anytime, trade receipts on secondary markets.',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'On-Chain Payments',
    description: 'Pay with USDT on BNB Chain. Payments go directly to predictors with low fees and fast transactions.',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: 'Transparent Stats',
    description: 'Predictor performance is tracked via ratings and sales. See who delivers results before you buy.',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
      </svg>
    ),
    title: 'Multi-Category',
    description: 'Find signals for crypto, forex, stocks, commodities, and more. Filter by risk level, timeframe, and price.',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
    title: 'Rating System',
    description: 'Rate signals after purchase to help the community. Predictors build reputation through honest feedback.',
  },
];

export function FeaturesSection() {
  return (
    <section className="py-16 md:py-24 bg-dark-800">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-fur-cream mb-4">
            Why Choose SignalFriend?
          </h2>
          <p className="text-lg text-gray-main max-w-2xl mx-auto">
            A trustless marketplace where predictors are accountable and buyers are protected.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="bg-dark-700 border-dark-600 hover:border-brand-500/50 transition-colors">
              <CardContent className="p-6">
                {/* Icon */}
                <div className="w-14 h-14 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-200 mb-4">
                  {feature.icon}
                </div>
                
                {/* Title */}
                <h3 className="text-xl font-semibold text-fur-cream mb-2">
                  {feature.title}
                </h3>
                
                {/* Description */}
                <p className="text-gray-main leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeaturesSection;
