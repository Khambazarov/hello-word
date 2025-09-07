#!/bin/bash
echo "Stopping existing backend processes..."
pkill -f "node.*server.js" 2>/dev/null || true
pkill -f "nodemon.*server.js" 2>/dev/null || true

echo "Waiting for processes to stop..."
sleep 2

echo "Starting backend..."
cd /home/dev/repos/my-projects/hello-word/backend
npm run dev
