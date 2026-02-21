#!/bin/bash
# VPS Setup Script for YNDU
# Run this on your VPS as root or with sudo

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
DEPLOY_PATH="${DEPLOY_PATH:-/opt/yndu}"
DOMAIN="${DOMAIN:-localhost}"
EMAIL="${EMAIL:-admin@example.com}"

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

# Check if running as root or with sudo
if [ "$EUID" -ne 0 ] && ! sudo -n true 2>/dev/null; then
    error "Please run as root or with sudo privileges"
fi

log "Starting VPS setup for YNDU..."
log "Deploy path: $DEPLOY_PATH"
log "Domain: $DOMAIN"

# Update system
log "Updating system packages..."
sudo apt-get update && sudo apt-get upgrade -y

# Install required packages
log "Installing required packages..."
sudo apt-get install -y \
    curl \
    wget \
    git \
    vim \
    htop \
    ca-certificates \
    gnupg \
    lsb-release \
    software-properties-common \
    apt-transport-https \
    certbot \
    python3-certbot-nginx

# Install Docker
log "Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
    log "Docker installed. You may need to log out and back in for group changes to take effect."
else
    log "Docker already installed"
fi

# Install Docker Compose plugin
log "Installing Docker Compose..."
if ! docker compose version &> /dev/null; then
    sudo apt-get install -y docker-compose-plugin
fi

# Create deployment directory
log "Creating deployment directory..."
sudo mkdir -p $DEPLOY_PATH
cd $DEPLOY_PATH

# Create required subdirectories
sudo mkdir -p nginx/ssl
sudo mkdir -p postgres_data
sudo mkdir -p redis_data

# Set up firewall
log "Configuring UFW firewall..."
if command -v ufw &> /dev/null; then
    sudo ufw default deny incoming
    sudo ufw default allow outgoing
    sudo ufw allow ssh
    sudo ufw allow http
    sudo ufw allow https
    sudo ufw --force enable
    log "Firewall configured"
else
    warn "UFW not installed, skipping firewall configuration"
fi

