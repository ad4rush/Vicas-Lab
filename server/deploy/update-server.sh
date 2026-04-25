#!/bin/bash
# ============================================================================
# VICAS Hub — Update & Restart Script
# Run this whenever you push code changes to GitHub
#
# Usage: ssh into VM and run:
#   sudo /opt/vicas-hub/server/deploy/update-server.sh
# ============================================================================

set -e

APP_DIR="/opt/vicas-hub"

echo "Pulling latest changes..."
cd "$APP_DIR"
git pull

echo "Installing dependencies..."
cd "$APP_DIR/server"
npm install --production

echo "Restarting server..."
pm2 restart vicas-backend

echo "✅ Server updated and restarted!"
pm2 status
