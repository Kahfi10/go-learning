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

type DiscussionHandler struct {
	db *pgxpool.Pool
}

func NewDiscussionHandler(db *pgxpool.Pool) *DiscussionHandler {
	return &DiscussionHandler{db: db}
}

func (h *DiscussionHandler) GetComments(w http.ResponseWriter, r *http.Request) {
	topic := chi.URLParam(r, "topic")
	lesson := chi.URLParam(r, "lesson")
	sort := r.URL.Query().Get("sort")
	orderBy := "c.created_at DESC"
	if sort == "upvotes" {
		orderBy = "c.upvotes DESC"
	}

	rows, err := h.db.Query(r.Context(), `
		SELECT c.id, c.user_id, u.name, u.avatar_url, c.content, c.upvotes, c.is_pinned, c.parent_id, c.created_at
		FROM comments c
		JOIN users u ON u.id = c.user_id
		WHERE c.topic_slug = $1 AND c.lesson_id = $2
		ORDER BY c.is_pinned DESC, `+orderBy, topic, lesson)
	if err != nil {
		jsonError(w, "failed to fetch comments", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var comments []map[string]interface{}
	for rows.Next() {
		var id, userID, userName, content string
		var avatarURL *string
		var upvotes int
		var isPinned bool
		var parentID *string
		var createdAt time.Time
		if err := rows.Scan(&id, &userID, &userName, &avatarURL, &content, &upvotes, &isPinned, &parentID, &createdAt); err != nil {
			continue
		}
		comments = append(comments, map[string]interface{}{
			"id":         id,
			"user_id":    userID,
			"user_name":  userName,
			"avatar_url": avatarURL,
			"content":    content,
			"upvotes":    upvotes,
			"is_pinned":  isPinned,
			"parent_id":  parentID,
			"created_at": createdAt,
		})
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(comments)
}

func (h *DiscussionHandler) CreateComment(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r)
	var req struct {
		TopicSlug string  `json:"topic_slug"`
		LessonID  string  `json:"lesson_id"`
		Content   string  `json:"content"`
		ParentID  *string `json:"parent_id"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		jsonError(w, "invalid request", http.StatusBadRequest)
		return
	}
	if req.Content == "" {
		jsonError(w, "content is required", http.StatusBadRequest)
		return
	}

	id := uuid.New().String()
	_, err := h.db.Exec(r.Context(),
		`INSERT INTO comments (id, user_id, topic_slug, lesson_id, content, parent_id) VALUES ($1,$2,$3,$4,$5,$6)`,
		id, userID, req.TopicSlug, req.LessonID, req.Content, req.ParentID,
	)
	if err != nil {
		jsonError(w, "failed to create comment", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{"id": id, "message": "comment created"})
}

func (h *DiscussionHandler) ToggleUpvote(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r)
	commentID := chi.URLParam(r, "id")

	var exists bool
	h.db.QueryRow(r.Context(),
		`SELECT EXISTS(SELECT 1 FROM comment_upvotes WHERE user_id=$1 AND comment_id=$2)`,
		userID, commentID,
	).Scan(&exists)

	if exists {
		h.db.Exec(r.Context(), `DELETE FROM comment_upvotes WHERE user_id=$1 AND comment_id=$2`, userID, commentID)
		h.db.Exec(r.Context(), `UPDATE comments SET upvotes = upvotes - 1 WHERE id=$1`, commentID)
	} else {
		h.db.Exec(r.Context(), `INSERT INTO comment_upvotes (user_id, comment_id) VALUES ($1,$2)`, userID, commentID)
		h.db.Exec(r.Context(), `UPDATE comments SET upvotes = upvotes + 1 WHERE id=$1`, commentID)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]bool{"upvoted": !exists})
}

func (h *DiscussionHandler) DeleteComment(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r)
	commentID := chi.URLParam(r, "id")

	result, err := h.db.Exec(r.Context(),
		`DELETE FROM comments WHERE id=$1 AND user_id=$2`,
		commentID, userID,
	)
	if err != nil || result.RowsAffected() == 0 {
		jsonError(w, "comment not found or not authorized", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "deleted"})
}
