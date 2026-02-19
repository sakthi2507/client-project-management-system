# 🚀 Deployment Guide - Render (Backend) & Vercel (Frontend)

## ✅ Deployment Readiness Checklist

Your project is now **DEPLOYMENT READY** after the updates! Here's what was fixed:

- ✅ Database: SQLite → PostgreSQL support
- ✅ CORS: Hardcoded URLs → Environment variables
- ✅ Environment: Added dotenv configuration
- ✅ Dependencies: Added psycopg2 for PostgreSQL
- ✅ .gitignore: Already configured properly

---

## 📋 Pre-Deployment Checklist

### Backend (Render)

- [ ] Create Render PostgreSQL database
- [ ] Copy DATABASE_URL from Render
- [ ] Set SECRET_KEY to a strong random value
- [ ] Set FRONTEND_URL to your Vercel deployment URL
- [ ] Create render.yaml or configure through dashboard

### Frontend (Vercel)

- [ ] Set VITE_API_URL to your Render API URL
- [ ] Verify build script: `npm run build`
- [ ] Test production build locally: `npm run build && npm run preview`

---

## 🔧 Step-by-Step Deployment

### PHASE 1: Create Render PostgreSQL Database

1. Go to https://render.com/
2. Click "New +" → "PostgreSQL"
3. Name: `project-management-db`
4. Region: Choose closest to your users
5. PostgreSQL Version: 15
6. Create database
7. **COPY the Internal Database URL** (you'll need this)

---

### PHASE 2: Deploy Backend to Render

1. Go to https://render.com/
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name:** `project-management-api`
   - **Environment:** Python 3.11
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. **Environment Variables** (click "Advanced" → "Add Environment Variable"):
   ```
   DATABASE_URL = [Your PostgreSQL Internal Database URL]
   FRONTEND_URL = https://your-vercel-app.vercel.app (set after Vercel deployment)
   SECRET_KEY = [Generate with: python -c "import secrets; print(secrets.token_urlsafe(32))"]
   ```
6. Click "Create Web Service"
7. **Wait for deployment to complete** (5-10 minutes)
8. Copy your API URL: `https://project-management-api.onrender.com`

---

### PHASE 3: Deploy Frontend to Vercel

1. Go to https://vercel.com/
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. **Environment Variables:**
   ```
   VITE_API_URL = https://project-management-api.onrender.com
   ```
6. Click "Deploy"
7. **Wait for deployment** (2-5 minutes)
8. Copy your frontend URL: `https://your-project.vercel.app`

---

### PHASE 4: Update Backend CORS

1. Go back to Render dashboard
2. Select `project-management-api`
3. Click "Environment" tab
4. Update `FRONTEND_URL` to your Vercel URL: `https://your-project.vercel.app`
5. Click "Save Changes"
6. Your backend will auto-redeploy

---

## 🧪 Testing After Deployment

### Test Backend API

```bash
curl https://project-management-api.onrender.com/
```

Should return: `{"message":"API is running"}`

### Test Frontend Connection

1. Visit `https://your-project.vercel.app/`
2. Try to login
3. Check browser console (F12) for any CORS errors
4. If login works → ✅ Everything is connected!

---

## 📝 Environment Variables Reference

### Backend (.env for local, Render dashboard for production)

| Variable       | Purpose                | Example                          |
| -------------- | ---------------------- | -------------------------------- |
| `DATABASE_URL` | PostgreSQL connection  | `postgresql://user:pass@host/db` |
| `FRONTEND_URL` | Frontend domain (CORS) | `https://app.vercel.app`         |
| `SECRET_KEY`   | JWT signing key        | `[random 32+ chars]`             |

### Frontend (.env.local for local, Vercel dashboard for production)

| Variable       | Purpose         | Example                    |
| -------------- | --------------- | -------------------------- |
| `VITE_API_URL` | Backend API URL | `https://api.onrender.com` |

---

## 🐛 Common Issues & Fixes

### "CORS Error" on frontend

- **Cause:** FRONTEND_URL not set correctly in backend
- **Fix:** Update FRONTEND_URL in Render dashboard to match your Vercel URL exactly

### "Database Connection Error"

- **Cause:** DATABASE_URL is wrong or database is down
- **Fix:** Verify DATABASE_URL in Render dashboard, check if PostgreSQL instance is running

### "Login fails with 401"

- **Cause:** Backend and frontend not communicating
- **Fix:** Check VITE_API_URL in Vercel dashboard points to correct Render API

### "Build fails on Render"

- **Cause:** Missing dependencies
- **Fix:** Run locally: `pip install -r requirements.txt` to verify

### "Vercel build fails"

- **Cause:** Node dependencies issue
- **Fix:** Run locally: `npm install && npm run build` to verify

---

## 🔒 Security Best Practices

1. **Never commit .env files** - Already configured in .gitignore ✅
2. **Use strong SECRET_KEY** - Generate with Python secrets module
3. **Use environment variables** - Never hardcode credentials
4. **HTTPS only** - Both Render and Vercel use HTTPS by default ✅
5. **Database backups** - Enable on Render PostgreSQL dashboard

---

## 📊 Deployment Architecture

```
┌─────────────────────────────────────┐
│   Your Computer (Development)       │
│  ├─ Backend: localhost:8000         │
│  └─ Frontend: localhost:5173        │
└─────────────────────────────────────┘
              ↓↓↓ Git Push
┌─────────────────────────────────────┐
│        GitHub Repository            │
└─────────────────────────────────────┘
      ↓                          ↓
   [Render]                  [Vercel]
      ↓                          ↓
┌──────────────┐        ┌──────────────┐
│ Backend API  │◄──────►│ Frontend App │
│ (FastAPI)    │        │ (React)      │
│ PostgreSQL   │        │              │
└──────────────┘        └──────────────┘
https://...             https://...
.onrender.com           .vercel.app
```

---

## ✨ You're all set!

Your project is now ready for production deployment. Follow the steps above and you'll have a live, scalable application! 🎉

**Need help?** Check the common issues section or refer to individual service docs:

- Render: https://render.com/docs
- Vercel: https://vercel.com/docs
- FastAPI: https://fastapi.tiangolo.com/deployment/
