-- Migration 005: Indexes for performance
CREATE INDEX IF NOT EXISTS idx_lesson_progress_user    ON lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_topic   ON lesson_progress(topic_slug);
CREATE INDEX IF NOT EXISTS idx_comments_lesson         ON comments(topic_slug, lesson_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent         ON comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_users_xp                ON users(xp DESC);
CREATE INDEX IF NOT EXISTS idx_users_last_active       ON users(last_active);
