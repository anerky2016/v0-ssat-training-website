# Docker Deployment - Quick Start

## First Time Setup (5 minutes)

### 1. Create config file
```bash
cp deploy-docker.config.example deploy-docker.config
```

### 2. Login to GitHub Container Registry
```bash
# Get token from: https://github.com/settings/tokens
# Permissions needed: write:packages

export GITHUB_TOKEN="your_token_here"
echo $GITHUB_TOKEN | docker login ghcr.io -u anerky2016 --password-stdin
```

### 3. Test SSH connection
```bash
ssh root@205.198.69.199
```

### 4. Setup multiplatform builder (Mac users only)
```bash
# For Apple Silicon (M1/M2/M3) Mac users - required for building AMD64 images
docker buildx create --name multiplatform --use
```

## Deploy to Server

### Full Deployment (recommended)
```bash
./deploy-docker.sh
```

This will:
- ✅ Build Docker image locally
- ✅ Push to GitHub Container Registry
- ✅ Deploy to your server at 205.198.69.199
- ✅ Start the container
- ✅ Show logs and status

### Build Only (test build)
```bash
./deploy-docker.sh --build-only
```

### Deploy Only (skip build)
```bash
./deploy-docker.sh --deploy-only
```

## Access Your App

After deployment:
- **URL**: http://205.198.69.199:3000
- **Or**: http://205.198.69.199 (if HOST_PORT=80 in config)

## Common Tasks

### View logs
```bash
ssh root@205.198.69.199 'docker logs -f ssat-app'
```

### Restart
```bash
ssh root@205.198.69.199 'docker restart ssat-app'
```

### Stop
```bash
ssh root@205.198.69.199 'docker stop ssat-app'
```

## Troubleshooting

### "unauthorized" error when pushing
```bash
# Re-login to registry
echo $GITHUB_TOKEN | docker login ghcr.io -u anerky2016 --password-stdin
```

### Can't SSH to server
```bash
# Set up SSH key
ssh-copy-id root@205.198.69.199
```

### Container won't start
```bash
# Check logs
ssh root@205.198.69.199 'docker logs ssat-app'
```

## Full Documentation

See [DOCKER_DEPLOYMENT.md](DOCKER_DEPLOYMENT.md) for:
- Production setup with Nginx
- SSL/HTTPS configuration
- Environment variables
- GitHub Actions automation
- Advanced configuration

## Configuration

Edit `deploy-docker.config` to change:
- Registry (GitHub/Docker Hub/Private)
- Server IP and credentials
- Port mappings (default: 3000 → 80)
- Container name

Default configuration already set for your server:
- Server: 205.198.69.199
- Registry: ghcr.io/anerky2016
- Ports: 3000 (container) → 3000 (host)

---

**Ready to deploy?** Just run: `./deploy-docker.sh`
