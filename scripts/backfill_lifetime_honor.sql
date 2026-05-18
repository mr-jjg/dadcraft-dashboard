-- backfill_lifetime_honor.sql
--
-- WHAT THIS IS:
-- A one-time fix for lifetime_honorable_kills and lifetime_honor being
-- undercounted in character_cache.
--
-- WHY THIS HAPPENS:
-- The character_cache lifetime honor columns are maintained incrementally.
-- Each cron run processes only new rows from character_honor_cp using a
-- watermark stored in honor_sync.last_processed_date. If the cache is
-- initialized after honor history already exists, the watermark jumps
-- forward on the first run and all prior history is permanently skipped.
--
-- HOW TO TELL IF YOU NEED THIS:
-- Run the following query. If it returns any rows, your lifetime counts are off:
--
--   SELECT cc.name, cc.lifetime_honorable_kills, src.actual_kills
--   FROM dadcraft_dashboard.character_cache cc
--   JOIN (
--       SELECT guid, COUNT(*) AS actual_kills
--       FROM v_characters.character_honor_cp
--       WHERE type = 1
--       AND date <= (SELECT last_processed_date FROM dadcraft_dashboard.honor_sync)
--       GROUP BY guid
--   ) src ON cc.guid = src.guid
--   WHERE cc.lifetime_honorable_kills != src.actual_kills;
--
-- HOW TO FIX IT:
-- Run this script. It recalculates lifetime kills and honor for all characters
-- from the full honor history and resets the watermark to the current max date.
-- Safe to re-run - sets absolute values, does not double-count.

UPDATE dadcraft_dashboard.character_cache cc
JOIN (
    SELECT guid, COUNT(*) AS kill_count, SUM(honor) AS honor_sum
    FROM v_characters.character_honor_cp
    WHERE type = 1
    GROUP BY guid
) src ON cc.guid = src.guid
SET
    cc.lifetime_honorable_kills = src.kill_count,
    cc.lifetime_honor           = src.honor_sum;

UPDATE dadcraft_dashboard.honor_sync
SET last_processed_date = (SELECT MAX(date) FROM v_characters.character_honor_cp WHERE type = 1);
