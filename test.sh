#!/bin/bash

# STEM Tutor Test Script
echo "🧪 Testing STEM Tutor setup..."
echo ""

# Function to check command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to get Node.js major version
get_node_version() {
    node -v | sed 's/v//' | cut -d'.' -f1 2>/dev/null || echo "0"
}

TESTS_PASSED=0
TESTS_FAILED=0

# Test Node.js
echo "1. Testing Node.js..."
if command_exists node; then
    NODE_VERSION=$(node -v)
    VERSION_NUM=$(get_node_version)
    if [ "$VERSION_NUM" -ge 18 ]; then
        echo "   ✅ Node.js $NODE_VERSION working (compatible)"
        ((TESTS_PASSED++))
    else
        echo "   ❌ Node.js $NODE_VERSION too old (need v18+)"
        ((TESTS_FAILED++))
    fi
else
    echo "   ❌ Node.js not found"
    ((TESTS_FAILED++))
fi

# Test npm
echo "2. Testing npm..."
if command_exists npm; then
    NPM_VERSION=$(npm -v)
    echo "   ✅ npm $NPM_VERSION working"
    ((TESTS_PASSED++))
else
    echo "   ❌ npm not working"
    ((TESTS_FAILED++))
fi

# Test internet connectivity
echo "3. Testing internet connectivity..."
if ping -c 1 registry.npmjs.org >/dev/null 2>&1; then
    echo "   ✅ Can reach npm registry"
    ((TESTS_PASSED++))
else
    echo "   ⚠️  Cannot reach npm registry (may affect package installation)"
    echo "   💡 Check internet connection or firewall settings"
fi

# Test backend dependencies
echo "4. Testing backend dependencies..."
cd backend
if [ -d "node_modules" ]; then
    # Check specific packages
    BACKEND_DEPS_OK=true
    for dep in "express" "cors" "uuid"; do
        if [ ! -d "node_modules/$dep" ]; then
            echo "   ❌ Missing dependency: $dep"
            BACKEND_DEPS_OK=false
        fi
    done
    
    if $BACKEND_DEPS_OK; then
        echo "   ✅ Backend dependencies installed and verified"
        ((TESTS_PASSED++))
    else
        echo "   ❌ Backend dependencies incomplete"
        echo "   💡 Run: cd backend && npm install"
        ((TESTS_FAILED++))
    fi
else
    echo "   ❌ Backend dependencies missing"
    echo "   💡 Run: cd backend && npm install"
    ((TESTS_FAILED++))
fi
cd ..

# Test frontend dependencies
echo "5. Testing frontend dependencies..."
cd frontend
if [ -d "node_modules" ]; then
    # Check specific packages
    FRONTEND_DEPS_OK=true
    for dep in "react" "vite" "@vitejs/plugin-react-swc"; do
        if [ ! -d "node_modules/$dep" ] && [ ! -d "node_modules/.pnpm/$dep"* ]; then
            echo "   ❌ Missing dependency: $dep"
            FRONTEND_DEPS_OK=false
        fi
    done
    
    if $FRONTEND_DEPS_OK; then
        echo "   ✅ Frontend dependencies installed and verified"
        ((TESTS_PASSED++))
    else
        echo "   ❌ Frontend dependencies incomplete"
        echo "   💡 Run: cd frontend && npm install"
        ((TESTS_FAILED++))
    fi
else
    echo "   ❌ Frontend dependencies missing"
    echo "   💡 Run: cd frontend && npm install"
    ((TESTS_FAILED++))
fi
cd ..

# Test data files
echo "6. Testing data files..."
DATA_FILES_OK=true
for file in "backend/data/flashcards.json" "backend/data/subjects.json" "backend/data/progress.json"; do
    if [ -f "$file" ]; then
        # Test JSON validity
        if command_exists node; then
            if node -e "JSON.parse(require('fs').readFileSync('$file', 'utf8'))" 2>/dev/null; then
                echo "   ✅ $file is valid JSON"
            else
                echo "   ❌ $file is invalid JSON"
                DATA_FILES_OK=false
            fi
        else
            echo "   ⚠️  Cannot validate $file (Node.js required)"
        fi
    else
        echo "   ❌ $file missing"
        DATA_FILES_OK=false
    fi
done

if $DATA_FILES_OK; then
    ((TESTS_PASSED++))
else
    echo "   💡 Run: ./troubleshoot.sh to fix data files"
    ((TESTS_FAILED++))
fi

# Test TypeScript configuration
echo "7. Testing TypeScript configuration..."
if [ -f "frontend/tsconfig.json" ] && [ -f "frontend/tsconfig.app.json" ]; then
    echo "   ✅ TypeScript configuration files present"
    ((TESTS_PASSED++))
else
    echo "   ❌ TypeScript configuration missing"
    ((TESTS_FAILED++))
fi

# Test Vite configuration
echo "8. Testing Vite configuration..."
if [ -f "frontend/vite.config.ts" ]; then
    echo "   ✅ Vite configuration present"
    ((TESTS_PASSED++))
else
    echo "   ❌ Vite configuration missing"
    ((TESTS_FAILED++))
fi

# Test backend server (quick start/stop)
echo "9. Testing backend server startup..."
if [ -d "backend/node_modules" ]; then
    cd backend
    
    # Start server in background with timeout
    timeout 10s npm start > /tmp/backend_test.log 2>&1 &
    SERVER_PID=$!
    
    # Wait for server to start
    sleep 3
    
    # Test if server responds
    if curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
        echo "   ✅ Backend server starts and responds"
        ((TESTS_PASSED++))
    else
        echo "   ❌ Backend server not responding"
        echo "   💡 Check logs: cat /tmp/backend_test.log"
        ((TESTS_FAILED++))
    fi
    
    # Clean up
    kill $SERVER_PID > /dev/null 2>&1
    wait $SERVER_PID 2>/dev/null
    cd ..
else
    echo "   ⚠️  Skipping server test (dependencies not installed)"
fi

# Test script permissions
echo "10. Testing script permissions..."
SCRIPTS_OK=true
for script in "start.sh" "install.sh" "troubleshoot.sh"; do
    if [ -f "$script" ]; then
        if [ -x "$script" ]; then
            echo "   ✅ $script is executable"
        else
            echo "   ❌ $script is not executable"
            SCRIPTS_OK=false
        fi
    else
        echo "   ❌ $script missing"
        SCRIPTS_OK=false
    fi
done

if $SCRIPTS_OK; then
    ((TESTS_PASSED++))
else
    echo "   💡 Run: chmod +x *.sh"
    ((TESTS_FAILED++))
fi

echo ""
echo "🎯 Test Summary:"
echo "   ✅ Tests passed: $TESTS_PASSED"
echo "   ❌ Tests failed: $TESTS_FAILED"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo "🎉 All tests passed! You can now run: ./start.sh"
    exit 0
elif [ $TESTS_FAILED -le 2 ]; then
    echo "⚠️  Minor issues detected. Try running: ./troubleshoot.sh"
    echo "   You can still try: ./start.sh"
    exit 0
else
    echo "❌ Multiple issues detected. Please run: ./troubleshoot.sh"
    echo "   Then run: ./install.sh"
    exit 1
fi