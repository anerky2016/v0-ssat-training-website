# Docker Deployment - START HERE

## For AI Assistants (Claude Code)

If you're Claude or another AI assistant setting up Docker deployment on a new machine:

**👉 Read this file:** [CLAUDE_DEPLOYMENT_GUIDE.md](CLAUDE_DEPLOYMENT_GUIDE.md)

It contains complete step-by-step instructions optimized for AI execution, including:
- Full context and architecture
- Prerequisites checks
- Setup steps with expected outputs
- Error handling
- Troubleshooting guide

---

## For Humans

Choose based on your situation:

### 🆕 First Time Setup (New Machine)
**👉 Use:** [SETUP_CHECKLIST.md](SETUP_CHECKLIST.md)

A checkbox-based guide that walks you through:
1. Installing Docker Desktop
2. Creating GitHub token
3. Setting up SSH
4. Creating multiplatform builder
5. Deploying

**Time:** ~15-20 minutes

---

### ⚡ Quick Reference (Already Set Up)
**👉 Use:** [DEPLOY_QUICKSTART.md](DEPLOY_QUICKSTART.md)

Quick commands for:
- Deploying: `./deploy-docker.sh`
- Viewing logs
- Restarting containers

---

### 📚 Detailed Documentation
**👉 Use:** [DOCKER_DEPLOYMENT.md](DOCKER_DEPLOYMENT.md)

Comprehensive guide covering:
- Multi-platform builds
- Production setup with Nginx
- SSL configuration
- Environment variables
- All docker commands

---

### 📑 Overview & Index
**👉 Use:** [DOCKER_README.md](DOCKER_README.md)

Links to all documentation and quick reference.

---

## One-Command Deployment

After initial setup, deploying is simple:

```bash
./deploy-docker.sh
```

This builds, pushes to registry, and deploys to your server automatically.

---

## Quick Setup Summary

For the impatient:

```bash
# 1. Install Docker
brew install --cask docker && open -a Docker

# 2. Get GitHub token from: https://github.com/settings/tokens
export GITHUB_TOKEN="your_token"
echo $GITHUB_TOKEN | docker login ghcr.io -u anerky2016 --password-stdin

# 3. Setup SSH
ssh-copy-id root@205.198.69.199

# 4. Setup builder (Mac only)
docker buildx create --name multiplatform --use

# 5. Create config
cp deploy-docker.config.example deploy-docker.config

# 6. Deploy!
./deploy-docker.sh
```

See the appropriate guide above for detailed instructions.

---

**Not sure which guide to use?**

- 🤖 **AI Assistant:** [CLAUDE_DEPLOYMENT_GUIDE.md](CLAUDE_DEPLOYMENT_GUIDE.md)
- 👤 **Human (first time):** [SETUP_CHECKLIST.md](SETUP_CHECKLIST.md)
- ⚡ **Human (experienced):** [DEPLOY_QUICKSTART.md](DEPLOY_QUICKSTART.md)
