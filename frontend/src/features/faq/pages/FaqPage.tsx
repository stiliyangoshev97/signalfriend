/**
 * FAQ Page
 *
 * Displays frequently asked questions with expandable accordion sections.
 * Includes questions about NFTs, wallet setup, platform features, and more.
 *
 * @module features/faq/pages/FaqPage
 */

import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSEO, getSEOUrl } from '@/shared/hooks';
import { getExplorerAddressUrl } from '@/shared/utils/explorer';
import { socialLinks } from '@/shared/config/social';

// =============================================================================
// Types
// =============================================================================

interface FaqItem {
  id: string;
  question: string;
  answer: React.ReactNode;
  category: 'wallet' | 'predictor' | 'trading' | 'fees' | 'security' | 'templates' | 'general';
}

// =============================================================================
// FAQ Data
// =============================================================================

const CONTRACT_ADDRESSES = {
  predictorAccessPass: '0x198Cd0549A0Dba09Aa3aB88e0B51CEb8dd335d07',
  signalKeyNFT: '0x2A5F920133e584773Ef4Ac16260c2F954824491f',
};

// Signal content template for predictors
export const SIGNAL_CONTENT_TEMPLATE = `📊 The Verdict: [BUY YES/NO] "[TARGET DATE]"

📈 True Probability: [X]% (Market is [Y]%)

🔍 The Analysis ([N] Alpha Triggers):

🎯 [Trigger 1 Name] [Data Source]:
[Explain the insight - what data did you find and why does it matter?]

🎯 [Trigger 2 Name] [Data Source]:
[Explain the insight - what pattern or information supports your thesis?]

🎯 [Trigger 3 Name] [Data Source]:
[Explain the insight - what's the catalyst or timing factor?]

⚡ Execution:
• Action: [Buy Yes/No] on [Date/Event]
• Max Price: [Price limit] ([Reasoning for the price target])`;

// Filled template example for predictors
export const SIGNAL_TEMPLATE_EXAMPLE = `📊 The Verdict: BUY YES "March 15, 2026"

📈 True Probability: 65% (Market is 38%)

🔍 The Analysis (3 Alpha Triggers):

🎯 Earnings Momentum [SEC Filings]:
NVIDIA's Q4 data center revenue grew 42% QoQ per their 8-K filing. The market is pricing in a slowdown that isn't materializing. Their backlog visibility extends through Q2 2026, suggesting sustained demand that analysts are underweighting.

🎯 Supply Chain Signal [Industry Sources]:
TSMC's January capacity utilization report shows 98% allocation to AI accelerators. This contradicts the "demand cliff" narrative. When fab utilization stays above 95%, it historically precedes earnings beats by 15-20%.

🎯 Options Flow Anomaly [Unusual Whales]:
Institutional call buying at the $150 strike (March expiry) spiked 340% last week. Smart money is positioning for upside before the March 12 earnings call. The put/call ratio dropped to 0.4—lowest in 8 months.

⚡ Execution:
• Action: Buy Yes on March 15, 2026
• Max Price: 45¢ (Targeting convergence with our 65% fair value. At 38¢, we have 70% upside to fair value)`;

/**
 * Signal Template Answer Component
 * Contains the template display and copy functionality
 */
