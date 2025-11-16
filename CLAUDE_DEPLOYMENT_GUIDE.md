# Docker Deployment Guide for Claude

This guide is optimized for Claude Code (or another AI assistant) to execute Docker deployment setup step-by-step on a new machine.

---

## CONTEXT

**Project:** SSAT Training Website (Next.js application)

**Deployment Architecture:**
- **Local Machine:** Apple Silicon Mac (ARM64) or Intel Mac
- **Target Server:** Linux server at 205.198.69.199 (AMD64/x86_64)
- **Container Registry:** GitHub Container Registry (ghcr.io)
- **Deployment Method:** Automated script that builds, pushes, and deploys

**Critical Requirement:** Must build linux/amd64 images from ARM64 Mac using Docker Buildx multiplatform builder.

---

## PREREQUISITES CHECK

Before starting, verify these prerequisites:

### Step 1: Check if Docker is installed
```bash
docker --version
```

**Expected:** Version info (e.g., "Docker version 24.0.0")

**If not installed:**
```bash
# On macOS
brew install --cask docker

# Then start Docker Desktop application
open -a Docker

# Wait 30-60 seconds for Docker daemon to start
# Verify it's running
docker ps
```

### Step 2: Check if Docker daemon is running
```bash
docker ps
```

**Expected:** Table showing containers (may be empty)

**If error "Cannot connect to Docker daemon":**
- Start Docker Desktop: `open -a Docker`
- Wait for it to fully initialize (watch menu bar icon)
- Try again: `docker ps`

### Step 3: Verify project directory
```bash
pwd
ls -la
```

**Expected:** Should be in `/Users/diz-air/git/v0-ssat-training-website` or similar project root

**Required files should exist:**
- `deploy-docker.sh`
- `deploy-docker.config.example`
- `docker/Dockerfile`
- `package.json`

---

## SETUP PHASE

### Step 4: Create GitHub Personal Access Token

**Action required from user:** This step requires manual action in browser.

**Instructions to give user:**
```
Please create a GitHub Personal Access Token:

1. Go to: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Set name: "Docker Deployment"
4. Set expiration: Your choice (30/60/90 days or no expiration)
5. Select scopes:
   ✅ write:packages
   ✅ read:packages
6. Click "Generate token"
7. Copy the token (starts with ghp_)

Please provide the token when ready.
```

**Wait for user to provide token.**

### Step 5: Login to GitHub Container Registry

**After receiving token from user:**

```bash
# Store token in environment variable (replace TOKEN_FROM_USER with actual token)
export GITHUB_TOKEN="TOKEN_FROM_USER"

# Login to GitHub Container Registry
echo $GITHUB_TOKEN | docker login ghcr.io -u anerky2016 --password-stdin
```

**Expected output:** `Login Succeeded`

**If error "unauthorized":**
- Verify token has correct scopes (write:packages, read:packages)
- Ask user to generate a new token
- Retry login command

### Step 6: Setup SSH Key Authentication

**Check if SSH key exists:**
```bash
ls -la ~/.ssh/id_*.pub
```

**If no SSH key exists, create one:**
```bash
ssh-keygen -t ed25519 -C "deployment-key"
# Press Enter for default location
# Press Enter twice for no passphrase (or user can set one)
```

**Copy SSH key to server:**

**Action required from user:** This step requires server password.

```bash
# Copy SSH key to server
ssh-copy-id root@205.198.69.199
```

**User will be prompted for server password - this is expected.**

**Verify passwordless SSH works:**
```bash
ssh -o BatchMode=yes -o ConnectTimeout=5 root@205.198.69.199 'echo "SSH connection successful!"'
```

**Expected output:** `SSH connection successful!`

**If error "Permission denied":**
- Ask user if they have server access
- Verify server IP is correct: 205.198.69.199
- Ask user to manually test: `ssh root@205.198.69.199`

### Step 7: Setup Server (One-Time)

**SSH to server and verify Docker is installed:**

```bash
ssh root@205.198.69.199 'docker --version'
```

**If Docker not found, install it:**
```bash
ssh root@205.198.69.199 'curl -fsSL https://get.docker.com -o get-docker.sh && sudo sh get-docker.sh'
```

**Login to GitHub Container Registry on server:**
```bash
ssh root@205.198.69.199 "echo $GITHUB_TOKEN | docker login ghcr.io -u anerky2016 --password-stdin"
```

**Create deployment directory on server:**
```bash
ssh root@205.198.69.199 'mkdir -p /v0-ssat-training-website'
```

**Verify directory created:**
```bash
ssh root@205.198.69.199 'ls -la /v0-ssat-training-website'
```

### Step 8: Setup Multiplatform Builder (CRITICAL for Mac)

**Check current platform:**
```bash
uname -m
```

**If output is `arm64` (Apple Silicon Mac), multiplatform builder is REQUIRED.**

**Create multiplatform builder:**
```bash
# Create builder
docker buildx create --name multiplatform --use

# Verify it's active
docker buildx ls
```

**Expected output:** Should show `multiplatform *` (asterisk means active)

