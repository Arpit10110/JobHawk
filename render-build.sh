#!/usr/bin/env bash
set -o errexit

# Install dependencies
npm install

# Install Chrome explicitly for Puppeteer
npx puppeteer browsers install chrome

# Set up cache directory
export PUPPETEER_CACHE_DIR=/opt/render/.cache/puppeteer
mkdir -p $PUPPETEER_CACHE_DIR

echo "Chrome installation completed"
