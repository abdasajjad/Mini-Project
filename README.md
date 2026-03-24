# Internship Management System

A full-stack web application for managing internship postings, applications, and certificate verification across three roles:
- Student
- Faculty
- Admin

This repository contains:
- `client/`: React + Vite frontend
- `server/`: Node.js + Express + MongoDB backend
- `docker-compose.yml`: Local MongoDB service

## 1. Project Overview

The Internship Management System supports a role-based workflow:
- Faculty/Admin create and manage internship postings.
- Students browse internships and apply with resume upload.
- Faculty/Admin review applications and approve/reject candidates.
- Approved students upload internship completion certificates.
- Faculty/Admin verify/reject certificates.

## 2. Tech Stack

Frontend (`client/`)
- React 19
- Vite 7
- React Router DOM 7
- Axios
- Tailwind CSS
- Radix UI primitives + custom UI components (`src/components/ui`)

Backend (`server/`)
- Node.js
- Express 4
- MongoDB + Mongoose 8
- JWT authentication (`jsonwebtoken`)
- Password hashing (`bcryptjs`)
- File uploads (`multer`)
- CORS + dotenv

Infrastructure
- Docker Compose for MongoDB
- Optional Vercel server deployment config (`server/vercel.json`)

## 3. High-Level Architecture

Request flow:
1. User logs in/registers via frontend.
2. Backend returns JWT token + user profile.
3. Frontend stores token in `localStorage` and sets Axios `Authorization: Bearer <token>` header.
4. Protected API routes validate token in middleware.
5. Role-based middleware enforces route access (`student`, `faculty`, `admin`).
6. Business logic runs in controllers, data stored/retrieved via Mongoose models.

Core backend modules:
- Routes: `server/routes/*.routes.js`
- Controllers: `server/controllers/*.controller.js`
- Middleware: `server/middleware/*.middleware.js`
- Models: `server/models/*.js`

Core frontend modules:
- Routing + protection: `client/src/App.jsx`
- Auth state management: `client/src/context/AuthContext.jsx`
- Role dashboards:
  - `client/src/pages/StudentDashboard.jsx`
  - `client/src/pages/FacultyDashboard.jsx`
  - `client/src/pages/AdminDashboard.jsx`

## 4. Repository Structure

```text
Internship-management-system/
├── docker-compose.yml
├── README.md
├── client/
│   ├── package.json
│   ├── .env
│   └── src/
│       ├── App.jsx
│       ├── config.js
│       ├── context/AuthContext.jsx
│       ├── pages/
│       │   ├── Login.jsx
│       │   ├── Register.jsx
│       │   ├── StudentDashboard.jsx
│       │   ├── FacultyDashboard.jsx
│       │   └── AdminDashboard.jsx
│       └── components/ui/
└── server/
    ├── package.json
    ├── .env.example
    ├── server.js
    ├── controllers/
    ├── middleware/
    ├── models/
    ├── routes/
    ├── uploads/
    └── vercel.json
```

## 5. Environment Variables

Backend (`server/.env`):
- `PORT`: API port (default `5000` in code)
- `MONGO_URI`: MongoDB connection string
- `JWT_SECRET`: Secret used for token signing/verification

Example (`server/.env.example`):
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/internship_system
JWT_SECRET=supersecretkey_change_this_in_production
```

Frontend (`client/.env`):
- `VITE_API_URL`: Backend base URL used by Axios

Example:
```env
VITE_API_URL=http://localhost:5000
```

## 6. Local Development Setup

### 6.1 Prerequisites
- Node.js 18+
- npm
- Docker + Docker Compose (recommended for MongoDB)

### 6.2 Start MongoDB with Docker
From repo root:
```bash
docker compose up -d
```

Default compose service:
- Container: `internship-mongodb`
- Port: `27017`
- Root user: `admin`
- Root password: `password`
- Volume: `mongodb_data`

Note: backend example URI points to unauthenticated local MongoDB. If using compose credentials, set `MONGO_URI` accordingly.

### 6.3 Start Backend
```bash
cd server
npm install
cp .env.example .env
npm run dev
```

Backend runs at `http://localhost:5000` by default.

### 6.4 Start Frontend
In another terminal:
```bash
cd client
npm install
npm run dev
```

Frontend runs at Vite dev URL (typically `http://localhost:5173`).

## 7. Authentication and Authorization

### 7.1 JWT Authentication
Implemented in `server/middleware/auth.middleware.js`:
- Reads token from `Authorization` header in `Bearer <token>` format.
- Verifies token with `JWT_SECRET`.
- Attaches decoded payload to `req.user`.

JWT payload fields:
- `id`
- `role`

### 7.2 Role Authorization
`authorize([...roles])` middleware restricts endpoints by role.

