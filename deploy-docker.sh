#!/bin/bash

# Docker Deployment Script for SSAT Training Website
# This script builds, pushes to registry, and deploys to remote server
# Usage: ./deploy-docker.sh [--build-only|--deploy-only]

set -e  # Exit on any error

# Load configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_FILE="${SCRIPT_DIR}/deploy-docker.config"

# Default configuration (can be overridden by config file)
DOCKER_IMAGE_NAME="ssat-training-app"
DOCKER_REGISTRY="ghcr.io"
DOCKER_REGISTRY_USER="anerky2016"
CONTAINER_NAME="ssat-app"
CONTAINER_PORT="3000"
HOST_PORT="3000"

# Server configuration
SERVER_IP="205.198.69.199"
SERVER_USER="root"
SERVER_PATH="/v0-ssat-training-website"

# Parse command line arguments
BUILD_ONLY=false
DEPLOY_ONLY=false
SKIP_BUILD=false

for arg in "$@"; do
    case $arg in
        --build-only)
            BUILD_ONLY=true
            ;;
        --deploy-only)
            DEPLOY_ONLY=true
            SKIP_BUILD=true
            ;;
        --skip-build)
            SKIP_BUILD=true
            ;;
        *)
            echo "Unknown option: $arg"
            echo "Usage: ./deploy-docker.sh [--build-only|--deploy-only|--skip-build]"
            exit 1
            ;;
    esac
done

# Load config file if exists
if [ -f "$CONFIG_FILE" ]; then
    echo "📋 Loading configuration from $CONFIG_FILE..."
    source "$CONFIG_FILE"
fi

# Full image name with registry
FULL_IMAGE_NAME="${DOCKER_REGISTRY}/${DOCKER_REGISTRY_USER}/${DOCKER_IMAGE_NAME}:latest"

echo "🚀 Docker Deployment Script"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Image: ${FULL_IMAGE_NAME}"
echo "Server: ${SERVER_USER}@${SERVER_IP}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# ============================================
# STEP 1: Build Docker Image
# ============================================
if [ "$SKIP_BUILD" = false ]; then
    echo "🔨 Step 1: Building Docker image..."
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    docker build -f docker/Dockerfile -t ${DOCKER_IMAGE_NAME}:latest .

    echo "✅ Docker image built successfully"
    echo ""

    # Tag for registry
    echo "🏷️  Tagging image for registry..."
    docker tag ${DOCKER_IMAGE_NAME}:latest ${FULL_IMAGE_NAME}
    echo "✅ Image tagged as ${FULL_IMAGE_NAME}"
    echo ""
else
    echo "⏭️  Skipping build step..."
    echo ""
fi

if [ "$BUILD_ONLY" = true ]; then
    echo "✨ Build complete! (--build-only mode)"
    exit 0
fi

# ============================================
# STEP 2: Push to Registry
# ============================================
if [ "$SKIP_BUILD" = false ]; then
    echo "📤 Step 2: Pushing to container registry..."
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Note: Make sure you're logged in to the registry:"
    echo "  Docker Hub: docker login"
    echo "  GitHub: echo \$GITHUB_TOKEN | docker login ghcr.io -u \$GITHUB_USER --password-stdin"
    echo ""

    docker push ${FULL_IMAGE_NAME}

    echo "✅ Image pushed to registry successfully"
    echo ""
fi

# ============================================
# STEP 3: Deploy to Server
# ============================================
echo "🚢 Step 3: Deploying to server..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Copy environment file if exists
if [ -f .env.local ]; then
    echo "📋 Copying environment variables to server..."
    scp .env.local ${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}/.env.local
    ENV_FILE_FLAG="--env-file ${SERVER_PATH}/.env.local"
else
    echo "⚠️  No .env.local file found - skipping environment variables"
    ENV_FILE_FLAG=""
fi

# SSH to server and deploy
ssh ${SERVER_USER}@${SERVER_IP} << ENDSSH
set -e

echo "🔍 Checking for running container..."

# Stop and remove existing container if running
if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}\$"; then
    echo "🛑 Stopping existing container..."
    docker stop ${CONTAINER_NAME} || true
    echo "🗑️  Removing existing container..."
    docker rm ${CONTAINER_NAME} || true
fi

echo "📥 Pulling latest image from registry..."
docker pull ${FULL_IMAGE_NAME}

echo "🚀 Starting new container..."
docker run -d \\
    --name ${CONTAINER_NAME} \\
    --restart=always \\
    -p ${HOST_PORT}:${CONTAINER_PORT} \\
    ${ENV_FILE_FLAG} \\
    ${FULL_IMAGE_NAME}

echo "⏳ Waiting for container to start..."
sleep 5

# Check if container is running
if docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}\$"; then
    echo "✅ Container is running!"
    echo ""
    echo "📊 Container Status:"
    docker ps --filter "name=${CONTAINER_NAME}" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    echo ""
    echo "📝 Recent logs:"
    docker logs --tail 20 ${CONTAINER_NAME}
else
    echo "❌ Container failed to start!"
    echo "📝 Logs:"
    docker logs ${CONTAINER_NAME}
    exit 1
fi

echo ""
echo "🧹 Cleaning up old images..."
docker image prune -f

echo ""
echo "✨ Deployment completed successfully!"
ENDSSH

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Deployment finished!"
echo ""
echo "🌐 Your app should now be running at:"
echo "   http://${SERVER_IP}:${HOST_PORT}"
echo ""
echo "📊 Useful commands:"
echo "   View logs:    ssh ${SERVER_USER}@${SERVER_IP} 'docker logs -f ${CONTAINER_NAME}'"
echo "   Restart:      ssh ${SERVER_USER}@${SERVER_IP} 'docker restart ${CONTAINER_NAME}'"
echo "   Stop:         ssh ${SERVER_USER}@${SERVER_IP} 'docker stop ${CONTAINER_NAME}'"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