function SignalTemplateAnswer() {
  const [copiedTemplate, setCopiedTemplate] = useState(false);
  const [copiedExample, setCopiedExample] = useState(false);
  const [showExample, setShowExample] = useState(false);

  const handleCopyTemplate = async () => {
    try {
      await navigator.clipboard.writeText(SIGNAL_CONTENT_TEMPLATE);
      setCopiedTemplate(true);
      setTimeout(() => setCopiedTemplate(false), 2000);
    } catch (err) {
      console.error('Failed to copy template:', err);
    }
  };

  const handleCopyExample = async () => {
    try {
      await navigator.clipboard.writeText(SIGNAL_TEMPLATE_EXAMPLE);
      setCopiedExample(true);
      setTimeout(() => setCopiedExample(false), 2000);
    } catch (err) {
      console.error('Failed to copy example:', err);
    }
  };

  return (
    <div className="space-y-4">
      <p>
        Yes! Use this <strong className="text-fur-cream">professional signal template</strong> to structure 
        your hidden content. Well-structured signals build trust and sell better.
      </p>
      
      {/* Template Preview */}
      <div className="bg-dark-900 rounded-lg border border-dark-600 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 bg-dark-800 border-b border-dark-600">
          <span className="text-sm font-medium text-fur-cream flex items-center gap-2">
            <span>📝</span> Signal Content Template
          </span>
          <button
            onClick={handleCopyTemplate}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              copiedTemplate 
                ? 'bg-success-500/20 text-success-400' 
                : 'bg-dark-700 text-fur-cream hover:bg-dark-600'
            }`}
          >
            {copiedTemplate ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy Template
              </>
            )}
          </button>
        </div>
        <pre className="p-4 text-sm text-fur-cream/90 whitespace-pre-wrap font-mono overflow-x-auto">
          {SIGNAL_CONTENT_TEMPLATE}
        </pre>
      </div>

      {/* Toggle Example Button */}
      <button
        onClick={() => setShowExample(!showExample)}
        className="flex items-center gap-2 text-accent-gold hover:text-accent-gold/80 transition-colors text-sm font-medium"
      >
        <svg 
          className={`w-4 h-4 transition-transform ${showExample ? 'rotate-90' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        {showExample ? 'Hide' : 'Show'} Filled Example
      </button>

      {/* Filled Example */}
      {showExample && (
        <div className="bg-dark-900 rounded-lg border border-accent-gold/30 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 bg-accent-gold/10 border-b border-accent-gold/30">
            <span className="text-sm font-medium text-accent-gold flex items-center gap-2">
              <span>✨</span> Example: Filled Template
            </span>
            <button
              onClick={handleCopyExample}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                copiedExample 
                  ? 'bg-success-500/20 text-success-400' 
                  : 'bg-dark-700 text-fur-cream hover:bg-dark-600'
              }`}
            >
              {copiedExample ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy Example
                </>
              )}
            </button>
          </div>
          <pre className="p-4 text-sm text-fur-cream/90 whitespace-pre-wrap font-mono overflow-x-auto">
            {SIGNAL_TEMPLATE_EXAMPLE}
          </pre>
          <div className="px-4 py-3 bg-dark-800/50 border-t border-dark-600">
            <p className="text-xs text-gray-main">
              <strong className="text-fur-cream">Note:</strong> This is a fictional example for demonstration purposes only. 
              Always do your own research before making any investment decisions.
            </p>
          </div>
        </div>
      )}

      {/* Section Explanations */}
      <div className="space-y-3 mt-4">
        <h4 className="font-semibold text-fur-cream">Template Sections Explained:</h4>
        
        <div className="bg-dark-800/50 rounded-lg p-4 space-y-3">
          <div>
            <p className="font-medium text-fur-cream">📊 The Verdict</p>
            <p className="text-sm text-gray-main">Your clear recommendation (Buy Yes/No) and the target date for the prediction.</p>
          </div>
          <div>
            <p className="font-medium text-fur-cream">📈 True Probability</p>
            <p className="text-sm text-gray-main">Your calculated probability vs the market price. This shows your edge.</p>
          </div>
          <div>
            <p className="font-medium text-fur-cream">🔍 Alpha Triggers</p>
            <p className="text-sm text-gray-main">2-4 key insights with data sources. Each trigger should explain WHY you believe the market is mispriced.</p>
          </div>
          <div>
            <p className="font-medium text-fur-cream">⚡ Execution</p>
            <p className="text-sm text-gray-main">Clear action steps: what to buy, when, and at what price limit.</p>
          </div>
        </div>
      </div>

      <p className="text-sm text-gray-main">
        <strong>Pro Tip:</strong> Replace all [bracketed placeholders] with your actual analysis. 
        The more specific your data sources and reasoning, the more valuable your signal appears.
      </p>
    </div>
  );
}

const faqItems: FaqItem[] = [
  // ===== WALLET & NFT QUESTIONS =====
  {
    id: 'nft-mobile-wallet',
    category: 'wallet',
    question: "Why can't I see my NFT in my mobile wallet?",
    answer: (
      <div className="space-y-4">
        <p>
          While desktop wallets (like the Rabby or MetaMask browser extensions) usually detect NFTs 
          automatically, <strong>MetaMask Mobile often requires a manual "Import"</strong> for assets 
          on the BNB Chain.
        </p>
        <p className="font-medium text-fur-cream">To view your assets on mobile:</p>
        <ol className="list-decimal list-inside space-y-2 ml-2">
          <li>Open MetaMask Mobile and select the <strong>NFTs</strong> tab.</li>
          <li>Tap <strong>"Import NFT"</strong> at the bottom.</li>
          <li>Use the following official contract addresses:</li>
        </ol>
        
        <div className="bg-dark-800/50 rounded-lg p-4 space-y-4 mt-4">
          <div>
            <p className="text-sm font-medium text-fur-cream mb-1">For Predictor Access Passes:</p>
            <p className="text-sm text-gray-main">Contract Address:</p>
            <code className="block text-xs bg-dark-900 px-2 py-1 rounded mt-1 text-accent-gold break-all">
              {CONTRACT_ADDRESSES.predictorAccessPass}
            </code>
            <p className="text-sm text-gray-main mt-2">Token ID: Your unique ID shown on your Predictor Dashboard.</p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-fur-cream mb-1">For Signal Key Receipts:</p>
            <p className="text-sm text-gray-main">Contract Address:</p>
            <code className="block text-xs bg-dark-900 px-2 py-1 rounded mt-1 text-accent-gold break-all">
              {CONTRACT_ADDRESSES.signalKeyNFT}
            </code>
            <p className="text-sm text-gray-main mt-2">Token ID: The unique purchase ID found in your transaction history.</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'nft-blank-image',
    category: 'wallet',
    question: 'I imported the NFT, but the image is blank. Is there an error?',
    answer: (
      <div className="space-y-4">
        <p>
          <strong className="text-fur-cream">No, your NFT is perfectly fine!</strong> This is a standard 
          indexing delay. Mobile apps use external servers to fetch high-resolution artwork from the blockchain.
        </p>
        <p className="font-medium text-fur-cream">The Fix:</p>
        <p>
          Simply pull down to refresh your NFT gallery. If it remains blank, wait 2–5 minutes and restart 
          your wallet app. The image will appear as soon as the wallet's server finishes processing the link.
        </p>
      </div>
    ),
  },
  {
    id: 'nft-difference',
    category: 'wallet',
    question: 'What is the difference between my two NFTs?',
    answer: (
      <div className="space-y-4">
        {/* NFT Images Side by Side */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <img 
              src="/nft-predictor-pass.jpg" 
              alt="Predictor Access Pass NFT" 
              className="w-full max-w-[180px] mx-auto rounded-lg border border-dark-600 shadow-lg"
            />
            <p className="text-xs text-gray-main mt-2">Predictor Pass</p>
          </div>
          <div className="text-center">
            <img 
              src="/nft-signal-key.jpg" 
              alt="Signal Key NFT" 
              className="w-full max-w-[180px] mx-auto rounded-lg border border-dark-600 shadow-lg"
            />
            <p className="text-xs text-gray-main mt-2">Signal Key</p>
          </div>
        </div>

        <div className="bg-dark-800/50 rounded-lg p-4">
          <h4 className="font-semibold text-fur-cream mb-2">🎫 Predictor Pass (Professional License)</h4>
          <p>
            This is your <strong>Professional License</strong>. It is "Soulbound," meaning it is 
            permanently tied to your wallet and <strong>cannot be transferred or sold</strong>. 
            It verifies your status as a trusted signal provider on SignalFriend.
          </p>
        </div>
        
        <div className="bg-dark-800/50 rounded-lg p-4">
          <h4 className="font-semibold text-fur-cream mb-2">🔑 Signal Key (Receipt/Access Pass)</h4>
          <p>
            This is your <strong>Access Pass</strong>. It is minted automatically when you buy a signal. 
            These NFTs are <strong>transferable</strong>, meaning you can hold them to access content 
            or trade them on secondary markets like PancakeSwap or Element.
          </p>
        </div>
      </div>
    ),
  },

  // ===== PREDICTOR QUESTIONS =====
  {
    id: 'become-predictor',
    category: 'predictor',
    question: 'How do I become a Predictor?',
    answer: (
      <div className="space-y-4">
        <p>Becoming a predictor on SignalFriend is straightforward:</p>
        <ol className="list-decimal list-inside space-y-2 ml-2">
          <li>Connect your wallet to SignalFriend</li>
          <li>Navigate to the <Link to="/become-predictor" className="text-accent-gold hover:underline">"Become a Predictor"</Link> page</li>
          <li>Pay the one-time registration fee of <strong className="text-fur-cream">$20 USDT</strong></li>
          <li>Optionally, enter a referral address to support another predictor</li>
          <li>Confirm the transaction in your wallet</li>
        </ol>
        <p>
          Once completed, you'll receive a <strong>Predictor Access Pass NFT</strong> and can immediately 
          start creating and selling signals!
        </p>
      </div>
    ),
  },
  {
    id: 'create-signal',
    category: 'predictor',
    question: 'How do I create a prediction signal?',
    answer: (
      <div className="space-y-4">
        <p>Once you're a registered predictor, creating signals is easy:</p>
        <ol className="list-decimal list-inside space-y-2 ml-2">
          <li>Go to your <Link to="/dashboard" className="text-accent-gold hover:underline">Predictor Dashboard</Link></li>
          <li>Click the <strong className="text-fur-cream">"Create Signal"</strong> button</li>
          <li>Fill out the signal form:</li>
        </ol>
        
        <div className="bg-dark-800/50 rounded-lg p-4 space-y-3 mt-2">
          <div>
            <p className="font-medium text-fur-cream">📝 Title</p>
            <p className="text-sm text-gray-main">A clear, compelling headline (max 100 characters). Example: "Will BTC reach $100k by March 2025?"</p>
          </div>
          <div>
            <p className="font-medium text-fur-cream">📋 Description</p>
            <p className="text-sm text-gray-main">A teaser visible before purchase (max 1000 characters). Hook buyers without revealing your full analysis.</p>
          </div>
          <div>
            <p className="font-medium text-fur-cream">🔒 Full Content</p>
            <p className="text-sm text-gray-main">Your complete prediction and reasoning (max 3000 characters). This is only revealed after purchase.</p>
          </div>
          <div>
            <p className="font-medium text-fur-cream">📁 Category</p>
            <p className="text-sm text-gray-main">Select a main category (Crypto, Finance, Politics, Sports, World, Culture) and subcategory.</p>
          </div>
          <div>
            <p className="font-medium text-fur-cream">💰 Price</p>
            <p className="text-sm text-gray-main">Set your price in USDT (minimum $1). Consider your track record when pricing.</p>
          </div>
          <div>
            <p className="font-medium text-fur-cream">📊 Confidence Level</p>
            <p className="text-sm text-gray-main">How confident are you? (1-100%). Be honest — your reputation depends on accuracy!</p>
          </div>
          <div>
            <p className="font-medium text-fur-cream">🔗 Event URL (Optional)</p>
            <p className="text-sm text-gray-main">Link to the prediction market event (Polymarket, Predict.fun, etc.) if applicable.</p>
          </div>
          <div>
            <p className="font-medium text-fur-cream">⏰ Expiration</p>
            <p className="text-sm text-gray-main">When does your signal expire? (1-90 days). Expired signals can't be purchased but remain viewable.</p>
          </div>
        </div>
        
        <p className="text-sm text-gray-main">
          <strong>Tip:</strong> Quality signals with clear reasoning sell better. Build your reputation 
          by providing valuable insights, and buyers will return for more!
        </p>
      </div>
    ),
  },
  {
    id: 'signal-categories',
    category: 'predictor',
    question: 'What categories can I post signals in?',
    answer: (
      <div className="space-y-4">
        <p>
          SignalFriend supports a wide range of prediction categories across <strong className="text-fur-cream">six main groups</strong>:
        </p>
        
        {/* Crypto */}
        <div className="bg-dark-800/50 rounded-lg p-4">
          <h4 className="font-semibold text-fur-cream mb-3 flex items-center gap-2">
            <span className="text-lg">🪙</span> Crypto
          </h4>
          <div className="flex flex-wrap gap-2">
            {['Bitcoin', 'Ethereum', 'Altcoins', 'DeFi', 'NFTs/Gaming', 'Meme Coins'].map((cat) => (
              <span key={cat} className="px-3 py-1 bg-dark-700 text-gray-main text-sm rounded-full border border-dark-600">
                {cat}
              </span>
            ))}
          </div>
        </div>
        
        {/* Finance */}
        <div className="bg-dark-800/50 rounded-lg p-4">
          <h4 className="font-semibold text-fur-cream mb-3 flex items-center gap-2">
            <span className="text-lg">📈</span> Finance
          </h4>
          <div className="flex flex-wrap gap-2">
            {['Stocks', 'Forex', 'Commodities', 'Earnings'].map((cat) => (
              <span key={cat} className="px-3 py-1 bg-dark-700 text-gray-main text-sm rounded-full border border-dark-600">
                {cat}
              </span>
            ))}
          </div>
        </div>
        
        {/* Politics */}
        <div className="bg-dark-800/50 rounded-lg p-4">
          <h4 className="font-semibold text-fur-cream mb-3 flex items-center gap-2">
            <span className="text-lg">🏛️</span> Politics
          </h4>
          <div className="flex flex-wrap gap-2">
            {['US Elections', 'World Politics', 'Policy', 'Legal'].map((cat) => (
              <span key={cat} className="px-3 py-1 bg-dark-700 text-gray-main text-sm rounded-full border border-dark-600">
                {cat}
              </span>
            ))}
          </div>
        </div>
        
        {/* Sports */}
        <div className="bg-dark-800/50 rounded-lg p-4">
          <h4 className="font-semibold text-fur-cream mb-3 flex items-center gap-2">
            <span className="text-lg">⚽</span> Sports
          </h4>
          <div className="flex flex-wrap gap-2">
            {['Football/Soccer', 'American Football', 'Basketball', 'Combat Sports', 'Esports', 'Other Sports'].map((cat) => (
              <span key={cat} className="px-3 py-1 bg-dark-700 text-gray-main text-sm rounded-full border border-dark-600">
                {cat}
              </span>
            ))}
          </div>
        </div>
        
        {/* World */}
        <div className="bg-dark-800/50 rounded-lg p-4">
          <h4 className="font-semibold text-fur-cream mb-3 flex items-center gap-2">
            <span className="text-lg">🌍</span> World
          </h4>
          <div className="flex flex-wrap gap-2">
            {['Geopolitics', 'Economy', 'Climate/Weather', 'Science'].map((cat) => (
              <span key={cat} className="px-3 py-1 bg-dark-700 text-gray-main text-sm rounded-full border border-dark-600">
                {cat}
              </span>
            ))}
          </div>
        </div>
        
        {/* Culture */}
        <div className="bg-dark-800/50 rounded-lg p-4">
          <h4 className="font-semibold text-fur-cream mb-3 flex items-center gap-2">
            <span className="text-lg">🎭</span> Culture
          </h4>
          <div className="flex flex-wrap gap-2">
            {['Entertainment', 'Awards', 'Tech/AI', 'Social Media'].map((cat) => (
              <span key={cat} className="px-3 py-1 bg-dark-700 text-gray-main text-sm rounded-full border border-dark-600">
                {cat}
              </span>
            ))}
          </div>
        </div>
        
        <p className="text-sm text-gray-main">
          When creating a prediction signal, you'll select a main category and subcategory. Buyers can filter 
          signals by category to find predictions on topics they're interested in.
        </p>
      </div>
    ),
  },
  {
    id: 'get-verified',
    category: 'predictor',
    question: 'How do I get verified as a Predictor?',
    answer: (
      <div className="space-y-4">
        <p>
          Verification is a badge of trust on SignalFriend. To become verified, you must meet 
          <strong className="text-fur-cream"> both</strong> of these requirements:
        </p>
        <ul className="list-disc list-inside space-y-2 ml-2">
          <li><strong>100+ signal sales</strong> – Build your track record</li>
          <li><strong>$1,000+ USDT total earnings</strong> – Prove consistent performance</li>
        </ul>
        <p>
          Once you meet these thresholds, a "Get Verified" button will appear on your dashboard. 
          After applying, our admin team will review your account. If approved, you'll receive 
          a verification badge visible on your profile and in search results.
        </p>
        <p className="text-sm text-gray-main">
          Note: If your application is rejected, you can reapply after gaining an additional 
          100 sales and $1,000 USDT in earnings since your last application.
        </p>
      </div>
    ),
  },
  {
    id: 'blacklist',
    category: 'predictor',
    question: 'What happens if a Predictor is blacklisted?',
    answer: (
      <div className="space-y-4">
        <p>
          If a predictor is blacklisted (due to scam reports, false signals, or rule violations), 
          the following occurs:
        </p>
        <ul className="list-disc list-inside space-y-2 ml-2">
          <li>Their signals are <strong>hidden from the marketplace</strong></li>
          <li>They <strong>cannot create new signals</strong></li>
          <li>They <strong>cannot earn referral bonuses</strong></li>
          <li>A warning banner appears on their profile</li>
        </ul>
        <p>
          Blacklisted predictors can submit a <strong>dispute</strong> through their dashboard 
          to appeal the decision. If the dispute is resolved in their favor, they will be 
          unblacklisted and can resume normal operations.
        </p>
        <p className="text-sm text-gray-main">
          Note: Buyers who purchased signals before blacklisting retain permanent access to that content.
        </p>
      </div>
    ),
  },

  // ===== TEMPLATES =====
  {
    id: 'signal-template',
    category: 'templates',
    question: 'Is there a template for writing signal content?',
    answer: (
      <SignalTemplateAnswer />
    ),
  },

  // ===== SIGNAL QUESTIONS =====
  {
    id: 'purchase-signal',
    category: 'trading',
    question: 'How do I purchase a signal?',
    answer: (
      <div className="space-y-4">
        <ol className="list-decimal list-inside space-y-2 ml-2">
          <li>Browse signals on the <Link to="/signals" className="text-accent-gold hover:underline">Signals</Link> page</li>
          <li>Click on a signal to view details</li>
          <li>Click the <strong>"Purchase Signal"</strong> button</li>
          <li>If this is your first purchase, approve USDT spending for the market contract</li>
          <li>Confirm the purchase transaction</li>
          <li>Once confirmed, you'll receive a <strong>SignalKey NFT</strong> and can view the full signal analysis!</li>
        </ol>
      </div>
    ),
  },
  {
    id: 'rate-signal',
    category: 'trading',
    question: 'How does the rating system work?',
    answer: (
      <div className="space-y-4">
        <p>After purchasing a signal, you can rate it from 1 to 5 stars. Key points:</p>
        <ul className="list-disc list-inside space-y-2 ml-2">
          <li><strong>One rating per purchase</strong> – Each SignalKey NFT can only submit one rating</li>
          <li><strong>Permanent ratings</strong> – Once submitted, ratings cannot be changed</li>
          <li><strong>Transparent</strong> – Ratings contribute to the predictor's public average score</li>
        </ul>
        <p className="text-sm text-gray-main">
          The rating system enforces one-per-purchase to prevent manipulation while ensuring 
          only actual buyers can rate signals.
        </p>
      </div>
    ),
  },
  {
    id: 'signal-expiry',
    category: 'trading',
    question: 'What happens when a signal expires?',
    answer: (
      <div className="space-y-4">
        <p>
          Predictors set an expiration date when creating signals. Once that date passes, the signal expires:
        </p>
        <ul className="list-disc list-inside space-y-2 ml-2">
          <li>It moves from the <strong>Active</strong> tab to the <strong>Expired</strong> tab</li>
          <li>It <strong>cannot be purchased</strong> by new buyers</li>
          <li>Existing buyers <strong>retain permanent access</strong> to the analysis</li>
          <li>The signal can still be viewed via direct URL (shows an "Expired" badge)</li>
        </ul>
        
        <div className="bg-dark-800/50 rounded-lg p-4 mt-4">
          <h4 className="font-semibold text-fur-cream mb-2 flex items-center gap-2">
            <span>🔓</span> Expired Signal Content Becomes Public
          </h4>
          <p className="text-gray-main">
            For <strong className="text-fur-cream">transparency and trust</strong>, the full content of expired signals 
            is automatically made public. This allows anyone to:
          </p>
          <ul className="list-disc list-inside space-y-1 mt-2 text-gray-main">
            <li>Verify the predictor's track record and accuracy</li>
            <li>Review historical predictions to evaluate quality</li>
            <li>Make informed decisions about future purchases</li>
          </ul>
          <p className="text-sm text-gray-main mt-3">
            This transparency feature ensures predictors are accountable for their signals and helps 
            buyers identify consistently accurate analysts.
          </p>
        </div>
        
        <p className="text-sm text-gray-main">
          <strong>Note:</strong> Only naturally expired signals become public. Manually deactivated 
          signals (by the predictor) remain protected.
        </p>
      </div>
    ),
  },

  // ===== FEE QUESTIONS =====
  {
    id: 'fees-structure',
    category: 'fees',
    question: 'What fees are involved?',
    answer: (
      <div className="space-y-4">
        <div className="bg-dark-800/50 rounded-lg p-4 space-y-3">
          <div className="flex justify-between items-center border-b border-dark-600 pb-2">
            <span>Predictor Registration</span>
            <span className="font-semibold text-fur-cream">$20 USDT (one-time)</span>
          </div>
          <div className="flex justify-between items-center border-b border-dark-600 pb-2">
            <span>Signal Purchase Access Fee</span>
            <span className="font-semibold text-fur-cream">$0.50 USDT (per purchase)</span>
          </div>
          <div className="flex justify-between items-center border-b border-dark-600 pb-2">
            <span>Platform Commission</span>
            <span className="font-semibold text-fur-cream">5% of signal price</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Predictor Earnings</span>
            <span className="font-semibold text-logo-green">95% of signal price</span>
          </div>
        </div>
        <p className="text-sm text-gray-main">
          Example: For a $10 signal purchase, you pay $10.50 total ($10 + $0.50 access fee). 
          The predictor receives $9.50 (95%), and the platform receives $1 (5% + $0.50 fee).
        </p>
      </div>
    ),
  },
  {
    id: 'referral-program',
    category: 'fees',
    question: 'How do referrals work?',
    answer: (
      <div className="space-y-4">
        <p>
          SignalFriend has a built-in referral program for predictors:
        </p>
        <ul className="list-disc list-inside space-y-2 ml-2">
          <li>Share your wallet address as a referral code</li>
          <li>When someone joins as a predictor using your address, they pay $20 USDT</li>
          <li>You instantly receive <strong className="text-accent-gold">$5 USDT</strong> (25% of the join fee)</li>
          <li>The remaining $15 USDT goes to the platform treasury</li>
        </ul>
        <p className="text-sm text-gray-main">
          Referral bonuses are paid automatically on-chain. You can track your referral earnings 
          in your predictor dashboard.
        </p>
        <p className="text-sm text-gray-main">
          Note: You must be a registered predictor to earn referral rewards, and blacklisted 
          predictors cannot earn referral bonuses.
        </p>
      </div>
    ),
  },

  // ===== SECURITY QUESTIONS =====
  {
    id: 'payment-security',
    category: 'security',
    question: 'Is my payment secure?',
    answer: (
      <div className="space-y-4">
        <p>
          Yes! All payments on SignalFriend happen <strong>directly on the BNB Chain blockchain</strong>:
        </p>
        <ul className="list-disc list-inside space-y-2 ml-2">
          <li><strong>Smart contract powered</strong> – No middleman, funds go directly to predictors</li>
          <li><strong>Transparent</strong> – Every transaction is verifiable on BscScan</li>
          <li><strong>No custody</strong> – We never hold your funds; they flow through smart contracts</li>
          <li><strong>Audited contracts</strong> – Our contracts are reviewed and Blockaid-verified</li>
        </ul>
        <p>
          Always verify you're interacting with our <Link to="/about" className="text-accent-gold hover:underline">official contract addresses</Link>.
        </p>
      </div>
    ),
  },
  {
    id: 'contract-verification',
    category: 'security',
    question: 'How do I verify I\'m using official SignalFriend contracts?',
    answer: (
      <div className="space-y-4">
        <p>
          Before approving any transaction, always verify the contract address matches our official addresses:
        </p>
        <div className="bg-dark-800/50 rounded-lg p-4 space-y-3 text-sm">
          <div>
            <span className="text-gray-main">SignalFriend Market:</span>
            <a 
              href={getExplorerAddressUrl('0xAebec2Cd5c2dB4c0875de215515B3060a7a652FB')}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-accent-gold hover:underline break-all"
            >
              0xAebec2Cd5c2dB4c0875de215515B3060a7a652FB
            </a>
          </div>
          <div>
            <span className="text-gray-main">Predictor Access Pass:</span>
            <a 
              href={getExplorerAddressUrl('0x198Cd0549A0Dba09Aa3aB88e0B51CEb8dd335d07')}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-accent-gold hover:underline break-all"
            >
              0x198Cd0549A0Dba09Aa3aB88e0B51CEb8dd335d07
            </a>
          </div>
          <div>
            <span className="text-gray-main">Signal Key NFT:</span>
            <a 
              href={getExplorerAddressUrl('0x2A5F920133e584773Ef4Ac16260c2F954824491f')}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-accent-gold hover:underline break-all"
            >
              0x2A5F920133e584773Ef4Ac16260c2F954824491f
            </a>
          </div>
        </div>
        <p className="text-sm text-gray-main">
          View our <Link to="/about" className="text-accent-gold hover:underline">About page</Link> for 
          full details and BscScan links.
        </p>
      </div>
    ),
  },

  // ===== GENERAL QUESTIONS =====
  {
    id: 'minimum-signal-price',
    category: 'general',
    question: 'What is the minimum signal price?',
    answer: (
      <p>
        The minimum signal price is <strong className="text-fur-cream">$1 USDT</strong>. Predictors 
        can set any price at or above this minimum. Remember, buyers also pay a $0.50 access fee 
        on top of the signal price.
      </p>
    ),
  },
  {
    id: 'supported-wallet',
    category: 'general',
    question: 'What wallets are supported?',
    answer: (
      <div className="space-y-4">
        <p>
          SignalFriend uses <strong className="text-fur-cream">RainbowKit</strong>, which supports 
          <strong className="text-fur-cream"> 100+ wallets</strong> compatible with WalletConnect and BNB Chain. 
          Popular options include:
        </p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>MetaMask (Desktop & Mobile)</li>
          <li>Rabby Wallet</li>
          <li>Trust Wallet</li>
          <li>Bitget Wallet</li>
          <li>Coinbase Wallet</li>
          <li>OKX Wallet</li>
          <li>Rainbow Wallet</li>
          <li>And many more via WalletConnect</li>
        </ul>
        <p className="text-sm text-gray-main">
          If your wallet supports WalletConnect and BNB Chain, it should work with SignalFriend. 
          Make sure you're connected to BNB Chain (BSC Mainnet, Chain ID: 56) and have USDT for purchases.
        </p>
      </div>
    ),
  },
  {
    id: 'usdt-source',
    category: 'general',
    question: 'Where can I get USDT on BNB Chain?',
    answer: (
      <div className="space-y-4">
        <p>You can obtain USDT (BEP-20) on BNB Chain through:</p>
        <ul className="list-disc list-inside space-y-2 ml-2">
          <li><strong>Centralized Exchanges</strong> – Binance, Coinbase, Kraken, etc. (withdraw to BNB Chain)</li>
          <li><strong>DEX Swaps</strong> – PancakeSwap, 1inch (swap BNB or other tokens for USDT)</li>
          <li><strong>Cross-chain Bridges</strong> – Bridge USDT from Ethereum or other chains</li>
        </ul>
        <p className="text-sm text-gray-main">
          Make sure you're receiving USDT on BNB Chain (BEP-20), not Ethereum (ERC-20) or another network.
        </p>
      </div>
    ),
  },
];

// =============================================================================
// Category Labels
// =============================================================================

const categoryLabels: Record<FaqItem['category'], { label: string; icon: string }> = {
  wallet: { label: 'Wallet & NFTs', icon: '👛' },
  predictor: { label: 'Predictors', icon: '📊' },
  trading: { label: 'Signals & Purchases', icon: '📈' },
  fees: { label: 'Fees & Payments', icon: '💰' },
  security: { label: 'Security', icon: '🔒' },
  templates: { label: 'Templates', icon: '📝' },
  general: { label: 'General', icon: '❓' },
};

// =============================================================================
// Components
// =============================================================================

function FaqAccordion({ item, isOpen, onToggle }: { item: FaqItem; isOpen: boolean; onToggle: () => void }) {
  return (
    <div id={`faq-${item.id}`} className="border border-dark-600 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left bg-dark-800/50 hover:bg-dark-800/70 transition-colors"
        aria-expanded={isOpen}
      >
        <span className="font-medium text-fur-cream">{item.question}</span>
        <svg
          className={`w-5 h-5 text-gray-main shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isOpen && (
        <div className="px-5 py-4 bg-dark-900/30 text-gray-main leading-relaxed">
          {item.answer}
        </div>
      )}
    </div>
  );
}

