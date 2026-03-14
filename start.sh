#!/usr/bin/env bash
set -e

echo ""
echo "  site auditor v2.0.0"
echo "  Starting server..."
echo ""

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed. Please install Node.js 18+."
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Resolve port (env var takes precedence, default 3847)
export SITE_AUDITOR_PORT="${SITE_AUDITOR_PORT:-3847}"
echo "  Listening on http://localhost:${SITE_AUDITOR_PORT}"
echo ""

# Start the server
npx tsx src/server.ts
