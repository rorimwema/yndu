# GitHub Secrets Setup for CI/CD

This document explains how to set up the required GitHub secrets for the CI/CD pipeline.

## Required Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions → New repository secret

### 1. VPS_SSH_KEY
**Type:** SSH Private Key  
**How to get it:**
```bash
# Generate a new SSH key pair (on your local machine or CI server)
ssh-keygen -t ed25519 -C "github-actions@yndu" -f ~/.ssh/github_actions

# Copy the private key
cat ~/.ssh/github_actions
```
Paste the entire content including `-----BEGIN OPENSSH PRIVATE KEY-----` and `-----END OPENSSH PRIVATE KEY-----`.

Then add the public key to your VPS authorized_keys:
```bash
# On your VPS
cat ~/.ssh/github_actions.pub >> ~/.ssh/authorized_keys
```

### 2. VPS_HOST
**Type:** String  
**Value:** Your VPS IP address or domain (e.g., `203.0.113.1` or `vps.yourdomain.com`)

### 3. VPS_USER
**Type:** String  
**Value:** The SSH username for your VPS (e.g., `root`, `ubuntu`, `deploy`)

### 4. DOMAIN
**Type:** String  
**Value:** Your domain name (e.g., `api.yourdomain.com` or `yourdomain.com`)

### 5. DEPLOY_PATH (Optional)
**Type:** String  
**Value:** The path where the application will be deployed on the VPS  
**Default:** `/opt/yndu`

### 6. GITHUB_TOKEN
**Type:** Automatically provided by GitHub  
**Note:** This is automatically available in workflows, no need to set manually.

---

## Optional Secrets for Notifications

### 7. SLACK_WEBHOOK_URL (Optional)
**Type:** URL  
**Purpose:** Send deployment notifications to Slack

### 8. DISCORD_WEBHOOK_URL (Optional)
**Type:** URL  
**Purpose:** Send deployment notifications to Discord

---

## Environment Variables (Not Secrets)

Go to Settings → Secrets and variables → Actions → Variables tab

### REGISTRY
**Value:** `ghcr.io` (GitHub Container Registry)

---

## Complete Setup Checklist

- [ ] Generate SSH key pair
- [ ] Add public key to VPS `~/.ssh/authorized_keys`
- [ ] Add private key as `VPS_SSH_KEY` secret
- [ ] Add VPS IP/hostname as `VPS_HOST` secret
- [ ] Add VPS username as `VPS_USER` secret
- [ ] Add domain name as `DOMAIN` secret
- [ ] (Optional) Set custom `DEPLOY_PATH`
- [ ] Enable GitHub Actions in repository settings
- [ ] Configure branch protection rules for `main`

---

## Testing the Connection

Before running the CI/CD pipeline, test the SSH connection:

```bash
# From your local machine with the private key
ssh -i ~/.ssh/github_actions <VPS_USER>@<VPS_HOST>
```

If this works, the GitHub Actions should be able to connect too.

---

## Security Recommendations

1. **Use a dedicated deploy user** on your VPS instead of root
2. **Restrict SSH access** to the deploy user to only run specific commands
3. **Enable 2FA** on your GitHub account
4. **Rotate SSH keys** regularly (every 90 days)
5. **Use a firewall** to restrict access to your VPS
6. **Monitor deployment logs** for any suspicious activity

---

## Troubleshooting

### Permission Denied (publickey)
- Check that the public key is in `~/.ssh/authorized_keys` on the VPS
- Ensure the `.ssh` directory has correct permissions: `chmod 700 ~/.ssh`
- Ensure `authorized_keys` has correct permissions: `chmod 600 ~/.ssh/authorized_keys`

### Connection Timeout
- Check that your VPS firewall allows SSH (port 22)
- Verify the VPS_HOST is correct
- Check if your VPS provider blocks port 22

### Docker Login Failed
- Ensure the GitHub token has `packages:write` permission
- Check that the repository is public or token has proper access
