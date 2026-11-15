#!/usr/bin/env bash
# Runs the whole app on this computer (local Supabase in Docker + backend + frontend),
# reachable from phones on the same Wi-Fi. No Supabase/Vercel account or real keys needed.
#
#   ./scripts/preview-local.sh          start everything (Ctrl+C stops the apps)
#   ./scripts/preview-local.sh --stop   also stop the local Supabase containers
#
# Requires: Docker Desktop running, Node.js 20+.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
API_PORT="${API_PORT:-3100}"
WEB_PORT="${WEB_PORT:-5180}"
EXCLUDE="studio,imgproxy,storage-api,edge-runtime,logflare,vector,mailpit,postgres-meta,supavisor"

cd "$ROOT"

if [[ "${1:-}" == "--stop" ]]; then
  npx --yes supabase stop
  exit 0
fi

if ! docker info >/dev/null 2>&1; then
  echo "Docker is not running. Open Docker Desktop, wait until it says 'running', and try again."
  exit 1
fi

echo "▶ Starting local Supabase (first run downloads images, can take a few minutes)..."
npx --yes supabase start -x "$EXCLUDE" >/dev/null

# Read local URL + demo keys (these are public, fixed demo values for local use only).
eval "$(npx --yes supabase status -o env 2>/dev/null | grep -E '^(API_URL|ANON_KEY|SERVICE_ROLE_KEY)=')"

DB_CONTAINER="supabase_db_$(sed -n 's/^project_id = "\(.*\)"/\1/p' supabase/config.toml)"
HAS_TABLES="$(docker exec "$DB_CONTAINER" psql -U postgres -d postgres -tAc "select to_regclass('public.people') is not null")"
if [[ "$HAS_TABLES" != "t" ]]; then
  echo "▶ Creating tables from supabase/schema.sql..."
  docker exec -i "$DB_CONTAINER" psql -q -U postgres -d postgres -v ON_ERROR_STOP=1 < supabase/schema.sql
fi

# LAN IP so phones on the same Wi-Fi can open it.
LAN_IP="$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || hostname -I 2>/dev/null | awk '{print $1}' || true)"
HOST="${LAN_IP:-localhost}"
SUPABASE_PORT="${API_URL##*:}"

for dir in backend frontend; do
  [[ -d "$dir/node_modules" ]] || (echo "▶ Installing $dir dependencies..." && cd "$dir" && npm install --silent)
done

pids=()
cleanup() {
  echo; echo "Stopping the apps... (local Supabase keeps running; stop it with: ./scripts/preview-local.sh --stop)"
  kill "${pids[@]}" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

echo "▶ Starting backend on port $API_PORT..."
(
  cd backend
  export PORT="$API_PORT"
  export SUPABASE_URL="$API_URL"
  export SUPABASE_SERVICE_ROLE_KEY="$SERVICE_ROLE_KEY"
  export FRONTEND_ORIGIN="http://localhost:$WEB_PORT,http://$HOST:$WEB_PORT"
  npm run build --silent && exec node dist/src/main.js
) &
pids+=($!)

echo "▶ Starting frontend on port $WEB_PORT..."
(
  cd frontend
  VITE_API_URL="http://$HOST:$API_PORT" \
  VITE_SUPABASE_URL="http://$HOST:$SUPABASE_PORT" \
  VITE_SUPABASE_ANON_KEY="$ANON_KEY" \
  npx vite --host --port "$WEB_PORT" --strictPort --clearScreen false --logLevel warn
) &
pids+=($!)

for _ in $(seq 1 60); do
  curl -s -o /dev/null "http://localhost:$API_PORT/" && break
  sleep 1
done
cat <<EOF

🎄 Ready! Open it:
   • On this computer:           http://$HOST:$WEB_PORT
   • On a phone (same Wi-Fi):    http://$HOST:$WEB_PORT

   Test data lives only on this computer. Press Ctrl+C to stop.
EOF
wait
