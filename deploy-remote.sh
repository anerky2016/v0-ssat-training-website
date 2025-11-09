#!/bin/bash

# Deployment script for SSAT Training Website
# Connects to remote server and runs deployment
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
SERVER_PATH="/v0-ssat-training-website"
DEPLOY_SCRIPT="./deploy.sh"

echo "🚀 Starting deployment to $SERVER_IP..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# SSH to server and run deployment script
ssh ${SERVER_USER}@${SERVER_IP} << ENDSSH
set -e

echo "📂 Navigating to project directory..."
cd ./v0-ssat-training-website

echo "🔄 Running deployment script..."
./deploy.sh $FORCE_FLAG

echo "✅ Deployment completed successfully!"
ENDSSH

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✨ Deployment finished!"