**Example output:**
```
NAME/NODE       DRIVER/ENDPOINT             STATUS  BUILDKIT PLATFORMS
multiplatform * docker-container
  multiplatform0 unix:///var/run/docker.sock running v0.12.0  linux/arm64, linux/amd64, ...
```

**If error "buildx: command not found":**
- Docker version is too old
- Update Docker Desktop to latest version

### Step 9: Create Configuration File

**Check if config already exists:**
```bash
ls -la deploy-docker.config
```

**If exists:**
- Read it to verify settings
- Skip to Step 10

**If doesn't exist, create it:**
```bash
cp deploy-docker.config.example deploy-docker.config
```

**Verify default configuration:**
```bash
cat deploy-docker.config
```

**Expected values:**
- `DOCKER_REGISTRY="ghcr.io"`
- `DOCKER_REGISTRY_USER="anerky2016"`
- `SERVER_IP="205.198.69.199"`
- `SERVER_USER="root"`
- `CONTAINER_NAME="ssat-app"`
- `HOST_PORT="3000"` (or `"80"` for direct access)

**These defaults should work. No changes needed unless user specifies.**

### Step 10: (Optional) Setup Environment Variables

**Check if .env.local exists:**
```bash
ls -la .env.local
```

**If doesn't exist and user needs environment variables:**

Ask user: "Do you need to configure environment variables (API keys, secrets, etc.)?"

**If yes:**
```bash
# Create .env.local (user will provide values)
nano .env.local
```

**Common variables for this project:**
```env
OPENAI_API_KEY=sk-xxxxx
VOLCENGINE_ACCESS_KEY_ID=xxxxx
VOLCENGINE_SECRET_ACCESS_KEY=xxxxx
NEXT_PUBLIC_API_URL=https://api.example.com
```

**Note:** .env.local is in .gitignore and won't be committed.

---

## DEPLOYMENT PHASE

### Step 11: Test Build Locally (Recommended First Time)

**Build image without deploying:**
```bash
./deploy-docker.sh --build-only
```

**This will:**
1. Build Docker image for linux/amd64 platform
2. Tag image for registry
3. Stop before pushing/deploying

**Expected output should include:**
- ✅ "Building for linux/amd64 platform"
- ✅ "Docker image built successfully for linux/amd64"
- ✅ "Build complete! (--build-only mode)"

**If error "platform not supported":**
- Verify multiplatform builder is active: `docker buildx ls`
- Recreate builder: `docker buildx create --name multiplatform --use`
- Try build again

**If error "Cannot connect to Docker daemon":**
- Start Docker Desktop: `open -a Docker`
- Wait 30 seconds
- Try build again

**If build succeeds, verify platform:**
```bash
docker image inspect ssat-training-app:latest --format '{{.Architecture}}'
```

**Expected output:** `amd64`

### Step 12: Full Deployment

**Deploy to server:**
```bash
./deploy-docker.sh
```

**This will execute these steps automatically:**

1. **Build** Docker image for linux/amd64
2. **Push** to GitHub Container Registry (ghcr.io)
3. **SSH** to server
4. **Pull** latest image on server
5. **Stop** old container (if running)
6. **Start** new container
7. **Verify** container is running

**Expected output timeline:**
- 🔨 Step 1: Building Docker image... (2-5 minutes)
- 📤 Step 2: Pushing to container registry... (1-3 minutes)
- 🚢 Step 3: Deploying to server... (30 seconds)
- ✅ Deployment finished!

**Successful deployment output should show:**
```
✅ Container is running!

📊 Container Status:
NAMES     STATUS              PORTS
ssat-app  Up X seconds        0.0.0.0:3000->3000/tcp

📝 Recent logs:
[logs showing Next.js starting up]

✅ Deployment finished!

🌐 Your app should now be running at:
   http://205.198.69.199:3000
```

### Step 13: Verify Deployment

**Check container is running on server:**
```bash
ssh root@205.198.69.199 'docker ps'
```

**Expected:** Should show `ssat-app` container with status "Up"

**Check container logs:**
```bash
ssh root@205.198.69.199 'docker logs --tail 50 ssat-app'
```

**Expected:** Should show Next.js application logs, no errors

**Verify image platform (should be amd64):**
```bash
ssh root@205.198.69.199 'docker image inspect ssat-training-app:latest --format "{{.Architecture}}"'
```

**Expected output:** `amd64`

**Test application endpoint:**
```bash
ssh root@205.198.69.199 'curl -I http://localhost:3000'
```

**Expected:** HTTP 200 OK or similar successful response

---

## POST-DEPLOYMENT

### Step 14: Inform User

**Provide user with:**
```
✅ Deployment successful!

Your application is now running at:
🌐 http://205.198.69.199:3000

Useful commands:
📝 View logs:    ssh root@205.198.69.199 'docker logs -f ssat-app'
🔄 Restart:      ssh root@205.198.69.199 'docker restart ssat-app'
🛑 Stop:         ssh root@205.198.69.199 'docker stop ssat-app'
📊 Status:       ssh root@205.198.69.199 'docker ps'

To deploy again: ./deploy-docker.sh
```

