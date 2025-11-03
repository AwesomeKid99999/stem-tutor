#!/bin/bash

# STEM Tutor Package Installation Fix Script
echo "🔧 Fixing package installation issues..."
echo ""

# Function to check command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "❌ Please run this script from the STEM Tutor root directory"
    exit 1
fi

echo "🧹 Step 1: Complete cleanup..."
echo "Removing all node_modules and lock files..."
rm -rf backend/node_modules frontend/node_modules node_modules
rm -f backend/package-lock.json frontend/package-lock.json package-lock.json
rm -rf backend/.npm frontend/.npm .npm

echo "🧹 Step 2: Clearing npm cache..."
npm cache clean --force 2>/dev/null || echo "Cache clean failed (continuing...)"

echo "🔧 Step 3: Configuring npm for better reliability..."
npm config set fund false
npm config set audit false
npm config set progress true
npm config set fetch-retries 5
npm config set fetch-retry-factor 2
npm config set fetch-retry-mintimeout 10000
npm config set fetch-retry-maxtimeout 60000

echo "📦 Step 4: Installing backend dependencies..."
cd backend

# Try multiple installation strategies for backend
echo "Attempting standard installation..."
if npm install --no-optional --no-fund --no-audit; then
    echo "✅ Backend installed successfully"
elif npm install --legacy-peer-deps --no-optional; then
    echo "✅ Backend installed with legacy peer deps"
elif npm install --force --no-optional; then
    echo "⚠️  Backend installed with force flag"
else
    echo "❌ Standard installation failed, trying alternative methods..."
    
    # Try with different registry
    echo "Trying with different registry..."
    npm install --registry https://registry.npmjs.org/ --no-optional
    
    if [ $? -ne 0 ]; then
        echo "❌ All backend installation methods failed"
        echo ""
        echo "Manual steps to try:"
        echo "1. Check your internet connection"
        echo "2. Check if you're behind a corporate firewall"
        echo "3. Try: npm config set registry https://registry.npmjs.org/"
        echo "4. Try installing individual packages:"
        echo "   npm install express@^4.18.2"
        echo "   npm install cors@^2.8.5"
        echo "   npm install uuid@^9.0.1"
        exit 1
    fi
fi

cd ..

echo "📦 Step 5: Installing frontend dependencies..."
cd frontend

# Frontend has more complex dependencies, try different strategies
echo "Attempting standard installation..."
if npm install --no-optional --no-fund --no-audit; then
    echo "✅ Frontend installed successfully"
elif npm install --legacy-peer-deps --no-optional; then
    echo "✅ Frontend installed with legacy peer deps"
elif npm install --force --no-optional; then
    echo "⚠️  Frontend installed with force flag"
else
    echo "❌ Standard installation failed, trying alternative methods..."
    
    # Try with increased timeout and retries
    echo "Trying with increased timeout..."
    npm install --fetch-timeout=300000 --fetch-retries=5 --legacy-peer-deps
    
    if [ $? -ne 0 ]; then
        echo "Trying to install core dependencies first..."
        npm install react@^18.3.1 react-dom@^18.3.1 --legacy-peer-deps
        npm install vite@^5.4.19 @vitejs/plugin-react-swc@^3.11.0 --legacy-peer-deps
        npm install typescript@^5.8.3 --legacy-peer-deps
        
        # Then install the rest
        npm install --legacy-peer-deps
        
        if [ $? -ne 0 ]; then
            echo "❌ All frontend installation methods failed"
            echo ""
            echo "Manual steps to try:"
            echo "1. Check your internet connection"
            echo "2. Try using yarn instead:"
            echo "   npm install -g yarn"
            echo "   yarn install"
            echo "3. Try installing with different Node.js version (use nvm)"
            echo "4. Check if you have enough disk space"
            echo "5. Try on a different network"
            exit 1
        fi
    fi
fi

cd ..

echo "🔍 Step 6: Verifying installations..."

# Verify backend
if [ -d "backend/node_modules/express" ] && [ -d "backend/node_modules/cors" ] && [ -d "backend/node_modules/uuid" ]; then
    echo "✅ Backend dependencies verified"
else
    echo "⚠️  Backend dependencies may be incomplete"
    echo "Missing packages:"
    [ ! -d "backend/node_modules/express" ] && echo "  - express"
    [ ! -d "backend/node_modules/cors" ] && echo "  - cors"
    [ ! -d "backend/node_modules/uuid" ] && echo "  - uuid"
fi

# Verify frontend
if [ -d "frontend/node_modules/react" ] && [ -d "frontend/node_modules/vite" ]; then
    echo "✅ Frontend dependencies verified"
else
    echo "⚠️  Frontend dependencies may be incomplete"
    echo "Missing packages:"
    [ ! -d "frontend/node_modules/react" ] && echo "  - react"
    [ ! -d "frontend/node_modules/vite" ] && echo "  - vite"
fi

echo "🧪 Step 7: Quick functionality test..."

# Test backend
echo "Testing backend..."
cd backend
if timeout 5s npm start > /tmp/backend_test.log 2>&1 & then
    SERVER_PID=$!
    sleep 2
    
    if curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
        echo "✅ Backend test passed"
    else
        echo "⚠️  Backend test failed - check logs: cat /tmp/backend_test.log"
    fi
    
    kill $SERVER_PID > /dev/null 2>&1
    wait $SERVER_PID 2>/dev/null
else
    echo "⚠️  Could not start backend for testing"
fi
cd ..

# Test frontend build
echo "Testing frontend build..."
cd frontend
if timeout 30s npm run build > /tmp/frontend_build.log 2>&1; then
    echo "✅ Frontend build test passed"
    rm -rf dist  # Clean up build output
else
    echo "⚠️  Frontend build test failed - check logs: cat /tmp/frontend_build.log"
fi
cd ..

echo ""
echo "🎉 Package installation fix completed!"
echo ""
echo "Next steps:"
echo "1. Run: ./test.sh (to verify everything works)"
echo "2. Run: ./start.sh (to start the application)"
echo ""
echo "If you still have issues:"
echo "• Check the log files in /tmp/"
echo "• Run: ./troubleshoot.sh"
echo "• Try a different Node.js version with nvm"
echo "• Consider using yarn instead of npm"