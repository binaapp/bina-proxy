#!/usr/bin/env bash
set -e  # stop on error

# === Part 1: Build and upload to S3 ===
echo "📦 Building project (staging)..."
npm run build -- --mode staging

echo "🚀 Uploading files to S3 (excluding index.html)..."
aws s3 sync ./dist s3://staging.binaapp.com \
  --exclude "index.html" \
  --cache-control "public, max-age=31536000, immutable" \
  --delete

echo "📄 Uploading index.html with no-cache..."
aws s3 cp ./dist/index.html s3://staging.binaapp.com/index.html \
  --cache-control "no-cache, no-store, must-revalidate"

echo "🌐 Creating CloudFront invalidation..."
aws cloudfront create-invalidation \
  --distribution-id E2EI2KZETP4HQH \
  --paths "/*"

# === Part 2: SSH → create timestamped release folder and clone repo ===
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
REMOTE_BASE="/home/bitnami/releases/staging"
REMOTE_DIR="$REMOTE_BASE/$TIMESTAMP"

REPO="git@github.com:binaapp/bina-proxy.git"
BRANCH="main"  # change to 'staging' if you use a staging branch

SSH_KEY="$HOME/.ssh/LightsailDefaultKey.pem"
SSH_HOST="bitnami@3.72.14.168"

echo "Creating remote release directory: $REMOTE_DIR"
ssh -i "$SSH_KEY" "$SSH_HOST" "mkdir -p '$REMOTE_BASE' && mkdir -p '$REMOTE_DIR'"

echo "Cloning repo into $REMOTE_DIR (branch: $BRANCH)..."
ssh -i "$SSH_KEY" "$SSH_HOST" "\
  command -v git >/dev/null 2>&1 || { echo 'git not found on server'; exit 1; }; \
  cd '$REMOTE_DIR' && \
  git clone --depth 1 --branch '$BRANCH' '$REPO' . \
"

echo "✅ Done. New backend release is at: $REMOTE_DIR"


# === Part 4: Update symlink for my-app-staging ===
echo "🔗 Updating symlink /home/bitnami/my-app-staging -> $REMOTE_DIR"

ssh -i "$SSH_KEY" "$SSH_HOST" "ln -sfn $REMOTE_DIR /home/bitnami/my-app-staging"
