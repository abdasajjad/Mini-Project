# Setup Guide: Frontend-Backend Integration with Gemini AI & PDF Extraction

## Summary of Changes Made

### 1. **Frontend Environment Setup**
- Created `frontend/.env.local` with:
  - `VITE_GEMINI_API_KEY`: Your Google Gemini API key
  - `VITE_API_BASE_URL`: Backend API endpoint (http://localhost:5000/api)
  - `VITE_SERVER_URL`: Frontend server URL (http://localhost:3000)

### 2. **Backend Dependencies Added**
- `@google/genai`: Google Generative AI SDK for resume analysis
- `pdf-parse`: PDF text extraction library

### 3. **Database Schema Updates**
Updated `Application` model with AI fields:
- `resumeText`: Extracted text from uploaded PDF resume
- `aiScore`: 0-100 score from AI analysis
- `aiFeedback`: Summary feedback from Gemini AI
- `aiAnalysis`: Detailed analysis object (strengths, improvements, recommendation)

### 4. **New Backend Files Created**

#### Utils:
- `backend/utils/pdfExtractor.js` - PDF text extraction utilities
- `backend/utils/geminiAI.js` - Gemini AI integration for resume analysis

#### Controllers:
- `backend/controllers/ai.controller.js` - AI analysis endpoints

### 5. **Updated Files**

#### Application Controller (`backend/controllers/application.controller.js`)
- Auto-extracts PDF text when students upload resumes
- Stores extracted text in database for AI analysis

#### Application Routes (`backend/routes/application.routes.js`)
- New route: `POST /api/applications/:applicationId/analyze` - Analyze resume with Gemini AI
- New route: `POST /api/applications/:applicationId/interview-questions` - Generate interview questions
- New route: `GET /api/applications/:applicationId/analysis` - Retrieve AI analysis

#### Environment (`backend/.env`)
- Added `GEMINI_API_KEY` variable

---

## Setup Instructions

### Step 1: Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

### Step 2: Configure Environment Variables

#### Backend (`backend/.env`)
```env
PORT=5000
MONGO_URI=mongodb://admin:password@localhost:27017/internship_db?authSource=admin
JWT_SECRET=supersecretkey_change_this_in_production
NODE_ENV=development
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

#### Frontend (`frontend/.env.local`)
```env
VITE_GEMINI_API_KEY=your_actual_gemini_api_key_here
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SERVER_URL=http://localhost:3000
```

> **⚠️ IMPORTANT**: Get your Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)

### Step 3: Start MongoDB Container

```bash
# From project root
docker-compose up -d
```

Verify MongoDB is running:
```bash
docker ps | grep internship-mongodb
```

### Step 4: Start Backend Server

```bash
cd backend
npm run dev
```

Expected output:
```
Server is running on port 5000
MongoDB Connected
```

### Step 5: Start Frontend Dev Server

```bash
cd frontend
npm run dev
```

Frontend should be available at `http://localhost:3000`

### Step 6: Test the Connection

1. **Signup/Login** at `http://localhost:3000`
2. Navigate to an internship posting
3. Upload your resume (PDF format)
4. As Faculty/Admin, click "Analyze Application" to trigger Gemini AI scoring

---

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/signup` - Register

### Internships
- `GET /api/internships` - List all internships
- `POST /api/internships` - Create internship (Faculty/Admin)
- `GET /api/internships/:id` - Get internship details
- `PUT /api/internships/:id` - Update internship
- `DELETE /api/internships/:id` - Delete internship

### Applications
- `POST /api/applications/:internshipId/apply` - Apply with resume upload
- `GET /api/applications/my` - Get my applications
- `GET /api/applications/internship/:internshipId` - Get applications for internship (Faculty/Admin)
- `PUT /api/applications/:id/status` - Update status (approve/reject)
- `POST /api/applications/:id/certificate` - Upload completion certificate

### AI Analysis (NEW)
- `POST /api/applications/:applicationId/analyze` - Run AI analysis on resume
- `POST /api/applications/:applicationId/interview-questions` - Generate interview questions
- `GET /api/applications/:applicationId/analysis` - Get AI analysis results

---

## Usage Example: AI Resume Analysis

### Frontend (Optional - for future implementation)
```typescript
// Analyze a specific application
const response = await fetch(`/api/applications/${appId}/analyze`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const result = await response.json();
console.log(result.analysis.score);        // 0-100
console.log(result.analysis.strengths);    // Array of strengths
console.log(result.analysis.improvements); // Array of improvements
console.log(result.analysis.recommendation); // Match quality
```

### Backend Direct Usage
```javascript
const { analyzeResume } = require('./utils/geminiAI');

const resumeText = "...extracted text from PDF...";
const internship = {
  title: "Software Engineer Intern",
  description: "...",
  requiredSkills: ["React", "Node.js", "TypeScript"]
};

const analysis = await analyzeResume(resumeText, internship);
// Returns: { score, strengths, improvements, recommendation, summary }
```

---

## Database Modification Notes

### Before:
```javascript
{
  student: ObjectId,
  internship: ObjectId,
  status: String,
  appliedAt: Date,
  resumeSnapshot: String,
  certificate: String,
  certificateStatus: String
}
```

### After (NEW FIELDS):
```javascript
{
  student: ObjectId,
  internship: ObjectId,
  status: String,
  appliedAt: Date,
  resumeSnapshot: String,
  resumeText: String,              // ✅ NEW
  aiScore: Number,                 // ✅ NEW
  aiFeedback: String,              // ✅ NEW
  aiAnalysis: Object,              // ✅ NEW
  certificate: String,
  certificateStatus: String
}
```

---

## Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:**
```bash
docker-compose up -d
docker logs internship-mongodb
```

### Gemini API Key Error
```
Error: GEMINI_API_KEY is not configured
```
**Solution:**
1. Get key from [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Update `backend/.env` with your key
3. Restart backend: `npm run dev`

### PDF Extraction Issues
```
Error: Failed to extract PDF text
```
**Solution:**
- Ensure resume is a valid PDF file
- Supported: Standard text-based PDFs
- May fail on: Image-only PDFs, scanned documents

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution:**
```bash
# Find process using port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>
```

---

## What's Working Now

✅ Resume upload with PDF text extraction
✅ Gemini AI resume scoring (0-100)
✅ AI-generated feedback and analysis
✅ Interview question generation
✅ MongoDB integration
✅ Role-based access control
✅ JWT authentication

---

## Next Steps (Optional Enhancements)

1. **Frontend UI** - Add visual components for AI scores and feedback
2. **Async Jobs** - Use Bull.js for background AI analysis
3. **Caching** - Cache Gemini responses to reduce API calls
4. **Batch Analysis** - Analyze multiple applications at once
5. **Certificate Verification** - Add AI-based certificate authenticity check

---

## Quick Reference

| Component | Port | URL |
|-----------|------|-----|
| Frontend | 3000 | http://localhost:3000 |
| Backend | 5000 | http://localhost:5000 |
| MongoDB | 27017 | mongodb://localhost:27017 |

**Start everything:**
```bash
# Terminal 1: Start MongoDB
docker-compose up -d

# Terminal 2: Start Backend
cd backend && npm run dev

# Terminal 3: Start Frontend
cd frontend && npm run dev
```
