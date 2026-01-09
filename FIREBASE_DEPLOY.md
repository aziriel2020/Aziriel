# 🔥 FIREBASE DEPLOYMENT GUIDE

## ⚡ Quick Deploy (3 Commands)

```bash
# 1. Install Firebase CLI
npm install -g firebase-tools

# 2. Login to Firebase
firebase login

# 3. Deploy!
firebase deploy
```

That's it! Your app will be live at: `https://neurafield-quantum.web.app`

---

## 📋 Detailed Steps

### Step 1: Install Firebase CLI
```bash
npm install -g firebase-tools
```

### Step 2: Login
```bash
firebase login
```
- Opens browser
- Sign in with Google
- Authorize Firebase CLI

### Step 3: Initialize (OPTIONAL - Already configured!)
```bash
# Skip this - I already created firebase.json
# But if you want to reconfigure:
firebase init
```

### Step 4: Deploy
```bash
firebase deploy
```

**What happens:**
1. ✅ Installs dependencies
2. ✅ Generates Prisma client
3. ✅ Deploys Cloud Functions (your API)
4. ✅ Deploys Hosting (your preview page)
5. ✅ Gives you live URL

---

## 🎯 What You Get

**Hosting URL:** `https://neurafield-quantum.web.app`
- Shows: Your beautiful PREVIEW.html page

**Functions URL:** `https://us-central1-neurafield-quantum.cloudfunctions.net/api`
- Shows: Full working API with all endpoints

**API Endpoints:**
- `https://your-app.web.app/api/health` - Health check
- `https://your-app.web.app/api/jobs` - Video generation jobs
- `https://your-app.web.app/api/storyboard` - Legendary storyboard
- `https://your-app.web.app/api/premium` - All premium features

---

## 🔧 Environment Variables

Set them in Firebase Console:
```bash
firebase functions:config:set \
  database.url="your-db-url" \
  jwt.secret="your-secret" \
  redis.url="your-redis-url"
```

Or use `.env` file (already configured).

---

## 💰 Pricing

**Firebase Free Tier (Spark Plan):**
- ✅ 125,000 function invocations/month
- ✅ 10GB hosting
- ✅ 360MB/day bandwidth
- ✅ Perfect for preview & testing

**Upgrade when needed:**
- Blaze Plan (Pay as you go)
- Still very cheap for small traffic

---

## 🚀 Quick Commands

```bash
# Deploy everything
firebase deploy

# Deploy only functions
firebase deploy --only functions

# Deploy only hosting
firebase deploy --only hosting

# View logs
firebase functions:log

# Open Firebase console
firebase open
```

---

## ✅ Advantages

✅ **Instant Preview** - Live URL in 3 minutes
✅ **Free Tier** - No credit card required
✅ **Auto-scaling** - Handles traffic spikes
✅ **SSL** - HTTPS included
✅ **CDN** - Global distribution
✅ **Logs** - Built-in monitoring

---

## 🎁 Already Configured!

I've created these files for you:
- ✅ `firebase.json` - Configuration
- ✅ `.firebaserc` - Project settings
- ✅ `index.js` - Cloud Function wrapper

Just run the 3 commands above and you're LIVE! 🔥
