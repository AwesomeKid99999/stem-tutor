#!/bin/bash

echo "🔧 Installing STEM Tutor Dependencies..."

# Function to check command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to get Node.js major version
get_node_version() {
    node -v | sed 's/v//' | cut -d'.' -f1
}

# Check if Node.js is installed
if ! command_exists node; then
    echo "❌ Node.js is not installed."
    echo "Please install Node.js (version 18 or higher) from https://nodejs.org/"
    echo ""
    echo "Installation options:"
    echo "  • macOS: brew install node"
    echo "  • Ubuntu/Debian: sudo apt install nodejs npm"
    echo "  • Windows: Download from https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(get_node_version)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version v$NODE_VERSION is too old."
    echo "Please install Node.js version 18 or higher from https://nodejs.org/"
    echo "Current version: $(node -v)"
    echo "Required version: v18.0.0 or higher"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Check if npm is installed
if ! command_exists npm; then
    echo "❌ npm is not installed. Please install npm."
    echo "npm usually comes with Node.js. Try reinstalling Node.js."
    exit 1
fi

echo "✅ npm $(npm -v) detected"

# Check if Python is installed
if ! command_exists python3; then
    echo "❌ Python 3 is not installed."
    echo "Please install Python 3 from https://python.org/"
    exit 1
fi

echo "✅ Python $(python3 --version) detected"

# Set npm configuration for better reliability
echo "🔧 Configuring npm for optimal installation..."
npm config set fund false
npm config set audit false
npm config set progress true

# Clean any existing installations
echo "🧹 Cleaning existing installations..."
rm -rf backend/node_modules frontend/node_modules
rm -f backend/package-lock.json frontend/package-lock.json package-lock.json
rm -rf ~/.npm/_cacache 2>/dev/null || true

# Clear npm cache
echo "🧹 Clearing npm cache..."
npm cache clean --force 2>/dev/null || true

# Install backend dependencies
echo ""
echo "📦 Installing backend dependencies..."
cd backend

# Try multiple installation strategies
if npm install --no-optional --no-fund --no-audit; then
    echo "✅ Backend dependencies installed successfully"
elif npm install --legacy-peer-deps --no-optional; then
    echo "✅ Backend dependencies installed with legacy peer deps"
elif npm install --force; then
    echo "⚠️  Backend dependencies installed with force flag"
else
    echo "❌ Failed to install backend dependencies"
    echo ""
    echo "Troubleshooting steps:"
    echo "1. Check your internet connection"
    echo "2. Try: npm cache clean --force"
    echo "3. Try: rm -rf node_modules package-lock.json && npm install"
    echo "4. Check if you're behind a corporate firewall"
    exit 1
fi

cd ..

# Install Python dependencies
echo ""
echo "🐍 Installing Python dependencies..."
pip3 install fastapi uvicorn pydantic httpx python-multipart

cd ..

# Install frontend dependencies
echo ""
echo "📦 Installing frontend dependencies..."
cd frontend

# Frontend has more complex dependencies, handle specific issues
echo "Installing React first to establish proper dependency tree..."
if npm install react@^18.3.1 react-dom@^18.3.1 --no-optional; then
    echo "✅ React installed successfully"
else
    echo "⚠️  React installation had issues, continuing..."
fi

echo "Installing core build tools..."
npm install vite@^5.4.19 @vitejs/plugin-react-swc@^3.11.0 typescript@^5.8.3 --no-optional

echo "Installing remaining dependencies with legacy peer deps..."
if npm install --legacy-peer-deps --no-optional; then
    echo "✅ Frontend dependencies installed successfully"
elif npm install --legacy-peer-deps --force; then
    echo "⚠️  Frontend dependencies installed with force flag"
else
    echo "❌ Failed to install frontend dependencies"
    echo ""
    echo "This might be due to npm cache permission issues."
    echo "Try running: ./fix-permissions.sh"
    echo ""
    echo "Or try these manual steps:"
    echo "1. sudo chown -R $(whoami) ~/.npm"
    echo "2. npm cache clean --force"
    echo "3. cd frontend && npm install --legacy-peer-deps"
    exit 1
fi

cd ..

# Verify installations
echo ""
echo "🔍 Verifying installations..."

# Check backend
if [ -d "backend/node_modules" ] && [ -f "backend/node_modules/express/package.json" ]; then
    echo "✅ Backend dependencies verified"
else
    echo "⚠️  Backend dependencies may be incomplete"
fi

# Check frontend
if [ -d "frontend/node_modules" ] && [ -f "frontend/node_modules/react/package.json" ]; then
    echo "✅ Frontend dependencies verified"
else
    echo "⚠️  Frontend dependencies may be incomplete"
fi

# Make scripts executable
echo "🔧 Making scripts executable..."
chmod +x start.sh troubleshoot.sh test.sh 2>/dev/null || true

# Create data directory if it doesn't exist
if [ ! -d "backend/data" ]; then
    echo "📁 Creating data directory..."
    mkdir -p backend/data
    echo '[]' > backend/data/flashcards.json
    echo '[]' > backend/data/subjects.json
    # Copy sample courses (Islam course with 3 modules)
    if [ -f "frontend/public/sample-courses.json" ]; then
        cp frontend/public/sample-courses.json backend/data/courses.json
        echo "✅ Sample Islam course with 3 modules installed"
    else
        echo '[]' > backend/data/courses.json
    fi
    # Create boss challenges file if it doesn't exist
    if [ ! -f "backend/data/boss-challenges.json" ]; then
        echo '[]' > backend/data/boss-challenges.json
        echo "✅ Boss challenges file created"
    fi
    echo '{"totalXP":0,"level":1,"streak":0,"lastActivity":null,"completedSkills":[],"achievements":[]}' > backend/data/progress.json
fi

echo ""
echo "🎉 Installation completed successfully!"
echo ""
echo "Next steps:"
echo "  1. Test the setup: ./test.sh"
echo "  2. Start the application: ./start.sh"
echo ""
echo "Manual startup:"
echo "  • Backend:  cd backend && npm start"
echo "  • Frontend: cd frontend && npm run dev"
echo ""
echo "The application will be available at:"
echo "  • Frontend: http://localhost:5173"
echo "  • Backend:  http://localhost:3001"
echo ""
echo "If you encounter issues, run: ./troubleshoot.sh"