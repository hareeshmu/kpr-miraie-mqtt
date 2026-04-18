#!/usr/bin/env bash
# Sync bridge/miraie_bridge.py → addon-miraie-bridge/miraie_bridge.py.
#
# The HAOS add-on (addon-miraie-bridge/) needs its own copy because Docker
# builds can't reach files outside the addon's build context. To prevent
# the two copies from drifting, this script copies bridge/ → addon/ and
# CI verifies they are byte-identical (.github/workflows/addon-sync-check.yml).
#
# Run this whenever bridge/miraie_bridge.py changes, then commit both files.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="${REPO_ROOT}/bridge/miraie_bridge.py"
DST="${REPO_ROOT}/addon-miraie-bridge/miraie_bridge.py"

if [ ! -f "$SRC" ]; then
    echo "ERROR: source not found: $SRC" >&2
    exit 1
fi

cp "$SRC" "$DST"
echo "synced: $SRC → $DST"