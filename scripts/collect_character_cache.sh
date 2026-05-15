#!/bin/bash
# collect_character_cache.sh
# Populates and maintains dadcraft_dashboard.character_cache with current
# non-GM character data. Uses a temp table and MD5 hash comparison to
# only write rows that have actually changed.
#
# Honor is handled separately from core character data:
#   - Lifetime kills/honor: incremental, via honor_sync tracking table
#   - Weekly kills/honor: recalculated fresh each run from saved_variables window
#
# Intended to run via cron every 5-10 minutes:
# */10 * * * * /srv/projects/dadcraft-dashboard/scripts/collect_character_cache.sh

set -euo pipefail

UPDATED_AT=$(date +%s)

mysql <<EOF

USE dadcraft_dashboard;

-- -----------------------------------------------------------------------
-- Step 1: Build temp table from live source (honor excluded from hash)
-- -----------------------------------------------------------------------
CREATE TEMPORARY TABLE tmp_character_cache AS
SELECT
    c.guid,
    c.name,

    -- decoded enums
    CASE c.race
        WHEN 1 THEN 'Human'
        WHEN 2 THEN 'Orc'
        WHEN 3 THEN 'Dwarf'
        WHEN 4 THEN 'Night Elf'
        WHEN 5 THEN 'Undead'
        WHEN 6 THEN 'Tauren'
        WHEN 7 THEN 'Gnome'
        WHEN 8 THEN 'Troll'
        ELSE 'Unknown'
    END AS race,

    CASE c.class
        WHEN 1  THEN 'Warrior'
        WHEN 2  THEN 'Paladin'
        WHEN 3  THEN 'Hunter'
        WHEN 4  THEN 'Rogue'
        WHEN 5  THEN 'Priest'
        WHEN 7  THEN 'Shaman'
        WHEN 8  THEN 'Mage'
        WHEN 9  THEN 'Warlock'
        WHEN 11 THEN 'Druid'
        ELSE 'Unknown'
    END AS class,

    CASE c.gender
        WHEN 0 THEN 'Male'
        WHEN 1 THEN 'Female'
        ELSE 'Unknown'
    END AS gender,

    -- progression
    c.level,
    c.xp,
    c.totaltime,
    c.leveltime,

    -- economy
    c.money,

    -- location
    c.zone,

    -- status
    c.online,
    IF(cbd.guid IS NOT NULL, 1, 0) AS in_battleground,

    -- guild
    COALESCE(g.name, 'None') AS guild,
    IF(g.leaderguid = c.guid, 1, 0) AS is_guild_leader,

    -- hash of core cached values only (honor excluded - updated separately)
    MD5(CONCAT(
        c.name,                            ',',
        c.race,                            ',',
        c.class,                           ',',
        c.gender,                          ',',
        c.level,                           ',',
        c.xp,                              ',',
        c.totaltime,                       ',',
        c.leveltime,                       ',',
        c.money,                           ',',
        c.zone,                            ',',
        c.online,                          ',',
        IF(cbd.guid IS NOT NULL, 1, 0),    ',',
        COALESCE(g.name, 'None'),          ',',
        IF(g.leaderguid = c.guid, 1, 0)
    )) AS cache_hash

FROM v_characters.characters c
JOIN v_realmd.account a
    ON c.account = a.id
    AND a.gmlevel = 0
LEFT JOIN v_characters.guild_member gm
    ON c.guid = gm.guid
LEFT JOIN v_characters.guild g
    ON gm.guildid = g.guildid
LEFT JOIN v_characters.character_battleground_data cbd
    ON c.guid = cbd.guid
WHERE c.deleteDate IS NULL;

