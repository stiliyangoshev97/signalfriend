# 📖 SignalFriend - General Runbook

> Quick reference for common development tasks and configurations.  
> Last Updated: 9 December 2025

---

## 🛠️ Maintenance Mode

When you need to take the site down for maintenance (deployments, database migrations, etc.), you can enable maintenance mode to show users a friendly maintenance page instead of errors.

### Enabling Maintenance Mode

**1. Update `frontend/.env.local`:**
```bash
# Enable maintenance mode
VITE_MAINTENANCE_MODE=true

# Optional: Custom message (default: "SignalFriend is currently undergoing scheduled maintenance...")
VITE_MAINTENANCE_MESSAGE=We're upgrading our systems to serve you better!

# Optional: Expected end time (displayed to users)
VITE_MAINTENANCE_END_TIME=December 10, 2025 at 6:00 PM UTC
```

**2. Rebuild and deploy the frontend:**
```bash
cd frontend
npm run build
# Deploy the build to your hosting provider
```

### Disabling Maintenance Mode

**1. Update `frontend/.env.local`:**
```bash
# Disable maintenance mode
VITE_MAINTENANCE_MODE=false
```
Or simply remove/comment out the `VITE_MAINTENANCE_MODE` line.

**2. Rebuild and deploy the frontend.**

### Maintenance Page Features

- Displays SignalFriend logo
- Shows maintenance message (customizable via env var)
- Shows expected end time (optional)
- Links to Discord and Twitter for updates
- Mobile-responsive design

### Production Tip

For production deployments, consider having a pre-built maintenance page ready:
```bash
# Build with maintenance mode enabled
VITE_MAINTENANCE_MODE=true npm run build
# Save this build as maintenance-build

# Build normal version
VITE_MAINTENANCE_MODE=false npm run build
# Save as production-build
```

Then you can quickly swap between versions without rebuilding.

---

## 🌐 Network Testing (Access from Phone/Other Devices)

To test the app on your phone or other devices on the same network:

### 1. Find Your Local IP
```bash
# On macOS
ipconfig getifaddr en0
# or
ifconfig | grep "inet " | grep -v 127.0.0.1
```

Example IP: `192.168.0.109`

### 2. Frontend Setup

**Update `.env.local`:**
```bash
VITE_API_BASE_URL=http://192.168.0.109:3001
```

**Start with `--host` flag:**
```bash
cd frontend
npm run dev -- --host
```

Frontend will be accessible at: `http://192.168.0.109:5173`

### 3. Backend Setup

**Update `.env` - Add CORS origin:**
```bash
CORS_ORIGIN=http://192.168.0.109:5173
```

Or for development, allow all origins:
```bash
CORS_ORIGIN=*
```

**Start backend (HOST not required, but can be explicit):**
```bash
cd backend
npm run dev
```

Backend will be accessible at: `http://192.168.0.109:3001`

### 4. Access from Phone
Open your mobile browser and navigate to:
```
http://192.168.0.109:5173
```

### Troubleshooting

| Issue | Solution |
|-------|----------|
| Network errors on phone | Check CORS_ORIGIN in backend `.env` matches your frontend URL |
| Can't connect to API | Ensure both frontend and backend are using the same IP address |
| Frontend not accessible | Make sure you used `--host` flag with `npm run dev` |
| IP changed | Your router may assign different IPs - check with `ipconfig getifaddr en0` |

---

## 🔄 Reverting to Local Development

When done with network testing, revert to localhost:

**Frontend `.env.local`:**
```bash
VITE_API_BASE_URL=http://localhost:3001
```

**Backend `.env`:**
```bash
CORS_ORIGIN=http://localhost:5173
```

---

## 📁 Project Structure Quick Reference

| Folder | Port | Description |
|--------|------|-------------|
| `/frontend` | 5173 | React + Vite frontend |
| `/backend` | 3001 | Express.js API server |
| `/contracts` | N/A | Solidity smart contracts (Foundry) |

---

## 🔧 Common Commands

### Frontend
```bash
cd frontend
npm run dev              # Start dev server (localhost only)
npm run dev -- --host    # Start dev server (network accessible)
npm run build            # Production build
npm run lint             # Run ESLint
```

### Backend
```bash
cd backend
npm run dev              # Start dev server
npm run build            # Compile TypeScript
npm run lint             # Run ESLint
```

### Contracts
```bash
cd contracts
forge build              # Compile contracts
forge test               # Run tests
forge test -vvv          # Run tests with verbose output
```

---

## 🚀 Running in Production Mode

Use these commands when you need to test production builds locally (bypasses Vite HMR, more accurate behavior testing).

