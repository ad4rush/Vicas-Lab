# 🚀 VICAS Hub — Complete Beginner Deployment Guide

> **Goal:** Get VICAS Hub live on the internet so anyone can access it.  
> **Time needed:** ~30 minutes  
> **Cost:** $0 (completely free)  
> **What you need:** A GitHub account (you already have this ✅)

---

## 🧠 How It Works (Big Picture)

Your app has **two parts**:

```
┌─────────────────────┐         ┌─────────────────────┐
│   FRONTEND (React)  │  ───►   │   BACKEND (Express)  │
│   What users see    │  API    │   Database + Logic    │
│   Hosted on VERCEL  │  calls  │   Hosted on RENDER    │
│   (Free forever)    │         │   (Free, sleeps idle) │
└─────────────────────┘         └─────────────────────┘
```

- **Vercel** = Hosts your React website (the pages, buttons, CSS)
- **Render** = Runs your Node.js server (handles login, stores data, serves photos)

Both are free. Let's set them up.

---

## 📋 Prerequisites Checklist

Before you start, make sure you have:

- [x] Code pushed to GitHub at `github.com/ad4rush/Vicas-Lab` ✅
- [ ] A Google account (for Firebase/OAuth)
- [ ] Firebase project set up with:
  - [ ] Google Auth enabled
  - [ ] Service Account Key JSON file (`serviceAccountKey.json`)
  - [ ] Storage bucket name
- [ ] Your Google OAuth Client ID

> **Don't have Firebase set up?** See [Appendix A](#appendix-a--setting-up-firebase-from-scratch) at the bottom.

---

# PART 1: Deploy the Backend on Render

## Step 1.1 — Create a Render Account

