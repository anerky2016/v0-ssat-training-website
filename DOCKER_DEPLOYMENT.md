# Docker Deployment Guide

## Prerequisites

### Install Docker

**macOS:**
1. Download Docker Desktop: https://www.docker.com/products/docker-desktop
2. Install and start Docker Desktop
3. Verify installation:
   ```bash
   docker --version
   docker compose version
   ```

**Linux (Ubuntu/Debian):**
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

**Windows:**
1. Download Docker Desktop: https://www.docker.com/products/docker-desktop
2. Install and enable WSL 2
3. Start Docker Desktop

## Quick Start

### Option 1: Using Docker Compose (Recommended)

```bash
# Navigate to docker folder
cd docker

# Build and start the container
docker compose up -d --build

# View logs
docker compose logs -f

# Stop the container
docker compose down
```

### Option 2: Using Docker Commands Directly

```bash
# Build the image
docker build -f docker/Dockerfile -t ssat-training-app .

# Run the container
docker run -d -p 3000:3000 --name ssat-app ssat-training-app

# View logs
docker logs -f ssat-app

# Stop the container
docker stop ssat-app
docker rm ssat-app
```

## Docker Commands Reference

### Container Management

```bash
# Start containers
docker compose up -d

# Stop containers
docker compose down

# Restart containers
docker compose restart

# View running containers
docker compose ps

# View all containers
docker ps -a
```

### Logs and Debugging

```bash
# View logs (follow mode)
docker compose logs -f

# View logs for specific service
docker compose logs -f web

# Execute command in running container
docker compose exec web sh

# Check container resource usage
docker stats
```

### Building and Updating

```bash
# Rebuild after code changes
docker compose up -d --build

# Force rebuild (ignore cache)
docker compose build --no-cache

# Pull latest base images
docker compose pull
```

## Environment Variables

### Using .env.local file

1. Create `.env.local` in the project root:
   ```env
   NEXT_PUBLIC_API_URL=https://api.example.com
   DATABASE_URL=postgresql://...
   SECRET_KEY=your-secret-key
   ```

2. Update `docker/docker-compose.yml` to include env file:
   ```yaml
   services:
     web:
       env_file:
         - ../.env.local
   ```

### Passing environment variables directly

```bash
# In docker-compose.yml
environment:
  - NODE_ENV=production
  - NEXT_PUBLIC_API_URL=https://api.example.com

# Or via command line
docker run -e NODE_ENV=production -e API_KEY=secret ssat-training-app
```

## Port Configuration

Default port is 3000. To change:

**In docker-compose.yml:**
```yaml
ports:
  - "8080:3000"  # Maps host:container
```

**Via docker run:**
```bash
docker run -p 8080:3000 ssat-training-app
```

## Production Deployment

### Deploy to Server

1. **Copy files to server:**
   ```bash
   rsync -avz --exclude 'node_modules' --exclude '.next' \
     ./ user@server:/path/to/app/
   ```

2. **On the server:**
   ```bash
   cd /path/to/app/docker
   docker compose up -d --build
   ```

### Using Docker Registry

1. **Tag and push image:**
   ```bash
   docker tag ssat-training-app:latest your-registry/ssat-training-app:latest
   docker push your-registry/ssat-training-app:latest
   ```

2. **On production server:**
   ```bash
   docker pull your-registry/ssat-training-app:latest
   docker run -d -p 3000:3000 your-registry/ssat-training-app:latest
   ```

### Nginx Reverse Proxy (Recommended for Production)

Create `nginx.conf`:
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Run nginx alongside:
```yaml
# docker-compose.yml
services:
  web:
    # ... existing config

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf
    depends_on:
      - web
```

## Advanced Configuration

### Multi-Environment Setup

```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  web:
    build:
      context: ..
      dockerfile: docker/Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    restart: always
```

```bash
# Use specific compose file
docker compose -f docker-compose.prod.yml up -d
```

### Health Checks

Add to `docker-compose.yml`:
```yaml
services:
  web:
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:3000"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

### Persistent Volumes

```yaml
services:
  web:
    volumes:
      - app-logs:/app/logs
      - app-data:/app/data

volumes:
  app-logs:
  app-data:
```

## Troubleshooting

### Container won't start

```bash
# Check logs
docker compose logs

# Check container status
docker compose ps

# Inspect container
docker inspect <container-id>
```

### Port already in use

```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or change port in docker-compose.yml
```

### Build fails

```bash
# Clear Docker cache
docker system prune -a

# Rebuild without cache
docker compose build --no-cache
```

### Out of disk space

```bash
# Remove unused containers, images, networks
docker system prune

# Remove everything (careful!)
docker system prune -a --volumes
```

## Performance Optimization

### Reduce Image Size

1. Use `.dockerignore` (already configured)
2. Multi-stage builds (already implemented)
3. Use alpine base images (already using node:20-alpine)

### Layer Caching

Order Dockerfile commands from least to most frequently changed:
- Package files first
- Source code last

## Security Best Practices

1. **Run as non-root user** (already configured)
2. **Use specific image versions** (using node:20-alpine)
3. **Scan for vulnerabilities:**
   ```bash
   docker scan ssat-training-app
   ```
4. **Keep base images updated:**
   ```bash
   docker compose pull
   docker compose up -d --build
   ```
5. **Don't expose sensitive data** (use .env files, not hardcode)

## Monitoring

### View Resource Usage

```bash
# Real-time stats
docker stats

# Container processes
docker compose top
```

### Log Management

```bash
# Limit log size in docker-compose.yml
services:
  web:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

## CI/CD Integration

### GitHub Actions Example

```yaml
# .github/workflows/docker-build.yml
name: Build Docker Image

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Build Docker image
        run: docker build -f docker/Dockerfile -t ssat-app .

      - name: Run tests in container
        run: docker run ssat-app npm test
```

## Resources

- Docker Documentation: https://docs.docker.com/
- Docker Compose: https://docs.docker.com/compose/
- Next.js Docker: https://nextjs.org/docs/deployment#docker-image
- Best Practices: https://docs.docker.com/develop/dev-best-practices/

## Support

For issues or questions:
1. Check Docker logs: `docker compose logs -f`
2. Verify Docker is running: `docker ps`
3. Check Docker version compatibility: `docker --version`
