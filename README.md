# VICAS Hub

> **VLSI Circuits and Systems Lab — IIIT-Delhi**
> A full-stack research lab web platform for managing and showcasing research projects, news, achievements, and a photo gallery. Built with React + Express + SQLite.

---

## 🧭 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Role System (3-Stage Access)](#role-system)
- [Pages](#pages)
- [API Reference](#api-reference)
- [Database Schema](#database-schema)
- [Project Structure](#project-structure)
- [Local Development](#local-development)
- [Environment Variables](#environment-variables)
- [Seed Data](#seed-data)

---

## Overview

VICAS Hub is a self-service lab portal for the VICAS Lab at IIIT-Delhi. It allows lab members to:
- Browse research projects, news, and achievements
- Submit their own content (projects/news/achievements) along with images, PDF papers, and external links
- Upload photos to a moderated gallery
- Manage everything from a powerful Admin Panel

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, React Router v6, Material UI (MUI v5) |
| **Backend** | Node.js, Express.js |
| **Database** | SQLite (via `sqlite` + `sqlite3`) |
| **Auth** | JWT (Access + Refresh Token rotation), Google OAuth via Firebase Admin |
| **File Storage** | Local disk (dev) / Firebase Storage (prod-ready) |
| **Security** | Helmet, CORS, express-rate-limit, bcrypt (12 rounds) |

---

## Features

### 🔐 Authentication
- Email/password registration and login
- **Google OAuth** (Sign in with Google via Firebase)
- JWT access tokens (15 min expiry) + HttpOnly refresh token cookies (7-day rotation)
- Automatic role assignment on signup based on a hardcoded allowlist of super admin emails

### 👥 3-Stage Role System <a name="role-system"></a>

| Role | Who | What they can do |
|------|-----|-----------------|
| **Student** (`user`) | Any registered user | View all content, upload photos (for approval), submit projects/news/achievements, request Admin role |
| **Admin** (`admin`) | Promoted by Super Admin | All Student permissions + approve/reject gallery photos, manage photo albums, delete content |
| **Super Admin** (`super_admin`) | Pre-configured email list | All Admin permissions + manage users (change roles, delete accounts), approve/reject admin access requests |

Super Admin emails are hard-coded in `server/controllers/authController.js` and `server/db.js`.

### 📸 Photo Gallery
- Students upload photos; they go to a **pending queue**
- Admins review and approve/reject from the Admin Panel
- Photos can be organized into **Albums**
- Full-screen lightbox with navigation

### 🔬 Research Projects
- Live feed fetched from the database (replaces static hardcoded list)
- Each project card shows: title, description, category tag
- Click **"Examine Record"** to open a detailed modal with:
  - Partners / Collaborators
  - Funding Source
  - Milestone checklist
  - 🔗 External link (arXiv, project page)
  - 📄 PDF download button (if paper uploaded)

### 📰 News & Achievements
- Combined feed of **News** and **Achievements** sorted chronologically
- 📰 / 🏆 type badges visually distinguish the two
- Achievement cards display: Recipient and Awarding Body
- External links and PDF download buttons per item

### ✍️ Content Submission (`/submit`)
Any logged-in user can submit content — live on the site instantly (rate-limited to 10/hour):
- **Research Project** — title, description, collaborators, funding, tag, milestones
- **News** — title, description, date, category tag
- **Achievement** — title, description, date, recipient, awarding body
- Optional attachments: 🖼️ Image, 📄 PDF, 🔗 External URL

### 🛡️ Admin Panel (`/admin`)
- **Tab 1 — Pending Approval**: Review and approve/reject gallery photos
- **Tab 2 — Photo Management**: View all photos, edit metadata, organize into albums
- **Tab 3 — User Management** *(Super Admin only)*: View all users, change roles, delete users, process admin access requests

### 📞 Contact Page
- Embedded Google Map of IIIT-Delhi
- Contact details (email, phone, address)
- Office hours table

---

## Pages

| URL | Page | Access |
|-----|------|--------|
| `/` | Home | Public |
| `/about` | About the Lab | Public |
| `/research` | Research Overview | Public |
| `/projects` | Live Research Projects | Public |
| `/news` | News & Achievements | Public |
| `/gallery` | Photo Gallery | Public |
| `/albums` | Photo Albums | Public |
| `/contact` | Contact Us | Public |
| `/upload` | Upload Photo | Login required |
| `/submit` | Submit Content | Login required |
| `/admin` | Admin Panel | Admin / Super Admin only |

---

## API Reference

### Auth (`/api/auth`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/register` | Register with email + password |
| `POST` | `/login` | Login, returns access token + sets refresh cookie |
| `POST` | `/refresh` | Get new access token using refresh cookie |
| `POST` | `/logout` | Clear session |
| `GET` | `/me` | Get current user info |
| `POST` | `/google` | Google OAuth login |

### Gallery (`/api/gallery`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/upload` | User | Upload photo (base64) |
| `GET` | `/photos` | — | Get all approved photos |
| `GET` | `/pending` | Admin | Get pending photos |
| `POST` | `/approve/:id` | Admin | Approve a photo |
| `POST` | `/reject/:id` | Admin | Reject & delete a photo |
| `DELETE` | `/photos/:id` | Admin | Delete approved photo |
| `PUT` | `/photos/:id` | Admin | Edit photo title/description |
| `GET` | `/albums` | — | List albums |
| `POST` | `/albums` | Admin | Create album |
| `POST` | `/albums/:id/photos` | Admin | Add photo to album |
| `GET` | `/users` | Super Admin | List all users |
| `PUT` | `/users/:id/role` | Super Admin | Change user role |
| `DELETE` | `/users/:id` | Super Admin | Delete user |
| `POST` | `/request-admin` | User | Request admin promotion |
| `GET` | `/admin-requests` | Super Admin | View pending admin requests |
| `PUT` | `/admin-requests/:id` | Super Admin | Approve/reject admin request |

### Content (`/api/content`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/:type` | — | Get approved items (`project`, `news`, `achievement`) |
| `POST` | `/upload` | User (rate-limited) | Submit new content item |
| `GET` | `/pending/all` | Admin | Get all pending content |
| `POST` | `/approve/:id` | Admin | Approve pending item |
| `POST` | `/reject/:id` | Admin | Reject & delete item |
| `DELETE` | `/:id` | Admin | Delete item |
| `PUT` | `/:id` | Admin | Update item |

---

## Database Schema

### `users`
```sql
id TEXT PRIMARY KEY, name TEXT, email TEXT UNIQUE,
password_hash TEXT, refresh_token TEXT,
role TEXT DEFAULT 'user',        -- 'user' | 'admin' | 'super_admin'
created_at DATETIME
```

### `photos`
```sql
id TEXT PRIMARY KEY, image_url TEXT, storage_path TEXT,
title TEXT, description TEXT, uploaded_by TEXT,
uploader_name TEXT, uploader_email TEXT,
status TEXT DEFAULT 'pending',   -- 'pending' | 'approved' | 'rejected'
created_at, updated_at
```

### `albums` + `album_photos`
Standard many-to-many junction for organizing photos into named collections.

### `content_items`
```sql
id TEXT PRIMARY KEY,
type TEXT NOT NULL,              -- 'project' | 'news' | 'achievement'
title TEXT, description TEXT,
image_url TEXT, storage_path TEXT,
metadata TEXT,                   -- JSON: tag, collaborators, funding, milestones, externalLink, pdfUrl, date, awardedTo, awardedBy
uploaded_by TEXT, uploader_name TEXT, uploader_email TEXT,
status TEXT DEFAULT 'approved',
created_at, updated_at
```

### `admin_requests`
Tracks user requests for admin promotion — reviewable by Super Admins.

---

## Project Structure

```
vicas-hub/
├── src/                          # React frontend
│   ├── components/
│   │   ├── common/
│   │   │   ├── Header.js         # Nav, login/logout, role-aware user menu
│   │   │   ├── Footer.js
│   │   │   └── LoginDialog.js    # Email + Google login dialog
│   │   └── pages/
│   │       ├── HomePage.js
│   │       ├── AboutPage.js
│   │       ├── ResearchPage.js
│   │       ├── ProjectsPage.js   # Live projects from DB
│   │       ├── NewsPage.js       # Live news + achievements from DB
│   │       ├── GalleryPage.js    # Lightbox photo gallery
│   │       ├── GalleryUpload.js  # Photo upload form
│   │       ├── ContentUpload.js  # Project/News/Achievement submit form
│   │       ├── AlbumsPage.js
│   │       ├── AdminPanel.js     # Full admin dashboard
│   │       └── ContactPage.js
│   ├── contexts/
│   │   └── AuthContext.js        # JWT auth state, role helpers
│   └── App.js                    # Routes + ProtectedRoute
│
├── server/                       # Express backend
│   ├── controllers/
│   │   ├── authController.js     # Register, login, refresh, Google OAuth
│   │   ├── galleryController.js  # Photo CRUD + albums + user management
│   │   └── contentController.js  # Projects/News/Achievements CRUD + PDF
│   ├── routes/
│   │   ├── auth.js
│   │   ├── gallery.js
│   │   └── content.js            # Rate-limited upload endpoint
│   ├── middleware/
│   │   └── auth.js               # authenticateToken + requireRole
│   ├── uploads/                  # Stored locally
│   │   ├── content/              # Images for projects/news/achievements
│   │   └── pdfs/                 # Research paper PDFs
│   ├── data/
│   │   └── db.sqlite             # SQLite database file
│   ├── db.js                     # Schema init + migrations
│   ├── index.js                  # Express app entry point
│   └── seed.js                   # Sample data seeder
│
├── public/
└── package.json
```

---

## Local Development

### Prerequisites
- Node.js v18+
- npm

### 1. Install dependencies

```bash
# Frontend (root)
npm install

# Backend
cd server && npm install
```

### 2. Configure environment

```bash
cd server
cp .env.example .env
# Edit .env with your secrets (see Environment Variables below)
```

### 3. Start the backend

```bash
cd server
node index.js
# Server starts on http://localhost:4000
```

### 4. Seed sample data (first run only)

```bash
cd server
node seed.js
# Adds 4 projects, 3 news, 3 achievements
```

### 5. Start the frontend

```bash
# In project root
npm start
# App opens on http://localhost:3000
```

---

## Environment Variables

Create `server/.env` (see `server/.env.example`):

```env
PORT=4000
NODE_ENV=development

# Strong random secrets — change these!
ACCESS_TOKEN_SECRET=replace_with_32+_char_random_string
REFRESH_TOKEN_SECRET=replace_with_different_32+_char_random_string

# Firebase (for Google OAuth and Storage)
FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json
FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
GOOGLE_CLIENT_ID=your_google_oauth_client_id

# Frontend URL for CORS
FRONTEND_ORIGIN=http://localhost:3000

# SQLite file path
DB_FILE=./data/db.sqlite
```

For the frontend, create `.env` in the root:

```env
REACT_APP_API_BASE=http://localhost:4000
REACT_APP_GOOGLE_CLIENT_ID=your_google_oauth_client_id
```

---

## Seed Data

Run `node seed.js` from the `server/` folder to populate the database with realistic VICAS Lab sample content:

- **4 Research Projects**: Low-Power SRAM, High-Speed ADC, AI Hardware Accelerator, Neuromorphic SNN Chip
- **3 News Items**: Best Paper Award (VLSI Symposium), DST-SERB Grant, PhD Graduation
- **3 Achievements**: ISSCC 2024 Acceptance, Intel India PhD Fellowship, ACM Dissertation Award

The script is **idempotent** — running it again will not duplicate data.

---

## Super Admin Configuration

To make someone a Super Admin, add their email to the list in **both** of these files:

1. `server/controllers/authController.js` → `SUPER_ADMIN_EMAILS` array
2. `server/db.js` → `SUPER_ADMIN_EMAILS` array

They will automatically receive `super_admin` role on next login (the DB init script upgrades them).
