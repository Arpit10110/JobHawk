#!/usr/bin/env bash
set -o errexit

# Install dependencies without postinstall
npm install

# Install Chrome explicitly
npx puppeteer browsers install chrome

echo "Build completed successfully"
