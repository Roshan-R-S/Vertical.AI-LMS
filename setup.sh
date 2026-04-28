#!/bin/bash

echo "🚀 LendKraft LMS - Quick Setup & Fix Script"
echo "=========================================="

# Check if we're in the right directory
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "❌ Please run this script from the root directory (lendkraft-lms)"
    exit 1
fi

echo "📦 Installing dependencies..."

# Backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
cd ..

# Frontend dependencies  
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ..

echo "🗄️ Setting up database..."
cd backend

# Initialize database
echo "🗄️ Initializing database with sample data..."
npx tsx init-database.ts

echo "✅ Setup completed!"
echo ""
echo "🚀 To start the application:"
echo "1. Backend: cd backend && npm run dev"
echo "2. Frontend: cd frontend && npm run dev"
echo ""
echo "🔑 Login credentials:"
echo "Super Admin: admin@lendkraft.com / Admin@123"
echo "Team Lead: john@lendkraft.com / Admin@123" 
echo "BDE: sarah@lendkraft.com / Admin@123"
echo "Channel Partner: cp@test.com / Test@123"
echo ""
echo "🌐 URLs:"
echo "Frontend: http://localhost:5173"
echo "Backend: http://localhost:5000"
echo "Health Check: http://localhost:5000/health"