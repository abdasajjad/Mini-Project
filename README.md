# Internship Management System

Full-stack internship portal with role-based access for students, faculty, and admins.

## Project Structure

```text
AbdasProject/
├── backend/      # Node.js + Express + MongoDB API
├── frontend/     # React + Vite app
├── docker-compose.yml
└── README.md
```

---

## Prerequisites

- Node.js 18+
- npm
- MongoDB (local install) **or** Docker + Docker Compose

---

## 1) Backend Setup

From project root:

```bash
cd backend
npm install
cp .env.example .env
```

### Backend Environment Variables

`backend/.env`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/internship_system
JWT_SECRET=supersecretkey_change_this_in_production
```

> Update `JWT_SECRET` for real deployments.

---

## 2) Database Setup (Choose One)

### Option A: MongoDB with Docker (recommended)

From project root:

```bash
docker compose up -d
```

`docker-compose.yml` starts MongoDB with:
- username: `admin`
- password: `password`
- db: `internship_db`
- port: `27017`

If using this container, set `MONGO_URI` in `backend/.env` to:

```env
MONGO_URI=mongodb://admin:password@localhost:27017/internship_db?authSource=admin
```

### Option B: Local MongoDB service

If you already run MongoDB locally without auth, keep:

```env
MONGO_URI=mongodb://localhost:27017/internship_system
```

---

## 3) Frontend Setup

From project root:

```bash
cd frontend
npm install
```

Optional (AI features): create `frontend/.env` and set:

```env
GEMINI_API_KEY=your_key_here
```

---

## 4) Run the Project

Use 2 terminals:

### Terminal 1 — Backend

```bash
cd backend
npm run dev
```

Backend URL: `http://localhost:5000`

### Terminal 2 — Frontend

```bash
cd frontend
npm run dev
```

Frontend URL: `http://localhost:5173`

The frontend is configured to proxy `/api/*` requests to `http://localhost:5000`.

---

## 5) Verify Everything Is Running

- Backend health:

```bash
curl http://localhost:5000/
```

Expected response:

```text
Internship Management System API is running
```

- Open frontend in browser: `http://localhost:5173`

---

## Common Issues

### `EADDRINUSE: address already in use :::5000`

Another process is already using port `5000`. Stop that process, then restart backend.

### `MongoDB Connection Error`

Usually `MONGO_URI` mismatch.
- Docker MongoDB requires auth URI with `admin/password`.
- Local MongoDB usually works with unauthenticated localhost URI.

### `Unexpected token ... is not valid JSON`

Happens when an endpoint returns non-JSON while frontend expects JSON. Ensure backend is restarted after pulling latest backend changes.

---

## Scripts Reference

### backend/package.json
- `npm run dev` → run backend with nodemon
- `npm start` → run backend with node

### frontend/package.json
- `npm run dev` → run Vite dev server
- `npm run build` → build frontend + server bundle
- `npm run preview` → preview build
- `npm run lint` → TypeScript type-check (`tsc --noEmit`)
