/**
 * FeaturesSection Component
 *
 * Highlights the key features and benefits of SignalFriend.
 * Uses a card-based grid layout with icons.
 *
 * @module features/home/components/FeaturesSection
 *
 * FEATURES HIGHLIGHTED:
 * 1. Verified Predictors - KYC'd and staked predictors
 * 2. Smart Contract Refunds - Automatic refunds for missed predictions
 * 3. NFT Receipts - Proof of purchase as SignalKey NFTs
 * 4. Transparent Stats - On-chain performance tracking
 * 5. Multi-Category Signals - Crypto, stocks, forex, etc.
 * 6. Secure Payments - USDT payments on BNB Chain
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
    title: 'Verified Predictors',
    description: 'All predictors are verified and must stake tokens. Bad actors get slashed, good performers get rewarded.',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
    title: 'Automatic Refunds',
    description: 'If a signal misses its target, smart contracts automatically refund your purchase. No disputes needed.',
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
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: 'Transparent Stats',
    description: 'All predictor stats are on-chain and verifiable. Win rates, accuracy, and historical performance are public.',
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
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    title: 'Secure Payments',
    description: 'Pay with USDT on BNB Chain. Low fees, fast transactions, and your funds are held in audited smart contracts.',
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
