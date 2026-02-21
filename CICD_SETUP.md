# CI/CD Pipeline Setup Guide

This guide walks you through setting up a complete CI/CD pipeline for YNDU using GitHub Actions and
deploying to your self-hosted VPS.

## Architecture Overview

```
┌─────────────────┐
│  Developer Push │
│    to main      │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│    GitHub Actions       │
│  ┌───────────────────┐  │
│  │  1. CI: Test      │  │
│  │  2. Build Images  │  │
│  │  3. Push to GHCR  │  │
│  └───────────────────┘  │
└────────┬────────────────┘
         │
         │ SSH + Docker
         ▼
┌─────────────────────────┐
│      Your VPS           │
│  ┌───────────────────┐  │
│  │  Docker Compose   │  │
│  │  ├─ Nginx (SSL)   │  │
│  │  ├─ Frontend      │  │
│  │  ├─ Backend       │  │
│  │  ├─ Microservices │  │
│  │  ├─ Database      │  │
│  │  └─ Cache         │  │
│  └───────────────────┘  │
└─────────────────────────┘
         │
         ▼
┌─────────────────────────┐
│   Users (HTTPS)         │
└─────────────────────────┘
```

## Prerequisites

1. **GitHub Repository** with your code
2. **VPS** (Ubuntu 20.04+ recommended) with:
   - Static IP address
   - SSH access
   - At least 2GB RAM, 20GB storage
3. **Domain name** with DNS pointing to your VPS
4. **GitHub Account** with repository admin access

---

## Step 1: VPS Setup

### 1.1 Initial Server Setup

SSH into your VPS and run:

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install essential packages
sudo apt install -y curl wget git vim ufw

# Configure firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
sudo ufw enable
```

### 1.2 Run the Setup Script

```bash
# Download and run the VPS setup script
cd ~
curl -O https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/deploy/vps-setup.sh
chmod +x vps-setup.sh

# Run with your domain and email
sudo DOMAIN=yourdomain.com EMAIL=admin@yourdomain.com ./vps-setup.sh
```

This will:

- Install Docker and Docker Compose
- Set up SSL certificates with Let's Encrypt
- Configure the firewall
- Create deployment directory structure
- Set up monitoring and backup scripts

---

## Step 2: GitHub Repository Configuration

### 2.1 Enable GitHub Container Registry

1. Go to **Package settings** in your repository
2. Ensure "Inherit access from source repository" is enabled

### 2.2 Configure Secrets

Go to **Settings → Secrets and variables → Actions → New repository secret**

| Secret        | Description                    | How to Get                 |
| ------------- | ------------------------------ | -------------------------- |
| `VPS_SSH_KEY` | SSH private key for VPS access | `cat ~/.ssh/your_key`      |
| `VPS_HOST`    | VPS IP or domain               | Your VPS IP/hostname       |
| `VPS_USER`    | SSH username                   | Usually `root` or `ubuntu` |
| `DOMAIN`      | Your domain name               | e.g., `app.yourdomain.com` |
| `DEPLOY_PATH` | Deploy path on VPS             | Default: `/opt/yndu`       |

#### Generating SSH Key

```bash
# On your local machine
ssh-keygen -t ed25519 -C "github-actions@yndu" -f ~/.ssh/github_actions

# Add public key to VPS
ssh-copy-id -i ~/.ssh/github_actions.pub root@your-vps-ip

# Copy private key for GitHub secret
cat ~/.ssh/github_actions
```

---

## Step 3: GitHub Actions Workflows

The following workflows are automatically configured:

### 3.1 CI Workflow (`ci.yml`)

**Triggers:** Push to any branch, PR to main/develop

**Jobs:**

- ✅ Lint and format checks (Deno)
- ✅ Type checking
- ✅ Unit tests
- ✅ Frontend build
- ✅ Docker image builds
- ✅ Security scanning

### 3.2 Deploy Workflow (`deploy.yml`)

**Triggers:** Push to `main`, Manual dispatch

**Jobs:**

- 🚀 Deploy to VPS
- 🔍 Health checks
- 🧹 Cleanup old images

### 3.3 Rollback Workflow (`rollback.yml`)

**Triggers:** Manual dispatch

**Purpose:** Rollback to a previous version

---

## Step 4: First Deployment

### 4.1 Push to Main Branch

```bash
# Commit and push your code
git add .
git commit -m "Initial CI/CD setup"
git push origin main
```

### 4.2 Monitor the Deployment

1. Go to **Actions** tab in your GitHub repository
2. Watch the CI workflow run
3. Once CI passes, the Deploy workflow will trigger
4. Monitor the deployment logs

### 4.3 Verify Deployment

```bash
# On your VPS
/opt/yndu/monitor.sh

# Or check individual services
docker compose -f docker-compose.production.yml ps

