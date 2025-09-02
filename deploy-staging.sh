# === Part 2: SSH into Lightsail and create a new release folder ===
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
REMOTE_DIR="/home/bitnami/releases/staging/$TIMESTAMP"

echo "🔑 Connecting to Lightsail and creating release directory $REMOTE_DIR ..."
ssh -i ~/.ssh/LightsailDefaultKey.pem bitnami@3.72.14.168 "mkdir -p $REMOTE_DIR"

echo "✅ Done! New release folder created on server: $REMOTE_DIR"
