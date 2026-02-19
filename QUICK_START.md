# Quick Start Guide

## ⚡ 5-Minute Setup

### Backend Setup (Terminal 1)

```bash
cd backend
python -m venv venv
.\venv\Scripts\activate              # Windows
source venv/bin/activate             # Mac/Linux
pip install -r requirements.txt
python init_admin.py
python -m uvicorn app.main:app --reload
```

✅ Backend running on `http://localhost:8000`

### Frontend Setup (Terminal 2)

```bash
cd frontend
npm install
```

Create `.env.local`:

```env
VITE_API_URL=http://localhost:8000
```

Then:

```bash
npm run dev
```

✅ Frontend running on `http://localhost:5173`

---

## 🔐 Default Credentials

```
Email:    admin@example.com
Password: password
```

⚠️ **Change immediately in production!**

---

## 📊 User Roles Quick Reference

| Role               | Projects      | Teams  | Register Users | Delete |
| ------------------ | ------------- | ------ | -------------- | ------ |
| **Admin**          | All           | All    | ✅ Yes         | ✅ Yes |
| **ProjectManager** | All           | Assign | ❌ No          | ❌ No  |
| **TeamMember**     | Assigned Only | View   | ❌ No          | ❌ No  |

---

## 🚀 First Steps

1. **Log in** with admin credentials
2. **Register** a test user (Click user icon or Register page)
3. **Create** a project (Click "New Project")
4. **Assign** team member (Click "Teams" button)
5. **View** as different user to see role-based filtering

---

## 📁 Key File Locations

| File                                | Purpose                    |
| ----------------------------------- | -------------------------- |
| `backend/app/main.py`               | FastAPI app entry point    |
| `backend/app/auth.py`               | JWT & password logic       |
| `backend/app/models.py`             | Database models            |
| `frontend/src/pages/Login.jsx`      | Login page                 |
| `frontend/src/pages/Projects.jsx`   | Project management + teams |
| `frontend/src/auth/AuthContext.jsx` | Auth state management      |
| `frontend/.env.local`               | API URL configuration      |

---

## 🔧 Common Tasks

### Reset Database

```bash
cd backend
del database.db              # Windows
rm database.db              # Mac/Linux
python init_admin.py
```

### Change Admin Password

Admin must update password in `/auth/me` endpoint after first login

### Update API URL

Edit `frontend/.env.local`:

```env
VITE_API_URL=http://your-server:8000
```

### Build for Production

```bash
cd frontend
npm run build          # Creates dist/ folder
# Deploy dist/ to web server
```

---

## ✨ Features Overview

- ✅ User authentication & JWT tokens
- ✅ Role-based access control (Admin, ProjectManager, TeamMember)
- ✅ Project CRUD with team assignments
- ✅ Team member visibility (role-filtered)
- ✅ Admin notifications for user requests
- ✅ Task & client management
- ✅ Secure logout on page refresh
- ✅ Duplicate email prevention
- ✅ Beautiful UI with Tailwind CSS

---

## 🐛 Troubleshooting

| Problem               | Solution                                            |
| --------------------- | --------------------------------------------------- |
| "Cannot reach API"    | Make sure backend is running on port 8000           |
| "Invalid credentials" | Reset DB: `del database.db && python init_admin.py` |
| "Port 8000 in use"    | Change port: `--port 8001`                          |
| "CORS error"          | Check `frontend/.env.local` has correct API URL     |
| "Teams not visible"   | Refresh browser, check assignments created          |

---

## 📈 Next Steps

1. Change default admin password
2. Create test projects and teams
3. Register team members with different roles
4. Test role-based access
5. Deploy to production server

---

## 📚 Full Documentation

See `DOCUMENTATION.md` for complete guide including:

- Architecture diagrams
- Database schema
- All API endpoints
- Component structure
- Security details
- Deployment guide

---

**Built with ❤️ using GitHub Copilot**
**Status: Production Ready ✅**
