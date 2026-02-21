#!/usr/bin/env bash
# YNDU VPS setup + Docker Swarm deployment script (Debian 13 friendly)
set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() { echo -e "${GREEN}[INFO]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
die() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

usage() {
  cat <<'EOF'
Usage: vps-setup.sh [options]

Options:
  -d, --domain <domain>           Public domain (required for production)
  -r, --repo <git-url>            Repository URL (default: https://github.com/rorimwema/yndu.git)
  -p, --path <path>               Deploy path (default: /opt/yndu)
  -t, --tag <image-tag>           Container image tag (default: latest)
  -o, --cors-origin <url>         CORS origin (default: https://<domain>)
  -s, --stack <name>              Swarm stack name / secret prefix (default: yndu)
  --registry <registry>           Registry base (default from repo owner, e.g. ghcr.io/owner)
  --image-name <name>             Image name (default from repo name)
  --cert <path>                   Cloudflare Origin cert path on VPS (PEM)
  --key <path>                    Cloudflare Origin private key path on VPS (PEM)
  --allow-self-signed             Generate self-signed cert if no cert/key provided
  -h, --help                      Show help

Examples:
  sudo ./deploy/vps-setup.sh \
    --domain yndufresh.com \
    --repo https://github.com/rorimwema/yndu.git \
    --tag latest \
    --cert /root/cert.pem \
    --key /root/key.pem
EOF
}

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || die "Missing required command: $1"
}

require_root_or_sudo() {
  if [ "${EUID}" -eq 0 ]; then
    SUDO=""
  elif sudo -n true 2>/dev/null; then
    SUDO="sudo"
  else
    die "Run as root or with passwordless sudo."
  fi
}

is_placeholder_secret() {
  local file="$1"
  [ ! -s "$file" ] && return 0
  grep -qiE 'replace-with|changeme|change_me|your-' "$file"
}

set_secret_if_placeholder() {
  local file="$1"
  local bytes="${2:-48}"
  if is_placeholder_secret "$file"; then
    openssl rand -base64 "$bytes" >"$file"
    log "Generated secret: $file"
  fi
}

copy_origin_certificates() {
  local cert_src="$1"
  local key_src="$2"
  local ssl_dir="$3"

  [ -f "$cert_src" ] || die "Cloudflare cert not found: $cert_src"
  [ -f "$key_src" ] || die "Cloudflare key not found: $key_src"

  $SUDO install -d -m 755 "$ssl_dir"
  $SUDO install -m 644 "$cert_src" "$ssl_dir/cert.pem"
  $SUDO install -m 600 "$key_src" "$ssl_dir/key.pem"
  log "Installed Cloudflare Origin certs at $ssl_dir"
}

generate_self_signed_certificates() {
  local domain="$1"
  local ssl_dir="$2"
  $SUDO install -d -m 755 "$ssl_dir"
  openssl req -x509 -nodes -newkey rsa:2048 -days 365 \
    -keyout "$ssl_dir/key.pem" \
    -out "$ssl_dir/cert.pem" \
    -subj "/CN=${domain}" >/dev/null 2>&1
  chmod 600 "$ssl_dir/key.pem"
  chmod 644 "$ssl_dir/cert.pem"
  warn "Generated self-signed cert. Cloudflare Full (strict) may fail; prefer Origin cert."
}

DOMAIN=""
REPO_URL="https://github.com/rorimwema/yndu.git"
DEPLOY_PATH="/opt/yndu"
TAG="latest"
STACK_NAME="yndu"
REGISTRY=""
IMAGE_NAME=""
CORS_ORIGIN=""
CERT_PATH=""
KEY_PATH=""
ALLOW_SELF_SIGNED="false"

while [ $# -gt 0 ]; do
  case "$1" in
    -d|--domain) DOMAIN="$2"; shift 2 ;;
    -r|--repo) REPO_URL="$2"; shift 2 ;;
    -p|--path) DEPLOY_PATH="$2"; shift 2 ;;
    -t|--tag) TAG="$2"; shift 2 ;;
    -o|--cors-origin) CORS_ORIGIN="$2"; shift 2 ;;
    -s|--stack) STACK_NAME="$2"; shift 2 ;;
    --registry) REGISTRY="$2"; shift 2 ;;
    --image-name) IMAGE_NAME="$2"; shift 2 ;;
    --cert) CERT_PATH="$2"; shift 2 ;;
    --key) KEY_PATH="$2"; shift 2 ;;
    --allow-self-signed) ALLOW_SELF_SIGNED="true"; shift ;;
    -h|--help) usage; exit 0 ;;
    *) die "Unknown argument: $1" ;;
  esac
done

require_root_or_sudo
require_cmd git
require_cmd openssl
require_cmd curl

if [ -z "$DOMAIN" ]; then
  die "Missing --domain. Example: --domain yndufresh.com"
fi

if [ -z "$CORS_ORIGIN" ]; then
  CORS_ORIGIN="https://${DOMAIN}"
fi

