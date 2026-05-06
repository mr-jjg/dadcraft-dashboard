#!/bin/bash
# Usage: ./scripts/nuke_wow_metrics.sh [prometheus_url]
# Deletes all wow_character_level series from Prometheus TSDB.
# Run this before deploying any change that removes or renames a label on that metric.

set -euo pipefail

PROMETHEUS_URL="${1:-http://localhost:9090}"

echo "Deleting series: {__name__=\"wow_character_level\"} from ${PROMETHEUS_URL}"

curl -s -f -X POST \
  "${PROMETHEUS_URL}/api/v1/admin/tsdb/delete_series" \
  --data-urlencode 'match[]={__name__="wow_character_level"}' \
  || { echo "DELETE failed"; exit 1; }

echo ""
echo "Triggering clean_tombstones..."

curl -s -f -X POST \
  "${PROMETHEUS_URL}/api/v1/admin/tsdb/clean_tombstones" \
  || { echo "clean_tombstones failed"; exit 1; }

echo ""
echo "Done. Orphaned wow_character_level series removed."
