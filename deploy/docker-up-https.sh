#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COMPOSE_FILE="${ROOT_DIR}/docker-compose.https.yml"

if ! command -v docker >/dev/null 2>&1; then
  echo "ERROR: Docker is not installed or not in PATH."
  exit 1
fi

if [[ -z "${DOMAIN:-}" ]]; then
  echo "ERROR: DOMAIN environment variable is required."
  echo "Example:"
  echo "  DOMAIN=example.com ./deploy/docker-up-https.sh"
  exit 1
fi

echo "Starting OptioHire HTTPS stack for domain: ${DOMAIN}"
docker compose -f "${COMPOSE_FILE}" up -d --build

echo
echo "Services status:"
docker compose -f "${COMPOSE_FILE}" ps

echo
echo "Waiting briefly for health checks..."
sleep 8

echo
echo "Health endpoint check:"
if curl -fsS "http://localhost/health" >/dev/null 2>&1; then
  echo "OK: http://localhost/health is responding."
else
  echo "WARN: http://localhost/health did not respond yet."
  echo "Use: docker compose -f ${COMPOSE_FILE} logs -f caddy backend frontend"
fi

echo
echo "Done. Open: https://${DOMAIN}"
echo "If DNS is still propagating, HTTPS certificate issuance may take a few minutes."

