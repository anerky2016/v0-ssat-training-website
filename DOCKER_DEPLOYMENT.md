# Docker Deployment Guide

## Overview

This project includes automated Docker deployment scripts that handle building, pushing to a container registry, and deploying to a remote server.

**Key Features:**
- ✅ Multi-platform builds (ARM64 Mac → AMD64 Linux server)
- ✅ Automated deployment with one command
- ✅ GitHub Container Registry integration
- ✅ Auto-restart and health monitoring
- ✅ Environment variable management

## Quick Start - Automated Deployment

The easiest way to deploy is using the automated deployment script:

```bash
./deploy-docker.sh
```

This single command will:
1. Build AMD64 Docker image (compatible with Linux servers)
2. Push to GitHub Container Registry
3. SSH to your server
4. Pull latest image
5. Stop old container and start new one
6. Clean up old images

**First time setup required** - see [Setup](#setup) section below.

## Setup

### 1. Install Docker Desktop (macOS)

```bash
# Install via Homebrew
brew install --cask docker

# Or download from:
# https://www.docker.com/products/docker-desktop
```

Start Docker Desktop and wait for it to fully start.

### 2. GitHub Container Registry Authentication

Create a GitHub Personal Access Token:

1. Go to: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Name: `Docker Deployment`
4. Expiration: Choose (30/60/90 days or no expiration)
5. Scopes: Check ✅ `write:packages` and ✅ `read:packages`
6. Generate token and copy it

Login to registry:

```bash
# Replace with your token
export GITHUB_TOKEN="ghp_xxxxx"

echo $GITHUB_TOKEN | docker login ghcr.io -u anerky2016 --password-stdin
```

### 3. SSH Key Setup

Set up passwordless SSH to your server:

```bash
# Copy your SSH key to server (enter password once)
ssh-copy-id root@205.198.69.199

# Test connection
ssh root@205.198.69.199 'echo "SSH works!"'
```

### 4. Server Setup (First Time Only)

On your server, ensure Docker is installed:

```bash
# SSH to server
ssh root@205.198.69.199

# Install Docker (if not installed)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Login to GitHub Container Registry on server
echo $GITHUB_TOKEN | docker login ghcr.io -u anerky2016 --password-stdin
```

### 5. Setup Multiplatform Builder (Mac users)

**Important for Apple Silicon (M1/M2/M3) Mac users:**

Create a multiplatform builder to build AMD64 images:

```bash
# Create and use multiplatform builder (one-time setup)
docker buildx create --name multiplatform --use

# Verify it's active
docker buildx ls
```

You should see `multiplatform *` in the output (the `*` means it's active).

### 6. Create Configuration

```bash
# Copy example config
cp deploy-docker.config.example deploy-docker.config

# Edit if needed (defaults are already set)
nano deploy-docker.config
```

## Deployment Methods

### Method 1: Automated Deployment (Recommended)

**Full deployment:**
```bash
./deploy-docker.sh
```

**Build only (test locally):**
```bash
./deploy-docker.sh --build-only
```

**Deploy only (skip build):**
```bash
./deploy-docker.sh --deploy-only
```

### Method 2: Manual Docker Commands

For local testing or manual deployment:

```bash
# Build for AMD64 (Linux servers)
docker buildx build --platform linux/amd64 \
  -f docker/Dockerfile \
  -t ghcr.io/anerky2016/ssat-training-app:latest \
  --push .

# Or build for ARM64 (Mac local)
docker build -f docker/Dockerfile -t ssat-training-app:latest .

# Run locally
docker run -d -p 3000:3000 --name ssat-app ssat-training-app:latest
```

## Important: Multi-Platform Builds

⚠️ **Critical for deployment from Mac to Linux server:**

When building on **Apple Silicon (ARM64)** for deployment to **Intel/AMD servers (AMD64)**, you MUST use the multiplatform builder:

### Setup Multiplatform Builder (One Time)

```bash
# Create multiplatform builder
docker buildx create --name multiplatform --use
```

### Build for AMD64

```bash
# This creates linux/amd64 image (compatible with Intel/AMD servers)
docker buildx build --builder multiplatform \
  --platform linux/amd64 \
  -f docker/Dockerfile \
  -t ghcr.io/anerky2016/ssat-training-app:latest \
  --push .
```

### Verify Platform

```bash
# Check what platform was built
docker buildx imagetools inspect ghcr.io/anerky2016/ssat-training-app:latest
```

Should show `Platform: linux/amd64`

## Docker Commands Reference

### Container Management

```bash
# View running containers
docker ps

# View all containers
docker ps -a

# View logs
ssh root@205.198.69.199 'docker logs -f ssat-app'

# Restart container
ssh root@205.198.69.199 'docker restart ssat-app'

# Stop container
ssh root@205.198.69.199 'docker stop ssat-app'

# Remove container
ssh root@205.198.69.199 'docker stop ssat-app && docker rm ssat-app'
```

### Image Management

```bash
# List images
docker images

# Remove image
docker rmi ghcr.io/anerky2016/ssat-training-app:latest

# Pull image
docker pull ghcr.io/anerky2016/ssat-training-app:latest

# Inspect image
docker inspect ghcr.io/anerky2016/ssat-training-app:latest
```

### Cache Management

```bash
# Clear all cache and unused data (frees up space)
docker system prune -af --volumes

# Clear build cache only
docker builder prune -af

# Check disk usage
docker system df
```

## Configuration

### deploy-docker.config

Edit this file to customize deployment:

```bash
# Docker Image
DOCKER_IMAGE_NAME="ssat-training-app"

# Registry (GitHub Container Registry)
DOCKER_REGISTRY="ghcr.io"
DOCKER_REGISTRY_USER="anerky2016"

# Container settings
CONTAINER_NAME="ssat-app"
CONTAINER_PORT="3000"  # Port inside container
HOST_PORT="3000"       # Port on host

# Server settings
SERVER_IP="205.198.69.199"
SERVER_USER="root"
SERVER_PATH="/v0-ssat-training-website"
```

### Environment Variables

To use environment variables in production:

1. Create `.env.local` locally (already in .gitignore)
2. The deployment script automatically copies it to the server
3. Container runs with `--env-file` flag

Example `.env.local`:
```env
OPENAI_API_KEY=sk-xxxxx
NEXT_PUBLIC_API_URL=https://api.example.com
VOLCENGINE_ACCESS_KEY_ID=xxxxx
VOLCENGINE_SECRET_ACCESS_KEY=xxxxx
```

## Production Setup with Nginx

For production, use Nginx as reverse proxy (port 80/443) → Docker (port 3000):

### Nginx Configuration

```bash
# On server
sudo nano /etc/nginx/sites-available/ssat-app
```

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/ssat-app /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### SSL with Let's Encrypt

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal is configured automatically
```

## Troubleshooting

### Platform Mismatch Error

**Error:** `no matching manifest for linux/amd64 in manifest list`

**Cause:** Built ARM64 image on Mac, but server needs AMD64

**Solution:**
```bash
# Use multiplatform builder
docker buildx create --name multiplatform --use

# Build for AMD64
docker buildx build --builder multiplatform \
  --platform linux/amd64 \
  -f docker/Dockerfile \
  -t ghcr.io/anerky2016/ssat-training-app:latest \
  --push .
```

### SSH Permission Denied

**Solution:**
```bash
# Set up SSH key
ssh-copy-id root@205.198.69.199
```

### Port Already in Use

**Error:** `address already in use`

**Solution:**
```bash
# Check what's using the port
ssh root@205.198.69.199 'lsof -i :3000'

# Change port in deploy-docker.config
# Or stop the conflicting service
```

### Registry Authentication Failed

**Error:** `unauthorized: authentication required`

**Solution:**
```bash
# Re-login to GitHub Container Registry
echo $GITHUB_TOKEN | docker login ghcr.io -u anerky2016 --password-stdin
```

### Container Won't Start

**Check logs:**
```bash
ssh root@205.198.69.199 'docker logs ssat-app'
```

**Check container status:**
```bash
ssh root@205.198.69.199 'docker ps -a | grep ssat-app'
```

### Out of Disk Space

**Clean up Docker cache:**
```bash
# On local machine
docker system prune -af --volumes

# On server
ssh root@205.198.69.199 'docker system prune -af'
```

## Architecture

### Multi-Stage Dockerfile

The Dockerfile uses 3 stages for optimal image size:

1. **deps**: Install dependencies
2. **builder**: Build Next.js application
3. **runner**: Production runtime (minimal image)

**Benefits:**
- Small final image (~600MB vs ~2GB)
- Fast deploys (only final stage pushed)
- Security (no build tools in production)

### Build Process Flow

```
Local Mac (ARM64)
  ↓
Docker Buildx (creates AMD64 image)
  ↓
GitHub Container Registry
  ↓
Linux Server (AMD64) pulls image
  ↓
Docker container runs
```

## Best Practices

1. **Always use multiplatform builder** when deploying from Mac to Linux
2. **Test locally** with `--build-only` before deploying
3. **Check logs** after deployment to verify startup
4. **Use environment variables** for secrets (never hardcode)
5. **Clean cache regularly** to free up disk space
6. **Monitor container** with `docker stats` for resource usage
7. **Use Nginx reverse proxy** for production (SSL, caching, etc.)

## Resources

- **Docker Documentation:** https://docs.docker.com/
- **Docker Buildx:** https://docs.docker.com/buildx/working-with-buildx/
- **GitHub Container Registry:** https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry
- **Next.js Docker:** https://nextjs.org/docs/deployment#docker-image

## Support

For deployment issues:
1. Check logs: `ssh root@205.198.69.199 'docker logs ssat-app'`
2. Verify platform: `docker buildx imagetools inspect ghcr.io/anerky2016/ssat-training-app:latest`
3. Check server: `ssh root@205.198.69.199 'docker ps'`
4. Clear cache: `docker system prune -af`

---

**Last Updated:** 2025-01-20 (Updated with multi-platform build instructions)
