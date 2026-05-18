-- init_character_cache.sql
-- Creates dadcraft_dashboard tables for character cache and honor sync.
-- Run once to initialize. Safe to re-run only if tables do not exist.
-- Usage: mysql < init_character_cache.sql

CREATE TABLE IF NOT EXISTS dadcraft_dashboard.character_cache (
    -- identity
    guid                     INT UNSIGNED     NOT NULL,
    name                     VARCHAR(12)      NOT NULL,

    -- decoded enums
    race                     VARCHAR(20)      NOT NULL,
    class                    VARCHAR(20)      NOT NULL,
    gender                   VARCHAR(10)      NOT NULL,

    -- progression
    level                    TINYINT UNSIGNED NOT NULL,
    xp                       INT UNSIGNED     NOT NULL,
    totaltime                INT UNSIGNED     NOT NULL,
    leveltime                INT UNSIGNED     NOT NULL,

    -- economy
    money                    INT UNSIGNED     NOT NULL,

    -- location
    zone                     VARCHAR(100)     NOT NULL,

    -- status
    online                   TINYINT          NOT NULL,
    in_battleground          TINYINT          NOT NULL DEFAULT 0,

    -- guild
    guild                    VARCHAR(255)     NOT NULL DEFAULT 'None',
    is_guild_leader          TINYINT          NOT NULL DEFAULT 0,

    -- honor (sourced from character_honor_cp, not characters table)
    -- lifetime values: incremental via honor_sync tracking table
    -- weekly values: recalculated fresh each cron run from saved_variables window
    lifetime_honorable_kills INT UNSIGNED     NOT NULL DEFAULT 0,
    lifetime_honor           FLOAT            NOT NULL DEFAULT 0,
    week_honorable_kills     INT UNSIGNED     NOT NULL DEFAULT 0,
    week_honor               FLOAT            NOT NULL DEFAULT 0,

    -- cache management
    -- cache_hash covers core fields only; honor is excluded and updated separately
    cache_hash               CHAR(32)         NOT NULL,
    updated_at               INT UNSIGNED     NOT NULL,

    PRIMARY KEY (guid),
    INDEX idx_name    (name),
    INDEX idx_level   (level),
    INDEX idx_race    (race),
    INDEX idx_class   (class),
    INDEX idx_guild   (guild),
    INDEX idx_online  (online)
);

-- Tracks the last character_honor_cp.date processed for lifetime honor aggregation.
-- Single-row table. Initialized to 0 so the first run processes all history.
CREATE TABLE IF NOT EXISTS dadcraft_dashboard.honor_sync (
    last_processed_date INT UNSIGNED NOT NULL
);

INSERT INTO dadcraft_dashboard.honor_sync (last_processed_date)
SELECT 0 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM dadcraft_dashboard.honor_sync);
