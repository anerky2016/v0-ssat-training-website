#!/bin/bash

# SSAT Training Website Deployment Script
# This script pulls latest changes, installs dependencies, builds, and restarts the app
# Usage: ./deploy.sh [--force]

set -e  # Exit on any error

FORCE_DEPLOY=false

# Check for --force flag
if [ "$1" = "--force" ]; then
    FORCE_DEPLOY=true
fi

echo "========================================="
echo "Starting deployment..."
echo "========================================="

# Pull latest changes from git and check if anything was updated
echo ""
echo "📥 Checking for updates from git..."
git fetch origin

LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/main)

if [ "$LOCAL" = "$REMOTE" ] && [ "$FORCE_DEPLOY" = false ]; then
    echo ""
    echo "========================================="
    echo "✅ Already up to date! No deployment needed."
    echo "Use --force flag to force deployment anyway."
    echo "========================================="
    exit 0
fi

if [ "$FORCE_DEPLOY" = true ]; then
    echo "🔥 Force deployment mode enabled - deploying anyway..."
fi

echo "📥 Pulling latest changes..."
git pull

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Build the application
echo ""
echo "🔨 Building the application..."
npm run build

# Restart the application with PM2
echo ""
echo "🔄 Restarting application with PM2..."
pm2 restart midssat

echo ""
echo "========================================="
echo "✅ Deployment completed successfully!"
echo "========================================="