### Frontend (Production Build)
```bash
cd frontend
npm run build            # Build production bundle
npm run preview          # Serve production build locally (usually port 4173)
```

### Backend (Production Build)
```bash
cd backend
npm run build            # Compile TypeScript to JavaScript
npm start                # Run compiled JS (production mode)
```

### One-liner Commands
```bash
# Frontend: Build and preview
cd frontend && npm run build && npm run preview

# Backend: Build and start
cd backend && npm run build && npm start
```

### When to Use Production Mode
- Testing behavior that differs between dev and production
- Debugging issues that don't reproduce in dev mode (e.g., HMR state preservation)
- Performance testing
- Pre-deployment verification

---

### Git Workflow
```bash
# After PR merge, clean up
git checkout main
git fetch --prune
git pull
git branch -d <branch-name>    # Delete merged local branch

# Check branches
git branch -a                   # List all branches
```

---

## 🌍 Environment Files

| File | Purpose | Git Ignored |
|------|---------|-------------|
| `frontend/.env` | Default frontend env vars | No |
| `frontend/.env.local` | Local overrides (your settings) | Yes |
| `backend/.env` | Backend env vars | Yes |
| `backend/.env.example` | Template for backend env | No |

---

## 📱 Mobile Wallet Testing

For testing wallet connections on mobile:

1. Use WalletConnect-compatible wallets (MetaMask Mobile, Trust Wallet)
2. Ensure your phone is on the same WiFi network
3. The WalletConnect Project ID is configured in frontend `.env.local`

---

## 🔄 CI/CD Pipeline

SignalFriend uses **GitHub Actions** to automatically run tests on every Pull Request and push to `main`. This catches bugs before they get merged.

### How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│                    Pull Request Created                         │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                 GitHub Actions Triggered                        │
└─────────────────────────┬───────────────────────────────────────┘
                          │
            ┌─────────────┴─────────────┐
            ▼                           ▼
    ┌───────────────┐           ┌───────────────┐
    │   Backend     │           │   Frontend    │
    │   (parallel)  │           │   (parallel)  │
    ├───────────────┤           ├───────────────┤
    │ npm ci        │           │ npm ci        │
    │ tsc --noEmit  │           │ tsc --noEmit  │
    │ npm run lint  │           │ npm run lint  │
    │ npm test      │           │ npm run build │
    └───────┬───────┘           └───────┬───────┘
            │                           │
            └─────────────┬─────────────┘
                          ▼
              ┌───────────────────┐
              │   All Passed?     │
              └─────────┬─────────┘
                        │
           ┌────────────┴────────────┐
           ▼                         ▼
    ┌─────────────┐          ┌─────────────┐
    │  ✅ Merge   │          │  ❌ Blocked │
    │   Allowed   │          │  Fix Issues │
    └─────────────┘          └─────────────┘
```

### What Gets Checked

| Job | Checks | What It Catches |
|-----|--------|-----------------|
| **Backend** | TypeScript compile | Type errors |
| | ESLint | Code style issues |
| | Vitest | Broken tests, regressions |
| **Frontend** | TypeScript compile | Type errors |
| | ESLint | Code style issues |
| | Vite build | Import errors, build failures |

### Viewing CI Results

1. **On Pull Request**: Look for the green ✓ or red ✗ at the bottom
2. **Details**: Click "Details" next to any check to see logs
3. **Actions Tab**: Go to repo → Actions to see all runs

### What Happens on Failure

- ❌ PR shows red "Some checks were not successful"
- You can still merge (not blocked) but **should fix issues first**
- Click "Details" to see which step failed and why

### Branch Protection (Recommended)

To **require** CI to pass before merging:

1. Go to GitHub repo → Settings → Branches
2. Add rule for `main` branch
3. Enable "Require status checks to pass"
4. Select "CI Success" as required check
5. Save

Now PRs **cannot** be merged unless all tests pass.

### Running Checks Locally

Before pushing, run the same checks locally:

```bash
# Backend
cd backend
npx tsc --noEmit           # Type check
npm run lint               # Linting
npm test                   # Run tests

# Frontend
cd frontend
npx tsc --noEmit           # Type check
npm run lint               # Linting  
npm run build              # Build check
```

### CI Configuration

The workflow is defined in `.github/workflows/ci.yml`.

**Triggers:**
- Every push to `main`
- Every pull request targeting `main`

**Features:**
- Runs backend and frontend checks **in parallel** (faster)
- Caches npm dependencies (faster subsequent runs)
- Auto-cancels old runs when new commits are pushed

---

