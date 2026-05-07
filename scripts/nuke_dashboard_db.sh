#!/bin/bash
# nuke_dashboard_db.sh
# Wipes all ding history from dadcraft_dashboard in preparation for a server reset.
# Usage: ./scripts/nuke_dashboard_db.sh

set -euo pipefail

mysql <<'EOF'
TRUNCATE TABLE dadcraft_dashboard.dings;
TRUNCATE TABLE dadcraft_dashboard.progression_scrapes;
TRUNCATE TABLE dadcraft_dashboard.progression_snapshots;
TRUNCATE TABLE dadcraft_dashboard.progression_snapshot_chars;
EOF

echo "Done. dadcraft_dashboard wiped."
