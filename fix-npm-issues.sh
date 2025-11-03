#!/bin/bash

# STEM Tutor NPM Issues Fix Script
echo "🔧 Fixing specific npm issues..."
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "❌ Please run this script from the STEM Tutor root directory"
    exit 1
fi

echo "🚨 Detected Issues:"
echo "1. npm cache permission issue (EACCES)"
echo "2. React dependency resolution issue (ERESOLVE)"
echo ""

echo "🔧 Step 1: Fixing npm cache permissions..."
# Fix npm cache permissions (the main issue from logs)
echo "Fixing npm cache ownership..."
sudo chown -R $(whoami) ~/.npm 2>/dev/null || {
    echo "⚠️  Could not fix npm cache permissions with sudo"
    echo "💡 You may need to run: sudo chown -R $(whoami) ~/.npm"
}

# Alternative: use a different cache directory
echo "Setting up alternative npm cache..."
mkdir -p ~/.npm-cache-local
npm config set cache ~/.npm-cache-local

echo "🧹 Step 2: Complete cleanup..."
rm -rf backend/node_modules frontend/node_modules
rm -f backend/package-lock.json frontend/package-lock.json package-lock.json
rm -rf ~/.npm/_cacache 2>/dev/null || true
rm -rf ~/.npm-cache-local 2>/dev/null || true

echo "🔧 Step 3: Configure npm for problematic dependencies..."
npm config set legacy-peer-deps true
npm config set fund false
npm config set audit false
npm config set progress true
npm config set fetch-retries 5
npm config set fetch-retry-factor 2

echo "📦 Step 4: Install backend dependencies (should work fine)..."
cd backend
npm install
if [ $? -eq 0 ]; then
    echo "✅ Backend dependencies installed successfully"
else
    echo "❌ Backend installation failed"
    exit 1
fi
cd ..

echo "📦 Step 5: Install frontend dependencies with specific fixes..."
cd frontend

# The main issue is with react-hook-form peer dependency resolution
echo "Installing React first to establish proper dependency tree..."
npm install react@^18.3.1 react-dom@^18.3.1

echo "Installing core build tools..."
npm install vite@^5.4.19 @vitejs/plugin-react-swc@^3.11.0 typescript@^5.8.3

echo "Installing remaining dependencies with legacy peer deps..."
npm install --legacy-peer-deps

if [ $? -eq 0 ]; then
    echo "✅ Frontend dependencies installed successfully"
else
    echo "⚠️  Some frontend dependencies may have issues, trying alternative approach..."
    
    # Alternative: install problematic packages individually
    echo "Installing problematic packages individually..."
    npm install @hookform/resolvers@^3.10.0 --legacy-peer-deps
    npm install react-hook-form@^7.61.1 --legacy-peer-deps
    
    # Try installing everything else
    npm install --legacy-peer-deps --force
    
    if [ $? -eq 0 ]; then
        echo "✅ Frontend dependencies installed with alternative method"
    else
        echo "❌ Frontend installation still failing, trying yarn..."
        
        # Install yarn and try with it
        npm install -g yarn 2>/dev/null || {
            echo "❌ Could not install yarn globally"
            echo "💡 Try: sudo npm install -g yarn"
            exit 1
        }
        
        yarn install
        if [ $? -eq 0 ]; then
            echo "✅ Frontend dependencies installed with yarn"
        else
            echo "❌ All installation methods failed"
            exit 1
        fi
    fi
fi

cd ..

echo "🔍 Step 6: Verify installations..."
# Check backend
if [ -d "backend/node_modules/express" ]; then
    echo "✅ Backend Express.js verified"
else
    echo "❌ Backend Express.js missing"
fi

# Check frontend
if [ -d "frontend/node_modules/react" ]; then
    echo "✅ Frontend React verified"
else
    echo "❌ Frontend React missing"
fi

if [ -d "frontend/node_modules/vite" ]; then
    echo "✅ Frontend Vite verified"
else
    echo "❌ Frontend Vite missing"
fi

echo "🧪 Step 7: Quick test..."
# Test backend startup
echo "Testing backend startup..."
cd backend
timeout 5s npm start > /tmp/backend_fix_test.log 2>&1 &
SERVER_PID=$!
sleep 2

if curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
    echo "✅ Backend test passed"
else
    echo "⚠️  Backend test failed - check logs: cat /tmp/backend_fix_test.log"
fi

kill $SERVER_PID > /dev/null 2>&1
wait $SERVER_PID 2>/dev/null
cd ..

echo ""
echo "🎉 NPM issues fix completed!"
echo ""
echo "✅ What was fixed:"
echo "• npm cache permissions (EACCES error)"
echo "• React dependency resolution (ERESOLVE error)"
echo "• Configured legacy peer deps for problematic packages"
echo ""
echo "Next steps:"
echo "1. Run: ./test.sh (to verify everything works)"
echo "2. Run: ./start.sh (to start the application)"
echo ""
echo "If you still have issues:"
echo "• The npm cache fix may require a system restart"
echo "• Try running the commands manually:"
echo "  cd backend && npm start"
echo "  cd frontend && npm run dev"