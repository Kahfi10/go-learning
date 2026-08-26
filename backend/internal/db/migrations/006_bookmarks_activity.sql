-- Migration 006: bookmarks and lesson activity
ALTER TABLE lesson_progress
  ADD COLUMN IF NOT EXISTS last_viewed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS topic_bookmarked BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS lesson_bookmarked BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_lesson_progress_user_last_viewed
  ON lesson_progress(user_id, last_viewed_at DESC);

CREATE INDEX IF NOT EXISTS idx_lesson_progress_user_bookmarks
  ON lesson_progress(user_id, topic_bookmarked, lesson_bookmarked);
