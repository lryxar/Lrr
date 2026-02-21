#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${1:-http://127.0.0.1:8000}"
USERNAME="test_user_$(date +%s)"
PASSWORD="test_pass"

json() {
  python - <<'PY'
import json,sys
print(json.dumps(json.load(sys.stdin), ensure_ascii=False, indent=2))
PY
}

echo "[1/5] Health check => ${BASE_URL}/api/health"
HEALTH=$(curl -sS "${BASE_URL}/api/health")
echo "$HEALTH" | json

echo "[2/5] Register test account"
REGISTER_PAYLOAD=$(printf '{"username":"%s","password":"%s"}' "$USERNAME" "$PASSWORD")
REGISTER=$(curl -sS -X POST "${BASE_URL}/auth/register" -H 'Content-Type: application/json' -d "$REGISTER_PAYLOAD")
echo "$REGISTER" | json
USER_ID=$(echo "$REGISTER" | python -c 'import sys,json; print(json.load(sys.stdin).get("user_id",""))')
if [[ -z "$USER_ID" ]]; then
  echo "Could not get user_id from register response" >&2
  exit 1
fi

echo "[3/5] Login with created account"
LOGIN=$(curl -sS -X POST "${BASE_URL}/auth/login" -H 'Content-Type: application/json' -d "$REGISTER_PAYLOAD")
echo "$LOGIN" | json

echo "[4/5] Create a sample bot"
BOT_PAYLOAD=$(cat <<JSON
{"owner_id":${USER_ID},"name":"hello-bot","source_code":"print('hello from smoke test')"}
JSON
)
BOT=$(curl -sS -X POST "${BASE_URL}/bots/" -H 'Content-Type: application/json' -d "$BOT_PAYLOAD")
echo "$BOT" | json

echo "[5/5] Done ✅ basic API flow is working"
