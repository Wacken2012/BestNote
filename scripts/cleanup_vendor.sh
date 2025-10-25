#!/usr/bin/env bash
set -euo pipefail

# cleanup_vendor.sh
# Remove common large/demo/CI folders from a vendor checkout to reduce size.
# Usage: scripts/cleanup_vendor.sh <target-dir> [--dry-run] [--yes]

TARGET=${1:-vendor/jverein}
DRY_RUN=0
YES=0

shift 1 || true
while [ "$#" -gt 0 ]; do
  case "$1" in
    --dry-run) DRY_RUN=1; shift ;;
    --yes) YES=1; shift ;;
    *) echo "Unknown option: $1"; exit 2 ;;
  esac
done

ABS_TARGET="$(cd "$(dirname "$0")/.." && pwd)/$TARGET"
if [ ! -d "$ABS_TARGET" ]; then
  echo "Target $ABS_TARGET does not exist"; exit 1
fi

WHITELIST=(
  ".git"
  "src"
  "lib"
  "LICENSE"
  "README.md"
)

DEFAULT_REMOVE=(
  ".github"
  "demo"
  "tests"
  "build"
  "dist"
  "node_modules"
)

echo "Target: $ABS_TARGET"
echo "Planned removals: ${DEFAULT_REMOVE[*]}"

if [ "$DRY_RUN" -eq 1 ]; then
  echo "DRY RUN: listing files that would be removed"
  for p in "${DEFAULT_REMOVE[@]}"; do
    if [ -e "$ABS_TARGET/$p" ]; then
      echo "  would remove: $ABS_TARGET/$p"
    fi
  done
  exit 0
fi

if [ "$YES" -ne 1 ]; then
  read -p "Proceed to remove the listed folders from $ABS_TARGET? [y/N] " ans
  case "$ans" in
    y|Y) ;;
    *) echo "Aborted."; exit 1 ;;
  esac
fi

for p in "${DEFAULT_REMOVE[@]}"; do
  if [ -e "$ABS_TARGET/$p" ]; then
    echo "Removing $ABS_TARGET/$p"
    rm -rf "$ABS_TARGET/$p"
  fi
done

echo "Cleanup complete."
