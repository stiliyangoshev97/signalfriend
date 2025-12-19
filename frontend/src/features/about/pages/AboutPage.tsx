/**
 * About Page
 *
 * Displays official SignalFriend information including:
 * - Official smart contract addresses (clickable to BscScan)
 * - Security verification status (Blockaid whitelisted)
 * - Platform overview
 *
 * @module features/about/pages/AboutPage
 */

import { Link } from 'react-router-dom';
import { useSEO, getSEOUrl } from '@/shared/hooks';
import { getExplorerAddressUrl } from '@/shared/utils/explorer';
import { CopyableAddress } from '@/shared/components/ui';

// =============================================================================
// Contract Addresses (BNB Chain Mainnet)
// =============================================================================

interface ContractInfo {
  name: string;
  address: `0x${string}`;
  description: string;
}

const OFFICIAL_CONTRACTS: ContractInfo[] = [
  {
    name: 'SignalFriend Market',
    address: '0xAebec2Cd5c2dB4c0875de215515B3060a7a652FB',
    description: 'Main marketplace contract - handles predictor registration, signal purchases, and fee distribution.',
  },
  {
    name: 'Predictor Access Pass',
    address: '0x198Cd0549A0Dba09Aa3aB88e0B51CEb8dd335d07',
    description: 'Soulbound NFT contract - your professional license as a verified predictor.',
  },
  {
    name: 'Signal Key NFT',
    address: '0x2A5F920133e584773Ef4Ac16260c2F954824491f',
    description: 'Transferable NFT receipt - proof of signal purchase and access key to content.',
  },
];

// =============================================================================
// Components
// =============================================================================

