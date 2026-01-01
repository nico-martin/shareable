#!/bin/bash
set -e

# Fix permissions on cache directory if it's mounted as a volume
if [ -d "/app/.cache" ]; then
  echo "Setting cache directory permissions..."
  chmod -R 777 /app/.cache 2>/dev/null || echo "Warning: Could not set cache permissions"
  chown -R pptruser:pptruser /app/.cache 2>/dev/null || echo "Warning: Could not change cache ownership"
fi

# If running as root, switch to pptruser
if [ "$(id -u)" = "0" ]; then
  exec su pptruser -c "exec $*"
else
  exec "$@"
fi
