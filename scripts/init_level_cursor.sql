-- init_level_cursor.sql
-- Creates dadcraft_dashboard.character_level_cursor, used by collect_dings.sh
-- to detect level-ups cheaply without re-scanning the dings history table.
-- Run once to initialize. Safe to re-run only if table does not exist.
-- Usage: mysql < init_level_cursor.sql

CREATE TABLE IF NOT EXISTS dadcraft_dashboard.character_level_cursor (
    guid       INT UNSIGNED     NOT NULL,
    last_level TINYINT UNSIGNED NOT NULL,
    PRIMARY KEY (guid)
);