---

## TROUBLESHOOTING GUIDE

### Error: "Cannot connect to Docker daemon"

**Solution:**
```bash
# Start Docker Desktop
open -a Docker

# Wait 30-60 seconds
sleep 30

# Verify
docker ps
```

### Error: "no matching manifest for linux/amd64"

**Cause:** Built ARM64 image but server needs AMD64

**Solution:**
```bash
# Setup multiplatform builder
docker buildx create --name multiplatform --use

# Verify it's active
docker buildx ls

# Build again
./deploy-docker.sh --build-only
```

### Error: "unauthorized: authentication required"

**Solution:**
```bash
# Re-login to registry
echo $GITHUB_TOKEN | docker login ghcr.io -u anerky2016 --password-stdin

# If token expired, ask user for new token
```

### Error: "Permission denied" (SSH)

**Solution:**
```bash
# Copy SSH key again
ssh-copy-id root@205.198.69.199

# Verify
ssh root@205.198.69.199 'echo "SSH works"'
```

### Error: "address already in use" (Port conflict)

**Cause:** Port 3000 (or 80) already in use on server

**Solution:**
```bash
# Check what's using the port
ssh root@205.198.69.199 'lsof -i :3000'

# Option 1: Stop the conflicting service
ssh root@205.198.69.199 'docker stop ssat-app'

# Option 2: Change port in deploy-docker.config
# Edit HOST_PORT to a different port (e.g., 3001, 8080)
```

### Error: Build fails with "no space left on device"

**Solution:**
```bash
# Clean Docker cache locally
docker system prune -af

# Clean cache on server
ssh root@205.198.69.199 'docker system prune -af'
```

### Container starts but immediately stops

**Check logs for errors:**
```bash
ssh root@205.198.69.199 'docker logs ssat-app'
```

**Common causes:**
- Missing environment variables (.env.local)
- Application error in code
- Port already in use

---

## VERIFICATION CHECKLIST

After completing all steps, verify:

- [ ] Docker Desktop installed and running
- [ ] GitHub Container Registry authentication successful
- [ ] SSH key authentication working (passwordless)
- [ ] Server has Docker installed
- [ ] Multiplatform builder created and active (Mac only)
- [ ] deploy-docker.config file created
- [ ] Build completes successfully (--build-only)
- [ ] Full deployment succeeds
- [ ] Container running on server (`docker ps`)
- [ ] Application accessible at http://205.198.69.199:3000
- [ ] Image platform is amd64 (not arm64)

---

## QUICK REFERENCE

### Deployment Commands

```bash
# Full deployment (build + push + deploy)
./deploy-docker.sh

# Test build only
./deploy-docker.sh --build-only

# Deploy without rebuilding
./deploy-docker.sh --deploy-only
```

### Server Management

```bash
# View logs (follow mode)
ssh root@205.198.69.199 'docker logs -f ssat-app'

# Restart container
ssh root@205.198.69.199 'docker restart ssat-app'

# Stop container
ssh root@205.198.69.199 'docker stop ssat-app'

# Check container status
ssh root@205.198.69.199 'docker ps'

# Check container resource usage
ssh root@205.198.69.199 'docker stats ssat-app --no-stream'
```

### Debugging

```bash
# Verify image platform
docker image inspect ssat-training-app:latest --format '{{.Architecture}}'

# Check buildx builders
docker buildx ls

# Inspect remote image
docker buildx imagetools inspect ghcr.io/anerky2016/ssat-training-app:latest

# Test SSH connection
ssh -v root@205.198.69.199 'echo "SSH test"'

# Check Docker daemon status
docker info
```

---

## ALTERNATIVE: Direct Server Build (No Registry)

If GitHub Container Registry has issues, use direct server build:

```bash
./deploy-docker-direct.sh
```

**This method:**
- Syncs files to server via rsync
- Builds directly on server (no registry needed)
- Deploys immediately

**Trade-offs:**
- ✅ No registry authentication needed
- ✅ Faster for small changes
- ❌ Server needs build resources
- ❌ Build time happens on server

---

## NOTES FOR CLAUDE

### Execution Order
1. Always run prerequisites checks first
2. Don't skip multiplatform builder on Mac (check with `uname -m`)
3. Verify each step completes before moving to next
4. Check for errors in command output

### User Interaction Points
- GitHub token creation (manual)
- Server password for ssh-copy-id (manual, first time)
- Environment variable configuration (optional)

### Critical Steps
- **Step 8** (multiplatform builder) is CRITICAL for Mac
- **Step 5** (registry login) must succeed before deployment
- **Step 6** (SSH setup) must work for remote deployment

### Error Handling
- If any step fails, refer to TROUBLESHOOTING GUIDE
- Don't proceed with deployment if build fails
- Always verify container is running after deployment

### Platform Verification
Always verify the built image is `linux/amd64`:
```bash
docker image inspect IMAGE_NAME --format '{{.Architecture}}'
```
Should output: `amd64` (NOT `arm64`)

---

**End of Guide**

This guide should enable successful Docker deployment from a new machine following these steps in order.
