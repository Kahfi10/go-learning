-- Migration 003: Badges & gamification
CREATE TABLE IF NOT EXISTS badges (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug           VARCHAR(100) UNIQUE NOT NULL,
  name_id        VARCHAR(255) NOT NULL,
  name_en        VARCHAR(255) NOT NULL,
  description_id TEXT NOT NULL,
  description_en TEXT NOT NULL,
  icon           VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS user_badges (
  user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_slug     VARCHAR(100) NOT NULL REFERENCES badges(slug),
  earned_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, badge_slug)
);

-- Seed badges
INSERT INTO badges (slug, name_id, name_en, description_id, description_en, icon) VALUES
  ('first-lesson',       'Langkah Pertama',     'First Step',          'Selesaikan lesson pertamamu',              'Complete your first lesson',               'star'),
  ('first-topic',        'Topik Pertama',        'First Topic',         'Selesaikan seluruh topik pertama',         'Complete your first full topic',            'book'),
  ('quiz-perfect',       'Nilai Sempurna',       'Perfect Score',       'Raih nilai sempurna di sebuah kuis',       'Get a perfect score on any quiz',           'trophy'),
  ('speed-runner',       'Speed Runner',         'Speed Runner',        'Selesaikan lesson dalam 5 menit',          'Complete a lesson in under 5 minutes',      'zap'),
  ('streak-7',           'Streak Seminggu',      'Week Streak',         'Belajar 7 hari berturut-turut',            'Learn for 7 consecutive days',              'flame'),
  ('streak-30',          'Streak Sebulan',       'Month Streak',        'Belajar 30 hari berturut-turut',           'Learn for 30 consecutive days',             'fire'),
  ('beginner-complete',  'Lulus Dasar',          'Beginner Graduate',   'Selesaikan semua topik Beginner',          'Complete all Beginner topics',              'graduation-cap'),
  ('intermediate',       'Level Menengah',       'Intermediate',        'Selesaikan semua topik Intermediate',      'Complete all Intermediate topics',          'award'),
  ('go-expert',          'Go Expert',            'Go Expert',           'Selesaikan seluruh kurikulum GoLearn',     'Complete the entire GoLearn curriculum',    'crown'),
  ('concurrency-master', 'Concurrency Master',   'Concurrency Master',  'Selesaikan topik Goroutines & Channels',   'Complete the Goroutines & Channels topic',  'cpu'),
  ('code-runner',        'Code Runner',          'Code Runner',         'Jalankan kode 50 kali',                    'Run code 50 times',                         'play'),
  ('top-10',             'Top 10',               'Top 10',              'Masuk 10 besar leaderboard',               'Reach top 10 on the leaderboard',           'chart'),
  ('first-comment',      'Diskusi Pertama',      'First Discussion',    'Tulis komentar pertamamu',                 'Write your first comment',                  'message'),
  ('helpful',            'Sangat Membantu',      'Super Helpful',       'Dapatkan 10 upvote pada komentar',         'Get 10 upvotes on your comments',           'thumbs-up'),
  ('level-5',            'Level 5',              'Level 5',             'Capai level 5 di GoLearn',                 'Reach level 5 in GoLearn',                  'shield')
ON CONFLICT (slug) DO NOTHING;
