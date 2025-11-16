#!/bin/bash

# Docker Deployment Script - Direct Server Build
# Builds Docker image directly on server (no registry needed)
# Usage: ./deploy-docker-direct.sh

set -e

# Configuration
SERVER_IP="205.198.69.199"
SERVER_USER="root"
SERVER_PATH="/v0-ssat-training-website"
CONTAINER_NAME="ssat-app"
CONTAINER_PORT="3000"
HOST_PORT="3000"

echo "🚀 Docker Direct Deployment (No Registry)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Server: ${SERVER_USER}@${SERVER_IP}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 1: Sync files to server
echo "📤 Step 1: Syncing files to server..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

rsync -avz --exclude 'node_modules' --exclude '.next' --exclude '.git' \
  --exclude 'deploy-docker.config' \
  ./ ${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}/

echo "✅ Files synced successfully"
echo ""

# Step 2: Build and deploy on server
echo "🔨 Step 2: Building and deploying on server..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

ssh ${SERVER_USER}@${SERVER_IP} << ENDSSH
set -e

cd ${SERVER_PATH}

echo "🔍 Checking for running container..."
if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}\$"; then
    echo "🛑 Stopping existing container..."
    docker stop ${CONTAINER_NAME} || true
    echo "🗑️  Removing existing container..."
    docker rm ${CONTAINER_NAME} || true
fi

echo "🔨 Building Docker image..."
docker build -f docker/Dockerfile -t ssat-training-app:latest .

echo "🚀 Starting new container..."
docker run -d \\
    --name ${CONTAINER_NAME} \\
    --restart=always \\
    -p ${HOST_PORT}:${CONTAINER_PORT} \\
    ssat-training-app:latest

echo "⏳ Waiting for container to start..."
sleep 5

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
    docker logs ${CONTAINER_NAME}
    exit 1
fi

echo ""
echo "🧹 Cleaning up old images..."
docker image prune -f
ENDSSH

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Deployment finished!"
echo ""
echo "🌐 Your app is running at:"
echo "   http://${SERVER_IP}:${HOST_PORT}"
echo ""
echo "📊 Useful commands:"
echo "   View logs:    ssh ${SERVER_USER}@${SERVER_IP} 'docker logs -f ${CONTAINER_NAME}'"
echo "   Restart:      ssh ${SERVER_USER}@${SERVER_IP} 'docker restart ${CONTAINER_NAME}'"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
