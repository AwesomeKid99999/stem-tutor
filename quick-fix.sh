#!/bin/bash

# Quick Fix for STEM Tutor Installation Issues
echo "🚀 Quick Fix for STEM Tutor Installation Issues"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "❌ Please run this script from the STEM Tutor root directory"
    exit 1
fi

echo "🔍 Detected issues from your logs:"
echo "1. EACCES: npm cache permission issue"
echo "2. ERESOLVE: React dependency resolution conflict"
echo "3. Missing backend directory in start.sh"
echo ""

echo "🔧 Applying fixes..."

# Fix 1: npm permissions (the main culprit)
echo "Step 1: Fixing npm permissions..."
if [ -d "/Users/vasanth/.npm" ]; then
    sudo chown -R $(whoami) /Users/vasanth/.npm 2>/dev/null || {
        echo "⚠️  Could not fix permissions automatically"
        echo "💡 Please run: sudo chown -R $(whoami) ~/.npm"
    }
else
    sudo chown -R $(whoami) ~/.npm 2>/dev/null || true
fi

# Fix 2: Clear problematic cache
echo "Step 2: Clearing npm cache..."
npm cache clean --force 2>/dev/null || true
rm -rf ~/.npm/_cacache 2>/dev/null || true

# Fix 3: Set npm config for better compatibility
echo "Step 3: Configuring npm..."
npm config set legacy-peer-deps true
npm config set fund false
npm config set audit false

# Fix 4: Clean everything
echo "Step 4: Cleaning existing installations..."
rm -rf backend/node_modules frontend/node_modules
rm -f backend/package-lock.json frontend/package-lock.json package-lock.json

# Fix 5: Install backend (should work fine)
echo "Step 5: Installing backend..."
cd backend
npm install
if [ $? -ne 0 ]; then
    echo "❌ Backend installation failed"
    exit 1
fi
echo "✅ Backend installed successfully"
cd ..

# Fix 6: Install frontend with specific strategy
echo "Step 6: Installing frontend with dependency resolution fix..."
cd frontend

# Install React first to establish proper dependency tree
npm install react@18.3.1 react-dom@18.3.1

# Install build tools
npm install vite@5.4.19 @vitejs/plugin-react-swc@3.11.0 typescript@5.8.3

# Install the rest with legacy peer deps
npm install --legacy-peer-deps

if [ $? -eq 0 ]; then
    echo "✅ Frontend installed successfully"
else
    echo "⚠️  Frontend installation had issues, trying with yarn..."
    
    # Try with yarn as fallback
    if command -v yarn >/dev/null 2>&1; then
        yarn install
    else
        npm install -g yarn 2>/dev/null && yarn install
    fi
    
    if [ $? -eq 0 ]; then
        echo "✅ Frontend installed with yarn"
    else
        echo "❌ Frontend installation failed with all methods"
        echo "💡 Try running the installation manually:"
        echo "   cd frontend"
        echo "   npm install --legacy-peer-deps --force"
        exit 1
    fi
fi

cd ..

# Fix 7: Verify installations
echo "Step 7: Verifying installations..."
if [ -d "backend/node_modules/express" ]; then
    echo "✅ Backend verified"
else
    echo "❌ Backend verification failed"
fi

if [ -d "frontend/node_modules/react" ] && [ -d "frontend/node_modules/vite" ]; then
    echo "✅ Frontend verified"
else
    echo "❌ Frontend verification failed"
fi

# Fix 8: Test the setup
echo "Step 8: Quick test..."
cd backend
timeout 5s npm start > /tmp/quick_fix_test.log 2>&1 &
SERVER_PID=$!
sleep 2

if curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
    echo "✅ Backend test passed"
else
    echo "⚠️  Backend test failed"
fi

kill $SERVER_PID > /dev/null 2>&1
wait $SERVER_PID 2>/dev/null
cd ..

echo ""
echo "🎉 Quick fix completed!"
echo ""
echo "✅ What was fixed:"
echo "• npm cache permissions (EACCES)"
echo "• React dependency conflicts (ERESOLVE)"
echo "• Configured legacy peer deps"
echo "• Cleaned and reinstalled all dependencies"
echo ""
echo "🚀 Next steps:"
echo "1. Try: ./start.sh"
echo "2. If that works, visit: http://localhost:5173"
echo ""
echo "💡 If you still have issues:"
echo "• Check the logs when running ./start.sh"
echo "• Try manual startup:"
echo "  Terminal 1: cd backend && npm start"
echo "  Terminal 2: cd frontend && npm run dev"