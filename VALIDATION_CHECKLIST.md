# Validation Checklist

## Pre-Flight Checks

- [ ] Node.js v18+ installed: `node --version`
- [ ] Docker installed: `docker --version`
- [ ] Git repository initialized and staged changes

## Step 1: Environment Setup

### Backend Configuration
- [ ] `backend/.env` file exists with these variables:
  - [ ] `PORT=5000`
  - [ ] `MONGO_URI=mongodb://admin:password@localhost:27017/internship_db?authSource=admin`
  - [ ] `JWT_SECRET=supersecretkey_change_this_in_production`
  - [ ] `NODE_ENV=development`
  - [ ] `GEMINI_API_KEY=<your_actual_key>`

### Frontend Configuration
- [ ] `frontend/.env.local` file exists with these variables:
  - [ ] `VITE_GEMINI_API_KEY=<your_actual_key>`
  - [ ] `VITE_API_BASE_URL=http://localhost:5000/api`
  - [ ] `VITE_SERVER_URL=http://localhost:3000`

## Step 2: Dependencies Installation

### Backend
```bash
cd backend && npm install
```
- [ ] No errors during npm install
- [ ] `node_modules/` folder exists
- [ ] `@google/genai` in `node_modules`
- [ ] `pdf-parse` in `node_modules`

### Frontend
```bash
cd frontend && npm install
```
- [ ] No errors during npm install
- [ ] `node_modules/` folder exists
- [ ] All dependencies resolved

## Step 3: MongoDB Startup

```bash
docker-compose up -d
```

Check status:
```bash
docker ps | grep internship-mongodb
```

- [ ] Container is running
- [ ] Status shows "Up"
- [ ] Port 27017 is accessible

Test connection:
```bash
docker logs internship-mongodb
```
- [ ] See "Waiting for connections" message
- [ ] No connection errors

## Step 4: Backend Server Startup

```bash
cd backend
npm run dev
```

Expected console output:
```
Server is running on port 5000
MongoDB Connected
```

Validation:
- [ ] Console shows "Server is running on port 5000"
- [ ] Console shows "MongoDB Connected" (not error)
- [ ] No errors in console

Test connectivity:
```bash
curl http://localhost:5000/
```
- [ ] Response: "Internship Management System API is running"

## Step 5: Frontend Dev Server Startup

```bash
cd frontend
npm run dev
```

Expected output:
```
VITE v6.2.0  ready in ### ms

➜  Local:   http://localhost:3000/
```

Validation:
- [ ] Build completes without errors
- [ ] Server runs on port 3000
- [ ] No TypeScript errors

## Step 6: Functional Tests

### 6.1: Authentication Flow
1. Navigate to `http://localhost:3000`
2. Click "Sign Up"
3. Fill in form (Name, Email, Password)
4. Select role: "Student"
5. Click Submit

Validation:
- [ ] Form validates properly
- [ ] Signup request sent to backend
- [ ] User created in MongoDB (check MongoDB)
- [ ] Can login with created credentials

### 6.2: Database Connectivity
Check MongoDB to verify user was created:
```bash
docker exec internship-mongodb mongosh -u admin -p password --authenticationDatabase admin
> use internship_db
> db.users.find()
```

Validation:
- [ ] User document exists
- [ ] Fields: name, email, password (hashed), role, department

### 6.3: Internship Listing
1. Login as created user
2. Navigate to internships page

Validation:
- [ ] Can fetch and display internships
- [ ] API call succeeds: `GET /api/internships`
- [ ] No CORS errors in console

### 6.4: Resume Upload & PDF Extraction
1. As Student, click "Apply" on an internship
2. Upload a PDF resume file
3. Submit application

Validation:
- [ ] File upload succeeds
- [ ] Application created in database
- [ ] Check database:
  ```bash
  > db.applications.find()
  ```
- [ ] `resumeText` field populated with extracted text
- [ ] No PDF parsing errors in backend console

### 6.5: AI Analysis (Faculty/Admin View)
1. Logout and login as Faculty/Admin
2. Navigate to applications for an internship
3. Click "Analyze Application" button (if implemented in UI)

OR test via REST:
```bash
curl -X POST http://localhost:5000/api/applications/{applicationId}/analyze \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json"
```

Validation:
- [ ] API endpoint responds without error
- [ ] Check response includes:
  - [ ] `score` (0-100 number)
  - [ ] `strengths` (array)
  - [ ] `improvements` (array)
  - [ ] `recommendation` (string)
  - [ ] `summary` (string)
