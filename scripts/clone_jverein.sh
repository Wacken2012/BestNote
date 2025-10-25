#!/usr/bin/env bash
set -euo pipefail

# Helper to clone jVerein upstream into vendor/jverein
# Usage: ./scripts/clone_jverein.sh [REMOTE] [BRANCH] [--flags]
# Examples:
#   ./scripts/clone_jverein.sh
#   ./scripts/clone_jverein.sh https://github.com/yourname/jverein.git main
#   ./scripts/clone_jverein.sh --dry-run
# Flags:
#   --force    : remove existing target dir before cloning (destructive)
#   --update   : if target exists, run 'git fetch' and 'git reset --hard' to update
#   --merge    : clone into a temporary dir and copy only missing files into target (skip overwrites)
#   --dry-run  : show what would be done but don't perform network or filesystem changes
#   --help     : show this help and exit

REMOTE_DEFAULT="https://github.com/openjverein/jverein.git"
BRANCH_DEFAULT="main"
TARGET_DIR="$(cd "$(dirname "$0")/.." && pwd)/vendor/jverein"

# flags
FORCE=0
UPDATE=0
MERGE=0
DRY_RUN=0
CLEANUP=0

usage() {
  sed -n '1,200p' "$0" | sed -n '1,120p'
}

# try to clone a branch first; if that fails, retry without specifying a branch
clone_try() {
  local dest="$1"
  echo "Attempting to clone branch '$BRANCH' from $REMOTE into $dest"
  if git clone --depth 1 --branch "$BRANCH" "$REMOTE" "$dest"; then
    return 0
  else
    echo "Warning: branch '$BRANCH' not found or clone failed; retrying without explicit branch (using repository default)"
    git clone --depth 1 "$REMOTE" "$dest"
  fi
}

while [ "$#" -gt 0 ]; do
  case "$1" in
    --force)
      FORCE=1; shift ;;
    --update)
      UPDATE=1; shift ;;
    --dry-run)
      DRY_RUN=1; shift ;;
    --merge)
      MERGE=1; shift ;;
    --cleanup)
      CLEANUP=1; shift ;;
    --help|-h)
      usage; exit 0 ;;
    --) shift; break ;;
    -*) echo "Unknown option: $1"; usage; exit 2 ;;
    *)
      # first non-flag is remote, second is branch
      if [ -z "${REMOTE+x}" ] || [ "$REMOTE" = "" ] ; then
        REMOTE="$1"
      elif [ -z "${BRANCH+x}" ] || [ "$BRANCH" = "" ]; then
        BRANCH="$1"
      else
        echo "Ignoring extra argument: $1"
      fi
      shift ;;
  esac
done

REMOTE=${REMOTE:-$REMOTE_DEFAULT}
BRANCH=${BRANCH:-$BRANCH_DEFAULT}

echo "Target directory: $TARGET_DIR"

if [ "$DRY_RUN" -eq 1 ]; then
  echo "DRY RUN: would clone $REMOTE (branch $BRANCH) into $TARGET_DIR"
  if [ -d "$TARGET_DIR" ] && [ "$(ls -A "$TARGET_DIR")" ]; then
    echo "DRY RUN: target exists and is not empty"
    if [ "$FORCE" -eq 1 ]; then
      echo "DRY RUN: would remove existing directory before cloning (--force)"
    elif [ "$UPDATE" -eq 1 ]; then
      echo "DRY RUN: would attempt to update existing repository (--update)"
    elif [ "$MERGE" -eq 1 ]; then
      echo "DRY RUN: would attempt to merge missing files from a fresh clone into the existing directory (--merge)"
    else
      echo "DRY RUN: would abort to avoid overwriting (target exists). Use --force, --update or --merge to change this behavior."
    fi
  else
    echo "DRY RUN: target does not exist or is empty; would proceed to clone"
  fi
  if [ "$CLEANUP" -eq 1 ]; then
    echo "DRY RUN: would run scripts/cleanup_vendor.sh on the target after clone (--cleanup)"
  fi
  exit 0
fi

if [ -d "$TARGET_DIR" ] && [ "$(ls -A "$TARGET_DIR")" ]; then
  if [ "$FORCE" -eq 1 ]; then
    echo "--force specified: removing existing $TARGET_DIR"
    rm -rf "$TARGET_DIR"
    mkdir -p "$TARGET_DIR"
  elif [ "$UPDATE" -eq 1 ]; then
    if [ -d "$TARGET_DIR/.git" ]; then
      echo "--update specified: fetching and resetting $TARGET_DIR"
      git -C "$TARGET_DIR" fetch --all --prune
      git -C "$TARGET_DIR" reset --hard "origin/$BRANCH" || true
      echo "Update complete."
      echo "You may want to remove CI or demo files to reduce vendor size."
      exit 0
    else
      echo "--update specified but $TARGET_DIR is not a git repo. Aborting."
      exit 1
    fi
  elif [ "$MERGE" -eq 1 ]; then
    echo "--merge specified: will clone into a temporary directory and copy only missing files into $TARGET_DIR"
    TMP_DIR="$(mktemp -d -t jverein-clone-XXXX)"
  echo "Cloning into temporary dir: $TMP_DIR"
  clone_try "$TMP_DIR"
    echo "Clone complete. Now copying missing files into $TARGET_DIR"
    # prefer rsync if available
    if command -v rsync >/dev/null 2>&1; then
      echo "Using rsync --ignore-existing to copy files"
      rsync -a --ignore-existing --exclude='.git' "$TMP_DIR/" "$TARGET_DIR/"
    else
      echo "rsync not available; using cp -rn fallback (copy without overwriting)"
      cp -r -n "$TMP_DIR/"* "$TARGET_DIR/" || true
    fi
    echo "Merge complete. Removing temporary dir"
    rm -rf "$TMP_DIR"
    if [ "$CLEANUP" -eq 1 ]; then
      REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
      REL_TARGET="${TARGET_DIR#$REPO_ROOT/}"
      echo "Running cleanup on $REL_TARGET"
      "$(cd "$(dirname "$0")" && pwd)/cleanup_vendor.sh" "$REL_TARGET"
    fi
    echo "You may want to remove CI or demo files to reduce vendor size."
    exit 0
  else
    echo "Target $TARGET_DIR already exists and is not empty. Aborting to avoid overwriting."
    echo "Use --force to remove it, --update to update an existing checkout, or --merge to copy missing files into the directory."
    exit 1
  fi
fi

mkdir -p "$TARGET_DIR"

echo "Cloning $REMOTE (branch $BRANCH) into $TARGET_DIR"

clone_try "$TARGET_DIR"

echo "Clone complete. You may want to remove CI or demo files to reduce vendor size."

echo "Optional: remove CI and demo files"
# Example cleanup (commented out by default):
# rm -rf "$TARGET_DIR/.github" "$TARGET_DIR/demo" "$TARGET_DIR/tests"

echo "If you made local modifications, document them in $TARGET_DIR/README.md and include a LICENSE file."
