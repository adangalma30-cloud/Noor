#!/usr/bin/env bash
# Compiles the real Smart Tasbeeh logic (src/lib/tasbeeh.ts) and runs
# scripts/tasbeeh.test.cjs against it. Pure logic — no device needed.
set -euo pipefail
cd "$(dirname "$0")/.."

OUT=.smoke-tasbeeh
rm -rf "$OUT"
mkdir -p "$OUT"

npx tsc src/lib/tasbeeh.ts src/types.ts \
  --outDir "$OUT" --module commonjs --target es2020 --esModuleInterop --skipLibCheck --ignoreConfig

node scripts/tasbeeh.test.cjs