- [ ] Database updated with AI fields:
  ```bash
  > db.applications.find().pretty()
  ```
  - [ ] `aiScore` populated
  - [ ] `aiFeedback` populated
  - [ ] `aiAnalysis` contains full analysis object

### 6.6: Interview Questions Generation
```bash
curl -X POST http://localhost:5000/api/applications/{applicationId}/interview-questions \
  -H "Authorization: Bearer {token}"
```

Validation:
- [ ] Returns array of 5 questions
- [ ] Questions are relevant to resume and internship

### 6.7: Error Handling
Test without Gemini API key:
1. Temporarily remove/comment `GEMINI_API_KEY` from `.env`
2. Restart backend
3. Try to analyze application

Validation:
- [ ] Get meaningful error: "GEMINI_API_KEY is not configured"
- [ ] Server doesn't crash

Test with invalid PDF:
1. Upload non-PDF file as resume
2. Check backend console

Validation:
- [ ] Logs warning about PDF extraction
- [ ] Application still created (fails gracefully)

## Step 7: File Structure Verification

Verify all new files exist:

### Backend Utils
- [ ] `backend/utils/pdfExtractor.js` exists
  - [ ] Has `extractPdfText()` function
  - [ ] Has `extractAndCleanPdfText()` function

- [ ] `backend/utils/geminiAI.js` exists
  - [ ] Has `analyzeResume()` function
  - [ ] Has `generateInterviewQuestions()` function

### Backend Controllers
- [ ] `backend/controllers/ai.controller.js` exists
  - [ ] Has `analyzeApplication` export
  - [ ] Has `generateInterviewQuestionsForApp` export
  - [ ] Has `getApplicationAnalysis` export

### Models
- [ ] `backend/models/Application.js` updated with:
  - [ ] `resumeText: String`
  - [ ] `aiScore: Number`
  - [ ] `aiFeedback: String`
  - [ ] `aiAnalysis: Object`

### Routes
- [ ] `backend/routes/application.routes.js` has new endpoints:
  - [ ] `POST /:applicationId/analyze`
  - [ ] `POST /:applicationId/interview-questions`
  - [ ] `GET /:applicationId/analysis`

### Environment
- [ ] `frontend/.env.local` created
- [ ] `backend/.env` has GEMINI_API_KEY

## Step 8: Integration Test

Complete end-to-end flow:

1. Sign up as Student (Alice)
2. Browse internships
3. Upload resume and apply
4. Logout, login as Faculty (Bob)
5. View applications for internship
6. Click "Analyze Application"
7. See AI score and feedback
8. Generate interview questions
9. View analysis details

Validation:
- [ ] All steps complete without errors
- [ ] Data flows correctly between frontend and backend
- [ ] AI analysis is meaningful and relevant
- [ ] No console errors or warnings

## Troubleshooting Guide

### Issue: "MongoDB Connection Error"
```bash
# Check if container is running
docker ps | grep internship-mongodb

# If not running:
docker-compose up -d

# Check logs:
docker logs internship-mongodb
```

### Issue: "Cannot find module '@google/genai'"
```bash
cd backend
npm install @google/genai
npm install pdf-parse
```

### Issue: "GEMINI_API_KEY is not configured"
1. Verify `backend/.env` has the key
2. Restart backend: `npm run dev`
3. Get key from: https://aistudio.google.com/app/apikey

### Issue: "Port 5000 already in use"
```bash
# Find and kill process
lsof -i :5000
kill -9 <PID>

# Or use different port in .env
PORT=5001
```

### Issue: "PDF extraction not working"
- Check if file is valid PDF
- Look at backend console for extraction errors
- Verify `pdf-parse` is installed

### Issue: "CORS errors in frontend console"
- Ensure backend is running on port 5000
- Verify `VITE_API_BASE_URL` in frontend `.env.local`
- Check CORS middleware in backend `server.js`

## Success Criteria

All of the following must be true:
- ✅ Docker MongoDB running
- ✅ Backend server started without errors
- ✅ Frontend dev server running
- ✅ Can signup and login
- ✅ Can upload resume PDF
- ✅ PDF text extracted and stored in DB
- ✅ Can trigger AI analysis
- ✅ AI returns meaningful scores and feedback
- ✅ Can generate interview questions
- ✅ All API endpoints respond correctly
- ✅ No console errors or 500 errors
- ✅ Data persists in MongoDB

## Next Steps After Validation

1. Create frontend UI components for AI score display
2. Implement certificate verification
3. Add email notifications
4. Deploy to production servers
5. Set up proper error monitoring (Sentry, etc.)
6. Implement rate limiting for AI API calls
