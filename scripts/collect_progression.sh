#!/bin/bash
# collect_progression.sh
# Snapshots current character population into dadcraft_dashboard progression tables.
# Intended to run via cron every hour:
# 0 * * * * /srv/projects/dadcraft-dashboard/scripts/collect_progression.sh

set -euo pipefail

SCRAPED_AT=$(date +%s)

mysql <<EOF
INSERT INTO dadcraft_dashboard.progression_scrapes (scraped_at)
VALUES ($SCRAPED_AT);

SET @scrape_id = LAST_INSERT_ID();

INSERT INTO dadcraft_dashboard.progression_snapshots (scrape_id, level, race, class, online, count)
SELECT @scrape_id, c.level,
       CASE c.race WHEN 1 THEN 'Human' WHEN 2 THEN 'Orc' WHEN 3 THEN 'Dwarf' WHEN 4 THEN 'Night Elf' WHEN 5 THEN 'Undead' WHEN 6 THEN 'Tauren' WHEN 7 THEN 'Gnome' WHEN 8 THEN 'Troll' ELSE 'Unknown' END,
       CASE c.class WHEN 1 THEN 'Warrior' WHEN 2 THEN 'Paladin' WHEN 3 THEN 'Hunter' WHEN 4 THEN 'Rogue' WHEN 5 THEN 'Priest' WHEN 7 THEN 'Shaman' WHEN 8 THEN 'Mage' WHEN 9 THEN 'Warlock' WHEN 11 THEN 'Druid' ELSE 'Unknown' END,
       c.online, COUNT(*)
FROM v_characters.characters c
JOIN v_realmd.account a ON c.account = a.id
WHERE a.gmlevel = 0
GROUP BY c.level, c.race, c.class, c.online;

INSERT INTO dadcraft_dashboard.progression_snapshot_chars (scrape_id, guid)
SELECT @scrape_id, c.guid
FROM v_characters.characters c
JOIN v_realmd.account a ON c.account = a.id
WHERE a.gmlevel = 0;
EOF

echo "Done. Progression snapshot written."
