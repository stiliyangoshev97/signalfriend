# 📋 SignalFriend Frontend - Runbook

> Operations and development guide for the frontend.  
> Last Updated: December 2025

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 🔧 Environment Setup

1. Copy `.env.example` to `.env.local`
2. Fill in required values:

```bash
# Required
VITE_API_BASE_URL=http://localhost:3001/api/v1
VITE_WALLETCONNECT_PROJECT_ID=your_project_id_here

# Optional - Error Tracking
VITE_SENTRY_DSN=https://your-dsn@sentry.io/project

# Optional - Chain Configuration
VITE_CHAIN_ID=97
VITE_ENABLE_TESTNET=true

# Optional - Maintenance Mode
VITE_MAINTENANCE_MODE=false
VITE_MAINTENANCE_MESSAGE=Custom maintenance message
VITE_MAINTENANCE_END_TIME=December 10, 2025 at 6:00 PM UTC
```

---

## 🔗 Network/Chain Configuration

Control which blockchain networks users can connect to:

```bash
# In .env.local
VITE_CHAIN_ID=97              # Default chain (97=testnet, 56=mainnet)
VITE_ENABLE_TESTNET=true      # Allow testnet selection in wallet
```

### Behavior

| Environment | `VITE_ENABLE_TESTNET` | Available Networks |
|-------------|----------------------|-------------------|
| Local Dev | `true` | BNB Testnet + Mainnet |
| Production | `false` | BNB Mainnet only |

**Important:** In production deployments, always set `VITE_ENABLE_TESTNET=false` to prevent users from accidentally connecting to testnet.

---

## 🔍 Sentry Error Tracking

Sentry is already configured in `main.tsx`. To enable:

1. Add your Sentry DSN to `.env.local`:
```bash
VITE_SENTRY_DSN=https://your-dsn@sentry.io/project
```

2. Errors will automatically be captured in production builds

---

## 🛠️ Production Testing

To test production builds locally (bypasses Vite HMR):

```bash
# Build and preview
npm run build && npm run preview
```

This runs on port 4173 by default. Use this to test:
- Behavior that differs between dev and production
- Issues that don't reproduce in dev mode
- Pre-deployment verification

---

## 🛡️ Maintenance Mode

Enable maintenance mode to show a friendly page during deployments:

```bash
# In .env.local
VITE_MAINTENANCE_MODE=true
VITE_MAINTENANCE_MESSAGE=We're upgrading our systems!
VITE_MAINTENANCE_END_TIME=December 10, 2025 at 6:00 PM UTC
```

Rebuild the frontend after changing these values.

---

## 📢 Announcement Banner & News Page

Display a site-wide announcement banner for important messages (beta notices, new features, maintenance, etc.). Full news history is available at `/news`.

### Configuration

Add these to `.env.local`:

```bash
# Enable the banner
VITE_ANNOUNCEMENT_ENABLED=true

# Message content (supports emojis)
VITE_ANNOUNCEMENT_MESSAGE=🎉 Welcome to SignalFriend! We're currently in beta.

# Style variant: info | warning | success | error
VITE_ANNOUNCEMENT_VARIANT=info

# Optional link button (leave empty to hide button)
VITE_ANNOUNCEMENT_LINK_TEXT=View All News
VITE_ANNOUNCEMENT_LINK_URL=/news
```

### Variants

| Variant | Use Case | Appearance |
|---------|----------|------------|
| `info` | General announcements, new features | Dark with gold accent border |
| `warning` | Important notices, upcoming changes | Gold/amber background |
| `success` | Positive news, milestones | Dark with green accent |
| `error` | Critical alerts, urgent issues | Dark with red accent |

### Dismissal Behavior

- Users can dismiss the banner by clicking X (per session only)
- Banner reappears on page refresh
- Banner auto-hides when user navigates to `/news` page
- Full announcement history available in navbar under "News"

### Adding News Items

Edit `src/features/news/pages/NewsPage.tsx` and add items to the `newsItems` array (newest first):

```typescript
const newsItems: NewsItem[] = [
  {
    id: 'unique-id-2024-12',
    title: '🎉 Your Title Here',
    date: '2024-12-11',  // ISO date format
    category: 'feature',  // update | feature | maintenance | security | general
    summary: 'Short summary shown as intro.',
    content: [
      'First paragraph of content.',
      'Second paragraph...',
      '• Bullet points work too',
    ],
  },
  // ... older items below
];
```

### Examples

```bash
# Beta launch announcement
VITE_ANNOUNCEMENT_ENABLED=true
VITE_ANNOUNCEMENT_MESSAGE=🚀 SignalFriend is now live! Start trading signals today.
VITE_ANNOUNCEMENT_VARIANT=success
VITE_ANNOUNCEMENT_LINK_TEXT=Get Started
VITE_ANNOUNCEMENT_LINK_URL=/become-predictor

# Scheduled maintenance warning
VITE_ANNOUNCEMENT_ENABLED=true
VITE_ANNOUNCEMENT_MESSAGE=⚠️ Scheduled maintenance on Dec 15 at 2:00 AM UTC
VITE_ANNOUNCEMENT_VARIANT=warning
VITE_ANNOUNCEMENT_LINK_TEXT=View All News
VITE_ANNOUNCEMENT_LINK_URL=/news

# New feature announcement
VITE_ANNOUNCEMENT_ENABLED=true
VITE_ANNOUNCEMENT_MESSAGE=✨ New: Signal expiration dates are now live!
VITE_ANNOUNCEMENT_VARIANT=info
VITE_ANNOUNCEMENT_LINK_TEXT=Learn More
VITE_ANNOUNCEMENT_LINK_URL=/news
```

---

## 📝 Notes

See main [RUNBOOK.md](../RUNBOOK.md) for:
- Network testing (access from phone/other devices)
- Git workflow
- Environment file overview