function ContractCard({ contract }: { contract: ContractInfo }) {
  const explorerUrl = getExplorerAddressUrl(contract.address);

  return (
    <div className="bg-dark-800/50 rounded-xl border border-dark-600 p-6 hover:border-accent-gold/30 transition-colors">
      <div className="flex items-start justify-between gap-4 mb-3">
        <h3 className="text-lg font-semibold text-fur-cream">{contract.name}</h3>
        <a
          href={explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 text-accent-gold hover:text-accent-gold/80 transition-colors"
          aria-label={`View ${contract.name} on BscScan`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
      
      <p className="text-sm text-gray-main mb-4">{contract.description}</p>
      
      <div className="flex items-center gap-2">
        <CopyableAddress address={contract.address} showFull className="text-sm" />
        <a
          href={explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-accent-gold hover:underline"
        >
          View on BscScan →
        </a>
      </div>
    </div>
  );
}

// =============================================================================
// Main Component
// =============================================================================

export function AboutPage() {
  // SEO for about page
  useSEO({
    title: 'About SignalFriend',
    description: 'Official SignalFriend smart contract addresses on BNB Chain. Verified by Blockaid. Always verify you are interacting with official addresses.',
    url: getSEOUrl('/about'),
  });

  return (
    <div className="min-h-screen bg-dark-950">
      {/* Page Header */}
      <header className="bg-gradient-to-b from-dark-800 to-dark-950 border-b border-dark-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-fur-cream mb-2">
            About SignalFriend
          </h1>
          <p className="text-fur-cream/60">
            Official information and verified smart contract addresses
          </p>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        
        {/* Security Badge Section */}
        <section className="bg-gradient-to-r from-logo-green/20 to-dark-800/50 rounded-xl border border-logo-green/30 p-6">
          <div className="flex items-start gap-4">
            <div className="shrink-0 w-12 h-12 bg-logo-green/20 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-logo-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-fur-cream mb-2">
                ✅ Security Verified by Blockaid
              </h2>
              <p className="text-gray-main leading-relaxed">
                All SignalFriend smart contracts and our domain (signalfriend.com) have been reviewed and 
                <strong className="text-fur-cream"> whitelisted by Blockaid</strong>, a leading Web3 security provider. 
                This means your wallet extensions (like MetaMask, Rabby, etc.) recognize our contracts as safe to interact with.
              </p>
            </div>
          </div>
        </section>

        {/* Official Contracts Section */}
        <section>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-fur-cream mb-2">
              Official Smart Contracts
            </h2>
            <p className="text-gray-main">
              SignalFriend operates on <strong className="text-fur-cream">BNB Chain (BSC Mainnet)</strong>. 
              Always verify you are interacting with these official contract addresses.
            </p>
          </div>

          <div className="grid gap-4">
            {OFFICIAL_CONTRACTS.map((contract) => (
              <ContractCard key={contract.address} contract={contract} />
            ))}
          </div>

          {/* Warning Notice */}
          <div className="mt-6 bg-error-500/10 border border-error-500/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-error-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="text-sm text-error-400 font-medium">Security Warning</p>
                <p className="text-sm text-gray-main mt-1">
                  Always verify contract addresses before approving transactions. Scammers may create fake 
                  contracts with similar names. If an address doesn't match the ones listed above, 
                  <strong className="text-fur-cream"> do not interact with it</strong>.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Platform Overview */}
        <section>
          <h2 className="text-2xl font-bold text-fur-cream mb-4">
            What is SignalFriend?
          </h2>
          <div className="prose prose-invert prose-fur max-w-none space-y-4">
            <p className="text-gray-main leading-relaxed">
              SignalFriend is a <strong className="text-fur-cream">Web3 transparent signal marketplace</strong> on 
              BNB Chain that connects verified prediction makers (Predictors) with traders through a transparent, 
              on-chain NFT mechanism.
            </p>
            <p className="text-gray-main leading-relaxed">
              When you purchase a signal, you receive a <strong className="text-fur-cream">SignalKey NFT</strong> — 
              a unique digital receipt that grants you access to the signal's content. This NFT is transferable, 
              meaning you can hold it for access or trade it on secondary markets.
            </p>
            <p className="text-gray-main leading-relaxed">
              Predictors hold a <strong className="text-fur-cream">Predictor Access Pass NFT</strong> — 
              a soulbound (non-transferable) license that verifies their status as a registered signal provider 
              on the platform.
            </p>
          </div>
        </section>

        {/* Key Features */}
        <section>
          <h2 className="text-2xl font-bold text-fur-cream mb-4">
            Key Features
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-dark-800/30 rounded-lg p-4 border border-dark-600">
              <h3 className="font-semibold text-fur-cream mb-2">🔒 Transparent & On-Chain</h3>
              <p className="text-sm text-gray-main">
                All payments and NFT minting happen on-chain. Verify any transaction on BscScan.
              </p>
            </div>
            <div className="bg-dark-800/30 rounded-lg p-4 border border-dark-600">
              <h3 className="font-semibold text-fur-cream mb-2">💰 Fair Fee Structure</h3>
              <p className="text-sm text-gray-main">
                Only 5% platform fee. Predictors keep 95% of their signal sales.
              </p>
            </div>
            <div className="bg-dark-800/30 rounded-lg p-4 border border-dark-600">
              <h3 className="font-semibold text-fur-cream mb-2">🎁 Referral Rewards</h3>
              <p className="text-sm text-gray-main">
                Earn $5 USDT for every predictor you refer to the platform.
              </p>
            </div>
            <div className="bg-dark-800/30 rounded-lg p-4 border border-dark-600">
              <h3 className="font-semibold text-fur-cream mb-2">⭐ Rating System</h3>
              <p className="text-sm text-gray-main">
                Rate signals you've purchased. One rating per purchase, permanent and transparent.
              </p>
            </div>
          </div>
        </section>

        {/* Links Section */}
        <section className="border-t border-dark-600 pt-8">
          <h2 className="text-xl font-bold text-fur-cream mb-4">
            Learn More
          </h2>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/faq"
              className="inline-flex items-center gap-2 px-4 py-2 bg-dark-800 hover:bg-dark-700 border border-dark-600 rounded-lg text-fur-cream transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Frequently Asked Questions
            </Link>
            <Link
              to="/terms"
              className="inline-flex items-center gap-2 px-4 py-2 bg-dark-800 hover:bg-dark-700 border border-dark-600 rounded-lg text-fur-cream transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Terms and Conditions
            </Link>
            <Link
              to="/news"
              className="inline-flex items-center gap-2 px-4 py-2 bg-dark-800 hover:bg-dark-700 border border-dark-600 rounded-lg text-fur-cream transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
              News & Updates
            </Link>
          </div>
        </section>

        {/* Back Link */}
        <div className="text-center pt-4">
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

export default AboutPage;
