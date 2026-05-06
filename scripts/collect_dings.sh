#!/bin/bash
# collect_dings.sh
# Detects frontier character level-ups and writes ding events to dadcraft_dashboard.dings
# Intended to run via cron every minute:
# * * * * * /srv/projects/dadcraft-dashboard/scripts/collect_dings.sh

set -euo pipefail

mysql <<'EOF'
INSERT IGNORE INTO dadcraft_dashboard.dings (guid, level, dinged_at)
SELECT c.guid, c.level, UNIX_TIMESTAMP()
FROM v_characters.characters c
JOIN v_realmd.account a ON c.account = a.id
WHERE a.gmlevel = 0
  AND c.level >= (
    SELECT MAX(c2.level)
    FROM v_characters.characters c2
    JOIN v_realmd.account a2 ON c2.account = a2.id
    WHERE a2.gmlevel = 0
  ) - 1;
EOF
