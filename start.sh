#!/bin/bash

# Finance Tracker - Startup Script
# This script starts both the backend and frontend servers

echo "🚀 Starting Finance Tracker Application..."
echo ""

# Check if MongoDB is running
echo "📊 Checking MongoDB..."
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  MongoDB is not running. Starting MongoDB..."
    brew services start mongodb-community
    sleep 3
else
    echo "✅ MongoDB is already running"
fi

echo ""
echo "🔧 Starting Backend Server (Port 5000)..."
cd backend
node server.js &
BACKEND_PID=$!
echo "✅ Backend server started (PID: $BACKEND_PID)"

echo ""
echo "🎨 Starting Frontend Server (Port 5173)..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!
echo "✅ Frontend server started (PID: $FRONTEND_PID)"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✨ Finance Tracker is now running!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📡 Backend API:  http://localhost:5000"
echo "🌐 Frontend App: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Wait for user interrupt
trap "echo ''; echo '🛑 Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
