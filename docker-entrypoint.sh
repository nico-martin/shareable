#!/bin/sh
set -e

echo "Entrypoint: Starting as $(whoami) (UID: $(id -u))"

# Fix permissions on cache directory if it's mounted as a volume
if [ -d "/app/.cache" ]; then
  echo "Entrypoint: Fixing cache directory permissions..."
  chmod -R 777 /app/.cache || echo "Warning: Could not set cache permissions"
  chown -R pptruser:pptruser /app/.cache || echo "Warning: Could not change cache ownership"
  ls -la /app/.cache
fi

# If running as root, switch to pptruser
if [ "$(id -u)" = "0" ]; then
  echo "Entrypoint: Switching to pptruser..."
  exec su-exec pptruser "$@"
else
  echo "Entrypoint: Already running as non-root, executing command..."
  exec "$@"
fi
