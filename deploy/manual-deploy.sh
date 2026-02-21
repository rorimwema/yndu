#!/bin/bash
# Manual Deployment Script for YNDU
# Use this if you want to deploy manually instead of using GitHub Actions

set -e

# Configuration
REGISTRY="ghcr.io"
GITHUB_USER="${GITHUB_USER:-yourusername}"
IMAGE_NAME="${IMAGE_NAME:-yndu}"
TAG="${TAG:-latest}"
DEPLOY_PATH="${DEPLOY_PATH:-/opt/yndu}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

# Help message
usage() {
    cat << EOF
Usage: $0 [OPTIONS]

Manual deployment script for YNDU application

OPTIONS:
    -u, --user          GitHub username (default: $GITHUB_USER)
    -t, --tag           Image tag to deploy (default: $TAG)
    -p, --path          Deploy path on VPS (default: $DEPLOY_PATH)
    -r, --registry      Container registry (default: $REGISTRY)
    -h, --help          Show this help message

EXAMPLES:
    # Deploy latest images
    $0

    # Deploy specific tag
    $0 --tag v1.2.3

    # Deploy from different user/org
    $0 --user myorg --tag stable

EOF
    exit 0
}

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -u|--user)
            GITHUB_USER="$2"
            shift 2
            ;;
        -t|--tag)
            TAG="$2"
            shift 2
            ;;
        -p|--path)
            DEPLOY_PATH="$2"
            shift 2
            ;;
        -r|--registry)
            REGISTRY="$2"
            shift 2
            ;;
        -h|--help)
            usage
            ;;
        *)
            error "Unknown option: $1"
            ;;
    esac
done

log "Starting manual deployment..."
log "Registry: $REGISTRY"
log "User: $GITHUB_USER"
log "Image: $IMAGE_NAME"
log "Tag: $TAG"
log "Deploy path: $DEPLOY_PATH"

# Check if docker is available
if ! command -v docker &> /dev/null; then
    error "Docker is not installed"
fi

# Check if logged in to registry
if ! docker info | grep -q "Username"; then
    warn "Not logged in to container registry"
    log "Please login with: docker login $REGISTRY"
    docker login $REGISTRY
fi

# Pull latest images
log "Pulling images..."
docker pull $REGISTRY/$GITHUB_USER/$IMAGE_NAME/backend:$TAG || warn "Backend image not found"
docker pull $REGISTRY/$GITHUB_USER/$IMAGE_NAME/frontend:$TAG || warn "Frontend image not found"
docker pull $REGISTRY/$GITHUB_USER/$IMAGE_NAME/users:$TAG || warn "Users service image not found"
docker pull $REGISTRY/$GITHUB_USER/$IMAGE_NAME/inventory:$TAG || warn "Inventory service image not found"
docker pull $REGISTRY/$GITHUB_USER/$IMAGE_NAME/orders:$TAG || warn "Orders service image not found"
docker pull $REGISTRY/$GITHUB_USER/$IMAGE_NAME/gateway:$TAG || warn "Gateway image not found"

# Create docker-compose override
log "Creating docker-compose override..."
cat > docker-compose.manual.yml << EOF
name: yndu_manual

services:
  backend:
    image: $REGISTRY/$GITHUB_USER/$IMAGE_NAME/backend:$TAG
    restart: always

  frontend:
    image: $REGISTRY/$GITHUB_USER/$IMAGE_NAME/frontend:$TAG
    restart: always

  users:
    image: $REGISTRY/$GITHUB_USER/$IMAGE_NAME/users:$TAG
    restart: always

  inventory:
    image: $REGISTRY/$GITHUB_USER/$IMAGE_NAME/inventory:$TAG
    restart: always

  orders:
    image: $REGISTRY/$GITHUB_USER/$IMAGE_NAME/orders:$TAG
    restart: always

  gateway:
    image: $REGISTRY/$GITHUB_USER/$IMAGE_NAME/gateway:$TAG
    restart: always
EOF

# Deploy
log "Deploying services..."
docker compose -f docker-compose.production.yml -f docker-compose.manual.yml pull
docker compose -f docker-compose.production.yml -f docker-compose.manual.yml up -d --remove-orphans

# Cleanup
docker image prune -af --filter "until=168h" || true

# Health check
log "Running health checks..."
sleep 10

HEALTHY=true

if curl -sf http://localhost:8000/health > /dev/null 2>&1; then
    log "✓ Backend is healthy"
else
    error "✗ Backend health check failed"
    HEALTHY=false
fi

if curl -sf http://localhost:3000 > /dev/null 2>&1; then
    log "✓ Frontend is healthy"
else
    error "✗ Frontend health check failed"
    HEALTHY=false
fi

if [ "$HEALTHY" = true ]; then
    log ""
    log "========================================"
    log "Deployment successful!"
    log "========================================"
else
    error "Deployment completed with health check failures"
fi

# Show status
log ""
log "Service status:"
docker compose -f docker-compose.production.yml -f docker-compose.manual.yml ps

log ""
log "To view logs: docker compose -f docker-compose.production.yml -f docker-compose.manual.yml logs -f"
