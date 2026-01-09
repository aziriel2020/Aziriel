#!/bin/bash

# ============================================================================
# NEURAFIELD QUANTUM - QUICK START SCRIPT
# ============================================================================

set -e

echo ""
echo "🚀🚀🚀 STARTING NEURAFIELD QUANTUM 🚀🚀🚀"
echo "        THE ULTIMATE AI VIDEO PLATFORM"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

print_step() {
    echo -e "${BLUE}==>${NC} ${GREEN}$1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ${NC}  $1"
}

print_success() {
    echo -e "${GREEN}✔${NC}  $1"
}

cd /home/user/Aziriel

# ============================================================================
# STEP 1: INSTALL DEPENDENCIES
# ============================================================================
print_step "Step 1: Installing dependencies..."

if [ ! -d "node_modules" ]; then
    npm install --legacy-peer-deps
else
    print_info "Root dependencies already installed"
fi

if [ ! -d "client/node_modules" ]; then
    cd client && npm install --legacy-peer-deps && cd ..
else
    print_info "Client dependencies already installed"
fi

print_success "All dependencies ready!"
echo ""

# ============================================================================
# STEP 2: SETUP DATABASE
# ============================================================================
print_step "Step 2: Setting up database..."

cd server
npx prisma generate
npx prisma db push --skip-generate

print_success "Database ready!"
cd ..
echo ""

# ============================================================================
# STEP 3: START SERVERS
# ============================================================================
print_step "Step 3: Starting servers..."
echo ""
echo "================================================================"
echo -e "${PURPLE}✨ YOUR LEGENDARY PLATFORM IS STARTING! ✨${NC}"
echo "================================================================"
echo ""
echo -e "${GREEN}📡 Backend API:${NC} http://localhost:4000"
echo -e "${GREEN}🎨 Frontend UI:${NC} http://localhost:3000"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop${NC}"
echo "================================================================"
echo ""

cleanup() {
    echo ""
    print_info "Stopping servers..."
    kill $SERVER_PID $CLIENT_PID 2>/dev/null
    print_success "Servers stopped!"
    exit 0
}

trap cleanup INT TERM

# Start backend
npm run dev &
SERVER_PID=$!

sleep 3

# Start frontend
cd client
npm run dev &
CLIENT_PID=$!

wait
