#!/bin/bash

echo "🚀 Starting STEM Tutor with AI Course Generator..."

# Function to check if a port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo "⚠️  Port $1 is already in use. Stopping existing process..."
        lsof -ti:$1 | xargs kill -9 2>/dev/null || true
        sleep 2
    fi
}

# Install dependencies first
echo "� Installitng dependencies..."
npm run install

# Check and free up ports
check_port 3001
check_port 8000
check_port 5173

# Check Ollama status
echo "🔍 Checking Ollama status..."
if ! curl -s http://localhost:11434/api/tags >/dev/null 2>&1; then
    echo "❌ Ollama is not running. Please start Ollama first:"
    echo "   brew install ollama"
    echo "   ollama serve"
    exit 1
fi

# Check if gemma3n model is available
if ! curl -s http://localhost:11434/api/tags | grep -q "gemma"; then
    echo "❌ Gemma model not found. Installing..."
    ollama pull gemma2
fi

echo "Ollama is running ✅"
echo "Gemma3n model is available ✅"

echo "🚀 Starting services..."

echo "🔧 Starting Express server (flashcards) on port 3001..."
cd backend && npm start &
BACKEND_PID=$!

echo "🤖 Starting FastAPI server (course generator) on port 8000..."
cd .. && python3 backend/python_server.py &
PYTHON_PID=$!

echo "🌐 Starting frontend on port 5173..."
cd frontend && npm run dev &
FRONTEND_PID=$!

sleep 3

echo ""
echo "📊 Service Status:"
echo "✅ Express API (flashcards): http://localhost:3001"
echo "✅ FastAPI (course generator): http://localhost:8000"
echo "✅ Frontend: http://localhost:5173"
echo "✅ Ollama (AI): http://localhost:11434"
echo ""
echo "🎯 All services are running! Open http://localhost:5173 to start learning."
echo "Press Ctrl+C to stop all services..."

# Function to cleanup processes on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down all services..."
    kill $BACKEND_PID 2>/dev/null || true
    kill $PYTHON_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Wait for all processes
wait