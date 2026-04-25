# VICAS Hub — Deployment Guide & Screenshot Reference

> A complete guide to deploying VICAS Hub for free, plus a reference for taking product screenshots.

---

## Table of Contents

- [Free Deployment Options](#free-deployment-options)
- [Option A — Render (Backend) + Vercel (Frontend)](#option-a----render--vercel)
- [Option B — Railway (Full Stack)](#option-b----railway)
- [Option C — Google Cloud Compute Engine](#option-c---google-cloud-compute-engine-free-tier--recommended)
- [Option D — AWS EC2 (Free Tier)](#option-d---aws-ec2-free-tier)
- [Database: Migrating from SQLite to Turso (Free Persistent SQLite)](#database-migration)
- [File Storage: Using Firebase Storage](#file-storage)
- [Environment Variables Reference](#environment-variables-reference)
- [Screenshot Guide — Pages & Captions](#screenshot-guide)

---

## Storage Requirements Analysis

Before choosing a hosting platform, here's what VICAS Hub actually consumes:

| Component | Current Size | Projected (2 years, ~50 users) |
|-----------|-------------|--------------------------------|
| SQLite database (`db.sqlite`) | **~104 KB** | ~5–10 MB |
| Gallery photos (uploads) | **~1.57 MB** | ~500 MB – 1 GB |
| PDF papers & content images | ~0 MB | ~200–500 MB |
| **Total** | **~1.7 MB** | **~1–2 GB** |

> [!TIP]
> VICAS Hub is extremely lightweight. Even after 2 years of active use by ~50 lab members, total storage will comfortably stay under 2 GB — well within every free tier listed below.

---

## Free Deployment Options

| Service | What it hosts | Free tier limit | Persistent disk? | Duration |
|---------|--------------|-----------------|-----------------|----------|
| **Render** | Express backend | 750 hrs/month, sleeps after 15 min idle | ❌ Ephemeral | Indefinite |
| **Vercel** | React frontend | Unlimited static | ✅ N/A (static) | Indefinite |
| **GCE e2-micro** ⭐ | Express backend | Always Free (24/7, no sleeping) | ✅ 30 GB persistent | Always Free |
| **AWS EC2 t2.micro** | Express backend | 750 hrs/month + 30 GB EBS + 5 GB S3 | ✅ 30 GB persistent | **12 months** |
| **Railway** | Both frontend + backend | $5 free credit/month | ✅ Volumes available | Indefinite |
| **Turso** | SQLite (cloud-hosted) | 500 DBs, 9 GB storage | ✅ Yes | Indefinite |
| **Firebase Storage** | Images + PDFs | 5 GB free | ✅ Yes | Indefinite |

> [!IMPORTANT]
> **Recommended for long-term:** Use **Option C (GCE + Vercel)** — it's Always Free with no expiry.  
> **Recommended if you already have AWS:** Use **Option D (AWS EC2 + Vercel)** — generous 12-month free tier with the same architecture, but you pay ~$4/month after the first year.

---

## Option A — Render + Vercel

### Step 1: Deploy the Backend on Render

1. Push your project to GitHub.
2. Go to [render.com](https://render.com) → **New → Web Service**
3. Connect your GitHub repo.
4. Configure:

| Setting | Value |
|---------|-------|
| **Root Directory** | `server` |
| **Build Command** | `npm install` |
| **Start Command** | `node index.js` |
| **Environment** | `Node` |

5. Add all environment variables from the table below.
6. Click **Deploy**.
7. Note the URL — e.g., `https://vicas-hub-api.onrender.com`

> [!NOTE]
> On Render's free tier, the server **sleeps after 15 minutes of inactivity** and takes ~30 seconds to wake. Upgrade to the $7/month Starter plan to avoid this.

---

### Step 2: Deploy the Frontend on Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import your GitHub repo.
3. Set the **Root Directory** to `/` (the project root, not `/src`).
4. Set **Framework Preset** to `Create React App`.
5. Add environment variables:

```
REACT_APP_API_BASE=https://vicas-hub-api.onrender.com
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
```

6. Deploy. Your frontend will be at `https://vicas-hub.vercel.app` or similar.

7. Go back to Render → your backend service → Environment → add:
```
FRONTEND_ORIGIN=https://vicas-hub.vercel.app
```

---

## Option B — Railway

Railway is simpler — it can host both services with persistent volumes.

1. Go to [railway.app](https://railway.app) → **New Project → Deploy from GitHub**
2. Create **two services**: one for the backend (`server/`), one for the frontend (root).
3. For the backend service, add a **Volume** mounted at `/app/server/data` to persist SQLite.
4. Set all environment variables in each service's settings.
5. Railway auto-assigns public URLs for each service.

---

## Option C — Google Cloud Compute Engine (Free Tier) ⭐ RECOMMENDED

> **Best option for persistent storage.** GCE's `e2-micro` VM is free forever and gives you a 30 GB persistent disk. Your SQLite database and uploaded files survive reboots and redeploys. No code changes needed.

### Architecture

| Component | Service | Cost |
|-----------|---------|------|
| Frontend | **Vercel** (stays as-is) | Free |
| Backend | **GCE e2-micro VM** | Free (Always Free tier) |
| Database | **SQLite on persistent disk** | Free (part of 30 GB disk) |
| File uploads | **Firebase Storage** | Free (5 GB) |

### Step 1: Create the VM

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a project (or use existing `vicas-hub` project)
3. Enable **Compute Engine API**
4. Go to **Compute Engine → VM Instances → Create Instance**
5. Configure:

| Setting | Value |
|---------|-------|
| **Name** | `vicas-hub-server` |
| **Region** | `us-central1` (Iowa) — **must be a US region for free tier** |
| **Zone** | `us-central1-a` |
| **Machine type** | `e2-micro` (2 vCPU, 1 GB memory) |
| **Boot disk** | Debian 12, **Standard persistent disk**, 30 GB |
| **Firewall** | ✅ Allow HTTP traffic, ✅ Allow HTTPS traffic |

6. Click **Create**. Note the **External IP** address.

### Step 2: Set Up the Server

```bash
# From your local machine, upload the setup script:
gcloud compute scp server/deploy/setup-gce.sh vicas-hub-server:~ --zone=us-central1-a

# SSH into the VM:
gcloud compute ssh vicas-hub-server --zone=us-central1-a

# Edit the script to set your GitHub repo URL:
nano ~/setup-gce.sh
# Change REPO_URL="https://github.com/YOUR_USERNAME/vicas-hub.git"

# Run setup:
chmod +x ~/setup-gce.sh
sudo ~/setup-gce.sh
```

### Step 3: Upload Firebase Service Account

```bash
# From your local machine:
gcloud compute scp server/firebase-service-account.json \
  vicas-hub-server:/opt/vicas-hub/server/firebase-service-account.json \
  --zone=us-central1-a

# SSH in and restart:
gcloud compute ssh vicas-hub-server --zone=us-central1-a \
  --command="sudo pm2 restart vicas-backend"
```

### Step 4: Verify Backend

```bash
# Test from your machine:
curl http://<YOUR_VM_IP>/
# Should return: {"ok":true}
```

### Step 5: Update Vercel Frontend

Go to [Vercel Dashboard](https://vercel.com) → Your project → Settings → Environment Variables:

```
REACT_APP_API_BASE=http://<YOUR_VM_IP>
```

Click **Redeploy** to apply the change.

### Step 6: Update Google OAuth (Important!)

Go to [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials → Your OAuth Client:

1. Add to **Authorized JavaScript origins**:
   - `http://<YOUR_VM_IP>`
   - `https://vicas-lab.vercel.app`
2. Add to **Authorized redirect URIs**:
   - `http://<YOUR_VM_IP>`
   - `https://vicas-lab.vercel.app`

### Step 7: Update Backend CORS

SSH into the VM and edit the `.env` file:
```bash
gcloud compute ssh vicas-hub-server --zone=us-central1-a
sudo nano /opt/vicas-hub/server/.env
```

Ensure `FRONTEND_ORIGIN` matches your Vercel URL:
```
FRONTEND_ORIGIN=https://vicas-lab.vercel.app
```

Restart: `sudo pm2 restart vicas-backend`

### Updating After Code Changes

Whenever you push new code to GitHub:
```bash
gcloud compute ssh vicas-hub-server --zone=us-central1-a \
  --command="sudo /opt/vicas-hub/server/deploy/update-server.sh"
```

### Optional: Add HTTPS with a Custom Domain

If you have a domain (e.g., `vicaslab.com`):

1. Point an A record: `api.vicaslab.com` → `<YOUR_VM_IP>`
2. SSH into VM and run:
   ```bash
   sudo certbot --nginx -d api.vicaslab.com
   ```
3. Update Vercel env var: `REACT_APP_API_BASE=https://api.vicaslab.com`
4. Update backend `.env`: `FRONTEND_ORIGIN=https://vicas-lab.vercel.app`

> [!TIP]
> Without a custom domain, the backend runs on HTTP (not HTTPS). This is fine for development but some browsers may block mixed content (HTTPS frontend → HTTP backend). Consider adding a domain for production use.

---

## Option D — AWS EC2 Free Tier + Vercel

> **Best for:** Teams already using AWS or wanting a familiar cloud provider. The 12-month free tier is generous — 750 hrs/month of EC2 (enough to run 24/7), 30 GB disk, and 5 GB S3 storage. After 12 months, the `t2.micro` costs ~$4/month.

### AWS Free Tier — What You Get

| AWS Service | Free Tier Allowance | VICAS Hub Needs | Verdict |
|-------------|--------------------|-----------------|---------|
| **EC2 t2.micro** | 750 hrs/month (1 vCPU, 1 GB RAM) | Node.js backend (~50 MB RAM idle) | ✅ More than enough |
| **EBS (Disk)** | 30 GB general-purpose SSD | SQLite DB (~104 KB) + uploads (~1.57 MB) | ✅ Uses < 0.1% of quota |
| **S3 (Object Storage)** | 5 GB + 20K GET / 2K PUT per month | Optional — for images/PDFs | ✅ Plenty |
| **Data Transfer** | 100 GB/month outbound (aggregated) | Low-traffic lab site | ✅ Plenty |

> [!WARNING]
> **The EC2 free tier expires after 12 months.** After that, a `t2.micro` in `us-east-1` costs ~$8.50/month on-demand, or ~$4/month with a 1-year reserved instance. Set up **AWS Budgets** to get alerts before any charges hit.

### Architecture

| Component | Service | Cost |
|-----------|---------|------|
| Frontend | **Vercel** (stays as-is) | Free forever |
| Backend | **AWS EC2 t2.micro** | Free for 12 months |
| Database | **SQLite on EBS volume** | Free (part of 30 GB EBS) |
| File uploads | **S3** or local EBS disk | Free (5 GB S3 / 30 GB EBS) |

### Step 1: Launch the EC2 Instance

1. Sign up / log in at [aws.amazon.com](https://aws.amazon.com)
2. Go to **EC2 → Launch Instance**
3. Configure:

| Setting | Value |
|---------|-------|
| **Name** | `vicas-hub-server` |
| **AMI** | Amazon Linux 2023 (or Ubuntu 22.04) |
| **Instance type** | `t2.micro` (Free tier eligible) |
| **Key pair** | Create new → download `.pem` file |
| **Network** | Allow SSH (port 22), HTTP (port 80), HTTPS (port 443), Custom TCP (port 4000) |
| **Storage** | 30 GB gp3 (max free tier) |

4. Click **Launch Instance**.
5. Note the **Public IPv4 address** from the instance details.

### Step 2: Connect & Install Dependencies

```bash
# Connect via SSH (replace with your key and IP)
ssh -i "your-key.pem" ec2-user@<YOUR_PUBLIC_IP>

# Update system
sudo yum update -y          # Amazon Linux
# OR: sudo apt update -y   # Ubuntu

# Install Node.js 18+
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs git
# OR for Ubuntu:
# curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
# sudo apt install -y nodejs git

# Install PM2 (process manager)
sudo npm install -g pm2
```

### Step 3: Deploy the Backend

```bash
# Clone your repo
cd /opt
sudo git clone https://github.com/ad4rush/Vicas-Lab.git vicas-hub
sudo chown -R ec2-user:ec2-user /opt/vicas-hub

# Install backend dependencies
cd /opt/vicas-hub/server
npm install

# Create the .env file
cat > .env << 'EOF'
PORT=4000
NODE_ENV=production
ACCESS_TOKEN_SECRET=<your_random_secret_1>
REFRESH_TOKEN_SECRET=<your_random_secret_2>
FRONTEND_ORIGIN=https://vicas-lab.vercel.app
FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json
FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
GOOGLE_CLIENT_ID=your_google_client_id
DB_FILE=./data/db.sqlite
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM="VICAS Lab" <your_email@gmail.com>
FRONTEND_URL=https://vicas-lab.vercel.app
EOF

# Upload your Firebase service account key
# (from your local machine):
# scp -i "your-key.pem" serviceAccountKey.json ec2-user@<IP>:/opt/vicas-hub/server/

# Seed sample data (first time only)
node seed.js

# Start with PM2
pm2 start index.js --name vicas-backend
pm2 save
pm2 startup  # Follow the printed command to enable auto-start on reboot
```

### Step 4: Set Up Nginx Reverse Proxy (Optional but Recommended)

```bash
# Install Nginx
sudo yum install -y nginx   # Amazon Linux
# OR: sudo apt install -y nginx   # Ubuntu

# Configure
sudo tee /etc/nginx/conf.d/vicas.conf > /dev/null << 'EOF'
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        client_max_body_size 50M;
    }
}
EOF

sudo systemctl enable nginx
sudo systemctl start nginx
```

### Step 5: Verify

```bash
curl http://<YOUR_PUBLIC_IP>/
# Should return: {"ok":true}
```

### Step 6: Update Vercel + Google OAuth

1. **Vercel**: Set `REACT_APP_API_BASE=http://<YOUR_PUBLIC_IP>` → Redeploy.
2. **Google Cloud Console** → Credentials → OAuth Client:
   - Add `http://<YOUR_PUBLIC_IP>` to Authorized JavaScript Origins
   - Add `https://vicas-lab.vercel.app` to Authorized Redirect URIs

### Step 7: Set Up AWS Budget Alert (Critical!)

1. Go to **AWS Console → Billing → Budgets → Create Budget**
2. Choose **Cost budget** → Set amount to **$1.00**
3. Add your email for notifications at **80% threshold**
4. This ensures you get warned before any unexpected charges

### Updating After Code Changes

```bash
ssh -i "your-key.pem" ec2-user@<YOUR_PUBLIC_IP>
cd /opt/vicas-hub
git pull origin main
cd server && npm install
pm2 restart vicas-backend
```

### Optional: Add HTTPS with Let's Encrypt

If you point a domain (e.g., `api.vicaslab.com`) to your EC2 IP:

```bash
sudo yum install -y certbot python3-certbot-nginx   # Amazon Linux
# OR: sudo apt install -y certbot python3-certbot-nginx  # Ubuntu
sudo certbot --nginx -d api.vicaslab.com
```

### AWS vs GCE Comparison

| Feature | AWS EC2 (Option D) | GCE e2-micro (Option C) |
|---------|-------------------|------------------------|
| **Free duration** | 12 months only | Always Free (forever) |
| **CPU / RAM** | 1 vCPU, 1 GB | 2 vCPU (shared), 1 GB |
| **Disk** | 30 GB SSD | 30 GB Standard |
| **After free tier** | ~$4–8.50/month | Still free |
| **Sleep / Spin-down** | No (runs 24/7) | No (runs 24/7) |
| **Ecosystem** | Larger (S3, RDS, etc.) | Smaller but sufficient |
| **Ease of setup** | Moderate | Moderate |

> [!CAUTION]
> **After 12 months on AWS**, if you don't terminate the instance, you will be charged. Either:
> 1. Migrate to GCE (free forever) before the year is up, or
> 2. Budget ~$4/month for a reserved instance.

---

## Database Migration

### Migrate SQLite → Turso (Free Persistent Cloud SQLite)

Turso gives you a real persistent SQLite database accessible over the network.

#### 1. Install Turso CLI
```bash
curl -sSfL https://get.tur.so/install.sh | bash
turso auth login
```

#### 2. Create a database and get credentials
```bash
turso db create vicas-hub
turso db show vicas-hub       # Note the URL
turso db tokens create vicas-hub  # Note the auth token
```

#### 3. Install the Turso client in the backend
```bash
cd server
npm install @libsql/client
```

#### 4. Update `server/db.js`
Replace the `sqlite` + `sqlite3` open call with:

```js
const { createClient } = require('@libsql/client');

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});
```

Then replace every `db.run(...)` / `db.get(...)` / `db.all(...)` with the equivalent `client.execute(...)` calls from the libsql API.

#### 5. Add env variables to Render/Railway
```
TURSO_DATABASE_URL=libsql://vicas-hub-xxxxx.turso.io
TURSO_AUTH_TOKEN=your_token_here
```

---

## File Storage

### Use Firebase Storage for Images and PDFs

Your project already has Firebase Admin configured. To make uploads persist:

#### In `contentController.js`, replace `saveFileLocally()` with:

```js
const { getStorage } = require('firebase-admin/storage');
const bucket = getStorage().bucket();

async function saveToFirebase(base64Data, fileName, folder) {
  const cleanBase64 = base64Data.replace(/^data:[^;]+;base64,/, '');
  const buffer = Buffer.from(cleanBase64, 'base64');
  const uniqueName = `${folder}/${uuidv4()}_${fileName}`;
  const file = bucket.file(uniqueName);
  await file.save(buffer, { public: true });
  const publicUrl = `https://storage.googleapis.com/${bucket.name}/${uniqueName}`;
  return { publicUrl, storagePath: uniqueName };
}
```

Do the same for `galleryController.js`.

---

## Environment Variables Reference

### Backend (`server/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | Yes | Server port (default: 4000) |
| `NODE_ENV` | Yes | `development` or `production` |
| `ACCESS_TOKEN_SECRET` | Yes | Long random string for JWT signing |
| `REFRESH_TOKEN_SECRET` | Yes | Different long random string |
| `FRONTEND_ORIGIN` | Yes | Frontend URL for CORS |
| `FIREBASE_SERVICE_ACCOUNT_PATH` | Yes (Google OAuth) | Path to Firebase service account JSON |
| `FIREBASE_STORAGE_BUCKET` | Yes (file uploads) | Firebase storage bucket name |
| `GOOGLE_CLIENT_ID` | Yes (Google login) | From Google Cloud Console |
| `DB_FILE` | No | SQLite file path (default: `./data/db.sqlite`) |
| `TURSO_DATABASE_URL` | If using Turso | Cloud SQLite URL |
| `TURSO_AUTH_TOKEN` | If using Turso | Cloud SQLite auth token |

### Frontend (`.env` in root)

| Variable | Required | Description |
|----------|----------|-------------|
| `REACT_APP_API_BASE` | Yes | Backend URL (e.g., `http://localhost:4000`) |
| `REACT_APP_GOOGLE_CLIENT_ID` | Yes (Google login) | From Google Cloud Console |

---

## Screenshot Guide

> Use these pages and scenarios to get the best screenshots for your portfolio/presentation. Start the app locally with `npm start` (frontend) and `node index.js` (backend).

---

### 🏠 Home Page — `/`

**URL**: `http://localhost:3000/`

**What to capture**:
- Full-page hero with VICAS Lab branding and background image
- Navigation bar with logo, links, and "Get in Touch" button
- Scroll down to show the research highlights / quick stats section

**Caption suggestion**:
> *Home page of VICAS Hub — the lab's central platform for research showcase and community management.*

---

### 👤 About Page — `/about`

**URL**: `http://localhost:3000/about`

**What to capture**:
- The full hero section
- Team/faculty cards section

**Caption suggestion**:
> *About page with lab overview and faculty profiles.*

---

### 🔬 Research Projects Page — `/projects`

**URL**: `http://localhost:3000/projects`

**What to capture**:
1. The grid of project cards (4 cards visible from seed data)
2. Click "Examine Record" on any card → screenshot the detail modal showing milestones, funding, and the link/PDF buttons

**Caption suggestion**:
> *Research Projects page with live data fetched from the database — showing project cards and the detail modal with milestones.*

---

### 📰 News & Achievements Page — `/news`

**URL**: `http://localhost:3000/news`

**What to capture**:
1. The list showing mixed News (📰) and Achievement (🏆) items with distinct badges
2. One achievement item expanded showing "Recipient" and "Awarded By" fields

**Caption suggestion**:
> *News & Achievements feed — a combined chronological timeline of lab updates and honors with type badges and external links.*

---

### 🖼️ Gallery Page — `/gallery`

**URL**: `http://localhost:3000/gallery`

**What to capture**:
1. The masonry/grid of approved photos
2. Click a photo → screenshot the full-screen lightbox view

**Caption suggestion**:
> *Photo gallery with lightbox — approved photos from lab events and research activities.*

---

### ✍️ Content Submission Form — `/submit`

> [!NOTE]
> You must be **logged in** to access this page.

**URL**: `http://localhost:3000/submit` *(after login)*

**What to capture**:
1. The full form with "Research Project" selected showing all fields
2. Switch to "Achievement" type and screenshot the different field set
3. Show the PDF upload and external link sections at the bottom

**Caption suggestion**:
> *Content submission form — authenticated users can publish research projects, news, and achievements with optional PDF papers and links. Rate-limited to prevent abuse.*

---

### 📷 Photo Upload — `/upload`

> [!NOTE]
> You must be **logged in** to access this page.

**URL**: `http://localhost:3000/upload` *(after login)*

**What to capture**:
- The upload form with image preview if possible
- The "pending review" confirmation message after submitting

**Caption suggestion**:
> *Photo upload page — submitted photos enter a pending queue and require admin approval before appearing in the gallery.*

---

### 🛡️ Admin Panel — `/admin` (Tab 1: Pending Approval)

> [!IMPORTANT]
> Log in with an **admin or super_admin** account to access this page.

**URL**: `http://localhost:3000/admin`

**What to capture**:
1. The "Pending Approval" tab with photo cards showing Approve/Reject buttons
2. The "Photo Management" tab with the full photo grid

**Caption suggestion**:
> *Admin Panel — Pending Approval queue where admins review and approve or reject user-submitted photos.*

---

### 👥 User Management — `/admin` (Tab 3: User Management)

> [!IMPORTANT]
> Log in with a **super_admin** account to see this tab.

**What to capture**:
1. The Users table showing different role badges (Student, Admin, Super Admin)
2. The "Change Role" dialog — screenshot the dropdown with all three roles

**Caption suggestion**:
> *Super Admin — User Management panel showing the 3-tier role system. Roles can be changed per user from a dropdown.*

---

### 🔑 Login Dialog

**How**: Click "Login" or any protected link while logged out.

**What to capture**:
- The modal with Email/Password fields and the "Sign in with Google" button

**Caption suggestion**:
> *Login dialog — supports email/password and Google OAuth sign-in.*

---

### 📞 Contact Page — `/contact`

**URL**: `http://localhost:3000/contact`

**What to capture**:
- Full page with hero, contact info cards, embedded Google Map, and office hours table

**Caption suggestion**:
> *Contact page with embedded Google Map, lab contact details, and office hours.*

---

## Free Tier Storage Summary

| What | Where stored | Free quota | VICAS Hub needs |
|------|-------------|-----------|----------------|
| Database (users, content, metadata) | SQLite on disk (EC2/GCE) | 30 GB disk | ~104 KB (current) |
| Photos + images | Local disk or Firebase Storage | 30 GB / 5 GB | ~1.57 MB (current) |
| PDF papers | Local disk or Firebase Storage | (same pool) | ~0 MB (current) |
| Frontend hosting | Vercel | Unlimited static | ~5 MB bundle |
| Backend hosting | EC2 / GCE / Render | 750 hrs – Always Free | ~50 MB RAM |

> [!TIP]
> VICAS Hub currently uses only **~1.7 MB** of total storage. Even with 50 users uploading for 2 years, you'll stay under 2 GB. **Every free tier option listed gives you at minimum 5 GB — you won't run out of space.**
