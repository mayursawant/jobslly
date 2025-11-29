#!/bin/bash
set -e

cd /app/frontend

# Check if build directory exists, if not create it
if [ ! -d "build" ] || [ ! -f "build/index.html" ]; then
    echo "Build directory not found or incomplete. Running yarn build..."
    yarn build
fi

# Start the server
exec node server.js
