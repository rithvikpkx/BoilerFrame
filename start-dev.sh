#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"

function err { echo "ERROR: $1" 1>&2; exit 1; }

command -v docker >/dev/null 2>&1 || err "docker not installed. Install Docker Desktop (https://www.docker.com/get-started)."
command -v docker-compose >/dev/null 2>&1 || command -v docker >/dev/null 2>&1 || err "docker-compose not available. Use Docker Compose v2 (docker compose) or install docker-compose."

echo "Using repo root: $ROOT_DIR"

# Load env from .env if present
if [ -f "$ROOT_DIR/.env" ]; then
  echo "Loading environment from .env"
  # shellcheck disable=SC1090
  set -a
  # shellcheck disable=SC1090
  . "$ROOT_DIR/.env"
  set +a
else
  echo ".env not found in repo root. If you have AWS credentials exported in your shell, that's fine; otherwise copy .env.example to .env and fill values."
fi

if [ -z "${AWS_ACCESS_KEY_ID:-}" ] || [ -z "${AWS_SECRET_ACCESS_KEY:-}" ] || [ -z "${S3_BUCKET:-}" ]; then
  echo "Warning: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY or S3_BUCKET not set." 
  echo "If you want to skip AWS resource creation and test only local flows, export these or edit .env."
fi

echo "Bringing up docker-compose (builds images). This may take a few minutes on first run."
docker-compose up --build
