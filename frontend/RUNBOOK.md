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

## 📝 Notes

See main [RUNBOOK.md](../RUNBOOK.md) for:
- Network testing (access from phone/other devices)
- Git workflow
- Environment file overview
