# SKYWARD TRAVELS - Firebase Deployment Guide

## Prerequisites

Before deploying, ensure you have:

1. **Node.js 20+** installed
2. **Firebase CLI** installed: `npm install -g firebase-tools`
3. **Firebase Project** created at [console.firebase.google.com](https://console.firebase.google.com)
4. **API Keys** for travel services (Amadeus, Duffel, Hotelbeds)

---

## Quick Start Deployment

### Step 1: Firebase Setup

```bash
# Login to Firebase
firebase login

# Initialize project (select your Firebase project)
firebase use your-project-id
```

### Step 2: Environment Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit with your actual values
nano .env
```

**Required Environment Variables:**

```env
# Firebase (from Firebase Console > Project Settings)
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com

# Travel APIs
AMADEUS_CLIENT_ID=your_amadeus_client_id
AMADEUS_CLIENT_SECRET=your_amadeus_client_secret
HOTELBEDS_API_KEY=your_hotelbeds_key
HOTELBEDS_SECRET=your_hotelbeds_secret
DUFFEL_ACCESS_TOKEN=your_duffel_token

# Payments
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# AI
OPENAI_API_KEY=sk-xxx
ANTHROPIC_API_KEY=sk-ant-xxx
```

### Step 3: Install Dependencies

```bash
# Install root dependencies
npm install

# Install client dependencies
npm --prefix client install

# Install functions dependencies
npm --prefix functions install
```

### Step 4: Build & Deploy

```bash
# Full deployment (hosting + functions + rules)
npm run firebase:deploy:all

# Or deploy individually:
npm run firebase:deploy:hosting    # Next.js frontend only
npm run firebase:deploy:functions  # Cloud Functions API only
npm run firebase:deploy:rules      # Firestore & Storage rules
```

---

## Deployment Commands

| Command | Description |
|---------|-------------|
| `npm run firebase:deploy` | Full deployment (build + deploy all) |
| `npm run firebase:deploy:all` | Deploy hosting, functions, firestore, storage |
| `npm run firebase:deploy:hosting` | Deploy Next.js frontend only |
| `npm run firebase:deploy:functions` | Deploy Cloud Functions only |
| `npm run firebase:deploy:rules` | Deploy security rules only |
| `npm run firebase:deploy:indexes` | Deploy Firestore indexes |
| `npm run firebase:preview` | Create preview channel (7 days) |
| `npm run deploy:staging` | Deploy to staging environment |
| `npm run deploy:production` | Deploy to production environment |

---

## Local Development

### Start Emulators

```bash
# Start all Firebase emulators
npm run firebase:emulators

# Start with UI and data persistence
npm run firebase:emulators:ui
```

**Emulator Ports:**
- Auth: `localhost:9099`
- Functions: `localhost:5001`
- Firestore: `localhost:8080`
- Hosting: `localhost:5000`
- Storage: `localhost:9199`
- Emulator UI: `localhost:4000`

### Run Development Server

```bash
# Start both client and server
npm run dev

# Or separately:
npm run dev:client  # Next.js frontend (port 3000)
npm run dev:server  # Express backend (port 3001)
```

---

## Project Structure

```
/
├── client/                 # Next.js frontend
│   ├── src/app/           # App router pages
│   └── public/            # Static assets
├── functions/             # Firebase Cloud Functions
│   └── src/index.ts       # API endpoints
├── prisma/                # Database schema
├── server/                # Local development server
├── firebase.json          # Firebase configuration
├── firestore.rules        # Firestore security rules
├── firestore.indexes.json # Firestore indexes
├── storage.rules          # Storage security rules
└── .firebaserc           # Firebase project aliases
```

---

## Environment-Specific Deployment

### Staging

```bash
# Switch to staging project
firebase use staging

# Deploy
npm run firebase:deploy
```

### Production

```bash
# Switch to production project
firebase use production

# Deploy with production env
npm run deploy:production
```

---

## Setting Up API Keys

### Amadeus GDS (Flight Search)

1. Go to [developers.amadeus.com](https://developers.amadeus.com)
2. Create an account and app
3. Get API Key and Secret
4. Use `test` environment for development

### Duffel API (Flight Booking)

1. Go to [duffel.com/docs](https://duffel.com/docs)
2. Sign up for developer access
3. Get your access token
4. Use `sandbox` environment for testing

### Hotelbeds API (Hotels)

1. Go to [developer.hotelbeds.com](https://developer.hotelbeds.com)
2. Register for API access
3. Get API Key and Secret
4. Use `test` environment for development

### Stripe (Payments)

1. Go to [dashboard.stripe.com](https://dashboard.stripe.com)
2. Get your API keys (test mode first)
3. Set up webhook endpoint: `https://your-domain.com/api/payments/webhook`

---

## Troubleshooting

### Functions Not Deploying

```bash
# Clear functions build
rm -rf functions/lib

# Rebuild and deploy
npm --prefix functions run build
firebase deploy --only functions
```

### Hosting Build Fails

```bash
# Clear Next.js cache
rm -rf client/.next

# Rebuild
npm run build:client
```

### Firestore Rules Rejected

```bash
# Test rules locally first
firebase emulators:start --only firestore
```

---

## Production Checklist

- [ ] All environment variables set in Firebase Console
- [ ] Custom domain configured
- [ ] SSL certificate active
- [ ] Stripe webhook configured for production URL
- [ ] Travel APIs switched from test to production
- [ ] Firestore security rules reviewed
- [ ] Storage rules reviewed
- [ ] Rate limiting configured
- [ ] Error monitoring (Sentry) connected
- [ ] Analytics enabled

---

## Support

- Documentation: See `FEATURES.md` for complete feature list
- Issues: Report on GitHub
- APIs: Refer to individual provider documentation
