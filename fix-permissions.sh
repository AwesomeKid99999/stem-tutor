#!/bin/bash

# Fix npm permissions script
echo "🔧 Fixing npm permissions..."

# The error message specifically mentions this command
echo "Running the recommended fix from npm error message..."
sudo chown -R 502:20 "/Users/vasanth/.npm"

if [ $? -eq 0 ]; then
    echo "✅ npm permissions fixed"
else
    echo "⚠️  Permission fix failed, trying alternative..."
    
    # Alternative approach - fix for current user
    sudo chown -R $(whoami) ~/.npm
    
    if [ $? -eq 0 ]; then
        echo "✅ npm permissions fixed with alternative method"
    else
        echo "❌ Could not fix permissions"
        echo "💡 You may need to run this manually:"
        echo "   sudo chown -R $(whoami) ~/.npm"
        echo "   sudo chown -R $(whoami) /usr/local/lib/node_modules"
    fi
fi

# Clear the problematic cache
echo "🧹 Clearing npm cache..."
npm cache clean --force

echo "✅ Permission fix completed. Try running ./install.sh again."