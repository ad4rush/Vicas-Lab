#!/bin/bash
# ============================================================================
# VICAS Hub — Google Cloud Compute Engine Setup Script
# Run this ONCE after creating your e2-micro VM (Debian 12)
#
# Usage:
#   1. SSH into your GCE VM
#   2. Upload this script:  gcloud compute scp setup-gce.sh vicas-hub-server:~ --zone=us-central1-a
#   3. Run:  chmod +x setup-gce.sh && sudo ./setup-gce.sh
# ============================================================================

set -e  # Exit on any error

# ─── CONFIGURATION ──────────────────────────────────────────────
# Change these values before running!

REPO_URL="https://github.com/YOUR_USERNAME/vicas-hub.git"   # Your GitHub repo URL
DOMAIN=""                                                     # Leave empty to use raw IP, or set e.g. "api.vicaslab.com"
NODE_VERSION="20"

# Backend environment variables
ACCESS_TOKEN_SECRET="vicas_access_secret_2024"
REFRESH_TOKEN_SECRET="vicas_refresh_secret_2024"
GOOGLE_CLIENT_ID="183722713721"
FRONTEND_ORIGIN="https://vicas-lab.vercel.app"
FIREBASE_STORAGE_BUCKET="vicas-hub.firebasestorage.app"

# ─── SYSTEM PACKAGES ───────────────────────────────────────────

echo "========================================="
echo "  VICAS Hub — GCE Server Setup"
echo "========================================="
echo ""

echo "[1/7] Updating system packages..."
apt-get update -y && apt-get upgrade -y

echo "[2/7] Installing Node.js ${NODE_VERSION}..."
curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
apt-get install -y nodejs

echo "  Node.js version: $(node -v)"
echo "  npm version: $(npm -v)"

echo "[3/7] Installing nginx, git, certbot..."
apt-get install -y nginx git certbot python3-certbot-nginx

# ─── APPLICATION SETUP ─────────────────────────────────────────

APP_DIR="/opt/vicas-hub"

echo "[4/7] Cloning repository..."
if [ -d "$APP_DIR" ]; then
  echo "  Directory exists, pulling latest..."
  cd "$APP_DIR" && git pull
else
  git clone "$REPO_URL" "$APP_DIR"
fi

cd "$APP_DIR/server"

echo "[5/7] Installing Node.js dependencies..."
npm install --production

# Create data directory (for SQLite)
mkdir -p data
mkdir -p uploads/gallery uploads/content uploads/pdfs uploads/pending uploads/General

# ─── ENVIRONMENT FILE ──────────────────────────────────────────

echo "[5.5/7] Creating .env file..."
cat > .env << EOF
PORT=4000
NODE_ENV=production
ACCESS_TOKEN_SECRET=${ACCESS_TOKEN_SECRET}
REFRESH_TOKEN_SECRET=${REFRESH_TOKEN_SECRET}
GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
FRONTEND_ORIGIN=${FRONTEND_ORIGIN}
DB_FILE=./data/db.sqlite
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json
FIREBASE_STORAGE_BUCKET=${FIREBASE_STORAGE_BUCKET}
EOF

echo ""
echo "  ┌─────────────────────────────────────────────────────────┐"
echo "  │  IMPORTANT: You need to manually copy your Firebase     │"
echo "  │  service account JSON to:                               │"
echo "  │  /opt/vicas-hub/server/firebase-service-account.json    │"
echo "  │                                                         │"
echo "  │  From your local machine, run:                          │"
echo "  │  gcloud compute scp firebase-service-account.json \\     │"
echo "  │    vicas-hub-server:/opt/vicas-hub/server/ \\            │"
echo "  │    --zone=us-central1-a                                 │"
echo "  └─────────────────────────────────────────────────────────┘"
echo ""

# ─── PM2 PROCESS MANAGER ───────────────────────────────────────

echo "[6/7] Setting up PM2..."
npm install -g pm2

# Stop existing process if running
pm2 delete vicas-backend 2>/dev/null || true

# Start the server
pm2 start index.js --name vicas-backend --env production
pm2 save

# Set PM2 to auto-start on boot
pm2 startup systemd -u root --hp /root
pm2 save

echo "  PM2 is running. Server on port 4000."

# ─── NGINX REVERSE PROXY ───────────────────────────────────────

echo "[7/7] Configuring nginx..."

# Remove default site
rm -f /etc/nginx/sites-enabled/default

if [ -z "$DOMAIN" ]; then
  # ─── No domain: use IP address ───
  SERVER_IP=$(curl -s http://metadata.google.internal/computeMetadata/v1/instance/network-interfaces/0/access-configs/0/external-ip -H "Metadata-Flavor: Google")

  cat > /etc/nginx/sites-available/vicas-hub << EOF
server {
    listen 80;
    server_name ${SERVER_IP};

    # Max upload size (for photos)
    client_max_body_size 50M;

    location / {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

  echo ""
  echo "  ┌──────────────────────────────────────────────────────┐"
  echo "  │  No domain configured. Backend available at:         │"
  echo "  │  http://${SERVER_IP}                                 │"
  echo "  │                                                      │"
  echo "  │  Set this in Vercel as REACT_APP_API_BASE:           │"
  echo "  │  http://${SERVER_IP}                                 │"
  echo "  └──────────────────────────────────────────────────────┘"
  echo ""

else
  # ─── With domain: configure for SSL ───
  cat > /etc/nginx/sites-available/vicas-hub << EOF
server {
    listen 80;
    server_name ${DOMAIN};

    # Max upload size (for photos)
    client_max_body_size 50M;

    location / {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

  echo ""
  echo "  Domain configured: ${DOMAIN}"
  echo "  After DNS propagates, run:"
  echo "    sudo certbot --nginx -d ${DOMAIN}"
  echo "  to get free HTTPS."
  echo ""
fi

ln -sf /etc/nginx/sites-available/vicas-hub /etc/nginx/sites-enabled/vicas-hub

# Test and restart nginx
nginx -t
systemctl restart nginx
systemctl enable nginx

# ─── FIREWALL ───────────────────────────────────────────────────

echo ""
echo "========================================="
echo "  ✅ SETUP COMPLETE!"
echo "========================================="
echo ""
echo "  Backend is live at port 4000 (proxied through nginx on port 80)"
echo ""
echo "  Remaining steps:"
echo "  1. Copy firebase-service-account.json to /opt/vicas-hub/server/"
echo "  2. Restart: pm2 restart vicas-backend"
echo "  3. Update Vercel env var: REACT_APP_API_BASE=http://<YOUR_IP>"
echo "  4. Redeploy Vercel frontend"
echo "  5. Update Google OAuth authorized origins"
echo ""
echo "  Useful commands:"
echo "    pm2 status              — check if server is running"
echo "    pm2 logs vicas-backend  — view live logs"
echo "    pm2 restart vicas-backend — restart after changes"
echo ""
