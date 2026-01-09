#!/bin/bash

# ========================================
# NEURAFIELD QUANTUM - FIREBASE DEPLOY
# Automated deployment script
# ========================================

set -e  # Exit on error

echo "🔥 NEURAFIELD QUANTUM - Firebase Deployment"
echo "==========================================="
echo ""

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Installing..."
    npm install -g firebase-tools
    echo "✅ Firebase CLI installed"
fi

# Check if logged in
echo "🔐 Checking Firebase authentication..."
if ! firebase projects:list &> /dev/null; then
    echo "⚠️  Not logged in. Opening browser..."
    firebase login
fi

# Check if project exists
echo "📦 Checking Firebase project..."
if ! firebase use --add 2>/dev/null; then
    echo "⚠️  Project not found. Please:"
    echo "   1. Go to https://console.firebase.google.com"
    echo "   2. Create a new project called 'neurafield-quantum'"
    echo "   3. Run this script again"
    exit 1
fi

# Set environment variables
echo "⚙️  Setting environment variables..."
read -p "Do you want to set environment variables? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Setting DATABASE_URL..."
    read -p "DATABASE_URL (default: file:./server/prisma/dev.db): " db_url
    db_url=${db_url:-"file:./server/prisma/dev.db"}

    echo "Setting REDIS_URL..."
    read -p "REDIS_URL (default: redis://localhost:6379): " redis_url
    redis_url=${redis_url:-"redis://localhost:6379"}

    echo "Setting JWT_SECRET..."
    read -sp "JWT_SECRET (required): " jwt_secret
    echo

    if [ -z "$jwt_secret" ]; then
        echo "❌ JWT_SECRET is required!"
        exit 1
    fi

    firebase functions:config:set \
        database.url="$db_url" \
        redis.url="$redis_url" \
        jwt.secret="$jwt_secret"

    echo "✅ Environment variables set"
fi

# Install dependencies
echo "📥 Installing dependencies..."
npm install --legacy-peer-deps

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Deploy
echo "🚀 Deploying to Firebase..."
echo ""
echo "Choose deployment type:"
echo "1) Deploy everything (functions + hosting)"
echo "2) Deploy only functions (API)"
echo "3) Deploy only hosting (frontend)"
echo "4) Cancel"
read -p "Enter choice (1-4): " choice

case $choice in
    1)
        firebase deploy
        ;;
    2)
        firebase deploy --only functions
        ;;
    3)
        firebase deploy --only hosting
        ;;
    4)
        echo "❌ Deployment cancelled"
        exit 0
        ;;
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "=========================================="
echo "✅ DEPLOYMENT COMPLETE!"
echo "=========================================="
echo ""
echo "🌐 Your URLs:"
echo "   Hosting: https://neurafield-quantum.web.app"
echo "   API: https://us-central1-neurafield-quantum.cloudfunctions.net/api"
echo "   Health: https://us-central1-neurafield-quantum.cloudfunctions.net/health"
echo ""
echo "📊 View logs:"
echo "   firebase functions:log"
echo ""
echo "🔥 LET'S DOMINATE! 💎"
