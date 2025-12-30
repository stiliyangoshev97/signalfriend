/**
 * FAQ Page
 *
 * Displays frequently asked questions with expandable accordion sections.
 * Includes questions about NFTs, wallet setup, platform features, and more.
 *
 * @module features/faq/pages/FaqPage
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
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
  category: 'wallet' | 'predictor' | 'trading' | 'fees' | 'security' | 'general';
}

// =============================================================================
// FAQ Data
// =============================================================================

const CONTRACT_ADDRESSES = {
  predictorAccessPass: '0x198Cd0549A0Dba09Aa3aB88e0B51CEb8dd335d07',
  signalKeyNFT: '0x2A5F920133e584773Ef4Ac16260c2F954824491f',
};

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
    id: 'signal-categories',
    category: 'predictor',
    question: 'What categories can I post signals in?',
    answer: (
      <div className="space-y-4">
        <p>
          SignalFriend supports a wide range of signal categories across <strong className="text-fur-cream">three main groups</strong>:
        </p>
        
        {/* Crypto */}
        <div className="bg-dark-800/50 rounded-lg p-4">
          <h4 className="font-semibold text-fur-cream mb-3 flex items-center gap-2">
            <span className="text-lg">🪙</span> Crypto
          </h4>
          <div className="flex flex-wrap gap-2">
            {['Bitcoin', 'Ethereum', 'Altcoins', 'DeFi', 'NFTs', 'Layer 1/2', 'Meme Coins', 'Futures/Perpetuals', 'Others'].map((cat) => (
              <span key={cat} className="px-3 py-1 bg-dark-700 text-gray-main text-sm rounded-full border border-dark-600">
                {cat}
              </span>
            ))}
          </div>
        </div>
        
        {/* Traditional Finance */}
        <div className="bg-dark-800/50 rounded-lg p-4">
          <h4 className="font-semibold text-fur-cream mb-3 flex items-center gap-2">
            <span className="text-lg">📈</span> Traditional Finance
          </h4>
          <div className="flex flex-wrap gap-2">
            {['US Stock - Tech', 'US Stock - General', 'Forex - Majors', 'Commodities - Metals', 'Commodities - Energy', 'Others'].map((cat) => (
              <span key={cat} className="px-3 py-1 bg-dark-700 text-gray-main text-sm rounded-full border border-dark-600">
                {cat}
              </span>
            ))}
          </div>
        </div>
        
        {/* Macro / Other */}
        <div className="bg-dark-800/50 rounded-lg p-4">
          <h4 className="font-semibold text-fur-cream mb-3 flex items-center gap-2">
            <span className="text-lg">🌍</span> Macro / Other
          </h4>
          <div className="flex flex-wrap gap-2">
            {['Economic Data', 'Geopolitical Events', 'Sports', 'Others'].map((cat) => (
              <span key={cat} className="px-3 py-1 bg-dark-700 text-gray-main text-sm rounded-full border border-dark-600">
                {cat}
              </span>
            ))}
          </div>
        </div>
        
        <p className="text-sm text-gray-main">
          When creating a signal, you'll select a main category and subcategory. Buyers can filter 
          signals by category to find exactly what they're looking for.
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
          Predictors set an expiration date (1-2 days) when creating signals. When a signal expires:
        </p>
        <ul className="list-disc list-inside space-y-2 ml-2">
          <li>It is automatically <strong>hidden from the marketplace</strong></li>
          <li>It <strong>cannot be purchased</strong> by new buyers</li>
          <li>Existing buyers <strong>retain permanent access</strong> to the analysis</li>
          <li>The signal can still be viewed via direct URL (shows an "Expired" badge)</li>
        </ul>
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
  general: { label: 'General', icon: '❓' },
};

// =============================================================================
// Components
// =============================================================================

function FaqAccordion({ item, isOpen, onToggle }: { item: FaqItem; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="border border-dark-600 rounded-lg overflow-hidden">
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

  // SEO for FAQ page
  useSEO({
    title: 'Frequently Asked Questions',
    description: 'Find answers to common questions about SignalFriend - NFT visibility, becoming a predictor, fees, security, and more.',
    url: getSEOUrl('/faq'),
  });

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
