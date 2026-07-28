-- Migration 001: Users table
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email          VARCHAR(255) UNIQUE,
  password_hash  VARCHAR(255),
  provider       VARCHAR(50) NOT NULL DEFAULT 'local',
  provider_id    VARCHAR(255),
  name           VARCHAR(255) NOT NULL,
  avatar_url     TEXT,
  lang_pref      VARCHAR(5) NOT NULL DEFAULT 'id',
  xp             INT NOT NULL DEFAULT 0,
  streak_days    INT NOT NULL DEFAULT 0,
  last_active    DATE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
