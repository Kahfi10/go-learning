-- Migration 004: Discussions
CREATE TABLE IF NOT EXISTS comments (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  topic_slug     VARCHAR(100) NOT NULL,
  lesson_id      VARCHAR(100) NOT NULL,
  parent_id      UUID REFERENCES comments(id) ON DELETE CASCADE,
  content        TEXT NOT NULL,
  upvotes        INT NOT NULL DEFAULT 0,
  is_pinned      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS comment_upvotes (
  user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  comment_id     UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, comment_id)
);
