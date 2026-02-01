#!/bin/bash

# Deployment script for SSAT Training Website
# Builds locally and syncs to remote server
# Usage: ./deploy-remote.sh [--force]

set -e  # Exit on any error

# Parse command line arguments
FORCE_FLAG=""
if [ "$1" = "--force" ]; then
    FORCE_FLAG="--force"
    echo "🔥 Force deployment mode enabled"
fi

# Server configuration
SERVER_IP="205.198.69.199"
SERVER_USER="root"
SERVER_PATH="/root/v0-ssat-training-website"

echo "🚀 Starting local build and deployment to $SERVER_IP..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Step 0: Git commit and push
echo "📝 Checking for uncommitted changes..."

# Check if there are any changes
if ! git diff-index --quiet HEAD --; then
    echo "📝 Found uncommitted changes, creating commit..."

    # Add all changes
    git add -A

    # Create commit with timestamp
    COMMIT_MSG="Deploy: $(date '+%Y-%m-%d %H:%M:%S')"
    git commit -m "$COMMIT_MSG"

    echo "✅ Changes committed: $COMMIT_MSG"
else
    echo "✅ No uncommitted changes"
fi

# Pull first to check for conflicts
echo "📥 Pulling from remote..."
if ! git pull --no-rebase; then
    echo "❌ Git pull failed! There may be conflicts."
    echo "❌ Please resolve conflicts manually and try again."
    exit 1
fi

# Push to remote
echo "📤 Pushing to remote..."
if ! git push; then
    echo "❌ Git push failed!"
    exit 1
fi

echo "✅ Git sync completed successfully!"
echo ""

# Step 1: Build locally
echo "🔨 Building project locally..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "✅ Build completed successfully!"
echo ""

# Step 2: Remove old .next directory on server
echo "🗑️  Removing old .next directory on server..."
ssh ${SERVER_USER}@${SERVER_IP} << ENDSSH
set -e
cd ${SERVER_PATH}
echo "Removing .next directory..."
rm -rf .next
echo "✓ Old binaries removed"
ENDSSH

if [ $? -ne 0 ]; then
    echo "❌ Failed to remove old binaries!"
    exit 1
fi

echo "✅ Old binaries removed successfully!"
echo ""

# Step 3: Sync entire .next directory to server (including BUILD_ID, server/, static/)
echo "📦 Syncing complete .next build directory to server..."
rsync -avz --delete --progress .next/ ${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}/.next/

if [ $? -ne 0 ]; then
    echo "❌ Failed to sync .next directory!"
    exit 1
fi

echo "✅ .next directory synced successfully!"
echo ""

# Verify critical files
echo "🔍 Verifying critical build files on server..."
ssh ${SERVER_USER}@${SERVER_IP} << ENDSSH
set -e
cd ${SERVER_PATH}/.next

if [ ! -f BUILD_ID ]; then
    echo "❌ ERROR: BUILD_ID file missing!"
    exit 1
fi

if [ ! -d server ]; then
    echo "❌ ERROR: server directory missing!"
    exit 1
fi

if [ ! -d static ]; then
    echo "❌ ERROR: static directory missing!"
    exit 1
fi

echo "✓ BUILD_ID: \$(cat BUILD_ID)"
echo "✓ server/ directory present"
echo "✓ static/ directory present"
ENDSSH

if [ $? -ne 0 ]; then
    echo "❌ Critical build files verification failed!"
    exit 1
fi

echo "✅ All critical build files verified!"
echo ""

# Step 4: Sync necessary runtime files
echo "📦 Syncing runtime files to server..."
rsync -avz \
    --exclude 'node_modules' \
    --exclude '.git' \
    --exclude '.env.local' \
    --exclude '.next' \
    --exclude 'dist' \
    --exclude 'out' \
    --exclude '.DS_Store' \
    --include 'package.json' \
    --include 'package-lock.json' \
    --include 'next.config.js' \
    --include 'public/' \
    --include 'public/**' \
    --include 'data/' \
    --include 'data/**' \
    --include 'lib/' \
    --include 'lib/**' \
    --include 'styles/' \
    --include 'styles/**' \
    --exclude '*' \
    . ${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}/

if [ $? -ne 0 ]; then
    echo "❌ Failed to sync runtime files!"
    exit 1
fi

echo "✅ Runtime files synced successfully!"
echo ""

# Step 5: Restart PM2 on server
echo "🔄 Restarting application on server..."
ssh ${SERVER_USER}@${SERVER_IP} << ENDSSH
set -e

echo "📂 Navigating to project directory..."
cd ${SERVER_PATH}

echo "🔄 Restarting PM2 application..."
pm2 restart midssat 2>/dev/null || pm2 start npm --name midssat -- start

echo "✅ Application restarted successfully!"
ENDSSH

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✨ Deployment completed successfully!"
echo ""
echo "🌐 Website: http://$SERVER_IP"
echo "📊 PM2 Status: ssh $SERVER_USER@$SERVER_IP 'pm2 status'"
