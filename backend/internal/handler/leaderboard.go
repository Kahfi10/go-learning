package handler

import (
	"encoding/json"
	"net/http"

	"github.com/jackc/pgx/v5/pgxpool"
)

type LeaderboardHandler struct {
	db *pgxpool.Pool
}

func NewLeaderboardHandler(db *pgxpool.Pool) *LeaderboardHandler {
	return &LeaderboardHandler{db: db}
}

func (h *LeaderboardHandler) GetLeaderboard(w http.ResponseWriter, r *http.Request) {
	period := r.URL.Query().Get("period")

	var dateFilter string
	switch period {
	case "week":
		dateFilter = "AND u.last_active >= NOW() - INTERVAL '7 days'"
	case "month":
		dateFilter = "AND u.last_active >= NOW() - INTERVAL '30 days'"
	default:
		dateFilter = ""
	}

	query := `
		SELECT u.id, u.name, u.avatar_url, u.xp, u.streak_days,
		       (SELECT COUNT(*) FROM lesson_progress lp WHERE lp.user_id = u.id AND lp.completed = true) as lessons_done
		FROM users u
		WHERE u.xp > 0 ` + dateFilter + `
		ORDER BY u.xp DESC
		LIMIT 50
	`

	rows, err := h.db.Query(r.Context(), query)
	if err != nil {
		jsonError(w, "failed to fetch leaderboard", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var board []map[string]interface{}
	rank := 1
	for rows.Next() {
		var id, name string
		var avatarURL *string
		var xp, streak, lessonsDone int
		if err := rows.Scan(&id, &name, &avatarURL, &xp, &streak, &lessonsDone); err != nil {
			continue
		}
		board = append(board, map[string]interface{}{
			"rank":         rank,
			"id":           id,
			"name":         name,
			"avatar_url":   avatarURL,
			"xp":           xp,
			"level":        xpToLevel(xp),
			"streak_days":  streak,
			"lessons_done": lessonsDone,
		})
		rank++
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(board)
}
