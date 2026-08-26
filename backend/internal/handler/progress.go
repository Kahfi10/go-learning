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

func NewProgressHandler(db *pgxpool.Pool) *ProgressHandler {
	return &ProgressHandler{db: db}
}

func (h *ProgressHandler) GetProgress(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r)
	rows, err := h.db.Query(r.Context(),
		`SELECT topic_slug, lesson_id, completed, best_quiz_score, last_code, completed_at FROM lesson_progress WHERE user_id = $1`,
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
		if err := rows.Scan(&topicSlug, &lessonID, &completed, &bestScore, &lastCode, &completedAt); err != nil {
			continue
		}
		key := topicSlug + "/" + lessonID
		progress[key] = map[string]interface{}{
			"completed":       completed,
			"best_quiz_score": bestScore,
			"last_code":       lastCode,
			"completed_at":    completedAt,
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(progress)
}

func (h *ProgressHandler) UpdateProgress(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r)
	topic := chi.URLParam(r, "topic")
	lesson := chi.URLParam(r, "lesson")

	var req struct {
		Completed bool   `json:"completed"`
		LastCode  string `json:"last_code"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		jsonError(w, "invalid request", http.StatusBadRequest)
		return
	}

	now := time.Now()
	var wasCompleted bool
	_ = h.db.QueryRow(r.Context(), `SELECT completed FROM lesson_progress WHERE user_id = $1 AND topic_slug = $2 AND lesson_id = $3`, userID, topic, lesson).Scan(&wasCompleted)

	_, err := h.db.Exec(r.Context(), `
		INSERT INTO lesson_progress (id, user_id, topic_slug, lesson_id, completed, last_code, completed_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		ON CONFLICT (user_id, topic_slug, lesson_id)
		DO UPDATE SET completed = $5, last_code = $6, completed_at = CASE WHEN $5 THEN $7 ELSE lesson_progress.completed_at END
	`, uuid.New().String(), userID, topic, lesson, req.Completed, req.LastCode, now)
	if err != nil {
		jsonError(w, "failed to update progress", http.StatusInternalServerError)
		return
	}

	// Award XP if completed
	if req.Completed && !wasCompleted {
		h.db.Exec(r.Context(), `UPDATE users SET xp = xp + 50 WHERE id = $1`, userID)
		h.updateStreak(r, userID)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "progress updated"})
}

func (h *ProgressHandler) SubmitQuiz(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r)
	lessonID := chi.URLParam(r, "lessonID")

	var req struct {
		Score          int    `json:"score"`
		TopicSlug      string `json:"topic_slug"`
		TotalQuestions int    `json:"total_questions"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		jsonError(w, "invalid request", http.StatusBadRequest)
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
		h.db.Exec(r.Context(), `UPDATE users SET xp = xp + 25 WHERE id = $1`, userID)
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
			h.db.Exec(r.Context(), `UPDATE users SET streak_days = streak_days + 1, last_active = $1 WHERE id = $2`, today, userID)
		} else {
			h.db.Exec(r.Context(), `UPDATE users SET streak_days = 1, last_active = $1 WHERE id = $2`, today, userID)
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
