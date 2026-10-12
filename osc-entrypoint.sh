#!/bin/bash
set -e

# OSC provides $PORT; the app reads it directly.
export PORT="${PORT:-8080}"

# The database lives in /app/data (SQLite). It must be writable, mount the OSC volume there.
mkdir -p /app/data

exec "$@"
