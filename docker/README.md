# Docker Setup for SSAT Training Website

## Quick Start

### Build and run with docker-compose:
```bash
cd docker
docker-compose up -d
```

### Build and run with Docker directly:
```bash
# Build the image
docker build -f docker/Dockerfile -t ssat-training-app .

# Run the container
docker run -p 3000:3000 ssat-training-app
```

## Commands

### Start the application:
```bash
docker-compose up -d
```

### Stop the application:
```bash
docker-compose down
```

### View logs:
```bash
docker-compose logs -f
```

### Rebuild after code changes:
```bash
docker-compose up -d --build
```

## Environment Variables

If you need environment variables, create a `.env.local` file in the root directory and uncomment the `env_file` line in `docker-compose.yml`.

## Port Configuration

The application runs on port 3000 by default. To change it, modify the port mapping in `docker-compose.yml`:
```yaml
ports:
  - "8080:3000"  # Maps host port 8080 to container port 3000
```

## Production Deployment

For production deployment, consider:
1. Using a reverse proxy (nginx) in front of the app
2. Setting up SSL certificates
3. Configuring environment-specific variables
4. Using Docker secrets for sensitive data
5. Setting up health checks and monitoring
