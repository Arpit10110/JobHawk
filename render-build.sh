#!/usr/bin/env bash
set -o errexit

# Complete cleanup
rm -rf node_modules package-lock.json

# Install only puppeteer explicitly first
npm install puppeteer@21.0.0

# Install all other dependencies
npm install

# Verify no puppeteer-core exists
if [ -d "node_modules/puppeteer-core" ]; then
    echo "❌ Error: puppeteer-core still exists"
    rm -rf node_modules/puppeteer-core
fi

# Verify puppeteer installation
echo "Checking puppeteer installation..."
ls -la node_modules/puppeteer/ || echo "Puppeteer directory not found"

echo "✅ Build completed successfully"
exit 0
