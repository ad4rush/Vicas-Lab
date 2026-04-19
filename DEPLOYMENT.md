# VICAS Hub — Deployment Guide & Screenshot Reference

> A complete guide to deploying VICAS Hub for free, plus a reference for taking product screenshots.

---

## Table of Contents

- [Free Deployment Options](#free-deployment-options)
- [Option A — Render (Backend) + Vercel (Frontend)](#option-a----render--vercel)
- [Option B — Railway (Full Stack)](#option-b----railway)
- [Database: Migrating from SQLite to Turso (Free Persistent SQLite)](#database-migration)
- [File Storage: Using Firebase Storage](#file-storage)
- [Environment Variables Reference](#environment-variables-reference)
- [Screenshot Guide — Pages & Captions](#screenshot-guide)

---

## Free Deployment Options

| Service | What it hosts | Free tier limit | Persistent disk? |
|---------|--------------|-----------------|-----------------|
| **Render** | Express backend | 750 hrs/month, spins down after 15 min idle | ❌ Ephemeral |
| **Vercel** | React frontend | Unlimited static | ✅ N/A (static) |
| **Railway** | Both frontend + backend | $5 free credit/month | ✅ Volumes available |
| **Turso** | SQLite (cloud-hosted) | 500 DBs, 9 GB storage | ✅ Yes |
| **Firebase Storage** | Images + PDFs | 5 GB free | ✅ Yes |

> [!IMPORTANT]
> The current SQLite database stores files **on disk**. On Render's free tier, the disk is **ephemeral** — it resets on every deploy. Before going to production, migrate to **Turso** (for the database) and **Firebase Storage** (for uploaded files).

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

| What | Where stored | Free quota |
|------|-------------|-----------|
| Database (users, content, metadata) | Turso SQLite | 9 GB, 500 DBs |
| Photos + images | Firebase Storage | 5 GB total |
| PDF papers | Firebase Storage | (same 5 GB pool) |
| Frontend hosting | Vercel | Unlimited static |
| Backend hosting | Render | 750 hrs/month |

> [!TIP]
> For a lab with ~50 users, this setup comfortably handles years of operation entirely within free tiers.
