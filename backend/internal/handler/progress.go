package handler

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/Kahfi10/go-learning/backend/internal/middleware"
)

type ProgressHandler struct {
	db *pgxpool.Pool
}

type progressUpdateRequest struct {
	Completed       bool   `json:"completed"`
	LastCode        string `json:"last_code"`
	MarkViewed      bool   `json:"mark_viewed"`
	TopicBookmarked *bool  `json:"topic_bookmarked"`
	LessonBookmarked *bool `json:"lesson_bookmarked"`
}

func NewProgressHandler(db *pgxpool.Pool) *ProgressHandler {
	return &ProgressHandler{db: db}
}

func (h *ProgressHandler) GetProgress(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r)
	rows, err := h.db.Query(r.Context(),
		`SELECT topic_slug, lesson_id, completed, best_quiz_score, last_code, completed_at, last_viewed_at, topic_bookmarked, lesson_bookmarked FROM lesson_progress WHERE user_id = $1`,
		userID,
	)
	if err != nil {
		jsonError(w, "failed to fetch progress", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	progress := make(map[string]interface{})
	for rows.Next() {
		var topicSlug, lessonID string
		var completed bool
		var bestScore *int
		var lastCode *string
		var completedAt *time.Time
		var lastViewedAt *time.Time
		var topicBookmarked, lessonBookmarked bool
		if err := rows.Scan(&topicSlug, &lessonID, &completed, &bestScore, &lastCode, &completedAt, &lastViewedAt, &topicBookmarked, &lessonBookmarked); err != nil {
			continue
		}
		key := topicSlug + "/" + lessonID
		progress[key] = map[string]interface{}{
			"completed":       completed,
			"best_quiz_score": bestScore,
			"last_code":       lastCode,
			"completed_at":    completedAt,
			"last_viewed_at":  lastViewedAt,
			"topic_bookmarked": topicBookmarked,
			"lesson_bookmarked": lessonBookmarked,
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(progress)
}

func (h *ProgressHandler) UpdateProgress(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r)
	topic := chi.URLParam(r, "topic")
	lesson := chi.URLParam(r, "lesson")

	var req progressUpdateRequest
	if !decodeJSONBody(w, r, &req, 128<<10) {
		return
	}

	now := time.Now()
	var wasCompleted bool
	_ = h.db.QueryRow(r.Context(), `SELECT completed FROM lesson_progress WHERE user_id = $1 AND topic_slug = $2 AND lesson_id = $3`, userID, topic, lesson).Scan(&wasCompleted)
	lastViewedAt := any(nil)
	if req.MarkViewed {
		lastViewedAt = now
	}

	_, err := h.db.Exec(r.Context(), `
		INSERT INTO lesson_progress (id, user_id, topic_slug, lesson_id, completed, last_code, completed_at, last_viewed_at, topic_bookmarked, lesson_bookmarked)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, COALESCE($9, false), COALESCE($10, false))
		ON CONFLICT (user_id, topic_slug, lesson_id)
		DO UPDATE SET
			completed = CASE WHEN $5 THEN $5 ELSE lesson_progress.completed END,
			last_code = CASE WHEN $6 <> '' THEN $6 ELSE lesson_progress.last_code END,
			completed_at = CASE WHEN $5 AND NOT lesson_progress.completed THEN $7 ELSE lesson_progress.completed_at END,
			last_viewed_at = COALESCE($8, lesson_progress.last_viewed_at),
			topic_bookmarked = COALESCE($9, lesson_progress.topic_bookmarked),
			lesson_bookmarked = COALESCE($10, lesson_progress.lesson_bookmarked)
	`, uuid.New().String(), userID, topic, lesson, req.Completed, req.LastCode, now, lastViewedAt, req.TopicBookmarked, req.LessonBookmarked)
	if err != nil {
		jsonError(w, "failed to update progress", http.StatusInternalServerError)
		return
	}

	if req.TopicBookmarked != nil {
		_, _ = h.db.Exec(r.Context(), `UPDATE lesson_progress SET topic_bookmarked = $1 WHERE user_id = $2 AND topic_slug = $3`, *req.TopicBookmarked, userID, topic)
	}

	// Award XP if completed
	if req.Completed && !wasCompleted {
		_, _ = h.db.Exec(r.Context(), `UPDATE users SET xp = xp + 50 WHERE id = $1`, userID)
		h.updateStreak(r, userID)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "progress updated"})
}

func (h *ProgressHandler) GetActivity(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r)
	rows, err := h.db.Query(r.Context(), `
		SELECT topic_slug, lesson_id, completed, last_viewed_at, completed_at, topic_bookmarked, lesson_bookmarked
		FROM lesson_progress
		WHERE user_id = $1 AND (last_viewed_at IS NOT NULL OR completed_at IS NOT NULL OR topic_bookmarked = true OR lesson_bookmarked = true)
		ORDER BY GREATEST(COALESCE(last_viewed_at, to_timestamp(0)), COALESCE(completed_at, to_timestamp(0))) DESC
		LIMIT 20
	`, userID)
	if err != nil {
		jsonError(w, "failed to fetch activity", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var items []map[string]interface{}
	for rows.Next() {
		var topicSlug, lessonID string
		var completed, topicBookmarked, lessonBookmarked bool
		var lastViewedAt, completedAt *time.Time
		if err := rows.Scan(&topicSlug, &lessonID, &completed, &lastViewedAt, &completedAt, &topicBookmarked, &lessonBookmarked); err != nil {
			continue
		}
		items = append(items, map[string]interface{}{
			"topic_slug":       topicSlug,
			"lesson_id":        lessonID,
			"completed":        completed,
			"last_viewed_at":   lastViewedAt,
			"completed_at":     completedAt,
			"topic_bookmarked": topicBookmarked,
			"lesson_bookmarked": lessonBookmarked,
		})
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(items)
}

func (h *ProgressHandler) SubmitQuiz(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r)
	lessonID := chi.URLParam(r, "lessonID")

	var req struct {
		Score          int    `json:"score"`
		TopicSlug      string `json:"topic_slug"`
		TotalQuestions int    `json:"total_questions"`
	}
	if !decodeJSONBody(w, r, &req, 32<<10) {
		return
	}

	var previousBest *int
	_ = h.db.QueryRow(r.Context(), `SELECT best_quiz_score FROM lesson_progress WHERE user_id = $1 AND topic_slug = $2 AND lesson_id = $3`, userID, req.TopicSlug, lessonID).Scan(&previousBest)

	_, err := h.db.Exec(r.Context(), `
		INSERT INTO lesson_progress (id, user_id, topic_slug, lesson_id, best_quiz_score)
		VALUES ($1, $2, $3, $4, $5)
		ON CONFLICT (user_id, topic_slug, lesson_id)
		DO UPDATE SET best_quiz_score = GREATEST(lesson_progress.best_quiz_score, $5)
	`, uuid.New().String(), userID, req.TopicSlug, lessonID, req.Score)
	if err != nil {
		jsonError(w, "failed to save quiz", http.StatusInternalServerError)
		return
	}

	// Award bonus XP for perfect score
	maxScore := req.TotalQuestions
	if maxScore == 0 {
		maxScore = 5
	}
	newPerfect := req.Score == maxScore && (previousBest == nil || *previousBest < maxScore)
	if newPerfect {
		_, _ = h.db.Exec(r.Context(), `UPDATE users SET xp = xp + 25 WHERE id = $1`, userID)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"score":    req.Score,
		"xp_bonus": newPerfect,
	})
}

func (h *ProgressHandler) GetStats(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r)
	var xp, streak, lessonsCompleted int
	h.db.QueryRow(r.Context(),
		`SELECT xp, streak_days, (SELECT COUNT(*) FROM lesson_progress WHERE user_id = $1 AND completed = true) FROM users WHERE id = $1`,
		userID,
	).Scan(&xp, &streak, &lessonsCompleted)

	level := xpToLevel(xp)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"xp":                xp,
		"level":             level,
		"streak_days":       streak,
		"lessons_completed": lessonsCompleted,
	})
}

