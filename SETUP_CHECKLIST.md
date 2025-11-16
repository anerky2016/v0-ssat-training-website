# Docker Deployment - Setup Checklist

Use this checklist to set up Docker deployment on a new machine.

## Prerequisites Checklist

- [ ] macOS computer (for Mac instructions; adapt for Linux/Windows)
- [ ] GitHub account with access to this repository
- [ ] Server with SSH access (IP: 205.198.69.199 or your own)
- [ ] Server has Docker installed

## Setup Steps (First Time)

### Step 1: Install Docker Desktop ✅

```bash
# Install via Homebrew
brew install --cask docker
```

**Or** download from: https://www.docker.com/products/docker-desktop

- [ ] Docker Desktop installed
- [ ] Docker Desktop started (wait for it to fully initialize)
- [ ] Verify: `docker --version` shows version info

---

### Step 2: Create GitHub Personal Access Token ✅

1. Go to: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Settings:
   - **Name:** `Docker Deployment`
   - **Expiration:** Choose based on your preference (30/60/90 days or no expiration)
   - **Scopes:** Check these boxes:
     - ✅ `write:packages`
     - ✅ `read:packages`
4. Click "Generate token"
5. **IMPORTANT:** Copy the token immediately (you won't see it again)

- [ ] Token created
- [ ] Token copied and saved securely

---

### Step 3: Login to GitHub Container Registry ✅

```bash
# Replace ghp_xxxxx with your actual token
export GITHUB_TOKEN="ghp_xxxxx"

# Login to GitHub Container Registry
echo $GITHUB_TOKEN | docker login ghcr.io -u anerky2016 --password-stdin
```

Expected output: `Login Succeeded`

- [ ] Successfully logged in to ghcr.io
- [ ] No authentication errors

---

### Step 4: Setup SSH Key Authentication ✅

```bash
# Copy your SSH key to the server (enter password once)
ssh-copy-id root@205.198.69.199

# Test passwordless SSH
ssh root@205.198.69.199 'echo "SSH works!"'
```

If you don't have an SSH key yet:

```bash
# Generate SSH key (if you don't have one)
ssh-keygen -t ed25519 -C "your_email@example.com"

# Press Enter to accept default location
# Optionally set a passphrase (or press Enter for no passphrase)
```

- [ ] SSH key exists (`~/.ssh/id_ed25519` or `~/.ssh/id_rsa`)
- [ ] SSH key copied to server
- [ ] Passwordless SSH works (no password prompt)

---

### Step 5: Setup Server (One-Time) ✅

SSH to your server and ensure Docker is installed:

```bash
# SSH to server
ssh root@205.198.69.199

# Check if Docker is installed
docker --version

# If not installed, install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Login to GitHub Container Registry on server
export GITHUB_TOKEN="ghp_xxxxx"  # Use your token
echo $GITHUB_TOKEN | docker login ghcr.io -u anerky2016 --password-stdin

# Create deployment directory
mkdir -p /v0-ssat-training-website

# Exit server
exit
```

- [ ] Docker installed on server
- [ ] Server logged in to ghcr.io
- [ ] Deployment directory created (`/v0-ssat-training-website`)

---

### Step 6: Setup Multiplatform Builder (Mac Only) ✅

**CRITICAL for Apple Silicon (M1/M2/M3) Mac users:**

```bash
# Create multiplatform builder (one-time setup)
docker buildx create --name multiplatform --use

# Verify it's active
docker buildx ls
```

You should see `multiplatform *` in the output (the `*` means it's the active builder).

**Why?** This allows your ARM64 Mac to build AMD64 images for Intel/AMD Linux servers.

- [ ] Multiplatform builder created
- [ ] Builder is active (shown with `*` in `docker buildx ls`)

---

### Step 7: Create Configuration File ✅

```bash
# Copy example config to create your config
cp deploy-docker.config.example deploy-docker.config

# The defaults should work, but you can edit if needed
nano deploy-docker.config
```

**Default configuration:**
- Registry: `ghcr.io/anerky2016`
- Server: `205.198.69.199`
- Port: `3000`
- Container name: `ssat-app`

- [ ] `deploy-docker.config` file created
- [ ] Configuration reviewed and correct for your setup

---

### Step 8: (Optional) Create Environment Variables ✅

If your app needs environment variables:

```bash
# Create .env.local file
nano .env.local
```

Example contents:
```env
OPENAI_API_KEY=sk-xxxxx
NEXT_PUBLIC_API_URL=https://api.example.com
VOLCENGINE_ACCESS_KEY_ID=xxxxx
VOLCENGINE_SECRET_ACCESS_KEY=xxxxx
```

**Note:** This file is already in `.gitignore` and won't be committed.

- [ ] Environment variables configured (if needed)
- [ ] `.env.local` created (if needed)

---

## Deployment Test

Now test your setup with a deployment:

```bash
# Full deployment
./deploy-docker.sh

# Or test build only first
./deploy-docker.sh --build-only
```

Expected flow:
1. ✅ Building Docker image for linux/amd64
2. ✅ Pushing to GitHub Container Registry
3. ✅ Deploying to server
4. ✅ Container running

- [ ] Build completes successfully
- [ ] Push to registry succeeds
- [ ] Deployment to server succeeds
- [ ] App accessible at `http://205.198.69.199:3000`

---

## Verification Commands

After deployment, verify everything works:

```bash
# Check container is running on server
ssh root@205.198.69.199 'docker ps'

# View container logs
ssh root@205.198.69.199 'docker logs ssat-app'

# Check image platform (should show linux/amd64)
docker buildx imagetools inspect ghcr.io/anerky2016/ssat-training-app:latest
```

- [ ] Container shows as running
- [ ] Logs show no errors
- [ ] Platform is `linux/amd64`

---

## Common Issues & Solutions

### Issue: "Cannot connect to Docker daemon"
**Solution:** Start Docker Desktop and wait for it to fully initialize

### Issue: "unauthorized: authentication required"
**Solution:** Re-run the GitHub Container Registry login:
```bash
echo $GITHUB_TOKEN | docker login ghcr.io -u anerky2016 --password-stdin
```

### Issue: "Permission denied" (SSH)
**Solution:** Run `ssh-copy-id root@205.198.69.199` again

### Issue: "no matching manifest for linux/amd64"
**Solution:** Make sure multiplatform builder is set up and active:
```bash
docker buildx create --name multiplatform --use
docker buildx ls  # Should show multiplatform with *
```

### Issue: "port already in use"
**Solution:** Check what's using the port and stop it, or change `HOST_PORT` in `deploy-docker.config`

---

## Quick Reference

After setup is complete, deploying is simple:

```bash
# Deploy everything
./deploy-docker.sh

# Build only (test locally)
./deploy-docker.sh --build-only

# Deploy only (skip build)
./deploy-docker.sh --deploy-only
```

**View logs:**
```bash
ssh root@205.198.69.199 'docker logs -f ssat-app'
```

**Restart app:**
```bash
ssh root@205.198.69.199 'docker restart ssat-app'
```

---

## Complete Setup Summary

Once all checkboxes above are complete, you have:

✅ Docker Desktop installed and running
✅ GitHub Container Registry authentication configured
✅ SSH key authentication set up
✅ Server prepared with Docker
✅ Multiplatform builder configured (Mac)
✅ Configuration file created
✅ Successful test deployment

**You're ready to deploy!** Just run: `./deploy-docker.sh`

---

## For Team Members

If you're a new team member setting this up:

1. Follow this checklist from top to bottom
2. Don't skip the multiplatform builder step (Step 6) if you're on a Mac
3. Test with `--build-only` first before doing a full deployment
4. Ask for the GitHub token from your team lead
5. Verify your server IP and credentials

**Time estimate:** 15-20 minutes for complete setup

---

## Documentation

- **Quick Start:** See `DEPLOY_QUICKSTART.md`
- **Full Documentation:** See `DOCKER_DEPLOYMENT.md`
- **Direct Server Build:** See `deploy-docker-direct.sh` (alternative method)

---

**Last Updated:** 2025-01-20
