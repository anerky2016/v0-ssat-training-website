#!/bin/bash

# SSAT Training Website Deployment Script
# This script pulls latest changes, installs dependencies, builds, and restarts the app

set -e  # Exit on any error

echo "========================================="
echo "Starting deployment..."
echo "========================================="

# Pull latest changes from git
echo ""
echo "📥 Pulling latest changes from git..."
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