# Check logs
docker compose -f docker-compose.production.yml logs -f
```

---

## Step 5: Post-Deployment Configuration

### 5.1 Update Environment Variables

```bash
# On your VPS
sudo nano /opt/yndu/.env.production
```

Update these critical values:

```bash
DATABASE_PASSWORD=your_secure_password
REDIS_PASSWORD=your_secure_password
JWT_SECRET=your_jwt_secret_min_32_chars
NUXT_SESSION_PASSWORD=your_session_password
HASHPAY_API_KEY=your_payment_api_key
HASHPAY_ACCOUNT_ID=your_account_id
```

Then restart services:

```bash
cd /opt/yndu
docker compose -f docker-compose.production.yml restart
```

### 5.2 Verify SSL

```bash
# Check certificate
sudo certbot certificates

# Test SSL
curl -vI https://yourdomain.com
```

---

## Deployment Options

### Option 1: Automatic (GitHub Actions)

- Push to `main` → Auto deploy
- Best for: Regular development workflow

### Option 2: Manual (On VPS)

```bash
cd /opt/yndu
./manual-deploy.sh --tag v1.2.3
```

### Option 3: Direct Docker Compose

```bash
cd /opt/yndu
docker compose -f docker-compose.production.yml pull
docker compose -f docker-compose.production.yml up -d
```

---

## Monitoring & Maintenance

### Health Checks

```bash
# Backend health
curl https://yourdomain.com/health

# Full system status
/opt/yndu/monitor.sh
```

### Logs

```bash
# All services
docker compose -f docker-compose.production.yml logs -f

# Specific service
docker compose -f docker-compose.production.yml logs -f backend
```

### Backups

```bash
# Manual backup
/opt/yndu/backup.sh

# Backups are stored in /var/backups/yndu/
```

### Updates

```bash
# Pull latest images
docker compose -f docker-compose.production.yml pull

# Restart with new images
docker compose -f docker-compose.production.yml up -d
```

---

## Rollback Procedure

### Via GitHub Actions (Recommended)

1. Go to **Actions** tab
2. Select **Rollback Deployment**
3. Click **Run workflow**
4. Enter the version to rollback to (commit SHA or tag)
5. Click **Run workflow**

### Manual Rollback

```bash
cd /opt/yndu

# Edit docker-compose override to use specific tag
nano docker-compose.prod.override.yml

# Update image tags, then:
docker compose -f docker-compose.production.yml -f docker-compose.prod.override.yml up -d
```

---

## Troubleshooting

### Deployment Failed

```bash
# Check GitHub Actions logs
# Go to Actions tab → Failed workflow → View logs

# Check VPS logs
ssh root@your-vps-ip "cd /opt/yndu && docker compose logs --tail=50"
```

### Services Unhealthy

```bash
# Check individual service status
docker ps -a
docker stats

# Restart specific service
docker compose -f docker-compose.production.yml restart backend
```

### SSL Issues

```bash
# Renew certificate
sudo certbot renew --force-renewal

# Copy renewed certs
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem /opt/yndu/nginx/ssl/cert.pem
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem /opt/yndu/nginx/ssl/key.pem

# Restart nginx
docker compose -f docker-compose.production.yml restart nginx
```

### Database Connection Issues

```bash
# Check if postgres is running
docker compose -f docker-compose.production.yml ps postgres

# Check logs
docker compose -f docker-compose.production.yml logs postgres

# Connect to database
docker compose -f docker-compose.production.yml exec postgres psql -U postgres -d yndu_prod
```

---

## Security Best Practices

1. **Keep secrets secure**
   - Never commit `.env` files
   - Rotate SSH keys every 90 days
   - Use strong passwords

2. **Regular updates**
   ```bash
   # Update system packages
   sudo apt update && sudo apt upgrade -y

   # Update Docker images
   docker compose -f docker-compose.production.yml pull
   docker compose -f docker-compose.production.yml up -d
   ```

3. **Monitor access**
   ```bash
   # Check SSH logs
   sudo tail -f /var/log/auth.log

   # Check nginx access logs
   docker compose -f docker-compose.production.yml logs nginx
   ```

4. **Enable automatic security updates**
   ```bash
   sudo apt install unattended-upgrades
   sudo dpkg-reconfigure unattended-upgrades
   ```

---

## Directory Reference

| Path                        | Purpose                   |
| --------------------------- | ------------------------- |
| `/opt/yndu`                 | Main deployment directory |
| `/opt/yndu/nginx/ssl`       | SSL certificates          |
| `/opt/yndu/.env.production` | Environment variables     |
| `/var/backups/yndu`         | Database backups          |
| `/var/log`                  | System logs               |

---

## Support

For issues:

1. Check GitHub Actions logs
2. Review VPS logs: `journalctl -u yndu.service`
3. Check Docker logs: `docker compose logs`
4. Review this guide's troubleshooting section
