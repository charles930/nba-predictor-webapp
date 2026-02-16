#!/bin/bash
# NBA Predictor - Quick Run Script

echo "🏀 NBA Predictor Web App"
echo "======================="
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install
  echo "✅ Dependencies installed"
  echo ""
fi

# Show what's about to happen
echo "🚀 Starting development servers:"
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:3001"
echo "   Health:   http://localhost:3001/health"
echo ""
echo "Press Ctrl+C to stop"
echo "=========================="
echo ""

# Run both servers
npm run dev:all
