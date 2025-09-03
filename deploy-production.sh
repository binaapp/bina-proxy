#!/usr/bin/env bash
set -e  # stop on error

# === Part 1: Build and upload frontend to S3/CloudFront (PRODUCTION) ===
echo "Building project (production)..."
npm run build -- --mode production

echo "Uploading files to S3 (excluding index.html)..."
aws s3 sync ./dist s3://binaapp \
  --exclude "index.html" \
  --cache-control "public, max-age=31536000, immutable" \
  --delete

echo "Uploading index.html with no-cache..."
aws s3 cp ./dist/index.html s3://binaapp/index.html \
  --cache-control "no-cache, no-store, must-revalidate"

echo "Creating CloudFront invalidation..."
aws cloudfront create-invalidation \
  --distribution-id E365NL1YSPOQ3T \
  --paths "/*"

# === Part 2: SSH → create timestamped production release and clone repo ===
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
REMOTE_BASE="/home/bitnami/releases/production"
REMOTE_DIR="$REMOTE_BASE/$TIMESTAMP"

REPO="git@github.com:binaapp/bina-proxy.git"
BRANCH="main"  # change if you deploy a different branch to prod

SSH_KEY="$HOME/.ssh/LightsailDefaultKey.pem"
SSH_HOST="bitnami@3.72.14.168"

echo "Creating remote production release: $REMOTE_DIR"
ssh -i "$SSH_KEY" "$SSH_HOST" "mkdir -p '$REMOTE_BASE' && mkdir -p '$REMOTE_DIR'"

echo "Cloning repo into $REMOTE_DIR (branch: $BRANCH)..."
ssh -i "$SSH_KEY" "$SSH_HOST" "\
  command -v git >/dev/null 2>&1 || { echo 'git not found on server'; exit 1; }; \
  cd '$REMOTE_DIR' && \
  git clone --depth 1 --branch '$BRANCH' '$REPO' . \
"

echo "📦 Installing dependencies..."

ssh -i "$SSH_KEY" "$SSH_HOST" "cd '$REMOTE_DIR' && npm install"


# === Part 3: Update the production symlink ===
# This will atomically point /home/bitnami/bina-proxy to the new release
echo "Updating symlink /home/bitnami/bina-proxy -> $REMOTE_DIR"
ssh -i "$SSH_KEY" "$SSH_HOST" "ln -sfn '$REMOTE_DIR' /home/bitnami/bina-proxy"
ssh -i "$SSH_KEY" "$SSH_HOST" "ln -sfn /home/bitnami/shared/.env.production '$REMOTE_DIR/.env'"


echo "✅ Production deploy complete. Active release: $REMOTE_DIR"