# Setup SSL with Let's Encrypt (if domain is not localhost)
if [ "$DOMAIN" != "localhost" ]; then
    log "Setting up SSL certificate for $DOMAIN..."
    
    # Create temporary nginx config for certbot validation
    sudo mkdir -p /var/www/certbot
    
    # Stop any existing nginx
    sudo docker stop nginx 2>/dev/null || true
    
    # Obtain certificate
    if sudo certbot certonly --standalone -d $DOMAIN --agree-tos -n -m $EMAIL; then
        log "SSL certificate obtained successfully"
        
        # Copy certificates
        sudo cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem nginx/ssl/cert.pem
        sudo cp /etc/letsencrypt/live/$DOMAIN/privkey.pem nginx/ssl/key.pem
        sudo chmod 644 nginx/ssl/cert.pem
        sudo chmod 600 nginx/ssl/key.pem
        
        # Setup auto-renewal
        log "Setting up certificate auto-renewal..."
        (sudo crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet --deploy-hook 'cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem $DEPLOY_PATH/nginx/ssl/cert.pem && cp /etc/letsencrypt/live/$DOMAIN/privkey.pem $DEPLOY_PATH/nginx/ssl/key.pem && docker compose -f $DEPLOY_PATH/docker-compose.production.yml restart nginx'") | sudo crontab -
    else
        warn "Failed to obtain SSL certificate. You can retry later with: sudo certbot certonly --standalone -d $DOMAIN"
    fi
else
    warn "Skipping SSL setup (localhost detected)"
fi

# Create SSL nginx config
cat > nginx/production-ssl.conf << 'EOF'
server {
    listen 80;
    server_name _;
    
    # Redirect HTTP to HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name _;

    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    client_max_body_size 10m;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Nuxt app
    location / {
        proxy_pass http://frontend:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Deno API
    location /api/ {
        proxy_pass http://backend:8000/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Backend health passthrough
    location /health {
        proxy_pass http://backend:8000/health;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        access_log off;
    }

    # GraphQL Gateway
    location /graphql {
        proxy_pass http://gateway:4000/graphql;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
EOF

# Create environment file template
cat > .env.production << EOF
# Database Configuration
DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=$(openssl rand -base64 32)
DATABASE_NAME=yndu_prod

# Redis Configuration
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=$(openssl rand -base64 32)

# Application Configuration
NODE_ENV=production
PORT=8000
CORS_ORIGIN=https://$DOMAIN

# JWT Configuration
JWT_SECRET=$(openssl rand -base64 64)

# Session Configuration
NUXT_SESSION_PASSWORD=$(openssl rand -base64 32)

# API Keys (Update these with your actual keys)
HASHPAY_API_KEY=
HASHPAY_ACCOUNT_ID=

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
EOF

log "Created production environment file at $DEPLOY_PATH/.env.production"
warn "Please update the .env.production file with your actual API keys and secrets"

# Set proper permissions
sudo chown -R $USER:$USER $DEPLOY_PATH

# Create systemd service for auto-start (optional)
if command -v systemctl &> /dev/null; then
    log "Creating systemd service..."
    
    sudo tee /etc/systemd/system/yndu.service > /dev/null << EOF
[Unit]
Description=YNDU Application
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=$DEPLOY_PATH
ExecStart=/usr/bin/docker compose -f docker-compose.production.yml up -d
ExecStop=/usr/bin/docker compose -f docker-compose.production.yml down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

    sudo systemctl daemon-reload
    sudo systemctl enable yndu.service
    log "Systemd service created and enabled"
fi

# Create monitoring script
cat > $DEPLOY_PATH/monitor.sh << 'EOF'
#!/bin/bash
# Simple monitoring script

echo "=== YNDU Service Status ==="
docker compose -f docker-compose.production.yml ps

echo ""
echo "=== Resource Usage ==="
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}"

echo ""
echo "=== Disk Usage ==="
df -h

echo ""
echo "=== Recent Logs ==="
docker compose -f docker-compose.production.yml logs --tail=20
EOF
chmod +x $DEPLOY_PATH/monitor.sh

# Create backup script
cat > $DEPLOY_PATH/backup.sh << EOF
#!/bin/bash
# Backup script for YNDU

BACKUP_DIR="/var/backups/yndu"
TIMESTAMP=\$(date +%Y%m%d_%H%M%S)

mkdir -p \$BACKUP_DIR

# Backup database
docker exec yndu_prod_local-postgres-1 pg_dump -U postgres yndu_prod | gzip > \$BACKUP_DIR/db_\$TIMESTAMP.sql.gz

# Backup Redis (if needed)
docker exec yndu_prod_local-redis-1 redis-cli SAVE
docker cp yndu_prod_local-redis-1:/data/dump.rdb \$BACKUP_DIR/redis_\$TIMESTAMP.rdb

# Cleanup old backups (keep last 7 days)
find \$BACKUP_DIR -name "*.gz" -mtime +7 -delete
find \$BACKUP_DIR -name "*.rdb" -mtime +7 -delete

echo "Backup completed: \$BACKUP_DIR"
EOF
chmod +x $DEPLOY_PATH/backup.sh

# Add backup to crontab
(sudo crontab -l 2>/dev/null; echo "0 2 * * * $DEPLOY_PATH/backup.sh") | sudo crontab -

log ""
log "========================================"
log "VPS Setup Complete!"
log "========================================"
log ""
log "Next steps:"
log "1. Update $DEPLOY_PATH/.env.production with your actual secrets"
log "2. Copy your docker-compose.production.yml to $DEPLOY_PATH"
log "3. Run the deployment from GitHub Actions or manually:"
log "   docker compose -f docker-compose.production.yml up -d"
log ""
log "Useful commands:"
log "  - View status: $DEPLOY_PATH/monitor.sh"
log "  - View logs: docker compose -f docker-compose.production.yml logs -f"
log "  - Restart: docker compose -f docker-compose.production.yml restart"
log "  - Backup: $DEPLOY_PATH/backup.sh"
log ""
log "SSL Certificate:"
if [ "$DOMAIN" != "localhost" ]; then
    log "  - Auto-renewal is configured via cron"
    log "  - Manual renew: sudo certbot renew"
fi
log ""