Supported roles:
- `student`
- `faculty`
- `admin`

### 7.3 Frontend Route Protection
`PrivateRoute` in `client/src/App.jsx`:
- Redirects unauthenticated users to `/login`.
- Redirects users without required role to `/`.

## 8. Data Model (Mongoose Schemas)

### 8.1 User (`server/models/User.js`)
Fields:
- `name` (required)
- `email` (required, unique)
- `password` (required, hashed)
- `role` (`student|faculty|admin`, default `student`)
- `department` (optional)
- `resume` (optional path/url)
- `createdAt`

### 8.2 Internship (`server/models/Internship.js`)
Fields:
- `title` (required)
- `company` (required)
- `description` (required)
- `location` (optional)
- `duration` (optional)
- `department` (optional)
- `postedBy` (`User` reference)
- `createdAt`

### 8.3 Application (`server/models/Application.js`)
Fields:
- `student` (`User` reference, required)
- `internship` (`Internship` reference, required)
- `status` (`pending|approved|rejected`, default `pending`)
- `appliedAt`
- `resumeSnapshot` (file path at application time)
- `certificate` (file path)
- `certificateStatus` (`not_uploaded|pending_verification|verified|rejected`, default `not_uploaded`)

## 9. File Uploads

Implemented in `server/middleware/upload.middleware.js`:
- Storage: local `uploads/` directory
- Accepted MIME types:
  - `application/pdf`
  - `image/jpeg`
  - `image/png`
- File size limit: 5 MB
- Naming: `<fieldname>-<timestamp>-<random>.<ext>`

Static serving:
- `app.use('/uploads', express.static('uploads'))` in `server/server.js`
- Uploaded files accessible via `http://<host>/uploads/<filename>`

## 10. API Reference

Base URL:
- Local: `http://localhost:5000`

All protected endpoints require:
- Header: `Authorization: Bearer <JWT>`

### 10.1 Auth Routes (`/api/auth`)

