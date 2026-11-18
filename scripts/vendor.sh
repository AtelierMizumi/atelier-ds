#!/usr/bin/env bash
# Copy a fresh build of atelier-ds into a site that has no build step.
# Usage: scripts/vendor.sh <site-dir>     -> <site-dir>/vendor/atelier-ds/
set -euo pipefail

here="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
site="${1:?usage: vendor.sh <site-dir>}"
[[ -d "$site" ]] || { echo "not a directory: $site" >&2; exit 1; }

node "$here/scripts/build.mjs"

dest="$(cd "$site" && pwd)/vendor/atelier-ds"
# only ever replace our own folder
case "$dest" in */vendor/atelier-ds) ;; *) echo "refusing to write $dest" >&2; exit 1 ;; esac
rm -rf -- "$dest"
mkdir -p "$dest"
cp -r "$here/dist/." "$dest/"
rev="$(git -C "$here" rev-parse --short HEAD 2>/dev/null || echo uncommitted)"
printf 'atelier-ds %s (%s)\nCopied by scripts/vendor.sh. Do not edit here; change ~/Projects/Tools/atelier-ds and re-run.\n' \
  "$(cat "$here/dist/VERSION")" "$rev" > "$dest/README.txt"
echo "vendored into $dest"
