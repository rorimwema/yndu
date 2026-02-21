# Yndu DevOps Guide

## Docker & CI/CD Setup

This document outlines the Docker containerization and CI/CD pipeline strategy for the Yndu fresh
produce delivery system.

---

## Table of Contents

1. [Docker Architecture](#docker-architecture)
2. [Dockerfiles](#dockerfiles)
3. [Docker Compose](#docker-compose)
4. [CI/CD Pipeline](#cicd-pipeline)
5. [Environment Configuration](#environment-configuration)
6. [Deployment](#deployment)
7. [Monitoring](#monitoring)

---

## Docker Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        PRODUCTION                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │  Vue 3 UI   │  │  GraphQL    │  │  Deno API               │  │
│  │  (Nginx)    │  │  Gateway    │  │  (Oak)                  │  │
│  └──────┬──────┘  └──────┬──────┘  └───────────┬─────────────┘  │
└─────────┼────────────────┼─────────────────────┼────────────────┘
          │                │                     │
          ▼                ▼                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                      CONTAINER ORCHESTRATION                    │
│                   (Docker Swarm / Kubernetes)                   │
└─────────────────────────────────────────────────────────────────┘
          │                │                     │
          ▼                ▼                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                        INFRASTRUCTURE                            │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │   PostgreSQL    │  │      Redis      │  │   Monitoring   │  │
│  │   (Primary)     │  │   (Cache/Bus)   │  │   (Prometheus) │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Dockerfiles

### Backend Dockerfile (Deno)

```dockerfile
# Dockerfile.deno
FROM deno:1.41-alpine AS builder

WORKDIR /app

# Install dependencies
COPY deno.json deno.lock ./
RUN deno cache --reload --lock=deno.lock mod.ts

# Copy source
COPY src/ ./src/
COPY services/ ./services/

# Build
RUN deno compile --allow-all --output /app/yndu-api mod.ts

# Production image
FROM deno:1.41-alpine AS production

WORKDIR /app

# Security: Run as non-root user
RUN addgroup --gid 1000 --system deno && \
    adduser --uid 1000 --system --gid deno deno

# Copy binary from builder
COPY --from=builder /app/yndu-api /app/yndu-api

# Environment variables
ENV DENO_NO_PACKAGE_JSON=true
ENV PORT=8000
ENV HOST=0.0.0.0

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8000/health || exit 1

# Run as non-root
USER deno
EXPOSE 8000

CMD ["/app/yndu-api"]
```

### Frontend Dockerfile (Nginx)

```dockerfile
# Dockerfile.frontend
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./
RUN npm ci

# Copy source
COPY src/ ./src/
COPY public/ ./public/

# Build
RUN npm run build

# Production stage
FROM nginx:alpine AS production

# Copy custom nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Security: Run as non-root
RUN adduser -D -g '' nginxuser && \
    chown -R nginxuser:nginxuser /usr/share/nginx/html && \
    chown -R nginxuser:nginxuser /var/cache/nginx && \
    chown -R nginxuser:nginxuser /var/log/nginx

USER nginxuser
EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:80/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
```

### Nginx Configuration

```nginx
# nginx.conf
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Logging
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;
    error_log /var/log/nginx/error.log warn;

    # Performance
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml application/json application/javascript 
               application/rss+xml application/atom+xml image/svg+xml;

    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;

        # Health check endpoint
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }

        # Vue Router history mode
        location / {
            try_files $uri $uri/ /index.html;
        }

        # Static assets caching
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    }
}
```

---

## Docker Compose

### Development

```yaml
# docker-compose.yml
version: '3.9'

services:
  # Frontend Vue 3 Application
  frontend:
    build:
      context: ./src/presentation
      dockerfile: Dockerfile.dev
    ports:
      - '3000:3000'
    volumes:
      - ./src/presentation:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
      - VITE_API_URL=http://localhost:8000
      - VITE_WS_URL=ws://localhost:8000
    depends_on:
      - backend
    networks:
      - yndu-network

  # Backend Deno API
  backend:
    build:
      context: .
      dockerfile: Dockerfile.deno
    ports:
      - '8000:8000'
    volumes:
      - ./src:/app/src
      - ./services:/app/services
    environment:
      - DENO_ENV=development
      - DATABASE_URL=postgres://postgres:password@postgres:5432/yndu
      - REDIS_URL=redis://redis:6379
      - PORT=8000
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_started
    networks:
      - yndu-network
    healthcheck:
      test: ['CMD', 'wget', '--no-verbose', '--tries=1', '--spider', 'http://localhost:8000/health']
      interval: 30s
      timeout: 10s
      retries: 3

  # GraphQL Gateway
  gateway:
    build:
      context: ./gateway
      dockerfile: Dockerfile
    ports:
      - '4000:4000'
    environment:
      - NODE_ENV=development
      - GATEWAY_PORT=4000
      - USERS_SERVICE_URL=http://backend:8000/graphql
      - INVENTORY_SERVICE_URL=http://backend:8000/graphql
      - ORDERS_SERVICE_URL=http://backend:8000/graphql
    depends_on:
      - backend
    networks:
      - yndu-network

  # PostgreSQL Database
  postgres:
    image: postgres:16-alpine
    ports:
      - '5432:5432'
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=yndu
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./src/infrastructure/adapters/postgres/migrations:/docker-entrypoint-initdb.d
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U postgres']
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - yndu-network

  # Redis Cache & Event Bus
  redis:
    image: redis:7-alpine
    ports:
      - '6379:6379'
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    healthcheck:
      test: ['CMD', 'redis-cli', 'ping']
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - yndu-network

  # Database Admin (PgAdmin)
  pgadmin:
    image: dpage/pgadmin4:latest
    ports:
      - '5050:80'
    environment:
      - PGADMIN_DEFAULT_EMAIL=admin@yndu.com
      - PGADMIN_DEFAULT_PASSWORD=admin
    volumes:
      - pgadmin_data:/var/lib/pgadmin
    depends_on:
      - postgres
    networks:
      - yndu-network

volumes:
  postgres_data:
  redis_data:
  pgadmin_data:

networks:
  yndu-network:
    driver: bridge
```

### Production

```yaml
# docker-compose.production.yml
version: '3.9'

services:
  frontend:
    build:
      context: ./src/presentation
      dockerfile: Dockerfile
      args:
        - VITE_API_URL=https://api.yndu.com
        - VITE_WS_URL=wss://api.yndu.com
    ports:
      - '80:80'
      - '443:443'
    environment:
      - NODE_ENV=production
    restart: unless-stopped
    networks:
      - yndu-production

  backend:
    build:
      context: .
      dockerfile: Dockerfile.deno
    ports:
      - '8000:8000'
    environment:
      - DENO_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      - JWT_SECRET=${JWT_SECRET}
      - CORS_ORIGIN=${CORS_ORIGIN}
    restart: unless-stopped
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '0.5'
          memory: 512M
    networks:
      - yndu-production
    healthcheck:
      test: ['CMD', 'wget', '--no-verbose', '--tries=1', '--spider', 'http://localhost:8000/health']
      interval: 30s
      timeout: 10s
      retries: 3

  postgres:
    image: postgres:16-alpine
    environment:
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
      - POSTGRES_DB=${POSTGRES_DB}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 4G
    networks:
      - yndu-production

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    restart: unless-stopped
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G
    networks:
      - yndu-production

  # Nginx Reverse Proxy
  nginx:
    image: nginx:alpine
    ports:
      - '80:80'
      - '443:443'
    volumes:
      - ./nginx/production.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
    depends_on:
      - frontend
      - backend
    restart: unless-stopped
    networks:
      - yndu-production

volumes:
  postgres_data:
  redis_data:

networks:
  yndu-production:
    driver: bridge
```

---

## CI/CD Pipeline

### GitHub Actions Workflow

```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  # ============================================
  # LINT & TEST
  # ============================================
  lint-and-test:
    name: Lint & Test
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Deno
        uses: denoland/setup-deno@v1
        with:
          deno-version: v1.41.x

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      # Backend Linting & Testing
      - name: Deno Lint
        run: deno lint

      - name: Deno Test
        run: deno test --allow-all --no-check

      # Frontend Linting & Testing
      - name: Install Frontend Dependencies
        working-directory: ./src/presentation
        run: npm ci

      - name: ESLint
        working-directory: ./src/presentation
        run: npm run lint

      - name: Frontend Tests
        working-directory: ./src/presentation
        run: npm run test

  # ============================================
  # BUILD IMAGES
  # ============================================
  build:
    name: Build Docker Images
    runs-on: ubuntu-latest
    needs: lint-and-test
    if: github.event_name != 'pull_request'

    outputs:
      backend-image: ${{ steps.build-backend.outputs.image }}
      frontend-image: ${{ steps.build-frontend.outputs.image }}

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Login to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      # Build Backend
      - name: Build Backend Image
        id: build-backend
        uses: docker/build-push-action@v5
        with:
          context: .
          file: Dockerfile.deno
          push: true
          tags: |
            ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}/backend:${{ github.sha }}
            ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}/backend:latest
          cache-from: type=gha
          cache-to: type=gha,mode=max
          platforms: linux/amd64,linux/arm64

      # Build Frontend
      - name: Build Frontend Image
        id: build-frontend
        uses: docker/build-push-action@v5
        with:
          context: ./src/presentation
          file: Dockerfile
          push: true
          tags: |
            ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}/frontend:${{ github.sha }}
            ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}/frontend:latest
          cache-from: type=gha
          cache-to: type=gha,mode=max
          platforms: linux/amd64,linux/arm64

  # ============================================
  # SECURITY SCANNING
  # ============================================
  security:
    name: Security Scan
    runs-on: ubuntu-latest
    needs: build

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Run Trivy Vulnerability Scanner
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          scan-ref: '.'
          format: 'sarif'
          output: 'trivy-results.sarif'

      - name: Upload Trivy Results
        uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: 'trivy-results.sarif'

      - name: Run Docker Scout
        run: |
          docker scout cves ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}/backend:${{ github.sha }}
          docker scout cves ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}/frontend:${{ github.sha }}

  # ============================================
  # DEPLOY TO STAGING
  # ============================================
  deploy-staging:
    name: Deploy to Staging
    runs-on: ubuntu-latest
    needs: [build, security]
    if: github.ref == 'refs/heads/develop'
    environment: staging

    steps:
      - name: Deploy to Staging Server
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.STAGING_HOST }}
          username: ${{ secrets.STAGING_USER }}
          key: ${{ secrets.STAGING_SSH_KEY }}
          script: |
            cd /opt/yndu/staging
            docker-compose pull
            docker-compose up -d
            docker-compose -f docker-compose.yml exec -T backend deno task migrate

  # ============================================
  # DEPLOY TO PRODUCTION
  # ============================================
  deploy-production:
    name: Deploy to Production
    runs-on: ubuntu-latest
    needs: [build, security]
    if: github.ref == 'refs/heads/main'
    environment: production

    steps:
      - name: Deploy to Production Server
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.PRODUCTION_HOST }}
          username: ${{ secrets.PRODUCTION_USER }}
          key: ${{ secrets.PRODUCTION_SSH_KEY }}
          script: |
            cd /opt/yndu/production
            docker-compose pull
            docker-compose up -d --scale backend=3
            docker-compose exec -T backend deno task migrate

      - name: Notify Deployment
        if: always()
        uses: slackapi/slack-github-action@v1.25
        with:
          payload: |
            {
              "text": "Deployment ${{ job.status }} for Yndu v${{ github.sha }}",
              "blocks": [
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": "yndu Deployment: ${{ job.status }}"
                  }
                }
              ]
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

---

## Environment Configuration

### Development (.env)

```bash
# Development Environment Variables
# ============================================

# Server
PORT=8000
HOST=0.0.0.0
DENO_ENV=development
NODE_ENV=development

# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=password
DATABASE_NAME=yndu
DATABASE_URL=postgres://postgres:password@localhost:5432/yndu

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_URL=redis://localhost:6379

# Frontend
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000

# Security (Dev only!)
JWT_SECRET=dev-secret-change-in-production
CORS_ORIGIN=http://localhost:3000

# External Services
SMS_API_KEY=dev-sms-key
SMS_API_URL=https://api.africastalking.com
```

### Production (.env.production)

```bash
# Production Environment Variables
# ============================================

# Server
PORT=8000
HOST=0.0.0.0
DENO_ENV=production
NODE_ENV=production

# Database (Use secure credentials!)
DATABASE_URL=${DATABASE_URL}

# Redis
REDIS_URL=${REDIS_URL}
REDIS_PASSWORD=${REDIS_PASSWORD}

# Frontend
VITE_API_URL=https://api.yndu.com
VITE_WS_URL=wss://api.yndu.com

# Security (Must be set in CI/CD!)
JWT_SECRET=${JWT_SECRET}
CORS_ORIGIN=https://yndu.com

# External Services
SMS_API_KEY=${SMS_API_KEY}
SMS_API_URL=https://api.africastalking.com
```

---

## Deployment

### Manual Deployment

```bash
# 1. Build images
docker build -t yndu-backend:latest -f Dockerfile.deno .
docker build -t yndu-frontend:latest -f Dockerfile .

# 2. Run database migrations
docker-compose up -d postgres redis
docker-compose exec backend deno task migrate

# 3. Start all services
docker-compose up -d

# 4. Check logs
docker-compose logs -f

# 5. Verify health
curl http://localhost:8000/health
curl http://localhost:3000/health
```

### Automated Deployment

```bash
# Deploy using the script
./deploy.sh production

# Or with specific version
./deploy.sh production v1.0.0
```

### Deploy Script

```bash
#!/bin/bash
# deploy.sh

ENV=${1:-staging}
VERSION=${2:-latest}

echo "Deploying Yndu to $ENV (version: $VERSION)"

# Pull latest images
docker-compose -f docker-compose.$ENV.yml pull $VERSION

# Update environment file
cp .env.$ENV .env

# Deploy
docker-compose -f docker-compose.$ENV.yml up -d

# Run migrations
docker-compose -f docker-compose.$ENV.yml exec -T backend deno task migrate

# Health check
sleep 10
curl -f http://localhost:8000/health || exit 1

echo "Deployment complete!"
```

---

## Monitoring

### Health Check Endpoints

```typescript
// src/routes/health.ts
import { Router } from 'oak';

export const healthRouter = new Router();

healthRouter.get('/health', async (ctx) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      database: await checkDatabase(),
      redis: await checkRedis(),
    },
  };

  ctx.response.status = health.status === 'healthy' ? 200 : 503;
  ctx.response.body = health;
});

healthRouter.get('/health/ready', async (ctx) => {
  const ready = await checkReadiness();
  ctx.response.status = ready ? 200 : 503;
  ctx.response.body = { ready };
});

healthRouter.get('/health/live', async (ctx) => {
  ctx.response.status = 200;
  ctx.response.body = { alive: true };
});
```

### Docker Health Monitoring

```yaml
# Add to docker-compose.yml
services:
  backend:
    healthcheck:
      test: ['CMD', 'wget', '--no-verbose', '--tries=1', '--spider', 'http://localhost:8000/health']
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  postgres:
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U postgres -d yndu']
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    healthcheck:
      test: ['CMD', 'redis-cli', 'ping']
      interval: 10s
      timeout: 5s
      retries: 5
```

### Prometheus Metrics

```typescript
// src/middleware/metrics.ts
import { gatherMetrics } from 'jsr:@std/node_metrics';

export async function metricsMiddleware(ctx: any, next: any) {
  const start = Date.now();

  await next();

  const duration = Date.now() - start;

  // Increment counter
  Deno.metrics().httpRequestsTotal++;

  ctx.response.headers.set('X-Response-Time', `${duration}ms`);
}

// Metrics endpoint
export async function getMetrics(_req: Request) {
  const metrics = await gatherMetrics();
  return new Response(metrics, {
    headers: { 'Content-Type': 'text/plain' },
  });
}
```

---

## Backup & Recovery

### Database Backups

```yaml
# backup service in docker-compose
services:
  backup:
    image: postgres:16-alpine
    volumes:
      - ./backups:/backups
      - ./scripts/backup.sh:/backup.sh
    environment:
      - POSTGRES_HOST=postgres
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
      - POSTGRES_DB=yndu
    cron: '0 2 * * *' # Daily at 2 AM
    command: /bin/sh /backup.sh
```

```bash
#!/bin/sh
# scripts/backup.sh
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="/backups/yndu_$TIMESTAMP.sql"

pg_dump -h $POSTGRES_HOST -U $POSTGRES_USER -d $POSTGRES_DB > $BACKUP_FILE

# Keep only last 7 days
find /backups -name "yndu_*.sql" -mtime +7 -delete
```

---

## Troubleshooting

### Common Issues

```bash
# Check container logs
docker-compose logs -f backend

# Check container status
docker-compose ps

# Restart a specific service
docker-compose restart backend

# Rebuild without cache
docker-compose build --no-cache backend

# Access container shell
docker-compose exec backend /bin/sh

# Check resource usage
docker stats

# View networks
docker network ls
docker network inspect yndu_yndu-network
```

---

## Version History

| Version | Date       | Description          |
| ------- | ---------- | -------------------- |
| 1.0.0   | 2026-02-07 | Initial DevOps setup |
| 1.1.0   | 2026-02-20 | Added CI/CD pipeline |

---

**Last Updated**: 2026-02-20\
**Maintainer**: DevOps Team