1. `POST /api/auth/register`
- Access: Public
- Body:
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "secret123",
  "role": "student",
  "department": "Computer Science"
}
```
- Response:
```json
{
  "token": "<jwt>",
  "user": {
    "_id": "...",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "student",
    "department": "Computer Science"
  }
}
```

2. `POST /api/auth/login`
- Access: Public
- Body:
```json
{
  "email": "jane@example.com",
  "password": "secret123"
}
```
- Response: same shape as register

3. `GET /api/auth/me`
- Access: Authenticated
- Response: user object excluding password

### 10.2 Internship Routes (`/api/internships`)

1. `POST /api/internships`
- Access: `faculty`, `admin`
- Body example:
```json
{
  "title": "Frontend Intern",
  "company": "Acme Corp",
  "description": "Work on React UI modules",
  "location": "Remote",
  "duration": "3 months",
  "department": "Computer Science"
}
```
- Backend sets `postedBy` from authenticated user

2. `GET /api/internships`
- Access: Authenticated
- Query params (optional):
  - `department`
  - `company` (case-insensitive partial match)
  - `duration`
- Returns internships populated with `postedBy.name` and `postedBy.email`

3. `GET /api/internships/:id`
- Access: Authenticated
- Returns one internship

4. `PUT /api/internships/:id`
- Access: `faculty`, `admin`
- Rule: owner (`postedBy`) or admin only
- Body: fields to update

5. `DELETE /api/internships/:id`
- Access: `faculty`, `admin`
- Rule: owner (`postedBy`) or admin only

### 10.3 Application Routes (`/api/applications`)

1. `POST /api/applications/:internshipId/apply`
- Access: Authenticated, but controller enforces `student`
- Content-Type: `multipart/form-data`
- File field: `resume`
- Behavior:
  - checks internship exists
  - checks user role is student
  - prevents duplicate application per student+internship
  - stores resume path in `resumeSnapshot`

2. `GET /api/applications/my`
- Access: Authenticated (intended for students)
- Returns current user applications, populated with internship title/company/status

3. `GET /api/applications/internship/:internshipId`
- Access: `faculty`, `admin`
- Rule: internship owner or admin only
- Returns applications populated with student details

4. `PUT /api/applications/:id/status`
- Access: `faculty`, `admin`
- Body:
```json
{
  "status": "approved"
}
```
- Valid values in schema: `approved`, `rejected`, `pending`
- Rule: internship owner or admin only

5. `POST /api/applications/:id/certificate`
- Access: Authenticated, ownership enforced in controller
- Content-Type: `multipart/form-data`
- File field: `certificate`
- Preconditions:
  - application belongs to current user
  - application status must be `approved`
- Sets `certificateStatus` to `pending_verification`

6. `PUT /api/applications/:id/certificate-verify`
- Access: `faculty`, `admin`
- Body:
```json
{
  "status": "verified"
}
```
- Valid values in schema: `verified`, `rejected`, `pending_verification`, `not_uploaded`
- Rule: internship owner or admin only

## 11. Frontend Pages and Flows

### 11.1 Login (`/login`)
File: `client/src/pages/Login.jsx`
- Calls `AuthContext.login(email, password)`
- Redirects by role:
  - `admin` -> `/admin`
  - `faculty` -> `/faculty`
  - `student` -> `/student`

### 11.2 Register (`/register`)
File: `client/src/pages/Register.jsx`
- Registers a new user
- Role selectable at UI level (`student|faculty|admin`)
- Shows `department` input for student role
- Redirects by role after success

### 11.3 Student Dashboard (`/student`)
File: `client/src/pages/StudentDashboard.jsx`
Features:
- Search internships by company name
- View internship cards
- Apply with resume upload
- View personal applications and status
- Upload certificate for approved applications

### 11.4 Faculty Dashboard (`/faculty`)
File: `client/src/pages/FacultyDashboard.jsx`
Features:
- Post new internships
- View only own internship postings (client-side filtering)
- Open applications for selected internship
- Approve/reject applications
- View student resume links
- Verify/reject uploaded certificates

### 11.5 Admin Dashboard (`/admin`)
File: `client/src/pages/AdminDashboard.jsx`
Current state:
- UI scaffold exists
- User-management data loading is not implemented (placeholder comments)

## 12. Scripts

Frontend (`client/package.json`):
- `npm run dev`: start Vite dev server
- `npm run build`: production build
- `npm run lint`: ESLint
- `npm run preview`: preview built app

Backend (`server/package.json`):
- `npm run dev`: start server with nodemon
- `npm start`: start server with node

## 13. Deployment Notes

### Backend on Vercel
Config file: `server/vercel.json`
- Builds from `server.js` using `@vercel/node`
- Routes all requests to `server.js`

Set environment variables on Vercel:
- `PORT` (optional on managed platforms)
- `MONGO_URI`
- `JWT_SECRET`

### Frontend deployment
- Build via `npm run build` in `client/`
- Ensure `VITE_API_URL` points to deployed backend URL

## 14. Security and Operational Considerations

Current strengths:
- Password hashing using bcrypt
- JWT-based authentication
- Role-based authorization middleware
- Restricted upload types and max upload size

Recommended improvements:
- Add stricter registration guard so only admins can create `admin`/`faculty` accounts.
- Add request validation for all payloads (e.g., Zod/Joi/express-validator).
- Add rate limiting and brute-force protection on auth endpoints.
- Use cloud object storage (S3/GCS) for uploads in production.
- Add refresh token strategy or token revocation support.
- Add centralized error handling middleware.

## 15. Known Gaps and Behavioral Notes

1. Admin user management is not complete.
- `AdminDashboard` expects an endpoint for listing/managing users, but backend route/controller is missing.

2. Student internship search triggers immediate fetch on every keypress.
- Works, but no debounce; can cause extra network calls.

3. Faculty dashboard filters own internships on client side.
- Backend currently returns all internships and frontend filters by `postedBy._id`.
- Prefer server-side filtering endpoint for scalability.

4. Upload folder persistence strategy is local filesystem.
- Works for local dev; not ideal for horizontal scaling/ephemeral deployments.

5. CORS is currently open default (`app.use(cors())`).
- Restrict allowed origins in production.

## 16. Quick API Test Examples (cURL)

Register:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Student One","email":"student1@example.com","password":"secret123","role":"student","department":"CSE"}'
```

Login:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student1@example.com","password":"secret123"}'
```

Create internship (faculty/admin token required):
```bash
curl -X POST http://localhost:5000/api/internships \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Backend Intern","company":"Acme","description":"Node.js internship","location":"Remote","duration":"3 months","department":"IT"}'
```

Apply with resume upload:
```bash
curl -X POST http://localhost:5000/api/applications/<INTERNSHIP_ID>/apply \
  -H "Authorization: Bearer <TOKEN>" \
  -F "resume=@/path/to/resume.pdf"
```

## 17. Suggested Next Implementation Steps

1. Add admin-only backend endpoints for user listing and role management.
2. Add request validation and consistent error response format.
3. Add tests for auth, internship CRUD, and application workflow.
4. Add server-side pagination/filtering for internships and applications.
5. Add audit logs for status and certificate verification changes.

---

If you want, this documentation can be split into separate files next:
- `docs/API.md`
- `docs/ARCHITECTURE.md`
- `docs/DEPLOYMENT.md`
- `docs/SECURITY.md`
for easier long-term maintenance.
