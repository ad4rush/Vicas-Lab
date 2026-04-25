#!/bin/bash
# ============================================================================
# VICAS Hub — Data Migration Script
# Downloads your SQLite database from the current Render instance
# and uploads it to your GCE VM
#
# Run this FROM YOUR LOCAL MACHINE before shutting down Render
# ============================================================================

set -e

RENDER_BACKEND_URL="https://vicas-hub-api.onrender.com"  # Your Render backend URL
GCE_VM_NAME="vicas-hub-server"
GCE_ZONE="us-central1-a"

echo "========================================="
echo "  VICAS Hub — Data Migration"
echo "========================================="
echo ""

# Step 1: Check if we can reach the Render backend
echo "[1/3] Checking Render backend..."
HEALTH=$(curl -s "${RENDER_BACKEND_URL}/" 2>/dev/null)
if echo "$HEALTH" | grep -q "ok"; then
  echo "  ✅ Render backend is reachable"
else
  echo "  ⚠️  Render backend is not reachable (may be sleeping)."
  echo "  Hit ${RENDER_BACKEND_URL}/ in your browser first to wake it up,"
  echo "  then run this script again."
  exit 1
fi

echo ""
echo "[2/3] You need to manually download the SQLite database."
echo ""
echo "  Since Render doesn't expose filesystem access directly,"
echo "  you have two options:"
echo ""
echo "  Option A: If you added a /api/debug/download-db endpoint (dev only):"
echo "    curl -o db.sqlite ${RENDER_BACKEND_URL}/api/debug/download-db"
echo ""
echo "  Option B: Use the Render dashboard → Shell tab:"
echo "    1. Open your service on render.com"
echo "    2. Go to the Shell tab"
echo "    3. Run: cat /opt/render/project/src/server/data/db.sqlite | base64"
echo "    4. Copy the output, decode it locally:"
echo "       echo '<base64_output>' | base64 -d > db.sqlite"
echo ""
echo "  Option C: Run the seed script on GCE to start fresh:"
echo "    ssh into VM → cd /opt/vicas-hub/server → node seed.js"
echo ""

echo "[3/3] Once you have db.sqlite, upload it to GCE:"
echo ""
echo "  gcloud compute scp db.sqlite ${GCE_VM_NAME}:/opt/vicas-hub/server/data/db.sqlite --zone=${GCE_ZONE}"
echo "  gcloud compute ssh ${GCE_VM_NAME} --zone=${GCE_ZONE} --command='sudo pm2 restart vicas-backend'"
echo ""
echo "Done! Your data will be preserved on GCE's persistent disk."
