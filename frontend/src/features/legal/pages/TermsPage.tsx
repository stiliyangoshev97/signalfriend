/**
 * Terms and Conditions Page
 *
 * Legal terms of service for SignalFriend platform.
 * Positions the platform as an NFT-based digital information marketplace,
 * NOT as financial advisors or a gambling platform.
 *
 * @module features/legal/pages/TermsPage
 */

import { useSEO, getSEOUrl } from '@/shared/hooks';
import { socialLinks } from '@/shared/config/social';

export function TermsPage() {
  // SEO for terms page
  useSEO({
    title: 'Terms and Conditions',
    description: 'SignalFriend Terms and Conditions. Read our legal terms of service for the NFT-based digital information marketplace on BNB Chain.',
    url: getSEOUrl('/terms'),
  });

  return (
    <div className="min-h-screen bg-dark-950">
      {/* Page Header */}
      <header className="bg-gradient-to-b from-dark-800 to-dark-950 border-b border-dark-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-fur-cream mb-2">
            Terms and Conditions
          </h1>
          <p className="text-fur-cream/60">
            Last updated: December 22, 2025
          </p>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="prose prose-invert prose-fur max-w-none space-y-8">
          
          {/* Section 1: Introduction */}
          <section>
            <h2 className="text-2xl font-bold text-fur-cream mb-4">1. Introduction and Acceptance</h2>
            <p className="text-gray-main leading-relaxed">
              Welcome to SignalFriend ("Platform," "we," "us," or "our"). By accessing or using our platform at signalfriend.com, 
              you ("User," "you," or "your") agree to be bound by these Terms and Conditions ("Terms"). If you do not agree 
              to these Terms, do not use the Platform.
            </p>
            <p className="text-gray-main leading-relaxed mt-4">
              SignalFriend operates as a <strong className="text-fur-cream">Web3 signal marketplace</strong> — a user interface 
              ("Interface") that enables interaction with the <strong className="text-fur-cream">SignalFriend Protocol</strong>, a set 
              of permissionless smart contracts deployed on BNB Chain. The Protocol autonomously handles all transactions, NFT 
              minting, and fund distribution. SignalFriend (the team/operators) develops and maintains this Interface and 
              participates in Protocol governance through a multi-signature arrangement.
            </p>
            <p className="text-gray-main leading-relaxed mt-4">
              The Platform facilitates the purchase and sale of digital content access tokens (NFTs) that unlock market-related 
              information and analysis created by independent third-party content creators ("Predictors"). When you use SignalFriend, you are 
              interacting directly with blockchain smart contracts — the Interface merely provides a convenient way to do so.
            </p>
          </section>

          {/* Section 2: Jurisdictional Restrictions - EU/EEA Exclusion */}
          <section className="bg-error-500/10 border border-error-500/30 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-fur-cream mb-4">2. Jurisdictional Restrictions (EU/EEA Exclusion)</h2>
            
            <p className="text-gray-main leading-relaxed">
              <strong className="text-error-400">IMPORTANT:</strong> SignalFriend is <strong className="text-fur-cream">not offered to, 
              directed at, or intended for use</strong> by any person or entity who is:
            </p>
            
            <ul className="list-disc list-inside text-gray-main space-y-2 mt-4 ml-4">
              <li>located in,</li>
              <li>resident in, or</li>
              <li>acting on behalf of a person or entity located in</li>
            </ul>
            
            <p className="text-gray-main leading-relaxed mt-4">
              the <strong className="text-fur-cream">European Union (EU)</strong> or the{' '}
              <strong className="text-fur-cream">European Economic Area (EEA)</strong> (collectively, the "Restricted Jurisdictions").
            </p>

            <p className="text-gray-main leading-relaxed mt-4">
              Users from Restricted Jurisdictions are <strong className="text-fur-cream">strictly prohibited</strong> from accessing or 
              using the Platform, including but not limited to purchasing, selling, minting, or interacting with SignalKey NFTs 
              or PredictorAccessPass NFTs through the Platform's official interface.
            </p>

            <div className="bg-dark-900/50 border border-dark-600 rounded-lg p-4 mt-6">
              <h3 className="text-lg font-semibold text-fur-cream mb-2">MiCA Compliance Notice</h3>
              <p className="text-gray-main leading-relaxed text-sm">
                SignalFriend does <strong className="text-fur-cream">not</strong> offer crypto-asset services within the meaning of 
                Regulation (EU) 2023/1114 (Markets in Crypto-Assets Regulation – "MiCA"), and does not seek authorization or 
                registration under MiCA. The Platform operates exclusively as an NFT marketplace for digital content access, 
                not as a crypto-asset service provider.
              </p>
            </div>

            <p className="text-gray-main leading-relaxed mt-4 text-sm">
              If you access or use the Platform from a Restricted Jurisdiction, you do so in violation of these Terms, and 
              SignalFriend assumes <strong className="text-fur-cream">no responsibility or liability</strong> for such unauthorized use. 
              We reserve the right to restrict, suspend, or terminate access for users who violate these jurisdictional restrictions.
            </p>
          </section>

          {/* Section 3: Protocol Architecture & Governance */}
          <section>
            <h2 className="text-2xl font-bold text-fur-cream mb-4">3. Protocol Architecture & Governance</h2>
            
            <h3 className="text-xl font-semibold text-fur-light mt-6 mb-3">3.1 The SignalFriend Protocol</h3>
            <p className="text-gray-main leading-relaxed">
              SignalFriend consists of two distinct components:
            </p>
            <ul className="list-disc list-inside text-gray-main space-y-2 mt-4 ml-4">
              <li>
                <strong className="text-fur-cream">The Protocol:</strong> Smart contracts deployed on BNB Chain that handle 
                all transactions, NFT minting, payment distribution, and business logic.
              </li>
              <li>
                <strong className="text-fur-cream">The Interface:</strong> This website (signalfriend.com) which provides a 
                user-friendly way to interact with the Protocol.
              </li>
            </ul>
            <p className="text-gray-main leading-relaxed mt-4">
              All purchases, payments, and NFT minting occur directly on the blockchain through the Protocol's smart contracts. 
              The Interface does not process payments, custody funds, or mint NFTs — these actions are executed autonomously 
              by the Protocol when users sign transactions with their wallets.
            </p>

            <h3 className="text-xl font-semibold text-fur-light mt-6 mb-3">3.2 Non-Custodial Architecture</h3>
            <p className="text-gray-main leading-relaxed">
              SignalFriend is entirely <strong className="text-fur-cream">non-custodial</strong>. The Interface is purely 
              informational — it reads blockchain data and displays it in a user-friendly format. It does not custody funds, 
              mint NFTs, or execute transactions. All state-changing actions occur via the decentralized Protocol when users 
              sign transactions with their own wallets.
            </p>
            <ul className="list-disc list-inside text-gray-main space-y-2 mt-4 ml-4">
              <li>Users connect their own wallets and sign transactions directly to the blockchain.</li>
              <li>Funds flow directly between users and the Protocol — never through SignalFriend servers.</li>
              <li>The Interface only reads blockchain data and provides a UI for transaction signing.</li>
              <li>SignalFriend does not have access to your funds, private keys, or the ability to move assets on your behalf.</li>
            </ul>

            <h3 className="text-xl font-semibold text-fur-light mt-6 mb-3">3.3 Governance (3-of-3 MultiSig)</h3>
            <p className="text-gray-main leading-relaxed">
              The Protocol includes governance mechanisms controlled by a <strong className="text-fur-cream">3-of-3 MultiSignature 
              arrangement</strong>. The MultiSig wallets are operated by SignalFriend team members, who deployed the Protocol's 
              smart contracts. All governance actions require unanimous approval from all three signers:
            </p>
            <ul className="list-disc list-inside text-gray-main space-y-2 mt-4 ml-4">
              <li>Three designated wallet addresses must unanimously approve any protocol parameter changes.</li>
              <li>Governance can modify: fee rates, minimum prices, treasury address, and emergency pause functionality.</li>
              <li>All governance actions are transparent and permanently recorded on-chain.</li>
              <li>Proposals automatically expire after 1 hour if not fully approved by all three signers.</li>
            </ul>

            <h3 className="text-xl font-semibold text-fur-light mt-6 mb-3">3.4 Alternative Interfaces</h3>
            <p className="text-gray-main leading-relaxed">
              The Protocol's smart contracts are public and verified on BSCScan. Anyone can:
            </p>
            <ul className="list-disc list-inside text-gray-main space-y-2 mt-4 ml-4">
              <li>Build alternative interfaces to interact with the Protocol.</li>
              <li>Verify the contract source code independently.</li>
              <li>Interact directly with the contracts via blockchain explorers (e.g., BSCScan).</li>
            </ul>
            <p className="text-gray-main leading-relaxed mt-4">
              The existence of this Interface does not prevent others from accessing the Protocol through other means. 
              SignalFriend is simply one way to interact with the underlying decentralized Protocol.
            </p>
          </section>

          {/* Section 4: Nature of the Platform */}
          <section>
            <h2 className="text-2xl font-bold text-fur-cream mb-4">4. Nature of the Platform</h2>
            
            <h3 className="text-xl font-semibold text-fur-light mt-6 mb-3">4.1 NFT Marketplace — Not a Crypto-Asset Service</h3>
            <p className="text-gray-main leading-relaxed">
              SignalFriend is an <strong className="text-fur-cream">NFT marketplace for digital information access</strong>. When you purchase 
              a "Signal" on our Platform, you are purchasing a Non-Fungible Token (SignalKey NFT) that grants you access to view 
              specific digital content created by a Predictor. The NFT serves as a receipt and access key to the content.
            </p>
            <p className="text-gray-main leading-relaxed mt-4">
              <strong className="text-fur-cream">What you are purchasing:</strong> A unique digital collectible (NFT) that functions as an 
              access key to view content. The NFT is the product; the content is the utility associated with owning that NFT.
            </p>

            <h3 className="text-xl font-semibold text-fur-light mt-6 mb-3">4.2 Not Financial Advice or Investment Services</h3>
            <p className="text-gray-main leading-relaxed">
              <strong className="text-error-500">IMPORTANT:</strong> SignalFriend, its operators, and its affiliates are 
              <strong className="text-fur-cream"> NOT</strong> registered investment advisers, broker-dealers, or financial planners. 
              The Platform does not provide financial, investment, trading, tax, or legal advice. All content available through 
              purchased NFTs represents the personal opinions of independent Predictors and should not be construed as professional 
              financial advice.
            </p>

            <h3 className="text-xl font-semibold text-fur-light mt-6 mb-3">4.3 Not Gambling</h3>
            <p className="text-gray-main leading-relaxed">
              SignalFriend is <strong className="text-fur-cream">NOT a gambling, betting, or wagering platform</strong>. The purchase of 
              SignalKey NFTs constitutes a one-time exchange of value for a digital collectible (NFT) that provides access to 
              information content. There are no contingent payouts, prizes, or refunds based on the accuracy of predictions. 
              You are purchasing an NFT; the value exchanged is for the digital asset itself and its associated content access utility.
            </p>

            <h3 className="text-xl font-semibold text-fur-light mt-6 mb-3">4.4 Independent Predictors</h3>
            <p className="text-gray-main leading-relaxed">
              Predictors are independent third-party content creators who use our Platform to distribute their content. 
              SignalFriend does not employ, control, endorse, or guarantee the accuracy of any Predictor or their content. 
              Predictors are solely responsible for the content they publish.
            </p>
          </section>

          {/* Section 5: User Responsibilities */}
          <section>
            <h2 className="text-2xl font-bold text-fur-cream mb-4">5. User Responsibilities and Acknowledgments</h2>
            
            <p className="text-gray-main leading-relaxed">By using SignalFriend, you acknowledge and agree that:</p>
            
            <ul className="list-disc list-inside text-gray-main space-y-3 mt-4">
              <li>
                <strong className="text-fur-cream">Investment Risk:</strong> Any trading or investment decisions you make are 
                solely your responsibility. You may lose some or all of your invested capital.
              </li>
              <li>
                <strong className="text-fur-cream">No Guarantees:</strong> Past performance of Predictors does not guarantee 
                future results. Ratings and statistics are for informational purposes only.
              </li>
              <li>
                <strong className="text-fur-cream">Do Your Own Research:</strong> You should conduct your own research and 
                consult with qualified financial professionals before making any investment decisions.
              </li>
              <li>
                <strong className="text-fur-cream">No Refunds on NFT Purchases:</strong> Purchases of SignalKey NFTs are final and 
                non-refundable. You are purchasing a digital collectible (NFT); there are no refunds regardless of the 
                accuracy or usefulness of the content associated with the NFT.
              </li>
              <li>
                <strong className="text-fur-cream">Blockchain Transactions:</strong> All transactions are processed on the 
                BNB Chain blockchain and are irreversible once confirmed.
              </li>
              <li>
                <strong className="text-fur-cream">Wallet Security:</strong> You are solely responsible for maintaining the 
                security of your cryptocurrency wallet and private keys.
              </li>
              <li>
                <strong className="text-fur-cream">Legal Compliance:</strong> You are responsible for ensuring that your use 
                of the Platform complies with all applicable laws in your jurisdiction.
              </li>
              <li>
                <strong className="text-fur-cream">Jurisdictional Eligibility:</strong> You confirm that you are not located in, 
                resident in, or acting on behalf of any person in the European Union (EU) or European Economic Area (EEA), 
                and that you are legally permitted to purchase NFTs and use the Platform in your jurisdiction.
              </li>
            </ul>
          </section>

          {/* Section 6: Predictor Terms */}
          <section>
            <h2 className="text-2xl font-bold text-fur-cream mb-4">6. Predictor Terms</h2>
            
            <p className="text-gray-main leading-relaxed">
              If you register as a Predictor by purchasing a PredictorAccessPass NFT, you additionally agree that:
            </p>
            
            <ul className="list-disc list-inside text-gray-main space-y-3 mt-4">
              <li>
                You are an independent content creator, not an employee or agent of SignalFriend.
              </li>
              <li>
                Your content represents your personal opinions and analysis only.
              </li>
              <li>
                You will not represent yourself as providing professional financial advice.
              </li>
              <li>
                You will not make false or misleading claims about your credentials or past performance.
              </li>
              <li>
                You will comply with all applicable laws regarding content creation and distribution.
              </li>
              <li>
                SignalFriend may blacklist your account for violations of these Terms or community guidelines.
              </li>
              <li>
                The one-time registration fee ($20 USDT) is non-refundable and grants you a soulbound 
                PredictorAccessPass NFT — a non-transferable digital collectible that serves as your license to 
                create and sell SignalKey NFTs on the Platform.
              </li>
              <li>
                You confirm that you are not located in, resident in, or acting on behalf of any person in the 
                European Union (EU) or European Economic Area (EEA).
              </li>
            </ul>

            <p className="text-gray-main leading-relaxed mt-4">
              <strong className="text-fur-cream">Note:</strong> When you complete registration, the Protocol's smart contract 
              mints the PredictorAccessPass NFT directly to your wallet. The Interface facilitates this interaction but does 
              not mint NFTs on your behalf — all minting is performed autonomously by the Protocol.
            </p>
          </section>

          {/* Section 7: Fees */}
          <section>
            <h2 className="text-2xl font-bold text-fur-cream mb-4">7. Fees and Payments</h2>
            
            <p className="text-gray-main leading-relaxed mb-4">
              All fees and payments are processed automatically by the Protocol's smart contracts on BNB Chain. 
              SignalFriend does not collect, hold, or process payments directly — all fund transfers occur on-chain 
              when users sign transactions with their wallets.
            </p>
            
            <ul className="list-disc list-inside text-gray-main space-y-3">
              <li>
                <strong className="text-fur-cream">Predictor Registration (NFT Purchase):</strong> $20 USDT one-time, 
                non-refundable fee to mint a PredictorAccessPass NFT.
              </li>
              <li>
                <strong className="text-fur-cream">Signal Purchases (NFT Minting):</strong> Price set by Predictor 
                (minimum $1 USDT) plus a $0.50 USDT platform access fee to mint a SignalKey NFT.
              </li>
              <li>
                <strong className="text-fur-cream">Platform Commission:</strong> 5% of the signal price is retained by the 
                Platform; 95% goes to the Predictor.
              </li>
              <li>
                <strong className="text-fur-cream">Referral Bonus:</strong> Predictors may earn $5 USDT for each new Predictor 
                who registers using their referral.
              </li>
              <li>
                <strong className="text-fur-cream">Gas Fees:</strong> Users are responsible for blockchain gas fees associated 
                with transactions.
              </li>
            </ul>
          </section>

          {/* Section 8: NFT Ownership */}
          <section>
            <h2 className="text-2xl font-bold text-fur-cream mb-4">8. NFT Ownership and Rights</h2>
            
            <h3 className="text-xl font-semibold text-fur-light mt-6 mb-3">8.1 SignalKey NFT (Buyers)</h3>
            <p className="text-gray-main leading-relaxed">
              When you purchase a Signal, you receive a SignalKey NFT — a unique digital collectible minted on the 
              BNB Chain blockchain. This NFT grants you perpetual access to view the associated content. The SignalKey NFT 
              is transferable and can be sold or traded on secondary markets. Transfer of the NFT transfers the content 
              access rights to the new owner.
            </p>

            <h3 className="text-xl font-semibold text-fur-light mt-6 mb-3">8.2 PredictorAccessPass NFT (Predictors)</h3>
            <p className="text-gray-main leading-relaxed">
              Predictor registration involves purchasing a soulbound (non-transferable) PredictorAccessPass NFT. This NFT 
              serves as your license to create and sell SignalKey NFTs on the Platform. It cannot be sold or transferred 
              and is permanently linked to your wallet address. Only one PredictorAccessPass can exist per wallet.
            </p>

            <h3 className="text-xl font-semibold text-fur-light mt-6 mb-3">8.3 Content Rights</h3>
            <p className="text-gray-main leading-relaxed">
              Predictors retain intellectual property rights to their content. Purchasing a SignalKey NFT grants you 
              a license to view the content for personal use only. You may not reproduce, distribute, or commercially 
              exploit the content without the Predictor's permission.
            </p>
          </section>

          {/* Section 9: Prohibited Activities */}
          <section>
            <h2 className="text-2xl font-bold text-fur-cream mb-4">9. Prohibited Activities</h2>
            
            <p className="text-gray-main leading-relaxed">Users are prohibited from:</p>
            
            <ul className="list-disc list-inside text-gray-main space-y-3 mt-4">
              <li>Using the Platform for any illegal purpose</li>
              <li>Accessing the Platform from a Restricted Jurisdiction (EU/EEA)</li>
              <li>Impersonating SignalFriend staff, moderators, or administrators</li>
              <li>Manipulating ratings or creating fake reviews</li>
              <li>Distributing malware or engaging in phishing attempts</li>
              <li>Attempting to circumvent Platform security measures</li>
              <li>Harassing, threatening, or abusing other users</li>
              <li>Publishing false, misleading, or fraudulent content</li>
              <li>Violating intellectual property rights of others</li>
              <li>Using automated bots or scripts without authorization</li>
            </ul>
          </section>

          {/* Section 10: Disclaimers */}
          <section>
            <h2 className="text-2xl font-bold text-fur-cream mb-4">10. Disclaimers and Limitation of Liability</h2>
            
            <h3 className="text-xl font-semibold text-fur-light mt-6 mb-3">10.1 "As Is" Basis</h3>
            <p className="text-gray-main leading-relaxed">
              THE PLATFORM AND ALL CONTENT ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, 
              EXPRESS OR IMPLIED. WE DISCLAIM ALL WARRANTIES, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR 
              PURPOSE, AND NON-INFRINGEMENT.
            </p>

            <h3 className="text-xl font-semibold text-fur-light mt-6 mb-3">10.2 No Liability for Losses</h3>
            <p className="text-gray-main leading-relaxed">
              SIGNALFRIEND SHALL NOT BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR 
              PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE PLATFORM, PURCHASE OF NFTS, OR RELIANCE ON ANY CONTENT, 
              INCLUDING BUT NOT LIMITED TO TRADING LOSSES, LOSS OF PROFITS, OR LOSS OF DATA.
            </p>

            <h3 className="text-xl font-semibold text-fur-light mt-6 mb-3">10.3 Third-Party Content</h3>
            <p className="text-gray-main leading-relaxed">
              We are not responsible for the accuracy, completeness, or reliability of any content created by 
              Predictors. Your reliance on such content is at your own risk.
            </p>

            <h3 className="text-xl font-semibold text-fur-light mt-6 mb-3">10.4 Blockchain and NFT Risks</h3>
            <p className="text-gray-main leading-relaxed">
              You acknowledge the inherent risks of blockchain technology and NFTs, including but not limited to: smart 
              contract vulnerabilities, network congestion, regulatory changes, cryptocurrency volatility, and the 
              potential loss of access to NFTs due to wallet security issues.
            </p>
          </section>

          {/* Section 11: Indemnification */}
          <section>
            <h2 className="text-2xl font-bold text-fur-cream mb-4">11. Indemnification</h2>
            <p className="text-gray-main leading-relaxed">
              You agree to indemnify, defend, and hold harmless SignalFriend, its operators, affiliates, and their 
              respective officers, directors, employees, and agents from any claims, damages, losses, or expenses 
              (including legal fees) arising from your use of the Platform, purchase of NFTs, violation of these Terms, 
              violation of jurisdictional restrictions, or infringement of any third-party rights.
            </p>
          </section>

          {/* Section 12: Modifications */}
          <section>
            <h2 className="text-2xl font-bold text-fur-cream mb-4">12. Modifications to Terms</h2>
            <p className="text-gray-main leading-relaxed">
              We reserve the right to modify these Terms at any time. Changes will be effective immediately upon 
              posting to the Platform. Your continued use of the Platform after changes constitutes acceptance of 
              the modified Terms. We encourage you to review these Terms periodically.
            </p>
          </section>

          {/* Section 13: Governing Law */}
          <section>
            <h2 className="text-2xl font-bold text-fur-cream mb-4">13. Governing Law and Disputes</h2>
            <p className="text-gray-main leading-relaxed">
              These Terms shall be governed by and construed in accordance with applicable laws. Any disputes 
              arising from these Terms or your use of the Platform shall be resolved through good-faith negotiation. 
              If negotiation fails, disputes shall be submitted to binding arbitration.
            </p>
          </section>

          {/* Section 14: Contact */}
          <section>
            <h2 className="text-2xl font-bold text-fur-cream mb-4">14. Contact Information</h2>
            <p className="text-gray-main leading-relaxed">
              For questions about these Terms, please contact us through our official channels:
            </p>
            <div className="flex flex-col gap-4 mt-6">
              {/* Email */}
              <a 
                href={`mailto:${socialLinks.email}`}
                className="flex items-center gap-3 text-gray-main hover:text-fur-cream transition-colors group"
              >
                <div className="w-10 h-10 bg-dark-800 rounded-lg flex items-center justify-center group-hover:bg-dark-700 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-brand-200 hover:text-brand-100">{socialLinks.email}</span>
              </a>
              
              {/* Discord */}
              <a 
                href={socialLinks.discord} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-gray-main hover:text-fur-cream transition-colors group"
              >
                <div className="w-10 h-10 bg-dark-800 rounded-lg flex items-center justify-center group-hover:bg-dark-700 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
                  </svg>
                </div>
                <span className="text-brand-200 hover:text-brand-100">Discord</span>
              </a>
              
              {/* X (formerly Twitter) */}
              <a 
                href={socialLinks.twitter} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-gray-main hover:text-fur-cream transition-colors group"
              >
                <div className="w-10 h-10 bg-dark-800 rounded-lg flex items-center justify-center group-hover:bg-dark-700 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </div>
                <span className="text-brand-200 hover:text-brand-100">@signalfriend1</span>
              </a>
            </div>
          </section>

          {/* Final Notice */}
          <section className="mt-12 p-6 bg-dark-800 border border-dark-600 rounded-lg">
            <h3 className="text-xl font-bold text-fur-cream mb-3">⚠️ Important Notice</h3>
            <p className="text-gray-main leading-relaxed">
              By using SignalFriend, you acknowledge that you have read, understood, and agree to be bound by 
              these Terms and Conditions. You further acknowledge that trading in cryptocurrencies and other 
              financial instruments involves substantial risk and may result in the loss of your entire investment. 
              Only trade with funds you can afford to lose.
            </p>
          </section>

        </div>
      </main>
    </div>
  );
}

export default TermsPage;
