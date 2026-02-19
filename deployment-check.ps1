# Quick deployment test script (PowerShell)
# Verifies backend and frontend are ready for production deployment

Write-Host "🔍 Deployment Readiness Check" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

# Check Backend
Write-Host ""
Write-Host "📦 Backend Checks:" -ForegroundColor Yellow
if (Test-Path "backend/requirements.txt") {
    Write-Host "✅ requirements.txt found" -ForegroundColor Green
    $reqContent = Get-Content "backend/requirements.txt"
    if ($reqContent -match "psycopg2") {
        Write-Host "✅ PostgreSQL driver (psycopg2) included" -ForegroundColor Green
    } else {
        Write-Host "❌ Missing psycopg2 - Add it for production database" -ForegroundColor Red
    }
} else {
    Write-Host "❌ requirements.txt not found" -ForegroundColor Red
}

if (Test-Path "backend/app/database.py") {
    Write-Host "✅ database.py found" -ForegroundColor Green
    $dbContent = Get-Content "backend/app/database.py"
    if ($dbContent -match "os.getenv") {
        Write-Host "✅ Environment variables supported" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Check if environment variables are used" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ database.py not found" -ForegroundColor Red
}

if (Test-Path "backend/.env.example") {
    Write-Host "✅ .env.example configuration created" -ForegroundColor Green
} else {
    Write-Host "⚠️ .env.example not found" -ForegroundColor Yellow
}

# Check Frontend
Write-Host ""
Write-Host "📱 Frontend Checks:" -ForegroundColor Yellow
if (Test-Path "frontend/package.json") {
    Write-Host "✅ package.json found" -ForegroundColor Green
    $pkgContent = Get-Content "frontend/package.json"
    if ($pkgContent -match '"build"') {
        Write-Host "✅ Build script configured" -ForegroundColor Green
    }
} else {
    Write-Host "❌ package.json not found" -ForegroundColor Red
}

if (Test-Path "frontend/.env.example") {
    Write-Host "✅ .env.example configuration created" -ForegroundColor Green
} else {
    Write-Host "⚠️ .env.example not found" -ForegroundColor Yellow
}

if (Test-Path "frontend/src/api/axios.js") {
    $axiosContent = Get-Content "frontend/src/api/axios.js"
    if ($axiosContent -match "VITE_API_URL") {
        Write-Host "✅ API URL uses environment variables" -ForegroundColor Green
    }
} else {
    Write-Host "❌ axios.js not found" -ForegroundColor Red
}

# Check Documentation
Write-Host ""
Write-Host "📚 Documentation:" -ForegroundColor Yellow
if (Test-Path "DEPLOYMENT_GUIDE.md") {
    Write-Host "✅ Deployment guide available" -ForegroundColor Green
} else {
    Write-Host "⚠️ DEPLOYMENT_GUIDE.md not found" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "✨ Deployment readiness check complete!" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Green
Write-Host "1. Create .env in backend/ directory"
Write-Host "2. Create .env.local in frontend/ directory" 
Write-Host "3. Follow DEPLOYMENT_GUIDE.md for Render & Vercel setup"
