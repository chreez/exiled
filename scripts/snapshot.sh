#!/usr/bin/env bash
set -euo pipefail

# Snapshot running dev server API responses to static JSON files.
# Usage: pnpm snapshot [league]
# Requires: dev server running on localhost:3017

LEAGUE="${1:-mirage}"
SERVER="http://localhost:3017"
OUT_DIR="$(dirname "$0")/../packages/web/static/data"

mkdir -p "$OUT_DIR"

echo "Snapshotting API data for league: $LEAGUE"

# Check server is running
if ! curl -sf "$SERVER/api/health" > /dev/null 2>&1; then
  echo "Error: dev server not running on $SERVER"
  echo "Start it with: pnpm dev"
  exit 1
fi

SNAPSHOT_DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Fetch tattoos
echo "  Fetching tattoos..."
TATTOO_DATA=$(curl -sf "$SERVER/api/tattoos/$LEAGUE")

# Fetch runegrafts
echo "  Fetching runegrafts..."
RUNEGRAFT_DATA=$(curl -sf "$SERVER/api/runegrafts/$LEAGUE")

# Write snapshot with metadata wrapper
cat > "$OUT_DIR/tattoos.json" <<ENDOFFILE
{
  "snapshotDate": "$SNAPSHOT_DATE",
  "league": "$LEAGUE",
  "data": $TATTOO_DATA
}
ENDOFFILE

cat > "$OUT_DIR/runegrafts.json" <<ENDOFFILE
{
  "snapshotDate": "$SNAPSHOT_DATE",
  "league": "$LEAGUE",
  "data": $RUNEGRAFT_DATA
}
ENDOFFILE

echo "Done. Snapshots written to $OUT_DIR/"
echo "  tattoos.json  ($(wc -c < "$OUT_DIR/tattoos.json" | tr -d ' ') bytes)"
echo "  runegrafts.json  ($(wc -c < "$OUT_DIR/runegrafts.json" | tr -d ' ') bytes)"
