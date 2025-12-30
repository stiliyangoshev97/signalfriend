/**
 * HowItWorksSection Component
 *
 * Step-by-step guide showing how SignalFriend works for buyers and predictors.
 * Uses a timeline/steps layout with numbered items.
 *
 * @module features/home/components/HowItWorksSection
 *
 * STEPS (For Buyers):
 * 1. Connect Wallet - Connect via MetaMask/WalletConnect
 * 2. Browse Signals - Find prediction signals that interest you
 * 3. Purchase Signal - Pay with USDT, receive SignalKey NFT
 * 4. View Content - Access the full analysis and recommendation
 * 5. Rate Signal - Help the community with feedback
 */

interface Step {
  number: number;
  title: string;
  description: string;
}

const buyerSteps: Step[] = [
  {
    number: 1,
    title: 'Connect Wallet',
    description: 'Connect your MetaMask, Trust Wallet, or any WalletConnect-compatible wallet to get started.',
  },
  {
    number: 2,
    title: 'Browse Signals',
    description: 'Explore prediction signals from predictors. Filter by category, confidence level, price, and ratings.',
  },
  {
    number: 3,
    title: 'Purchase Signal',
    description: 'Pay with USDT on BNB Chain. A SignalKey NFT is minted as your receipt and access pass.',
  },
  {
    number: 4,
    title: 'Access Content',
    description: 'View the full signal details including premium analysis and recommended decision.',
  },
  {
    number: 5,
    title: 'Rate Signal',
    description: 'After reviewing the signal, rate it to help others and build predictor reputation.',
  },
];

const predictorSteps: Step[] = [
  {
    number: 1,
    title: 'Register',
    description: 'Pay a one-time registration fee and receive your PredictorAccessPass NFT to start publishing.',
  },
  {
    number: 2,
    title: 'Create Signals',
    description: 'Publish your prediction analysis with insights, reasoning, and recommended decisions.',
  },
  {
    number: 3,
    title: 'Earn Revenue',
    description: 'Receive USDT directly to your wallet for every signal purchase. 95% goes to you.',
  },
  {
    number: 4,
    title: 'Build Reputation',
    description: 'Earn ratings from buyers. High performers can achieve verified status.',
  },
  {
    number: 5,
    title: 'Refer & Earn',
    description: 'Invite friends to become predictors. Earn 5 USDT for each new predictor who registers with your wallet address.',
  },
];

function StepCard({ step, isLast }: { step: Step; isLast: boolean }) {
  return (
    <div className="flex gap-4">
      {/* Number and Line */}
      <div className="flex flex-col items-center">
        <div className="w-10 h-10 rounded-full bg-brand-500 flex items-center justify-center text-dark-900 font-bold text-lg shrink-0">
          {step.number}
        </div>
        {!isLast && (
          <div className="w-0.5 h-full bg-gradient-to-b from-brand-500 to-dark-600 mt-2" />
        )}
      </div>

      {/* Content */}
      <div className="pb-8">
        <h4 className="text-lg font-semibold text-fur-cream mb-1">
          {step.title}
        </h4>
        <p className="text-gray-main">
          {step.description}
        </p>
      </div>
    </div>
  );
}

export function HowItWorksSection() {
  return (
    <section className="py-16 md:py-24 bg-dark-700">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-fur-cream mb-4">
            How It Works
          </h2>
          <p className="text-lg text-gray-main max-w-2xl mx-auto">
            Simple steps to start accessing prediction signals or earning as a predictor.
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* For Buyers */}
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-success-500/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-success-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-fur-cream">For Signal Buyers</h3>
            </div>
            
            <div className="space-y-0">
              {buyerSteps.map((step, index) => (
                <StepCard 
                  key={step.number} 
                  step={step} 
                  isLast={index === buyerSteps.length - 1}
                />
              ))}
            </div>
          </div>

          {/* For Predictors */}
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-brand-500/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-brand-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-fur-cream">For Predictors</h3>
            </div>
            
            <div className="space-y-0">
              {predictorSteps.map((step, index) => (
                <StepCard 
                  key={step.number} 
                  step={step} 
                  isLast={index === predictorSteps.length - 1}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HowItWorksSection;
