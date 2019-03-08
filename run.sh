#!/bin/sh
info(){ printf '\n--\n%s\n--\n\n' "$*"; }

info "Starting Databrokerdao Data Gateway..."

npm run build
if [ "$REMOTE_DEBUG_MODE" = "debug" ]; then
  echo "WARNING: REMOTE DEBUG is enabled (not breaking on start)."
  npm run start-debug
elif [ "$REMOTE_DEBUG_MODE" = "break" ]; then
  echo "WARNING: REMOTE DEBUG is enabled, with a break on start."
  npm run start-debug-break
else
  npm run start
fi
