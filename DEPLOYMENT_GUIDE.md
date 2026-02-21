# YNDU Deployment Guide

Complete step-by-step guide to deploy YNDU on Debian 13 VPS with Docker Swarm and **Cloudflare SSL**.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Cloudflare Setup](#cloudflare-setup)
3. [VPS Setup](#vps-setup)
4. [Initial Deployment](#initial-deployment)
5. [CI/CD Setup](#cicd-setup)
6. [Continuous Development](#continuous-development)

---

## Prerequisites

| Item | Specification |
|------|--------------|
| **VPS** | Debian 13 (Trixie) |
| **RAM** | Minimum 2GB (4GB recommended) |
| **Storage** | 30GB SSD minimum |
| **Domain** | Your domain with Cloudflare DNS |
| **GitHub** | Repository: `https://github.com/rorimwema/yndu` |

---

## Cloudflare Setup

### Step 1: Add DNS Records

In Cloudflare Dashboard → Your Domain → DNS:

| Type | Name | Content | Proxy Status | TTL |
|------|------|---------|--------------|-----|
| A | @ | YOUR_VPS_IP | **Proxied** | Auto |
| A | www | YOUR_VPS_IP | **Proxied** | Auto |

### Step 2: SSL/TLS Configuration

Go to **SSL/TLS** → **Overview**:
- Set **Encryption mode** to **Full (strict)**

Go to **SSL/TLS** → **Edge Certificates**:
- ✅ Enable **Always Use HTTPS**
- ✅ Enable **Automatic HTTPS Rewrites**

### Step 3: Create Origin Certificate (Recommended)

For secure communication between Cloudflare and your VPS:

1. Go to **SSL/TLS** → **Origin Server**
2. Click **Create Certificate**
3. Choose **"Let Cloudflare generate a private key and a CSR"**
4. Hostnames: `yourdomain.com, *.yourdomain.com`
5. Certificate Validity: 15 years
6. Save the **Origin Certificate** as `cert.pem`
7. Save the **Private Key** as `key.pem`

You'll upload these to your VPS later.

### Step 4: Security Settings

Go to **Security** → **Bots**:
- Enable **Bot Fight Mode** (optional)

Go to **Security** → **WAF**:
- Set Security Level to **High**

### Step 5: Page Rules (Optional)

Go to **Rules** → **Page Rules**:

**Rule 1: Redirect www to root**
- URL: `www.yourdomain.com/*`
- Setting: Forwarding URL (301)
- Destination: `https://yourdomain.com/$1`

**Rule 2: Cache static assets**
- URL: `yourdomain.com/_nuxt/*`
- Setting: Cache Level - Cache Everything

---

## VPS Setup

### Option A: Quick Automated Setup (Recommended)

```bash
# SSH into your VPS
ssh root@YOUR_VPS_IP

# Download and run the setup script
curl -fsSL -o vps-setup.sh https://raw.githubusercontent.com/rorimwema/yndu/main/deploy/vps-setup.sh
chmod +x vps-setup.sh

# Run with your domain + repo + cloudflare origin cert files already on VPS
sudo ./vps-setup.sh \
  --domain yndufresh.com \
  --repo https://github.com/rorimwema/yndu.git \
  --tag latest \
  --cert /root/cert.pem \
  --key /root/key.pem
```

### Option B: Manual Setup

#### Step 1: Connect to VPS

```bash
ssh root@YOUR_VPS_IP
```

#### Step 2: System Update

```bash
apt update && apt upgrade -y
hostnamectl set-hostname yndu-prod
apt install -y curl wget git vim ufw htop ncdu unzip
```

#### Step 3: Install Docker

```bash
curl -fsSL https://get.docker.com | sh
usermod -aG docker root
apt install -y docker-compose-plugin
```

#### Step 4: Configure Firewall

```bash
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
```

> **Note:** Only ports 80 and 443 need to be open. Cloudflare connects to these ports.

#### Step 5: Clone Repository

```bash
mkdir -p /opt/yndu
git clone https://github.com/rorimwema/yndu.git /opt/yndu
cd /opt/yndu
```

#### Step 6: Prepare Swarm Secret Files

```bash
cd /opt/yndu

cp -R secrets.example secrets
```

Fill `secrets/prod/*.txt` with production values:
- `postgres_password.txt`
- `database_password.txt`
- `redis_password.txt`
- `jwt_secret.txt`
- `hashpay_api_key.txt`
- `hashpay_account_id.txt`
- `nuxt_session_password.txt`

#### Step 7: Upload Cloudflare Origin Certificate

From your local machine:

```bash
# Upload the certificate files you downloaded from Cloudflare
scp cert.pem root@YOUR_VPS_IP:/opt/yndu/nginx/ssl/
scp key.pem root@YOUR_VPS_IP:/opt/yndu/nginx/ssl/

# SSH back and set permissions
ssh root@YOUR_VPS_IP "chmod 600 /opt/yndu/nginx/ssl/key.pem && chmod 644 /opt/yndu/nginx/ssl/cert.pem"
```

> For Cloudflare **Full (strict)**, use Cloudflare Origin certificates. Self-signed certificates are only for temporary/testing use.

---

## Initial Deployment

### Step 1: Create Secrets and Deploy Swarm Stack

```bash
cd /opt/yndu

# Create/update docker swarm secrets from secrets/prod
./scripts/swarm/create-secrets.sh

# Deploy stack
export REGISTRY=ghcr.io/rorimwema
export IMAGE_NAME=yndu
export TAG=latest
export CORS_ORIGIN=https://yourdomain.com
docker stack deploy -c docker-stack.yml yndu

# Check status
docker stack services yndu
docker stack ps yndu
```

### Step 2: Verify Deployment

```bash
# Health check through Cloudflare
curl https://yourdomain.com/health

# View logs
docker service logs -f yndu_nginx
```

### Step 3: Test in Browser

1. Open `https://yourdomain.com`
2. Check that SSL certificate is valid (should show Cloudflare as issuer)
3. Test login/signup functionality

---

## CI/CD Setup

### Step 1: Create GitHub Actions Workflow

Create `.github/workflows/deploy.yml` in your repo:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Deno
        uses: denoland/setup-deno@v1
        with:
          deno-version: v2.x
      
      - name: Run Deno lint
        run: deno lint
      
      - name: Run Deno tests
        run: deno task test
      
      - name: Test Frontend Build
        run: |
          cd src/presentation-nuxt
          npm ci
          npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to VPS via SSH
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            cd /opt/yndu
            
            # Pull latest code
            git pull origin main
            
            # Rebuild and restart
            docker compose -f docker-compose.production.yml build
            docker compose -f docker-compose.production.yml up -d
            
            # Cleanup old images
            docker image prune -af
            
            # Health check
            sleep 10
            curl -sf http://localhost:8000/health || exit 1
            echo "Deployment successful!"
```

### Step 2: Add GitHub Secrets

Go to **Settings** → **Secrets and variables** → **Actions**:

| Secret Name | Value |
|-------------|-------|
| `VPS_HOST` | Your VPS IP address |
| `VPS_USER` | root (or your deploy user) |
| `VPS_SSH_KEY` | SSH private key |

Generate SSH key locally:
```bash
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/github_actions

# Copy public key to VPS
cat ~/.ssh/github_actions.pub >> ~/.ssh/authorized_keys

# Copy private key to GitHub secret
cat ~/.ssh/github_actions
```

---

## Continuous Development

### Development Workflow

```bash
# 1. Make changes locally
vim src/...

# 2. Test locally
deno task test
cd src/presentation-nuxt && npm run test

# 3. Commit and push
git add .
git commit -m "feat: new feature"
git push origin main

# 4. GitHub Actions automatically deploys
```

### Manual Deploy (Emergency)

```bash
ssh root@YOUR_VPS_IP

cd /opt/yndu
git pull origin main
docker compose -f docker-compose.production.yml up -d --build
```

### Viewing Logs

```bash
# All services
docker compose -f docker-compose.production.yml logs -f

# Specific service
docker compose -f docker-compose.production.yml logs -f backend
docker compose -f docker-compose.production.yml logs -f frontend
```

### Database Operations

```bash
# Backup
docker compose -f docker-compose.production.yml exec postgres \
  pg_dump -U postgres yndu_prod | gzip > backup_$(date +%Y%m%d).sql.gz

# Connect to database
docker compose -f docker-compose.production.yml exec postgres \
  psql -U postgres -d yndu_prod

# Run migrations (if you have a migration task)
docker compose -f docker-compose.production.yml exec backend \
  deno task db:migrate
```

---

## Troubleshooting

### SSL Issues

If you see "Invalid SSL certificate" errors:

1. Check Cloudflare SSL/TLS mode is set to **Full (strict)**
2. Verify certificate files exist:
   ```bash
   ls -la /opt/yndu/nginx/ssl/
   ```
3. Check nginx logs:
   ```bash
   docker compose -f docker-compose.production.yml logs nginx
   ```

### 521 / 522 Errors (Cloudflare)

VPS not responding to Cloudflare:

```bash
# Check firewall
ufw status

# Check nginx is running
docker compose -f docker-compose.production.yml ps nginx

# Check nginx logs
docker compose -f docker-compose.production.yml logs nginx
```

### Database Connection Issues

```bash
# Check postgres is healthy
docker compose -f docker-compose.production.yml ps postgres

# Check environment variables
docker compose -f docker-compose.production.yml exec backend env | grep DATABASE

# Restart postgres
docker compose -f docker-compose.production.yml restart postgres
```

### High Memory Usage

```bash
# Check memory usage
docker stats --no-stream

# Restart services
docker compose -f docker-compose.production.yml restart
```

---

## Useful Commands Reference

```bash
# Full restart
cd /opt/yndu && docker compose -f docker-compose.production.yml restart

# Stop all
docker compose -f docker-compose.production.yml down

# Start all
docker compose -f docker-compose.production.yml up -d

# Rebuild specific service
docker compose -f docker-compose.production.yml build backend
docker compose -f docker-compose.production.yml up -d backend

# Shell into container
docker compose -f docker-compose.production.yml exec backend bash
docker compose -f docker-compose.production.yml exec postgres psql -U postgres

# Clean up
docker system prune -a
```

---

## Security Checklist

- [x] Cloudflare proxy enabled (orange cloud)
- [x] Cloudflare SSL/TLS set to Full (strict)
- [x] Origin Certificate installed (or self-signed for Full strict)
- [x] Firewall only allows 80, 443, 22
- [x] Environment file secured (chmod 600)
- [x] Strong passwords generated
- [x] SSH key authentication
- [x] Root login disabled (optional but recommended)
- [x] Automatic security updates enabled

---

## Next Steps

1. **Set up monitoring** - UptimeRobot or Better Stack
2. **Configure log aggregation** - Cloudflare Analytics
3. **Add CDN caching rules** - Cloudflare Page Rules
4. **Set up staging environment** - Duplicate for testing

---

## Quick Reference

| Task | Command |
|------|---------|
| Deploy | `git push origin main` |
| View logs | `docker compose -f docker-compose.production.yml logs -f` |
| Restart | `docker compose -f docker-compose.production.yml restart` |
| Backup DB | `/opt/yndu/backup.sh` |
| Monitor | `docker stats` |
| SSH to VPS | `ssh root@YOUR_VPS_IP` |
