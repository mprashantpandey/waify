#!/usr/bin/env bash
set -euo pipefail

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "[check-source-only] Not inside a git repository" >&2
  exit 1
fi

blocked_paths_regex='^(public/build/|bootstrap/ssr/)'

staged=$(git diff --cached --name-only)
if [ -z "$staged" ]; then
  echo "[check-source-only] No staged files."
  exit 0
fi

violations=$(printf "%s\n" "$staged" | rg "$blocked_paths_regex" || true)
if [ -n "$violations" ]; then
  echo "[check-source-only] Blocked build artifacts detected in staged changes:" >&2
  printf "%s\n" "$violations" >&2
  echo >&2
  echo "Unstage these files before commit:" >&2
  echo "  git restore --staged public/build bootstrap/ssr" >&2
  exit 2
fi

echo "[check-source-only] OK: staged changes are source-only."
