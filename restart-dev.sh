#!/bin/bash

# Kill existing service on port 3001
echo "Stopping existing service on port 3001..."
lsof -ti:3001 | xargs kill -9 2>/dev/null || echo "No service running on port 3001"

# Run npm install
echo "Installing dependencies..."
npm install

# Run npm run dev
echo "Starting development server..."
npm run dev
