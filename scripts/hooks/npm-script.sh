#!/usr/bin/env bash
# Run one or more root npm scripts for a local pre-commit/pre-push hook.
# Usage: scripts/hooks/npm-script.sh <script> [<script> ...]
#
# A missing toolchain is never a silent pass: it prints
# `SKIPPED: <tool> not installed` and exits 0, and CI (`npm run check`)
# still enforces. Prints the total runtime so slow hooks are visible.
set -uo pipefail

if ! command -v npm >/dev/null 2>&1; then
  echo "SKIPPED: npm not installed (CI npm run check still enforces: $*)"
  exit 0
fi
if [ ! -d node_modules ]; then
  echo "SKIPPED: node_modules not installed; run npm ci (CI npm run check still enforces: $*)"
  exit 0
fi

start=$SECONDS
status=0
for script in "$@"; do
  if ! npm run --silent "$script"; then
    status=1
    echo "FAILED: npm run $script"
    break
  fi
done
echo "npm run $* took $((SECONDS - start))s"
exit "$status"