# Derive owner/repo from https://github.com/<owner>/<repo>.git
repo_slug="$(echo "$REPO_URL" | sed -E 's#https?://github.com/##; s#\.git$##')"
repo_owner="$(echo "$repo_slug" | cut -d/ -f1)"
repo_name="$(echo "$repo_slug" | cut -d/ -f2)"

[ -n "$repo_owner" ] || die "Could not parse repo owner from: $REPO_URL"
[ -n "$repo_name" ] || die "Could not parse repo name from: $REPO_URL"

if [ -z "$REGISTRY" ]; then
  REGISTRY="ghcr.io/${repo_owner}"
fi

if [ -z "$IMAGE_NAME" ]; then
  IMAGE_NAME="${repo_name}"
fi

log "Domain: ${DOMAIN}"
log "Deploy path: ${DEPLOY_PATH}"
log "Repo: ${REPO_URL}"
log "Stack: ${STACK_NAME}"
log "Registry: ${REGISTRY}"
log "Image name: ${IMAGE_NAME}"
log "Tag: ${TAG}"
log "CORS origin: ${CORS_ORIGIN}"

log "Updating apt packages..."
$SUDO apt-get update -y
$SUDO apt-get install -y ca-certificates curl git gnupg lsb-release ufw

if ! command -v docker >/dev/null 2>&1; then
  log "Installing Docker Engine..."
  curl -fsSL https://get.docker.com | sh
else
  log "Docker already installed."
fi

$SUDO systemctl enable --now docker

if ! docker compose version >/dev/null 2>&1; then
  log "Installing Docker Compose plugin..."
  $SUDO apt-get install -y docker-compose-plugin
fi

if ! docker info --format '{{.Swarm.LocalNodeState}}' 2>/dev/null | grep -qE 'active|pending'; then
  log "Initializing Docker Swarm..."
  docker swarm init >/dev/null
else
  log "Docker Swarm already initialized."
fi

log "Configuring UFW (22,80,443)..."
$SUDO ufw default deny incoming
$SUDO ufw default allow outgoing
$SUDO ufw allow 22/tcp
$SUDO ufw allow 80/tcp
$SUDO ufw allow 443/tcp
$SUDO ufw --force enable

log "Preparing deployment directory..."
$SUDO mkdir -p "$DEPLOY_PATH"
$SUDO chown -R "$(id -u):$(id -g)" "$DEPLOY_PATH"

if [ -d "$DEPLOY_PATH/.git" ]; then
  log "Repository exists. Pulling latest..."
  git -C "$DEPLOY_PATH" fetch --all --prune
  git -C "$DEPLOY_PATH" checkout main
  git -C "$DEPLOY_PATH" pull --ff-only
else
  log "Cloning repository..."
  git clone "$REPO_URL" "$DEPLOY_PATH"
fi

cd "$DEPLOY_PATH"

[ -f "docker-stack.yml" ] || die "docker-stack.yml not found in $DEPLOY_PATH"
[ -f "scripts/swarm/create-secrets.sh" ] || die "scripts/swarm/create-secrets.sh not found."

if [ ! -d "secrets/prod" ]; then
  [ -d "secrets.example" ] || die "secrets.example directory not found."
  cp -R secrets.example secrets
  log "Created secrets/ from secrets.example/"
fi

set_secret_if_placeholder "secrets/prod/postgres_password.txt" 32
set_secret_if_placeholder "secrets/prod/database_password.txt" 32
set_secret_if_placeholder "secrets/prod/redis_password.txt" 32
set_secret_if_placeholder "secrets/prod/jwt_secret.txt" 64
set_secret_if_placeholder "secrets/prod/nuxt_session_password.txt" 32

for required in \
  secrets/prod/hashpay_api_key.txt \
  secrets/prod/hashpay_account_id.txt
do
  if is_placeholder_secret "$required"; then
    warn "Payment secret still placeholder: $required"
  fi
done

SSL_DIR="$DEPLOY_PATH/nginx/ssl"
if [ -n "$CERT_PATH" ] && [ -n "$KEY_PATH" ]; then
  copy_origin_certificates "$CERT_PATH" "$KEY_PATH" "$SSL_DIR"
else
  if [ "$ALLOW_SELF_SIGNED" = "true" ]; then
    generate_self_signed_certificates "$DOMAIN" "$SSL_DIR"
  else
    warn "No --cert/--key provided."
    warn "For Cloudflare Full (strict), provide Origin cert and key."
  fi
fi

chmod +x scripts/swarm/create-secrets.sh
STACK_PREFIX="$STACK_NAME" SECRETS_DIR="secrets/prod" ./scripts/swarm/create-secrets.sh

export REGISTRY IMAGE_NAME TAG CORS_ORIGIN
log "Deploying Swarm stack..."
docker stack deploy -c docker-stack.yml "$STACK_NAME"

log "Waiting for services..."
sleep 5
docker stack services "$STACK_NAME" || true
docker stack ps "$STACK_NAME" || true

log "Setup complete."
echo
echo "Next checks:"
echo "  docker stack services $STACK_NAME"
echo "  docker service logs -f ${STACK_NAME}_nginx"
echo "  curl -I https://${DOMAIN}"
