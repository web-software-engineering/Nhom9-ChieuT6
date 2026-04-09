# Facebook Login Demo (MERN)

A complete Facebook Login demo with:

- Backend: Node.js, Express, Passport-Facebook, express-session, MongoDB
- Frontend: React (Vite)
- Session-based authentication
- `GET /api/user` to return current logged-in user
- Login, logout, user info UI, and error handling

Project structure:

- `backend`
- `frontend`

## 1) Backend Setup

Path: `facebook-login-demo/backend`

### Install

```bash
cd backend
npm install
```

### Configure env

Copy `.env.example` to `.env` and fill values:

```bash
cp .env.example .env
```

Required keys:

- `MONGODB_URI`
- `SESSION_SECRET`
- `FACEBOOK_APP_ID`
- `FACEBOOK_APP_SECRET`
- `FACEBOOK_CALLBACK_URL`
- `FRONTEND_URL`

### Run

```bash
npm run dev
```

Backend starts at `http://localhost:5000` by default.

## 2) Frontend Setup

Path: `facebook-login-demo/frontend`

### Install

```bash
cd frontend
npm install
```

### Configure env

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Set backend URL if needed:

- `VITE_API_URL=http://localhost:5000`

### Run

```bash
npm run dev
```

Frontend starts at `http://localhost:5173` by default.

## 3) Facebook App Settings

In Facebook Developer Console:

1. Add **Facebook Login** product.
2. Set **Valid OAuth Redirect URI** to:
   - `http://localhost:5000/auth/facebook/callback`
3. Make sure app is in the right mode for your test user.

## API Endpoints

- `GET /auth/facebook` -> starts Facebook auth flow
- `GET /auth/facebook/callback` -> OAuth callback
- `POST /auth/logout` -> logs out and clears session
- `GET /api/user` -> returns current user (401 if not logged in)

## Security Notes

- Secrets are loaded from `.env`
- No hardcoded Facebook credentials
- Session cookie is `httpOnly`
- CORS is restricted to `FRONTEND_URL`
