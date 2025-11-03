#!/bin/bash

# STEM Tutor Troubleshooting Script
echo "🔍 STEM Tutor Troubleshooting..."
echo ""

# Function to check command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to get Node.js major version
get_node_version() {
    node -v | sed 's/v//' | cut -d'.' -f1 2>/dev/null || echo "0"
}

# Check Node.js
echo "1. Checking Node.js installation..."
if command_exists node; then
    NODE_VERSION=$(node -v)
    echo "   ✅ Node.js $NODE_VERSION installed"
    
    # Check version
    VERSION_NUM=$(get_node_version)
    if [ "$VERSION_NUM" -lt 18 ]; then
        echo "   ⚠️  Node.js version is too old (need v18+)"
        echo "   💡 Install from: https://nodejs.org/"
    else
        echo "   ✅ Node.js version is compatible"
    fi
else
    echo "   ❌ Node.js not found"
    echo "   💡 Install from: https://nodejs.org/"
fi

# Check npm
echo "2. Checking npm installation..."
if command_exists npm; then
    NPM_VERSION=$(npm -v)
    echo "   ✅ npm $NPM_VERSION installed"
    
    # Check npm configuration
    echo "   🔧 Checking npm configuration..."
    NPM_REGISTRY=$(npm config get registry 2>/dev/null || echo "unknown")
    echo "   📡 Registry: $NPM_REGISTRY"
    
    # Check npm cache
    NPM_CACHE=$(npm config get cache 2>/dev/null || echo "unknown")
    echo "   💾 Cache: $NPM_CACHE"
else
    echo "   ❌ npm not found"
    echo "   💡 npm usually comes with Node.js"
fi

# Check internet connectivity
echo "3. Checking internet connectivity..."
if ping -c 1 registry.npmjs.org >/dev/null 2>&1; then
    echo "   ✅ Can reach npm registry"
elif ping -c 1 8.8.8.8 >/dev/null 2>&1; then
    echo "   ⚠️  Internet works but npm registry unreachable"
    echo "   💡 You might be behind a firewall or proxy"
else
    echo "   ❌ No internet connection"
    echo "   💡 Check your network connection"
fi

# Check project structure
echo "4. Checking project structure..."
for dir in "backend" "frontend"; do
    if [ -d "$dir" ]; then
        echo "   ✅ $dir/ directory exists"
    else
        echo "   ❌ $dir/ directory missing"
    fi
done

for file in "backend/package.json" "frontend/package.json"; do
    if [ -f "$file" ]; then
        echo "   ✅ $file exists"
        # Validate JSON
        if command_exists node; then
            if node -e "JSON.parse(require('fs').readFileSync('$file', 'utf8'))" 2>/dev/null; then
                echo "   ✅ $file is valid JSON"
            else
                echo "   ❌ $file is invalid JSON"
            fi
        fi
    else
        echo "   ❌ $file missing"
    fi
done

# Check dependencies
echo "5. Checking dependencies..."
for dir in "backend" "frontend"; do
    if [ -d "$dir/node_modules" ]; then
        echo "   ✅ $dir dependencies installed"
        
        # Check key dependencies
        if [ "$dir" = "backend" ]; then
            if [ -f "$dir/node_modules/express/package.json" ]; then
                echo "   ✅ Express.js found"
            else
                echo "   ⚠️  Express.js missing"
            fi
        elif [ "$dir" = "frontend" ]; then
            if [ -f "$dir/node_modules/react/package.json" ]; then
                echo "   ✅ React found"
            else
                echo "   ⚠️  React missing"
            fi
            if [ -f "$dir/node_modules/vite/package.json" ]; then
                echo "   ✅ Vite found"
            else
                echo "   ⚠️  Vite missing"
            fi
        fi
    else
        echo "   ❌ $dir dependencies missing"
        echo "   💡 Run: cd $dir && npm install"
    fi
done

