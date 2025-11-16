# Docker Deployment Guide - Automated Deployment

This guide covers how to use the automated Docker deployment script to deploy your SSAT Training Website to a remote server.

## Quick Start

### 1. One-Time Setup

**Step 1: Create configuration file**
```bash
cp deploy-docker.config.example deploy-docker.config
```

**Step 2: Edit the configuration** (optional - defaults are already set)
```bash
# Edit deploy-docker.config to customize:
# - Registry settings (Docker Hub, GitHub, or private)
# - Server IP and credentials
# - Port mappings
```

**Step 3: Login to container registry**

Choose one based on your registry:

**For GitHub Container Registry (Recommended):**
```bash
# Create a GitHub Personal Access Token with 'write:packages' permission
# at https://github.com/settings/tokens

export GITHUB_TOKEN="your_github_token"
export GITHUB_USER="anerky2016"

echo $GITHUB_TOKEN | docker login ghcr.io -u $GITHUB_USER --password-stdin
```

**For Docker Hub:**
```bash
docker login
# Enter your Docker Hub username and password
```

**Step 4: Ensure SSH access to server**
```bash
# Test SSH connection
ssh root@205.198.69.199

# Optional: Set up SSH key for passwordless login
ssh-copy-id root@205.198.69.199
```

### 2. Deploy!

**Full deployment (build, push, and deploy):**
```bash
./deploy-docker.sh
```

That's it! The script will:
1. ✅ Build the Docker image locally
2. ✅ Tag and push to container registry
3. ✅ SSH to your server
4. ✅ Pull the latest image
5. ✅ Stop old container (if running)
6. ✅ Start new container
7. ✅ Show status and logs

## Advanced Usage

### Build Only (no deployment)
```bash
./deploy-docker.sh --build-only
```
Useful for testing the build locally.

### Deploy Only (skip build)
```bash
./deploy-docker.sh --deploy-only
```
Useful when the image is already built and pushed.

### Manual Server Setup (First Time Only)

If Docker isn't installed on your server:

```bash
# SSH to server
ssh root@205.198.69.199

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Verify installation
docker --version

# Optional: Login to registry on server (if using private registry)
echo $GITHUB_TOKEN | docker login ghcr.io -u $GITHUB_USER --password-stdin
```

## Configuration Options

Edit `deploy-docker.config` to customize:

```bash
# Docker Image
DOCKER_IMAGE_NAME="ssat-training-app"

# Registry (choose one)
DOCKER_REGISTRY="ghcr.io"              # GitHub Container Registry
# DOCKER_REGISTRY="docker.io"          # Docker Hub
# DOCKER_REGISTRY="registry.yoursite.com"  # Private registry

DOCKER_REGISTRY_USER="anerky2016"

# Container settings
CONTAINER_NAME="ssat-app"
CONTAINER_PORT="3000"  # Port inside container
HOST_PORT="80"         # Port on host (80 for HTTP, 443 for HTTPS)

# Server settings
SERVER_IP="205.198.69.199"
SERVER_USER="root"
SERVER_PATH="/v0-ssat-training-website"
```

## Environment Variables

If your app needs environment variables (API keys, database URLs, etc.):

**Step 1: Create `.env.local` file locally:**
```bash
# .env.local
OPENAI_API_KEY=your_key_here
NEXT_PUBLIC_API_URL=https://api.example.com
DATABASE_URL=postgresql://...
```

**Step 2: The deployment script automatically copies it to the server!**

The script will:
- Copy `.env.local` to the server
- Pass it to the Docker container with `--env-file` flag

**Important:** Make sure `.env.local` is in your `.gitignore` (it already is).

## Monitoring and Management

### View logs (real-time)
```bash
ssh root@205.198.69.199 'docker logs -f ssat-app'
```

### Check container status
```bash
ssh root@205.198.69.199 'docker ps'
```

### Restart container
```bash
ssh root@205.198.69.199 'docker restart ssat-app'
```

### Stop container
```bash
ssh root@205.198.69.199 'docker stop ssat-app'
```

### Access container shell
```bash
ssh root@205.198.69.199 'docker exec -it ssat-app sh'
```

## Production Setup with Nginx (Recommended)

For production, use Nginx as a reverse proxy:

**On your server:**

```bash
# Install Nginx
sudo apt update
sudo apt install nginx

# Create Nginx configuration
sudo nano /etc/nginx/sites-available/ssat-app
```

**Nginx config:**
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

**Enable and restart Nginx:**
```bash
sudo ln -s /etc/nginx/sites-available/ssat-app /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

**Update deploy-docker.config:**
```bash
# Change HOST_PORT from 80 to 3000 since Nginx will handle port 80
HOST_PORT="3000"
```

## SSL/HTTPS with Let's Encrypt (Recommended)

```bash
# On server
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal is configured automatically
```

## Troubleshooting

### Deployment fails with "permission denied"
```bash
# Ensure SSH key is set up
ssh-copy-id root@205.198.69.199

# Or check SSH connection
ssh root@205.198.69.199
```

### Registry push fails with "unauthorized"
```bash
# Re-login to registry
echo $GITHUB_TOKEN | docker login ghcr.io -u $GITHUB_USER --password-stdin

# Or for Docker Hub
docker login
```

### Container won't start
```bash
# Check logs
ssh root@205.198.69.199 'docker logs ssat-app'

# Check if port is in use
ssh root@205.198.69.199 'lsof -i :80'
```

### Environment variables not working
```bash
# Verify .env.local was copied
ssh root@205.198.69.199 'ls -la /v0-ssat-training-website/.env.local'

# Check container environment
ssh root@205.198.69.199 'docker exec ssat-app env'
```

## Workflow Comparison

### Traditional Deployment (deploy.sh)
- Uses PM2 process manager
- Builds on server
- Good for: Node.js-only deployments

### Docker Deployment (deploy-docker.sh)
- Uses Docker containers
- Builds locally or in CI/CD
- Good for: Production, scalability, consistency

### When to use which?

**Use PM2 deployment** (`deploy.sh`) if:
- Simple setup needed
- Server has enough resources to build
- Don't need containerization

**Use Docker deployment** (`deploy-docker.sh`) if:
- Want production-grade setup
- Need consistency across environments
- Plan to scale horizontally
- Want easy rollbacks

## Automation with GitHub Actions (Future)

You can automate deployment on every push:

```yaml
# .github/workflows/deploy.yml
name: Deploy to Server

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Login to GitHub Container Registry
        uses: docker/login-action@v1
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Build and push
        run: |
          docker build -f docker/Dockerfile -t ghcr.io/anerky2016/ssat-training-app:latest .
          docker push ghcr.io/anerky2016/ssat-training-app:latest

      - name: Deploy to server
        uses: appleboy/ssh-action@master
        with:
          host: 205.198.69.199
          username: root
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /v0-ssat-training-website
            ./deploy-docker.sh --deploy-only
```

## Support

For issues:
1. Check the troubleshooting section above
2. View server logs: `ssh root@205.198.69.199 'docker logs ssat-app'`
3. Check Docker status: `ssh root@205.198.69.199 'docker ps -a'`
4. Verify network: `curl http://205.198.69.199:80`

---

Last Updated: 2025-01-20
