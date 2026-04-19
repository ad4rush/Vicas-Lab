# VICAS Lab Backend (Auth)

Simple Express-based authentication service used by the frontend.

Features:
- Register / Login with bcrypt-hashed passwords
- **Google OAuth authentication (restricted to @iiitd.ac.in domain)**
- JWT access tokens (short-lived) and refresh tokens (httpOnly cookie)
- Refresh token rotation
- Input validation, rate limiting, helmet, CORS

## Setup

### 1. Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google+ API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure the consent screen if prompted
6. Set **Application Type** to **Web application**
7. Add authorized JavaScript origins:
   - `http://localhost:3000` (for local dev)
   - Your production frontend URL
8. Add authorized redirect URIs (not strictly needed for the current flow but good practice)
9. Copy the **Client ID**

### 2. Configure Environment

Copy `.env.example` to `.env` and set:
- `GOOGLE_CLIENT_ID`: Your Google OAuth Client ID
- `ACCESS_TOKEN_SECRET` and `REFRESH_TOKEN_SECRET`: Strong random secrets (32+ characters)
- `FRONTEND_ORIGIN`: Your frontend URL (default: `http://localhost:3000`)

```bash
cp .env.example .env
# Edit .env with your values
```

### 3. Install & Run

```bash
cd server
npm install
npm run dev  # or npm start
```

The server listens on `PORT` (default 4000).

## Frontend Setup

Add the same Google Client ID to your frontend `.env`:

```
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id_here
REACT_APP_API_BASE=http://localhost:4000
```

## Domain Restriction

Only users with `@iiitd.ac.in` email addresses can create accounts via Google OAuth. This is enforced server-side in the `/api/auth/google` endpoint.
