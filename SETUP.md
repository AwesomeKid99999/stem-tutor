# STEM Tutor Setup Guide

This guide will help you set up the STEM Tutor application and resolve common package installation issues.

## Quick Setup (Recommended)

1. **Clone and navigate to the project:**
   ```bash
   git clone <repository-url>
   cd stem-tutor
   ```

2. **Run the automated setup:**
   ```bash
   ./install.sh
   ./test.sh
   ./start.sh
   ```

If this works, you're done! If not, continue with the troubleshooting steps below.

## Common Package Installation Issues

### Issue 1: Node.js Version Problems

**Symptoms:**
- "Node.js version too old" error
- npm install fails with version errors

**Solutions:**
```bash
# Check your Node.js version
node --version

# If less than v18, install a newer version:
# Option 1: Download from https://nodejs.org/
# Option 2: Use nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18
```

### Issue 2: npm Registry/Network Issues

**Symptoms:**
- "ENOTFOUND registry.npmjs.org"
- "ETIMEDOUT" errors
- Packages fail to download

**Solutions:**
```bash
# Check internet connectivity
ping registry.npmjs.org

# Clear npm cache
npm cache clean --force

# Try different registry
npm config set registry https://registry.npmjs.org/

# If behind corporate firewall
npm config set proxy http://your-proxy:port
npm config set https-proxy http://your-proxy:port
```

### Issue 3: Permission Errors

**Symptoms:**
- "EACCES" permission denied errors
- Cannot write to directories

**Solutions:**
```bash
# Fix npm permissions (macOS/Linux)
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules

# Or use a Node version manager like nvm (recommended)
```

### Issue 4: Dependency Conflicts

**Symptoms:**
- "peer dependency" warnings/errors
- "conflicting versions" errors

**Solutions:**
```bash
# Use our fix script
./fix-packages.sh

# Or manually with legacy peer deps
cd backend && npm install --legacy-peer-deps
cd ../frontend && npm install --legacy-peer-deps
```

### Issue 5: Disk Space Issues

**Symptoms:**
- "ENOSPC" no space left on device
- Installation stops unexpectedly

**Solutions:**
```bash
# Check disk space
df -h

# Clean npm cache
npm cache clean --force

# Remove old node_modules
npm run clean
```

## Step-by-Step Manual Setup

If the automated scripts don't work, try this manual approach:

### 1. Prerequisites Check
```bash
# Check Node.js (need v18+)
node --version

# Check npm
npm --version

# Check internet
ping registry.npmjs.org
```

### 2. Clean Environment
```bash
# Remove any existing installations
rm -rf backend/node_modules frontend/node_modules
rm -f backend/package-lock.json frontend/package-lock.json

# Clear npm cache
npm cache clean --force
```

### 3. Configure npm
```bash
npm config set fund false
npm config set audit false
npm config set fetch-retries 5
npm config set fetch-retry-factor 2
```

### 4. Install Backend Dependencies
```bash
cd backend

# Try standard installation
npm install

# If that fails, try with legacy peer deps
npm install --legacy-peer-deps

# If still failing, try individual packages
npm install express@^4.18.2
npm install cors@^2.8.5
npm install uuid@^9.0.1

cd ..
```

### 5. Install Frontend Dependencies
```bash
cd frontend

# Try standard installation
npm install

# If that fails, try with legacy peer deps
npm install --legacy-peer-deps

# If still failing, install core packages first
npm install react@^18.3.1 react-dom@^18.3.1
npm install vite@^5.4.19 @vitejs/plugin-react-swc@^3.11.0
npm install typescript@^5.8.3
npm install --legacy-peer-deps

cd ..
```

### 6. Verify Installation
```bash
# Run our test script
./test.sh

# Or manually check
ls backend/node_modules/express
ls frontend/node_modules/react
```

### 7. Start the Application
```bash
# Start backend (in one terminal)
cd backend && npm start

# Start frontend (in another terminal)
cd frontend && npm run dev
```

## Alternative Package Managers

If npm continues to cause issues, try yarn:

```bash
# Install yarn
npm install -g yarn

# Install dependencies
cd backend && yarn install
cd ../frontend && yarn install

# Start with yarn
cd backend && yarn start
cd ../frontend && yarn dev
```

## Platform-Specific Issues

### macOS
```bash
# If you get permission errors
sudo chown -R $(whoami) /usr/local/lib/node_modules

# If using Homebrew Node.js
brew uninstall node
brew install node@18
```

### Windows
```bash
# Run as Administrator if permission issues
# Use PowerShell or Git Bash
# Consider using WSL2 for better compatibility
```

### Linux
```bash
# Update package manager first
sudo apt update  # Ubuntu/Debian
sudo yum update   # CentOS/RHEL

# Install Node.js from NodeSource
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

## Troubleshooting Commands

Use these commands to diagnose issues:

```bash
# Run full diagnostics
./troubleshoot.sh

# Fix package issues specifically
./fix-packages.sh

# Test the setup
./test.sh

# Check logs
cat /tmp/backend_test.log
cat /tmp/frontend_build.log

# Check npm configuration
npm config list

# Check Node.js and npm versions
node --version && npm --version

# Check available disk space
df -h

# Check network connectivity
ping registry.npmjs.org
curl -I https://registry.npmjs.org/
```

## Getting Help

If you're still having issues:

1. **Check the logs** - Look at error messages carefully
2. **Run diagnostics** - Use `./troubleshoot.sh`
3. **Try different approaches** - Use yarn, different Node.js version, etc.
4. **Check your environment** - Firewall, proxy, disk space, permissions
5. **Search for specific errors** - Copy exact error messages to search engines

## Success Indicators

You'll know the setup worked when:

- ✅ `./test.sh` passes all tests
- ✅ Backend starts at http://localhost:3001
- ✅ Frontend starts at http://localhost:5173
- ✅ You can create subjects and flashcards in the UI
- ✅ Data persists between sessions

## Next Steps

Once setup is complete:

1. Visit http://localhost:5173
2. Create your first subject
3. Add some flashcards
4. Explore the learning features

The application is fully offline and stores all data locally in JSON files.