// =============================================================================
// Main Component
// =============================================================================

export function FaqPage() {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());
  const [activeCategory, setActiveCategory] = useState<FaqItem['category'] | 'all'>('all');
  const location = useLocation();

  // SEO for FAQ page
  useSEO({
    title: 'Frequently Asked Questions',
    description: 'Find answers to common questions about SignalFriend - NFT visibility, becoming a predictor, fees, security, and more.',
    url: getSEOUrl('/faq'),
  });

  // Handle hash navigation (e.g., /faq#signal-template)
  useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (hash) {
      // Check if hash matches a FAQ item id
      const faqItem = faqItems.find(item => item.id === hash);
      if (faqItem) {
        // Open the item
        setOpenItems(new Set([hash]));
        // Set category filter to show the item (or 'all')
        setActiveCategory('all');
        // Scroll to the item after a short delay
        setTimeout(() => {
          const element = document.getElementById(`faq-${hash}`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
      }
    }
  }, [location.hash]);

  const toggleItem = (id: string) => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const filteredItems = activeCategory === 'all' 
    ? faqItems 
    : faqItems.filter((item) => item.category === activeCategory);

  // Group items by category for display
  const categories = Object.keys(categoryLabels) as FaqItem['category'][];

  return (
    <div className="min-h-screen bg-dark-950">
      {/* Page Header */}
      <header className="bg-gradient-to-b from-dark-800 to-dark-950 border-b border-dark-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-fur-cream mb-2">
            Frequently Asked Questions
          </h1>
          <p className="text-fur-cream/60">
            Find answers to common questions about SignalFriend
          </p>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Category Filter */}
        <div className="mb-8 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeCategory === 'all'
                ? 'bg-accent-gold text-dark-900'
                : 'bg-dark-800 text-fur-cream hover:bg-dark-700'
            }`}
          >
            All Questions
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeCategory === cat
                  ? 'bg-accent-gold text-dark-900'
                  : 'bg-dark-800 text-fur-cream hover:bg-dark-700'
              }`}
            >
              {categoryLabels[cat].icon} {categoryLabels[cat].label}
            </button>
          ))}
        </div>

        {/* FAQ Items */}
        <div className="space-y-3">
          {filteredItems.map((item) => (
            <FaqAccordion
              key={item.id}
              item={item}
              isOpen={openItems.has(item.id)}
              onToggle={() => toggleItem(item.id)}
            />
          ))}
        </div>

        {/* Still have questions? */}
        <div className="mt-12 bg-dark-800/50 rounded-xl border border-dark-600 p-6 text-center">
          <h2 className="text-xl font-bold text-fur-cream mb-2">
            Still have questions?
          </h2>
          <p className="text-gray-main mb-4">
            Can't find what you're looking for? Reach out to our community or support team.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href={socialLinks.discord}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#5865F2] hover:bg-[#4752C4] text-white rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
              Join Discord
            </a>
            <a
              href={socialLinks.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-dark-700 hover:bg-dark-600 text-fur-cream rounded-lg transition-colors border border-dark-600"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              Follow on X
            </a>
          </div>
        </div>

        {/* Back Link */}
        <div className="mt-8 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-accent-gold hover:text-accent-gold/80 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
        </div>
      </main>
    </div>
  );
}

export default FaqPage;
