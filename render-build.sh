#!/usr/bin/env bash
set -o errexit

# Clean install to avoid puppeteer-core conflicts
npm ci --only=production

# Remove any puppeteer-core that might have been installed
rm -rf node_modules/puppeteer-core

# Force install puppeteer if not present
if [ ! -d "node_modules/puppeteer" ]; then
    npm install puppeteer@^24.14.0
fi

echo "✅ Build completed successfully"
exit 0
