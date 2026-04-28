@echo off
echo 🚀 LendKraft LMS - Quick Setup ^& Fix Script
echo ==========================================

REM Check if we're in the right directory
if not exist "backend" (
    echo ❌ Please run this script from the root directory (lendkraft-lms)
    pause
    exit /b 1
)

if not exist "frontend" (
    echo ❌ Please run this script from the root directory (lendkraft-lms)
    pause
    exit /b 1
)

echo 📦 Installing dependencies...

REM Backend dependencies
echo 📦 Installing backend dependencies...
cd backend
call npm install
cd ..

REM Frontend dependencies  
echo 📦 Installing frontend dependencies...
cd frontend
call npm install
cd ..

echo 🗄️ Setting up database...
cd backend

REM Initialize database
echo 🗄️ Initializing database with sample data...
call npx tsx init-database.ts

echo ✅ Setup completed!
echo.
echo 🚀 To start the application:
echo 1. Backend: cd backend ^&^& npm run dev
echo 2. Frontend: cd frontend ^&^& npm run dev
echo.
echo 🔑 Login credentials:
echo Super Admin: admin@lendkraft.com / Admin@123
echo Team Lead: john@lendkraft.com / Admin@123
echo BDE: sarah@lendkraft.com / Admin@123
echo Channel Partner: cp@test.com / Test@123
echo.
echo 🌐 URLs:
echo Frontend: http://localhost:5173
echo Backend: http://localhost:5000
echo Health Check: http://localhost:5000/health

pause