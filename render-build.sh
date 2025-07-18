#!/usr/bin/env bash
set -o errexit

# Install dependencies
npm install

# Create the Puppeteer cache directory structure
PUPPETEER_CACHE_DIR=/opt/render/.cache/puppeteer
mkdir -p $PUPPETEER_CACHE_DIR

# Create the target directory structure
mkdir -p /opt/render/project/src/.cache/puppeteer/chrome

# Only copy if source directory exists
if [ -d "$PUPPETEER_CACHE_DIR" ]; then
    echo "Copying Puppeteer cache..."
    cp -R $PUPPETEER_CACHE_DIR/* /opt/render/project/src/.cache/puppeteer/ || true
else
    echo "Puppeteer cache directory not found, skipping copy"
fi
