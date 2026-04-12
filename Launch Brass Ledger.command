#!/bin/zsh
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT_DIR"

if ! command -v npm >/dev/null 2>&1; then
  echo "npm was not found. Please install Node.js and npm first."
  read -r "?Press enter to close this window."
  exit 1
fi

mkdir -p "${TMPDIR:-/tmp}/brass-ledger"
LOG_FILE="${TMPDIR:-/tmp}/brass-ledger/server.log"

health_ok() {
  local port="$1"
  curl -sf "http://127.0.0.1:${port}/api/health" 2>/dev/null | grep -q '"ok"[[:space:]]*:[[:space:]]*true'
}

candidate_ports() {
  echo 4000 4001 4002 4003 4004 4005 4006 4007 4008 4009 4010
}

find_running_port() {
  local port
  for port in $(candidate_ports); do
    if health_ok "$port"; then
      echo "$port"
      return 0
    fi
  done
  return 1
}

find_free_port() {
  local port
  for port in $(candidate_ports); do
    if ! lsof -nP -iTCP:"$port" -sTCP:LISTEN >/dev/null 2>&1; then
      echo "$port"
      return 0
    fi
  done
  return 1
}

if RUNNING_PORT="$(find_running_port)"; then
  echo "Brass Ledger is already running on http://127.0.0.1:${RUNNING_PORT}/"
  if [[ "${BRASS_LEDGER_NO_OPEN:-0}" != "1" ]]; then
    open "http://127.0.0.1:${RUNNING_PORT}/"
  fi
  exit 0
fi

if ! PORT="$(find_free_port)"; then
  echo "No open launch port was available in the 4000-4010 range."
  read -r "?Press enter to close this window."
  exit 1
fi

echo "Starting Brass Ledger on http://127.0.0.1:${PORT}/"
echo "Logs: ${LOG_FILE}"

cleanup() {
  if [[ -n "${SERVER_PID:-}" ]] && kill -0 "$SERVER_PID" >/dev/null 2>&1; then
    kill "$SERVER_PID" >/dev/null 2>&1 || true
  fi
}

trap cleanup EXIT INT TERM

launch_on_port() {
  local port="$1"

  : > "$LOG_FILE"
  PORT="$port" npm run start >>"$LOG_FILE" 2>&1 &
  SERVER_PID=$!

  for _ in {1..120}; do
    if health_ok "$port"; then
      PORT="$port"
      return 0
    fi

    if ! kill -0 "$SERVER_PID" >/dev/null 2>&1; then
      wait "$SERVER_PID" || true
      SERVER_PID=""
      return 1
    fi

    sleep 1
  done

  cleanup
  SERVER_PID=""
  return 1
}

if ! launch_on_port "$PORT"; then
  for RETRY_PORT in $(candidate_ports); do
    [[ "$RETRY_PORT" == "$PORT" ]] && continue
    if lsof -nP -iTCP:"$RETRY_PORT" -sTCP:LISTEN >/dev/null 2>&1; then
      continue
    fi

    echo "Retrying on http://127.0.0.1:${RETRY_PORT}/"
    if launch_on_port "$RETRY_PORT"; then
      break
    fi
  done
fi

if [[ -z "${SERVER_PID:-}" ]] || ! health_ok "$PORT"; then
  echo "Brass Ledger exited before it became healthy."
  echo
  cat "$LOG_FILE"
  read -r "?Press enter to close this window."
  exit 1
fi

echo "Brass Ledger is live."
if [[ "${BRASS_LEDGER_NO_OPEN:-0}" != "1" ]]; then
  open "http://127.0.0.1:${PORT}/"
fi
echo
echo "Press Ctrl+C in this window to stop the server."
wait "$SERVER_PID"