func (h *ProgressHandler) GetBadges(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r)
	rows, err := h.db.Query(r.Context(), `
		SELECT b.slug, b.name_id, b.name_en, b.description_id, b.description_en, b.icon,
		       ub.earned_at IS NOT NULL as earned, ub.earned_at
		FROM badges b
		LEFT JOIN user_badges ub ON ub.badge_slug = b.slug AND ub.user_id = $1
		ORDER BY earned DESC, b.slug
	`, userID)
	if err != nil {
		jsonError(w, "failed to fetch badges", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var badges []map[string]interface{}
	for rows.Next() {
		var slug, nameID, nameEN, descID, descEN, icon string
		var earned bool
		var earnedAt *time.Time
		if err := rows.Scan(&slug, &nameID, &nameEN, &descID, &descEN, &icon, &earned, &earnedAt); err != nil {
			continue
		}
		badges = append(badges, map[string]interface{}{
			"slug":           slug,
			"name_id":        nameID,
			"name_en":        nameEN,
			"description_id": descID,
			"description_en": descEN,
			"icon":           icon,
			"earned":         earned,
			"earned_at":      earnedAt,
		})
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(badges)
}

func (h *ProgressHandler) updateStreak(r *http.Request, userID string) {
	var lastActive *time.Time
	h.db.QueryRow(r.Context(), `SELECT last_active FROM users WHERE id = $1`, userID).Scan(&lastActive)
	today := time.Now().UTC().Truncate(24 * time.Hour)
	if lastActive == nil || lastActive.Before(today) {
		yesterday := today.Add(-24 * time.Hour)
		if lastActive != nil && lastActive.Equal(yesterday) {
			_, _ = h.db.Exec(r.Context(), `UPDATE users SET streak_days = streak_days + 1, last_active = $1 WHERE id = $2`, today, userID)
		} else {
			_, _ = h.db.Exec(r.Context(), `UPDATE users SET streak_days = 1, last_active = $1 WHERE id = $2`, today, userID)
		}
	}
}

func xpToLevel(xp int) int {
	thresholds := []int{0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 5000}
	level := 1
	for i, t := range thresholds {
		if xp >= t {
			level = i + 1
		}
	}
	return level
}
