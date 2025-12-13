/**
 * News Page
 *
 * Displays a timeline of platform news, updates, and announcements.
 * Each news item shows title, date, category, and full content.
 *
 * @module features/news/pages/NewsPage
 */

import { Link } from 'react-router-dom';

// =============================================================================
// Types
// =============================================================================

interface NewsItem {
  id: string;
  title: string;
  date: string; // ISO date string
  category: 'update' | 'feature' | 'maintenance' | 'security' | 'general';
  summary: string;
  content: string[];
}

// =============================================================================
// News Data
// =============================================================================

/**
 * Platform news - Add new items at the TOP of this array
 * 
 * To add a news item:
 * 1. Add a new object at the beginning of the array
 * 2. Use a unique ID (e.g., 'news-YYYY-MM-DD-X')
 * 3. Choose appropriate category
 * 4. Write a short summary (shown in preview)
 * 5. Add content paragraphs as array items
 */
const newsItems: NewsItem[] = [
  {
    id: 'referral-program-2025-01',
    title: '🎁 Referral Program Coming Soon!',
    date: '2025-01-15',
    category: 'feature',
    summary: 'Earn rewards by inviting friends to SignalFriend. Referral program launching Q1 2025!',
    content: [
      'We\'re excited to announce that a referral program is in development and will launch in Q1 2025!',
      'How it will work:',
      '• Get a unique referral link to share with friends',
      '• Earn a percentage of platform fees from referred users',
      '• Both you and your referral get bonus rewards',
      '• Track your referrals and earnings in your dashboard',
      'The referral program will reward our community members who help grow the platform. More details coming soon!',
      'Stay tuned for the official launch announcement.',
    ],
  },
  {
    id: 'beta-launch-2025-12',
    title: '🎉 Welcome to SignalFriend Beta!',
    date: '2025-12-11',
    category: 'general',
    summary: 'SignalFriend is now live on BNB Chain testnet. Start exploring and help us improve!',
    content: [
      'We\'re excited to announce the beta launch of SignalFriend - a decentralized NFT marketplace for trading signals on BNB Chain!',
      'During the beta phase, we\'re running on the BNB Chain testnet (chain ID 97). This allows you to explore all features without risking real funds.',
      'What you can do in beta:',
      '• Browse and purchase signals from predictors using testnet tokens',
      '• Become a predictor and publish your own signals',
      '• Test the full NFT minting and verification flow',
      '• Provide feedback to help us improve',
      'We appreciate all early testers and your feedback. Report any issues or suggestions through our community channels.',
    ],
  },
  {
    id: 'predictor-verification-2025-12',
    title: '✨ Predictor Verification System Now Live',
    date: '2025-12-10',
    category: 'feature',
    summary: 'Verified predictors now get a special badge and increased visibility on the platform.',
    content: [
      'We\'ve launched our predictor verification system to help you identify trusted signal providers!',
      'How verification works:',
      '• Predictors must reach 100+ signal sales',
      '• Apply for verification through your profile',
      '• Admin review process ensures quality',
      'Verified predictors receive:',
      '• A verification badge on their profile',
      '• Ability to upload a custom avatar',
      '• Higher trust from the community',
      'Start building your track record today to earn your verification badge!',
    ],
  },
  {
    id: 'ui-improvements-2025-12',
    title: '🎨 UI Improvements & Performance Updates',
    date: '2025-12-09',
    category: 'update',
    summary: 'We\'ve made several improvements to the user interface and overall performance.',
    content: [
      'This update includes several quality-of-life improvements based on your feedback:',
      'UI Improvements:',
      '• Redesigned signal cards for better readability',
      '• Improved mobile responsiveness across all pages',
      '• Added dark mode optimizations for better contrast',
      'Performance Updates:',
      '• Faster page load times (30% improvement)',
      '• Optimized image loading with lazy loading',
      '• Reduced API response times',
      'Thank you to everyone who submitted feedback!',
    ],
  },
  {
    id: 'security-update-2025-12',
    title: '🔒 Security Update: Enhanced Protection',
    date: '2025-12-07',
    category: 'security',
    summary: 'Important security improvements to protect your wallet and transactions.',
    content: [
      'We\'ve implemented several security enhancements to keep your assets safe:',
      'New Security Features:',
      '• Enhanced signature verification for all transactions',
      '• Tiered rate limiting to prevent abuse',
      '• Webhook signature verification for blockchain events',
      '• Comprehensive input validation on all endpoints',
      'Best Practices Reminder:',
      '• Never share your private keys or seed phrase',
      '• Always verify transaction details before signing',
      '• Use hardware wallets for large holdings',
      '• Report suspicious activity immediately',
      'Your security is our top priority. Contact us if you notice anything unusual.',
    ],
  },
  // Add more news items above this line...
];

// =============================================================================
// Helper Components
// =============================================================================

const categoryStyles: Record<NewsItem['category'], { bg: string; text: string; label: string }> = {
  update: { bg: 'bg-accent-gold/20', text: 'text-accent-gold', label: 'Update' },
  feature: { bg: 'bg-accent-gold/20', text: 'text-accent-gold', label: 'New Feature' },
  maintenance: { bg: 'bg-accent-gold/20', text: 'text-accent-gold', label: 'Maintenance' },
  security: { bg: 'bg-accent-gold/20', text: 'text-accent-gold', label: 'Security' },
  general: { bg: 'bg-accent-gold/20', text: 'text-accent-gold', label: 'Announcement' },
};

function CategoryBadge({ category }: { category: NewsItem['category'] }) {
  const style = categoryStyles[category];
  return (
    <span className={`${style.bg} ${style.text} text-xs font-medium px-2 py-1 rounded-full`}>
      {style.label}
    </span>
  );
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// =============================================================================
// Main Component
// =============================================================================

export function NewsPage() {
  return (
    <div className="min-h-screen bg-dark-950">
      {/* Page Header */}
      <header className="bg-gradient-to-b from-dark-800 to-dark-950 border-b border-dark-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-fur-cream mb-2">
            News
          </h1>
          <p className="text-fur-cream/60">
            Platform updates, new features, and important notices
          </p>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {newsItems.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-dark-400 text-lg">No news yet.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {newsItems.map((item, index) => (
              <article
                key={item.id}
                id={item.id}
                className={`
                  bg-dark-800/50 rounded-xl border border-dark-600 overflow-hidden
                  ${index === 0 ? 'ring-2 ring-accent-gold/30' : ''}
                `}
              >
                {/* News Item Header */}
                <div className="px-6 py-4 border-b border-dark-600 bg-dark-700/30">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <CategoryBadge category={item.category} />
                    <time className="text-sm text-dark-400" dateTime={item.date}>
                      {formatDate(item.date)}
                    </time>
                    {index === 0 && (
                      <span className="bg-accent-gold/10 text-accent-gold text-xs font-medium px-2 py-1 rounded-full">
                        Latest
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl font-bold text-fur-cream">
                    {item.title}
                  </h2>
                </div>

                {/* News Item Content */}
                <div className="px-6 py-5">
                  <p className="text-fur-light font-medium mb-4">
                    {item.summary}
                  </p>
                  <div className="space-y-3 text-dark-200">
                    {item.content.map((paragraph, pIndex) => (
                      <p key={pIndex} className="leading-relaxed">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Back Link */}
        <div className="mt-12 text-center">
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

export default NewsPage;
