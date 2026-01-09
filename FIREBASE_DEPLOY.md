# 🔥 FIREBASE DEPLOYMENT GUIDE - COMPLETE & UPDATED

## 📋 TABLE OF CONTENTS
1. [Quick Deploy (5 Minutes)](#quick-deploy)
2. [Automated Script](#automated-script)
3. [Manual Setup](#manual-setup)
4. [Environment Variables](#environment-variables)
5. [Testing Locally](#testing-locally)
6. [Troubleshooting](#troubleshooting)
7. [Advanced Configuration](#advanced-configuration)

---

## ⚡ QUICK DEPLOY (5 Minutes) {#quick-deploy}

### Prerequisites
- Node.js 20+ installed
- Google account
- Terminal access

### Step 1: Install Firebase CLI
```bash
npm install -g firebase-tools
```

### Step 2: Login to Firebase
```bash
firebase login
```
- Opens browser automatically
- Sign in with your Google account
- Authorize Firebase CLI

### Step 3: Create Firebase Project

**Option A: Via Firebase Console (Recommended)**
1. Go to https://console.firebase.google.com
2. Click **"Add Project"**
3. Name it: `neurafield-quantum`
4. Enable Google Analytics (optional)
5. Create project

**Option B: Via CLI**
```bash
firebase projects:create neurafield-quantum
```

### Step 4: Link Project
```bash
firebase use neurafield-quantum
```

### Step 5: Set Environment Variables
```bash
# Required variables
firebase functions:config:set \
  database.url="file:./server/prisma/dev.db" \
  redis.url="redis://localhost:6379" \
  jwt.secret="change-this-to-secure-random-string"

# Verify
firebase functions:config:get
```

### Step 6: Deploy
```bash
# Deploy everything
firebase deploy

# OR use the automated script
./deploy-firebase.sh
```

### Step 7: Access Your App
```
✅ Hosting: https://neurafield-quantum.web.app
✅ API: https://us-central1-neurafield-quantum.cloudfunctions.net/api
✅ Health: https://us-central1-neurafield-quantum.cloudfunctions.net/health
```

---

## 🤖 AUTOMATED SCRIPT {#automated-script}

We've created a deployment script that handles everything automatically!

### Usage
```bash
# Make it executable (already done)
chmod +x deploy-firebase.sh

# Run it
./deploy-firebase.sh
```

### What It Does
1. ✅ Checks if Firebase CLI is installed
2. ✅ Verifies authentication
3. ✅ Sets up environment variables (interactive)
4. ✅ Installs dependencies
5. ✅ Generates Prisma client
6. ✅ Deploys to Firebase
7. ✅ Shows your URLs

---

## 🔧 MANUAL SETUP {#manual-setup}

If you prefer manual control:

### 1. Install Dependencies
```bash
npm install --legacy-peer-deps
```

### 2. Generate Prisma Client
```bash
npx prisma generate
```

### 3. Configure Firebase
```bash
# Initialize (if not done)
firebase init

# Select:
# ✅ Functions: Configure and deploy Cloud Functions
# ✅ Hosting: Configure files for Firebase Hosting
```

### 4. Deploy Functions Only
```bash
firebase deploy --only functions
```

### 5. Deploy Hosting Only
```bash
firebase deploy --only hosting
```

### 6. Deploy Everything
```bash
firebase deploy
```

---

## 🔐 ENVIRONMENT VARIABLES {#environment-variables}

### Required Variables

#### DATABASE_URL
```bash
# For development (SQLite)
firebase functions:config:set database.url="file:./server/prisma/dev.db"

# For production (PostgreSQL recommended)
firebase functions:config:set database.url="postgresql://user:pass@host:5432/neurafield"
```

#### REDIS_URL
```bash
# Local Redis
firebase functions:config:set redis.url="redis://localhost:6379"

# Redis Cloud (recommended for production)
firebase functions:config:set redis.url="redis://user:pass@host:6379"
```

#### JWT_SECRET
```bash
# Generate a secure random string (32+ characters)
firebase functions:config:set jwt.secret="$(openssl rand -base64 32)"
```

### Optional Variables

#### AI API Keys
```bash
# OpenAI (for Sora 2.0)
firebase functions:config:set openai.key="sk-..."

# Google AI (for Veo 3.1)
firebase functions:config:set google.key="..."

# Anthropic (for Claude)
firebase functions:config:set anthropic.key="sk-ant-..."

# Runway (for Gen-4.5)
firebase functions:config:set runway.key="..."
```

#### Audio AI
```bash
# Suno AI (music generation)
firebase functions:config:set suno.key="..."

# ElevenLabs (voice-over)
firebase functions:config:set elevenlabs.key="..."
```

#### Stripe (Payments)
```bash
firebase functions:config:set \
  stripe.secret="sk_live_..." \
  stripe.webhook="whsec_..."
```

#### AWS S3 (Storage)
```bash
firebase functions:config:set \
  aws.key="..." \
  aws.secret="..." \
  aws.bucket="neurafield-videos" \
  aws.region="us-east-1"
```

### View All Config
```bash
firebase functions:config:get
```

### Delete Config
```bash
firebase functions:config:unset some.key
```

---

## 🧪 TESTING LOCALLY {#testing-locally}

### Start Emulators
```bash
# Start all emulators
firebase emulators:start

# Start only functions
firebase emulators:start --only functions

# Start functions + hosting
firebase emulators:start --only functions,hosting
```

### URLs (Local)
```
Functions: http://localhost:5001/neurafield-quantum/us-central1/api
Hosting: http://localhost:5000
Emulator UI: http://localhost:4000
```

### Test Endpoints
```bash
# Health check
curl http://localhost:5001/neurafield-quantum/us-central1/health

# API test
curl http://localhost:5001/neurafield-quantum/us-central1/api
```

---

## 🐛 TROUBLESHOOTING {#troubleshooting}

### Error: "Firebase login failed"
```bash
# Clear credentials
firebase logout

# Login again
firebase login --reauth
```

### Error: "Project not found"
```bash
# List your projects
firebase projects:list

# Select the correct one
firebase use <project-id>
```

### Error: "Functions deployment failed"
```bash
# View detailed logs
firebase functions:log

# Try deploying functions only
firebase deploy --only functions --debug
```

### Error: "Environment variables not set"
```bash
# Check current config
firebase functions:config:get

# Set missing variables
firebase functions:config:set key="value"

# Re-deploy
firebase deploy --only functions
```

### Error: "Node version mismatch"
```bash
# Check your Node version
node --version

# Should be 20+
# Install NVM and switch:
nvm install 20
nvm use 20
```

### Error: "npm install failed"
```bash
# Clear cache
npm cache clean --force

# Delete node_modules
rm -rf node_modules package-lock.json

# Reinstall
npm install --legacy-peer-deps
```

### Error: "Prisma client not found"
```bash
# Generate Prisma client
npx prisma generate

# Re-deploy
firebase deploy --only functions
```

### Functions Taking Too Long
```bash
# Increase timeout in index.js (already configured)
timeoutSeconds: 300  // 5 minutes

# Increase memory
memory: '2GB'  // More RAM
```

### Cold Start Issues
```bash
# Keep functions warm (in index.js)
minInstances: 1  // Never scale to zero

# Or use Cloud Scheduler to ping every 5 minutes
```

---

## ⚙️ ADVANCED CONFIGURATION {#advanced-configuration}

### Custom Domain
```bash
# Add domain in Firebase Console
# Then deploy
firebase deploy --only hosting
```

### Multiple Environments
```bash
# Create .firebaserc with aliases
{
  "projects": {
    "default": "neurafield-quantum",
    "staging": "neurafield-staging",
    "production": "neurafield-prod"
  }
}

# Deploy to staging
firebase use staging
firebase deploy

# Deploy to production
firebase use production
firebase deploy
```

### Scheduled Functions
```typescript
// In index.js, add:
exports.scheduledCleanup = functions
  .pubsub
  .schedule('every 24 hours')
  .onRun(async (context) => {
    // Cleanup old jobs
    console.log('Running scheduled cleanup');
  });
```

### CORS Configuration
```typescript
// Already configured in app.ts
cors({
  origin: process.env.CLIENT_URL,
  credentials: true
})
```

### Rate Limiting
```typescript
// Already configured in app.ts
rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100  // 100 requests per IP
})
```

### Monitoring & Alerts
```bash
# View logs
firebase functions:log

# View recent logs
firebase functions:log --only api

# Stream logs in real-time
firebase functions:log --follow
```

### Cost Optimization
```bash
# Use minInstances: 0 for low traffic
# Use smaller memory (256MB) for simple functions
# Use Cloud Scheduler to keep warm only during peak hours
```

---

## 📊 DEPLOYMENT CHECKLIST

Before deploying to production:

- [ ] Set secure JWT_SECRET
- [ ] Configure production DATABASE_URL (PostgreSQL)
- [ ] Set up production REDIS_URL
- [ ] Add AI API keys (if using AI features)
- [ ] Configure Stripe keys (if using payments)
- [ ] Set up AWS S3 (if using video storage)
- [ ] Test all endpoints locally first
- [ ] Review Firebase quotas and pricing
- [ ] Set up monitoring and alerts
- [ ] Configure custom domain (optional)
- [ ] Enable HTTPS (automatic with Firebase)
- [ ] Set up backup strategy for database
- [ ] Configure CORS for your domain
- [ ] Test rate limiting
- [ ] Review security rules

---

## 💰 FIREBASE PRICING

### Free Tier (Spark Plan)
- ✅ 125,000 function invocations/month
- ✅ 10GB hosting storage
- ✅ 360MB/day outbound data
- ✅ Perfect for testing & preview

### Paid Tier (Blaze Plan)
- Pay only for what you use
- Functions: $0.40 per million invocations
- Hosting: $0.026 per GB
- Still very affordable for most use cases

---

## 🎯 WHAT'S DEPLOYED

### Firebase Functions
- **api** - Main Express app (all API endpoints)
- **health** - Health check endpoint (fast response)

### Firebase Hosting
- **public/** - Static files
- **index.html** - Landing page
- **PREVIEW.html** - Project showcase

### Database
- Prisma + SQLite (default)
- Upgrade to PostgreSQL for production

### Features Available
- ✅ 15+ AI Video Models
- ✅ Legendary Storyboard System
- ✅ Video Editing (7 tools)
- ✅ Batch Generation (100 videos)
- ✅ AI Audio (music + voice)
- ✅ Social Sharing & Viral Optimization
- ✅ Team Collaboration
- ✅ Analytics & Tracking
- ✅ Plans & Credits (Stripe)
- ✅ Webhooks & Integrations
- ✅ 40+ API Endpoints
- ✅ Real-time WebSocket
- ✅ Full authentication & authorization

---

## 🚀 NEXT STEPS

After deployment:

1. **Test Your API**
   ```bash
   curl https://neurafield-quantum.web.app/health
   ```

2. **View Logs**
   ```bash
   firebase functions:log
   ```

3. **Monitor Performance**
   - Go to Firebase Console
   - Click "Functions" tab
   - View metrics & logs

4. **Scale Up**
   - Add AI API keys
   - Configure production database
   - Set up Redis cache
   - Add custom domain

5. **Monetize**
   - Configure Stripe
   - Set up subscription plans
   - Enable credit system

---

## 📞 SUPPORT

- 📚 Full documentation: [FEATURES_COMPLETE.md](./FEATURES_COMPLETE.md)
- 🐛 Report issues: GitHub Issues
- 💬 Questions: Create a discussion

---

## 🔥 COMMANDS CHEAT SHEET

```bash
# Deploy everything
firebase deploy

# Deploy functions only
firebase deploy --only functions

# Deploy hosting only
firebase deploy --only hosting

# Test locally
firebase emulators:start

# View logs
firebase functions:log

# View config
firebase functions:config:get

# Set config
firebase functions:config:set key="value"

# List projects
firebase projects:list

# Switch project
firebase use <project-id>

# Logout
firebase logout

# Login
firebase login
```

---

## ✅ FINAL RESULT

After successful deployment, you'll have:

🌐 **Live URLs:**
- Main App: https://neurafield-quantum.web.app
- API: https://us-central1-neurafield-quantum.cloudfunctions.net/api
- Health: https://us-central1-neurafield-quantum.cloudfunctions.net/health

💎 **Features:**
- Full AI video generation platform
- 40+ API endpoints
- Real-time WebSocket
- Production-ready backend
- Beautiful landing page

🔥 **Performance:**
- Auto-scaling
- Global CDN
- HTTPS included
- 99.95% uptime SLA

**LET'S DOMINATE! 🚀💎**
