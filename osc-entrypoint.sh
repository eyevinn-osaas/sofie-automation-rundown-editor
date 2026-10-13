#!/bin/bash
set -e

# OSC provides $PORT; the app reads it directly.
export PORT="${PORT:-8080}"

# The database lives in /app/data (SQLite). It must be writable, mount the OSC volume there.
mkdir -p /app/data

# Apply CORE_HOST / CORE_PORT to the app's stored settings (see osc-seed-settings.mjs).
NODE_NO_WARNINGS=1 node /usr/local/bin/osc-seed-settings.mjs

exec "$@"
