-- Migration 002: Lesson progress
CREATE TABLE IF NOT EXISTS lesson_progress (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  topic_slug      VARCHAR(100) NOT NULL,
  lesson_id       VARCHAR(100) NOT NULL,
  completed       BOOLEAN NOT NULL DEFAULT FALSE,
  last_code       TEXT,
  best_quiz_score INT,
  completed_at    TIMESTAMPTZ,
  UNIQUE(user_id, topic_slug, lesson_id)
);
