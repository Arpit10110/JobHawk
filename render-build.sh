#!/usr/bin/env bash
set -o errexit

# Only install dependencies - postinstall will handle Chrome
npm install

echo "Build completed successfully"
