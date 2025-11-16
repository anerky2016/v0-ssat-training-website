# Docker Deployment - Documentation Index

This project includes automated Docker deployment for easy deployment to remote servers.

## Quick Links

🤖 **Using Claude Code or AI assistant?** Start here:
- [CLAUDE_DEPLOYMENT_GUIDE.md](CLAUDE_DEPLOYMENT_GUIDE.md) - Step-by-step guide optimized for Claude to execute

📋 **New to Docker deployment?** Human-friendly guides:
- [SETUP_CHECKLIST.md](SETUP_CHECKLIST.md) - Complete setup checklist with checkboxes

⚡ **Already set up?** Quick reference:
- [DEPLOY_QUICKSTART.md](DEPLOY_QUICKSTART.md) - Quick deployment commands

📚 **Need details?** Full documentation:
- [DOCKER_DEPLOYMENT.md](DOCKER_DEPLOYMENT.md) - Comprehensive deployment guide

## One-Command Deployment

After setup, deploying is simple:

```bash
./deploy-docker.sh
```

This will:
1. ✅ Build Docker image for linux/amd64 (compatible with Linux servers)
2. ✅ Push to GitHub Container Registry
3. ✅ Deploy to your remote server
4. ✅ Start the container with auto-restart

## Files Overview

| File | Purpose |
|------|---------|
| `deploy-docker.sh` | Main deployment script (automated) |
| `deploy-docker-direct.sh` | Alternative: builds directly on server |
| `deploy-docker.config.example` | Configuration template |
| `deploy-docker.config` | Your configuration (create from example) |
| `docker/Dockerfile` | Multi-stage Docker image definition |
| `SETUP_CHECKLIST.md` | Complete setup guide for new machines |
| `DEPLOY_QUICKSTART.md` | Quick reference for common tasks |
| `DOCKER_DEPLOYMENT.md` | Full documentation with all details |

## First Time Setup (5 Minutes)

1. **Install Docker Desktop**
   ```bash
   brew install --cask docker
   ```

2. **Create GitHub Token**
   - Go to: https://github.com/settings/tokens
   - Scopes: `write:packages`, `read:packages`

3. **Login to Registry**
   ```bash
   export GITHUB_TOKEN="your_token"
   echo $GITHUB_TOKEN | docker login ghcr.io -u anerky2016 --password-stdin
   ```

4. **Setup SSH**
   ```bash
   ssh-copy-id root@205.198.69.199
   ```

5. **Setup Multiplatform Builder** (Mac only)
   ```bash
   docker buildx create --name multiplatform --use
   ```

6. **Create Config**
   ```bash
   cp deploy-docker.config.example deploy-docker.config
   ```

7. **Deploy!**
   ```bash
   ./deploy-docker.sh
   ```

See [SETUP_CHECKLIST.md](SETUP_CHECKLIST.md) for detailed instructions.

## Common Commands

```bash
# Deploy everything
./deploy-docker.sh

# Test build locally
./deploy-docker.sh --build-only

# Deploy without rebuilding
./deploy-docker.sh --deploy-only

# View logs
ssh root@205.198.69.199 'docker logs -f ssat-app'

# Restart app
ssh root@205.198.69.199 'docker restart ssat-app'

# Check if running
ssh root@205.198.69.199 'docker ps'
```

## Architecture

```
Local Mac (ARM64)
  ↓
Docker Buildx (multiplatform)
  ↓
Creates linux/amd64 image
  ↓
GitHub Container Registry
  ↓
Server pulls and runs
  ↓
Nginx (port 80) → Docker (port 3000)
```

## Key Features

- ✅ Multi-platform builds (Mac ARM64 → Linux AMD64)
- ✅ One-command deployment
- ✅ GitHub Container Registry integration
- ✅ Automatic container restart
- ✅ Environment variable support
- ✅ Multi-stage Dockerfile (optimized image size)

## Troubleshooting

**Platform mismatch error?**
```bash
docker buildx create --name multiplatform --use
```

**Authentication failed?**
```bash
echo $GITHUB_TOKEN | docker login ghcr.io -u anerky2016 --password-stdin
```

**SSH permission denied?**
```bash
ssh-copy-id root@205.198.69.199
```

See [DOCKER_DEPLOYMENT.md](DOCKER_DEPLOYMENT.md) for more troubleshooting.

## Support

- **Documentation:** Start with [SETUP_CHECKLIST.md](SETUP_CHECKLIST.md)
- **Issues:** Check [DOCKER_DEPLOYMENT.md](DOCKER_DEPLOYMENT.md) troubleshooting section
- **Quick Reference:** See [DEPLOY_QUICKSTART.md](DEPLOY_QUICKSTART.md)

---

**Ready to deploy?** Follow [SETUP_CHECKLIST.md](SETUP_CHECKLIST.md) step-by-step.
