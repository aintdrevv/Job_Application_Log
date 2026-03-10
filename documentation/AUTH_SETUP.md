# Auth Setup (React + Xano)

This project already contains exported Xano auth endpoints in `backend/apis/authentication/`.

Detected endpoints:
- `POST /auth/signup`
- `POST /auth/login`
- `GET /auth/me` (requires Bearer token)

## 1) Xano Base URL
In the frontend, create `frontend/.env` from `.env.example`.

```env
VITE_XANO_API_HOST=https://your-xano-instance.xano.io
VITE_XANO_API_GROUP=YOUR_DEFAULT_GROUP
VITE_XANO_API_GROUP_AUTH=EWRejxJg
VITE_XANO_API_GROUP_APPLICATIONS=50dXYRE-
```

Notes:
- Do not add trailing slash on host.
- `VITE_XANO_API_GROUP_AUTH` is used for `/auth/*`.
- `VITE_XANO_API_GROUP_APPLICATIONS` is used for `/applications` and `/application/*`.
- If feature-specific vars are omitted, `VITE_XANO_API_GROUP` is used as fallback.

## 2) Request/Response Contracts

### POST `/auth/signup`
Request body:
```json
{
  "name": "Your Name",
  "email": "you@email.com",
  "password": "your-password"
}
```

Response:
```json
{
  "authToken": "token-value",
  "user_id": 123
}
```

### POST `/auth/login`
Request body:
```json
{
  "email": "you@email.com",
  "password": "your-password"
}
```

Response:
```json
{
  "authToken": "token-value",
  "user_id": 123
}
```

### GET `/auth/me`
Header:
```http
Authorization: Bearer <authToken>
```

Response:
```json
{
  "id": 123,
  "created_at": 1700000000000,
  "name": "Your Name",
  "email": "you@email.com",
  "account_id": 0,
  "role": "member"
}
```

## 3) Frontend Auth Flow Implemented
- `signup` and `login` save `authToken` to `localStorage`.
- App calls `/auth/me` to hydrate current user.
- `/dashboard` is protected by auth guard.
- `/login` and `/signup` redirect to dashboard when already authenticated.
- `logout` clears token and session state.

## 4) Run Frontend
From `frontend/`:

```powershell
npm.cmd install
npm.cmd run dev
```

If PowerShell execution policy blocks `npm`, always use `npm.cmd`.
