#!/usr/bin/env bash
set -euo pipefail

ccs_home_dir="${CCS_HOME_DIR:-/home/node/.ccs}"

mkdir -p "$ccs_home_dir"

if [ "$(id -u)" = "0" ]; then
  chown -R node:node "$ccs_home_dir" || true
fi

if [ "$#" -eq 0 ]; then
  echo "[X] No command provided" >&2
  exit 1
fi

if [ "$(id -u)" = "0" ]; then
  cmd="$(printf '%q ' "$@")"
  exec su -s /bin/bash node -c "exec ${cmd}"
fi

exec "$@"

