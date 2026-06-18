#!/bin/bash
# collect_dings.sh
# Detects character level-ups for every character (not just the frontier)
# and writes ding events to dadcraft_dashboard.dings. character_level_cursor
# tracks each character's last-known level so only genuine level-ups attempt
# a write; the cursor itself stays population-sized regardless of how much
# ding history accumulates.
# Intended to run via cron every minute:
# * * * * * /srv/projects/dadcraft-dashboard/scripts/collect_dings.sh

set -euo pipefail

mysql <<'EOF'
INSERT IGNORE INTO dadcraft_dashboard.dings (guid, level, dinged_at)
SELECT c.guid, c.level, UNIX_TIMESTAMP()
FROM v_characters.characters c
JOIN v_realmd.account a ON c.account = a.id
LEFT JOIN dadcraft_dashboard.character_level_cursor cur ON cur.guid = c.guid
WHERE a.gmlevel = 0
  AND (cur.guid IS NULL OR c.level > cur.last_level);

INSERT INTO dadcraft_dashboard.character_level_cursor (guid, last_level)
SELECT c.guid, c.level
FROM v_characters.characters c
JOIN v_realmd.account a ON c.account = a.id
WHERE a.gmlevel = 0
ON DUPLICATE KEY UPDATE last_level = VALUES(last_level);
EOF
