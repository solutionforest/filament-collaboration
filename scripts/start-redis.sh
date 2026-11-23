#!/usr/bin/env bash
# Starts a Redis server for the tests, installing it first if the runner has none.
# Its data stays in /tmp, never in the working copy.
set -euo pipefail

if redis-cli ping >/dev/null 2>&1; then
    exit 0
fi

if ! command -v redis-server >/dev/null; then
    if [ "$(id -u)" = 0 ]; then apt-get update -qq && apt-get install -y -qq redis-server; else sudo apt-get update -qq && sudo apt-get install -y -qq redis-server; fi
fi

redis-server --daemonize yes --dir /tmp --save '' --appendonly no

for _ in $(seq 1 50); do
    redis-cli ping >/dev/null 2>&1 && exit 0
    sleep 0.1
done

echo "Redis did not start." >&2
exit 1
