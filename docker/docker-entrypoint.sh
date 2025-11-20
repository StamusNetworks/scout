#!/bin/sh
set -eu

CONFIG="/usr/share/nginx/html/config.json"

# Example dynamic update
if [ -n "${APP_API_URL:-}" ]; then
  sed -i "s|\"apiUrl\": \".*\"|\"apiUrl\": \"${APP_API_URL}\"|" "$CONFIG"
fi

exec "$@"