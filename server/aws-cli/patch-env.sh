#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -lt 3 ]; then
  echo "Usage: $0 AWS_ACCESS_KEY AWS_SECRET_KEY S3_BUCKET [REGION]"
  exit 1
fi

ACCESS_KEY="$1"
SECRET_KEY="$2"
S3_BUCKET="$3"
REGION="${4:-us-east-1}"

ENV_FILE="$(dirname "$0")/../.env"

echo "Backing up existing $ENV_FILE to ${ENV_FILE}.bak"
cp "$ENV_FILE" "${ENV_FILE}.bak" 2>/dev/null || true

cat > "$ENV_FILE" <<EOF
PORT=4000
MONGODB_URI=mongodb://mongo:27017/boilerframe
AWS_REGION=${REGION}
AWS_ACCESS_KEY_ID=${ACCESS_KEY}
AWS_SECRET_ACCESS_KEY=${SECRET_KEY}
S3_BUCKET=${S3_BUCKET}
S3_PREFIX=boilerframe
WORKER_POLL_INTERVAL_MS=5000
EOF

echo "Wrote $ENV_FILE"
