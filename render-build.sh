#!/usr/bin/env bash
set -o errexit

# Remove any existing node_modules and package-lock
rm -rf node_modules package-lock.json

# Clean install of dependencies
npm install

# Verify puppeteer installation
echo "Checking puppeteer installation..."
npm list puppeteer || echo "Puppeteer not found in npm list"

# Explicit completion
echo "✅ Build completed successfully"
exit 0
