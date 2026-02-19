#!/bin/bash
# Quick deployment test script
# Verifies backend and frontend are ready for production deployment

echo "🔍 Deployment Readiness Check"
echo "================================"

# Check Backend
echo ""
echo "📦 Backend Checks:"
if [ -f "backend/requirements.txt" ]; then
  echo "✅ requirements.txt found"
  if grep -q "psycopg2" backend/requirements.txt; then
    echo "✅ PostgreSQL driver (psycopg2) included"
  else
    echo "❌ Missing psycopg2 - Add it for production database"
  fi
else
  echo "❌ requirements.txt not found"
fi

if [ -f "backend/app/database.py" ]; then
  echo "✅ database.py found"
  if grep -q "os.getenv" backend/app/database.py; then
    echo "✅ Environment variables supported"
  else
    echo "⚠️  Check if environment variables are used"
  fi
else
  echo "❌ database.py not found"
fi

if [ -f "backend/.env.example" ]; then
  echo "✅ .env.example configuration created"
else
  echo "⚠️  .env.example not found"
fi

# Check Frontend
echo ""
echo "📱 Frontend Checks:"
if [ -f "frontend/package.json" ]; then
  echo "✅ package.json found"
  if grep -q '"build"' frontend/package.json; then
    echo "✅ Build script configured"
  fi
else
  echo "❌ package.json not found"
fi

if [ -f "frontend/.env.example" ]; then
  echo "✅ .env.example configuration created"
else
  echo "⚠️  .env.example not found"
fi

if [ -f "frontend/src/api/axios.js" ]; then
  if grep -q "VITE_API_URL" frontend/src/api/axios.js; then
    echo "✅ API URL uses environment variables"
  fi
else
  echo "❌ axios.js not found"
fi

# Check Documentation
echo ""
echo "📚 Documentation:"
if [ -f "DEPLOYMENT_GUIDE.md" ]; then
  echo "✅ Deployment guide available"
else
  echo "⚠️  DEPLOYMENT_GUIDE.md not found"
fi

echo ""
echo "================================"
echo "✨ Deployment readiness check complete!"
echo ""
echo "Next steps:"
echo "1. Create .env in backend/ directory"
echo "2. Create .env.local in frontend/ directory" 
echo "3. Follow DEPLOYMENT_GUIDE.md for Render & Vercel setup"