1. Go to **[render.com](https://render.com)**
2. Click **"Get Started for Free"**
3. Sign up with your **GitHub account** (easiest — it connects your repos automatically)

## Step 1.2 — Create a New Web Service

1. Once logged in, click the **"New +"** button (top right)
2. Select **"Web Service"**
3. You'll see a list of your GitHub repos. Find **`Vicas-Lab`** and click **"Connect"**

> **Can't see your repo?** Click "Configure account" to give Render access to your GitHub repos.

## Step 1.3 — Configure the Service

Fill in these settings:

| Setting | What to type |
|---------|-------------|
| **Name** | `vicas-hub-api` (or anything you like) |
| **Region** | `Oregon (US West)` (or closest to you) |
| **Branch** | `main` |
| **Root Directory** | `server` ⚠️ **THIS IS IMPORTANT — type `server`** |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `node index.js` |
| **Instance Type** | `Free` ✅ |

> [!CAUTION]
> **The Root Directory MUST be `server`**. If you leave it blank, Render will try to build the React frontend instead of the backend, and it will fail.

## Step 1.4 — Add Environment Variables

Scroll down to **"Environment Variables"** section. Click **"Add Environment Variable"** for each one:

| Key | Value | Where to get it |
|-----|-------|----------------|
| `PORT` | `4000` | Just type 4000 |
| `NODE_ENV` | `production` | Just type production |
| `ACCESS_TOKEN_SECRET` | `vicas_access_secret_2026_xyz` | Make up a long random string |
| `REFRESH_TOKEN_SECRET` | `vicas_refresh_secret_2026_abc` | Make up a DIFFERENT long random string |
| `FRONTEND_ORIGIN` | `https://vicas-lab.vercel.app` | Your Vercel URL (we'll set this up next) |
| `GOOGLE_CLIENT_ID` | `xxxxx.apps.googleusercontent.com` | From Google Cloud Console |
| `FIREBASE_SERVICE_ACCOUNT_PATH` | `./serviceAccountKey.json` | Just type this path |
| `FIREBASE_STORAGE_BUCKET` | `your-project.firebasestorage.app` | From Firebase Console |
| `DB_FILE` | `./data/db.sqlite` | Just type this path |

### 🔐 For the token secrets:
You can generate random strings here: Go to any browser and type in the address bar:
```
javascript:alert(Math.random().toString(36).substring(2)+Math.random().toString(36).substring(2)+Math.random().toString(36).substring(2))
```
Or just make up something long like: `my_super_secret_key_vicas_2026_abcdef123456`

### 📧 For Email Reminders (Optional — skip if you don't need weekly BTP emails):

| Key | Value |
|-----|-------|
| `SMTP_HOST` | `smtp.gmail.com` |
| `SMTP_PORT` | `587` |
| `SMTP_USER` | `your_email@gmail.com` |
| `SMTP_PASS` | Your Gmail App Password (see Appendix B) |
| `SMTP_FROM` | `"VICAS Lab" <your_email@gmail.com>` |
| `FRONTEND_URL` | `https://vicas-lab.vercel.app` |

## Step 1.5 — Upload Firebase Service Account Key

Render can't read a file from your repo directly for secrets. You have two options:

### Option A: Add the JSON as an Environment Variable (Easier)
1. Open your `serviceAccountKey.json` file
2. Copy the **entire contents**
3. In Render, add a new env variable:
   - Key: `FIREBASE_SERVICE_ACCOUNT_JSON`
   - Value: paste the entire JSON

Then we need a small code tweak. But for now, if you already committed the `serviceAccountKey.json` to the `server/` folder in your repo, Render will pick it up automatically.

### Option B: Commit the file (Simplest for now)
If your `serviceAccountKey.json` is already in `server/serviceAccountKey.json` and pushed to GitHub, it will just work.

> [!WARNING]
> **Never commit secrets to a public repo.** If your repo is public, use Option A instead.

## Step 1.6 — Deploy!

1. Click **"Create Web Service"**
2. Render will now:
   - Clone your repo
   - Run `npm install` in the `server/` folder
   - Start `node index.js`
3. Wait 2-3 minutes. You'll see live logs.
4. When you see `Auth server listening on port 4000` — it's working! 🎉

5. **Copy your Render URL** — it looks like:
   ```
   https://vicas-hub-api.onrender.com
   ```
   You'll need this for the frontend.

> [!NOTE]
> **Free tier sleep:** The server goes to sleep after 15 minutes of no traffic. The first request after sleeping takes ~30 seconds to wake up. This is normal and free.

---

# PART 2: Deploy the Frontend on Vercel

## Step 2.1 — Create a Vercel Account

1. Go to **[vercel.com](https://vercel.com)**
2. Click **"Sign Up"**
3. Choose **"Continue with GitHub"**

## Step 2.2 — Import Your Project

1. Click **"Add New Project"**
2. Find **`Vicas-Lab`** in your repo list and click **"Import"**

## Step 2.3 — Configure Build Settings

| Setting | What to set |
|---------|------------|
| **Framework Preset** | `Create React App` (Vercel usually auto-detects this) |
| **Root Directory** | Leave **BLANK** (empty) — the React app is in the root |
| **Build Command** | Leave default (`npm run build`) |
| **Output Directory** | Leave default (`build`) |

## Step 2.4 — Add Environment Variables

Click **"Environment Variables"** and add:

| Key | Value |
|-----|-------|
| `REACT_APP_API_BASE` | `https://vicas-hub-api.onrender.com` ← **Your Render URL from Step 1.6** |
| `REACT_APP_GOOGLE_CLIENT_ID` | `xxxxx.apps.googleusercontent.com` ← Same Google Client ID |

> [!IMPORTANT]
> The `REACT_APP_API_BASE` must be **exactly** your Render URL with NO trailing slash.  
> ✅ `https://vicas-hub-api.onrender.com`  
> ❌ `https://vicas-hub-api.onrender.com/`

## Step 2.5 — Deploy!

1. Click **"Deploy"**
2. Vercel will:
   - Install dependencies (`npm install`)
   - Build the React app (`npm run build`)
   - Deploy the static files to its CDN
3. Wait 1-2 minutes.
4. When done, you'll get your live URL:
   ```
   https://vicas-lab.vercel.app
   ```
   🎉 **Your frontend is live!**

---

# PART 3: Connect Everything Together

Now both services are running, but they need to know about each other.

## Step 3.1 — Update Render's CORS Setting

1. Go back to **Render Dashboard** → Your web service → **Environment**
2. Find `FRONTEND_ORIGIN` and make sure it's set to your **exact Vercel URL**:
   ```
   https://vicas-lab.vercel.app
   ```
3. Click **"Save Changes"** — Render will auto-redeploy.

## Step 3.2 — Update Google OAuth Credentials

1. Go to **[Google Cloud Console](https://console.cloud.google.com)**
2. Navigate to **APIs & Services → Credentials**
3. Click on your **OAuth 2.0 Client ID**
4. Under **Authorized JavaScript Origins**, add:
   ```
   https://vicas-lab.vercel.app
   https://vicas-hub-api.onrender.com
   ```
5. Under **Authorized redirect URIs**, add:
   ```
   https://vicas-lab.vercel.app
   ```
6. Click **Save**

## Step 3.3 — Test Everything!

1. Open your Vercel URL: `https://vicas-lab.vercel.app`
2. Try these:
   - [ ] Home page loads with the hero image ✅
   - [ ] Click "About" — page loads ✅
   - [ ] Click "Gallery" — photos show up ✅
   - [ ] Click "Login" → "Sign in with Google" — OAuth popup works ✅
   - [ ] After login, your name appears in the top right ✅
   - [ ] Navigate to "BTP Portal" — page loads ✅
   - [ ] Go to `/admin` — Admin panel loads (if you're an admin) ✅

> [!NOTE]
> **First load might be slow** (~30 seconds) because Render's free server was sleeping. After the first request, subsequent loads will be fast.

---

# PART 4: How to Update After Making Changes

Whenever you make code changes locally, here's how to push them live:

```powershell
# 1. Save your changes
git add -A

# 2. Commit with a message
git commit -m "describe what you changed"

# 3. Push to GitHub
git push origin main
```

**That's it!** Both Vercel and Render watch your GitHub repo. When you push:
- **Vercel** automatically rebuilds the frontend (~1-2 min)
- **Render** automatically rebuilds the backend (~2-3 min)

No manual deploy needed. Just push and wait.

---

# PART 5: Troubleshooting Common Issues

## ❌ "CORS policy" error in browser console

**Cause:** The backend doesn't allow requests from your frontend URL.

**Fix:**
1. Go to Render → Environment Variables
2. Check that `FRONTEND_ORIGIN` is **exactly** `https://vicas-lab.vercel.app`
3. No trailing slash, no `http://`, must be `https://`

## ❌ "Invalid token" when trying to login

**Cause:** The JWT secrets on Render don't match, or the token expired.

**Fix:**
1. Clear your browser cookies for the site
2. Try logging in again
3. Check that `ACCESS_TOKEN_SECRET` and `REFRESH_TOKEN_SECRET` are set in Render

## ❌ Google Login popup closes immediately / shows error

**Cause:** OAuth origins not configured correctly.

**Fix:**
1. Google Cloud Console → Credentials → Your OAuth Client
2. Make sure `https://vicas-lab.vercel.app` is in Authorized JavaScript Origins
3. Changes can take **5-10 minutes** to propagate at Google

## ❌ Photos/Gallery is empty after deploy

**Cause:** Render's free tier has **ephemeral storage** — files uploaded to disk are wiped on every deploy.

**Fix:** Use Firebase Storage for file uploads (already configured in your app). Or add a **Persistent Disk** on Render ($7/month) to keep files across deploys.

## ❌ Build fails on Vercel with "eslint" errors

**Cause:** Strict linting rules during production build.

**Fix:** Check the error message, fix the specific file, commit, and push again. Common fixes:
- Move all `import` statements to the top of the file
- Remove unused variables

## ❌ Server keeps sleeping on Render (free tier)

**Cause:** Normal — free tier sleeps after 15 min of inactivity.

**Workaround:** Use a free cron service like [cron-job.org](https://cron-job.org) to ping your Render URL every 14 minutes:
1. Sign up at cron-job.org
2. Create a new job:
   - URL: `https://vicas-hub-api.onrender.com/`
   - Schedule: Every 14 minutes
3. This keeps the server awake 24/7 for free

---

# Appendix A — Setting Up Firebase from Scratch

If you don't have Firebase set up yet:

## A.1 Create a Firebase Project

1. Go to **[console.firebase.google.com](https://console.firebase.google.com)**
2. Click **"Create a project"**
3. Name it `vicas-hub`
4. Disable Google Analytics (not needed)
5. Click **"Create project"**

## A.2 Enable Google Authentication

1. In Firebase Console → **Authentication** → **Get started**
2. Click **Sign-in method** tab
3. Click **Google** → Enable it
4. Set support email to your email
5. Click **Save**

## A.3 Get the Service Account Key

1. Click the **⚙️ gear icon** next to "Project Overview" → **Project settings**
2. Go to **Service accounts** tab
3. Click **"Generate new private key"**
4. Save the downloaded JSON file as `serviceAccountKey.json`
5. Put it in your `server/` folder

## A.4 Enable Firebase Storage

1. In Firebase Console → **Storage** → **Get started**
2. Start in **test mode** (we'll secure it later)
3. Note your **bucket name**: `your-project.firebasestorage.app`

## A.5 Get Google OAuth Client ID

1. Go to **[Google Cloud Console](https://console.cloud.google.com)**
2. Select your Firebase project
3. Navigate to **APIs & Services → Credentials**
4. Under **OAuth 2.0 Client IDs**, find the "Web client" auto-created by Firebase
5. Copy the **Client ID** — it looks like: `123456789-abc.apps.googleusercontent.com`
6. Click on it and add your URLs to Authorized Origins (see Step 3.2)

---

# Appendix B — Getting a Gmail App Password

Gmail requires an "App Password" for SMTP (sending emails from your server):

1. Go to **[myaccount.google.com](https://myaccount.google.com)**
2. Click **Security** (left sidebar)
3. Under "How you sign in", enable **2-Step Verification** first
4. After 2FA is enabled, go to **[myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)**
5. Under "App name", type `VICAS Hub`
6. Click **Create**
7. Google shows a **16-character password** like: `abcd efgh ijkl mnop`
8. Copy it **without spaces**: `abcdefghijklmnop`
9. Use this as your `SMTP_PASS` environment variable in Render

---

# Quick Reference Card

| What | Where | URL |
|------|-------|-----|
| **Your Code** | GitHub | `github.com/ad4rush/Vicas-Lab` |
| **Frontend** | Vercel | `https://vicas-lab.vercel.app` |
| **Backend** | Render | `https://vicas-hub-api.onrender.com` |
| **Firebase** | Google | `console.firebase.google.com` |
| **OAuth Settings** | Google Cloud | `console.cloud.google.com` → Credentials |
| **Backend Logs** | Render | Dashboard → Your service → Logs |
| **Build Logs** | Vercel | Dashboard → Your project → Deployments |

---

**You're done! 🎉** Your VICAS Hub is now live on the internet. Anyone with the Vercel URL can access it.