# Check data directory
echo "6. Checking data directory..."
if [ -d "backend/data" ]; then
    echo "   ✅ backend/data/ directory exists"
    
    for file in "flashcards.json" "subjects.json" "progress.json"; do
        filepath="backend/data/$file"
        if [ -f "$filepath" ]; then
            echo "   ✅ $file exists"
            # Validate JSON
            if command_exists node; then
                if node -e "JSON.parse(require('fs').readFileSync('$filepath', 'utf8'))" 2>/dev/null; then
                    echo "   ✅ $file is valid JSON"
                else
                    echo "   ❌ $file is invalid JSON - fixing..."
                    case $file in
                        "flashcards.json"|"subjects.json")
                            echo '[]' > "$filepath"
                            ;;
                        "progress.json")
                            echo '{"totalXP":0,"level":1,"streak":0,"lastActivity":null,"completedSkills":[],"achievements":[]}' > "$filepath"
                            ;;
                    esac
                    echo "   ✅ Fixed $file"
                fi
            fi
        else
            echo "   ❌ $file missing - creating..."
            case $file in
                "flashcards.json"|"subjects.json")
                    echo '[]' > "$filepath"
                    ;;
                "progress.json")
                    echo '{"totalXP":0,"level":1,"streak":0,"lastActivity":null,"completedSkills":[],"achievements":[]}' > "$filepath"
                    ;;
            esac
            echo "   ✅ Created $file"
        fi
    done
else
    echo "   ❌ backend/data/ directory missing - creating..."
    mkdir -p backend/data
    echo '[]' > backend/data/flashcards.json
    echo '[]' > backend/data/subjects.json
    echo '{"totalXP":0,"level":1,"streak":0,"lastActivity":null,"completedSkills":[],"achievements":[]}' > backend/data/progress.json
    echo "   ✅ Created data directory and files"
fi

# Check ports
echo "7. Checking if ports are available..."
if command_exists lsof; then
    if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo "   ⚠️  Port 3001 is already in use (backend port)"
        echo "   💡 Kill with: lsof -ti:3001 | xargs kill"
    else
        echo "   ✅ Port 3001 is available"
    fi

    if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo "   ⚠️  Port 5173 is already in use (frontend port)"
        echo "   💡 Kill with: lsof -ti:5173 | xargs kill"
    else
        echo "   ✅ Port 5173 is available"
    fi
else
    echo "   ⚠️  lsof not available - cannot check ports"
fi

# Check permissions
echo "8. Checking file permissions..."
for script in "start.sh" "install.sh" "test.sh" "troubleshoot.sh"; do
    if [ -f "$script" ]; then
        if [ -x "$script" ]; then
            echo "   ✅ $script is executable"
        else
            echo "   ⚠️  $script is not executable - fixing..."
            chmod +x "$script" 2>/dev/null && echo "   ✅ Fixed $script permissions" || echo "   ❌ Failed to fix $script permissions"
        fi
    fi
done

echo ""
echo "🔧 Common fixes:"
echo ""
echo "📦 Package Installation Issues:"
echo "   • Clean install: npm run clean && ./install.sh"
echo "   • Clear npm cache: npm cache clean --force"
echo "   • Use legacy peer deps: npm install --legacy-peer-deps"
echo "   • Behind firewall: npm config set registry https://registry.npmjs.org/"
echo ""
echo "🚀 Startup Issues:"
echo "   • Kill processes: lsof -ti:3001,5173 | xargs kill"
echo "   • Check Node.js version: node --version (need v18+)"
echo "   • Fix permissions: chmod +x *.sh"
echo ""
echo "🐛 Runtime Issues:"
echo "   • Check backend logs: cd backend && npm start"
echo "   • Check frontend logs: cd frontend && npm run dev"
echo "   • Verify data files: ls -la backend/data/"
echo ""
echo "💡 Still having issues?"
echo "   • Run: ./test.sh (to verify setup)"
echo "   • Check logs when running: ./start.sh"
echo "   • Try manual startup: npm run dev:backend & npm run dev:frontend"