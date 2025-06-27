#!/bin/bash

# Start backend server
echo "Starting backend server on port 5001..."
cd /Users/sirilgade/tax-calculator/backend
node server.js &
BACKEND_PID=$!
echo "Backend started with PID: $BACKEND_PID"

# Wait for backend to start
sleep 3

# Start frontend server
echo "Starting frontend server on port 3001..."
cd /Users/sirilgade/tax-calculator
PORT=3001 npm start &
FRONTEND_PID=$!
echo "Frontend started with PID: $FRONTEND_PID"

echo "Both servers are starting..."
echo "Backend: http://localhost:5001"
echo "Frontend: http://localhost:3001"
echo ""
echo "To stop servers, use: kill $BACKEND_PID $FRONTEND_PID"

# Keep script running
wait