-- -----------------------------------------------------------------------
-- Step 2: Upsert core character data for new or changed rows only.
--         Honor columns are intentionally excluded from ON DUPLICATE KEY
--         UPDATE so existing lifetime values are never overwritten here.
-- -----------------------------------------------------------------------
INSERT INTO dadcraft_dashboard.character_cache (
    guid, name, race, class, gender,
    level, xp, totaltime, leveltime,
    money, zone, online, in_battleground,
    guild, is_guild_leader,
    lifetime_honorable_kills, lifetime_honor,
    week_honorable_kills, week_honor,
    cache_hash, updated_at
)
SELECT
    t.guid, t.name, t.race, t.class, t.gender,
    t.level, t.xp, t.totaltime, t.leveltime,
    t.money, t.zone, t.online, t.in_battleground,
    t.guild, t.is_guild_leader,
    0, 0,   -- honor defaults for new characters; existing rows untouched
    0, 0,
    t.cache_hash, $UPDATED_AT
FROM tmp_character_cache t
LEFT JOIN dadcraft_dashboard.character_cache cc
    ON t.guid = cc.guid
WHERE cc.guid IS NULL
   OR t.cache_hash != cc.cache_hash
ON DUPLICATE KEY UPDATE
    name             = VALUES(name),
    race             = VALUES(race),
    class            = VALUES(class),
    gender           = VALUES(gender),
    level            = VALUES(level),
    xp               = VALUES(xp),
    totaltime        = VALUES(totaltime),
    leveltime        = VALUES(leveltime),
    money            = VALUES(money),
    zone             = VALUES(zone),
    online           = VALUES(online),
    in_battleground  = VALUES(in_battleground),
    guild            = VALUES(guild),
    is_guild_leader  = VALUES(is_guild_leader),
    cache_hash       = VALUES(cache_hash),
    updated_at       = VALUES(updated_at);
    -- honor columns deliberately omitted here

-- -----------------------------------------------------------------------
-- Step 3: Incremental lifetime honor update.
--         Only processes dates newer than last_processed_date, so the
--         query cost stays flat regardless of total table size.
-- -----------------------------------------------------------------------
SET @last_date = (SELECT last_processed_date FROM dadcraft_dashboard.honor_sync);

SET @max_date = (
    SELECT COALESCE(MAX(date), @last_date)
    FROM v_characters.character_honor_cp
    WHERE date > @last_date
);

UPDATE dadcraft_dashboard.character_cache cc
JOIN (
    SELECT
        guid,
        COUNT(*)    AS kill_count,
        SUM(honor)  AS honor_sum
    FROM v_characters.character_honor_cp
    WHERE date > @last_date
      AND victim_type = 4
      AND type = 1
    GROUP BY guid
) delta ON cc.guid = delta.guid
SET
    cc.lifetime_honorable_kills = cc.lifetime_honorable_kills + delta.kill_count,
    cc.lifetime_honor           = cc.lifetime_honor + delta.honor_sum;

UPDATE dadcraft_dashboard.honor_sync
SET last_processed_date = @max_date;

-- -----------------------------------------------------------------------
-- Step 4: Recalculate weekly honor fresh each run.
--         Uses saved_variables to derive the current week window so the
--         script adapts automatically after each maintenance reset.
-- -----------------------------------------------------------------------
SET @week_begin = (SELECT NextMaintenanceDate - 7 FROM v_characters.saved_variables);
SET @week_end   = (SELECT NextMaintenanceDate     FROM v_characters.saved_variables);

UPDATE dadcraft_dashboard.character_cache cc
LEFT JOIN (
    SELECT
        guid,
        COUNT(*)    AS kill_count,
        SUM(honor)  AS honor_sum
    FROM v_characters.character_honor_cp
    WHERE date >= @week_begin
      AND date <  @week_end
      AND victim_type = 4
      AND type = 1
    GROUP BY guid
) week_data ON cc.guid = week_data.guid
SET
    cc.week_honorable_kills = COALESCE(week_data.kill_count, 0),
    cc.week_honor           = COALESCE(week_data.honor_sum,  0);

-- -----------------------------------------------------------------------
-- Step 5: Remove characters that no longer exist or have been deleted.
-- -----------------------------------------------------------------------
DELETE cc FROM dadcraft_dashboard.character_cache cc
LEFT JOIN tmp_character_cache t ON cc.guid = t.guid
WHERE t.guid IS NULL;

EOF

echo "Done. character_cache updated at $UPDATED_AT."
