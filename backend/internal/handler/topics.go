package handler

import (
	"encoding/json"
	"net/http"
	"os"
	"path/filepath"
	"sort"
	"strings"

	"github.com/go-chi/chi/v5"
)

type TopicsHandler struct {
	contentDir string
}

func NewTopicsHandler() *TopicsHandler {
	dir := os.Getenv("CONTENT_DIR")
	if dir == "" {
		dir = "./data/content"
	}
	return &TopicsHandler{contentDir: dir}
}

func (h *TopicsHandler) ListTopics(w http.ResponseWriter, r *http.Request) {
	entries, err := os.ReadDir(h.contentDir)
	if err != nil {
		jsonError(w, "content not found", http.StatusInternalServerError)
		return
	}

	var topics []json.RawMessage
	for _, entry := range entries {
		if !entry.IsDir() {
			continue
		}
		metaPath := filepath.Join(h.contentDir, entry.Name(), "meta.json")
		data, err := os.ReadFile(metaPath)
		if err != nil {
			continue
		}

		var meta map[string]interface{}
		if err := json.Unmarshal(data, &meta); err != nil {
			continue
		}

		meta["lessons"] = h.lessonSummaries(filepath.Join(h.contentDir, entry.Name()))
		b, _ := json.Marshal(meta)
		topics = append(topics, json.RawMessage(b))
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(topics)
}

func (h *TopicsHandler) GetTopic(w http.ResponseWriter, r *http.Request) {
	slug := chi.URLParam(r, "slug")
	dir, err := h.findTopicDir(slug)
	if err != nil {
		jsonError(w, "topic not found", http.StatusNotFound)
		return
	}

	metaData, err := os.ReadFile(filepath.Join(dir, "meta.json"))
	if err != nil {
		jsonError(w, "meta not found", http.StatusNotFound)
		return
	}

	var meta map[string]interface{}
	json.Unmarshal(metaData, &meta)
	meta["lessons"] = h.lessonSummaries(dir)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(meta)
}

func (h *TopicsHandler) lessonSummaries(dir string) []json.RawMessage {
	entries, _ := os.ReadDir(dir)
	var lessons []json.RawMessage
	for _, e := range entries {
		if e.IsDir() || e.Name() == "meta.json" {
			continue
		}
		if !strings.HasPrefix(e.Name(), "lesson-") {
			continue
		}
		data, err := os.ReadFile(filepath.Join(dir, e.Name()))
		if err != nil {
			continue
		}
		var lesson map[string]interface{}
		if err := json.Unmarshal(data, &lesson); err != nil {
			continue
		}
		quizCount := 0
		if quiz, ok := lesson["quiz"].([]interface{}); ok {
			quizCount = len(quiz)
		}
		summary := map[string]interface{}{
			"id":               lesson["id"],
			"title_id":         lesson["title_id"],
			"title_en":         lesson["title_en"],
			"estimatedMinutes": lesson["estimatedMinutes"],
			"quizCount":        quizCount,
		}
		b, _ := json.Marshal(summary)
		lessons = append(lessons, json.RawMessage(b))
	}

	sort.Slice(lessons, func(i, j int) bool {
		var a, b map[string]interface{}
		_ = json.Unmarshal(lessons[i], &a)
		_ = json.Unmarshal(lessons[j], &b)
		return toString(a["id"]) < toString(b["id"])
	})

	return lessons
}

func toString(v interface{}) string {
	s, _ := v.(string)
	return s
}

func (h *TopicsHandler) GetLesson(w http.ResponseWriter, r *http.Request) {
	slug := chi.URLParam(r, "slug")
	lessonID := chi.URLParam(r, "lessonID")

	dir, err := h.findTopicDir(slug)
	if err != nil {
		jsonError(w, "topic not found", http.StatusNotFound)
		return
	}

	lessonPath := filepath.Join(dir, "lesson-"+lessonID+".json")
	data, err := os.ReadFile(lessonPath)
	if err != nil {
		jsonError(w, "lesson not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(data)
}

func (h *TopicsHandler) Search(w http.ResponseWriter, r *http.Request) {
	q := strings.ToLower(r.URL.Query().Get("q"))
	if q == "" {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode([]interface{}{})
		return
	}

	var results []map[string]interface{}
	entries, _ := os.ReadDir(h.contentDir)
	for _, entry := range entries {
		if !entry.IsDir() {
			continue
		}
		topicDir := filepath.Join(h.contentDir, entry.Name())
		metaPath := filepath.Join(topicDir, "meta.json")
		metaData, err := os.ReadFile(metaPath)
		if err != nil {
			continue
		}
		var meta map[string]interface{}
		if err := json.Unmarshal(metaData, &meta); err != nil {
			continue
		}
		topicTitleID, _ := meta["title_id"].(string)
		topicTitleEN, _ := meta["title_en"].(string)
		topicSlug, _ := meta["slug"].(string)
		lessons, _ := os.ReadDir(topicDir)
		for _, le := range lessons {
			if le.IsDir() || le.Name() == "meta.json" {
				continue
			}
			data, err := os.ReadFile(filepath.Join(topicDir, le.Name()))
			if err != nil {
				continue
			}
			var lesson map[string]interface{}
			if err := json.Unmarshal(data, &lesson); err != nil {
				continue
			}
			titleID, _ := lesson["title_id"].(string)
			titleEN, _ := lesson["title_en"].(string)
			if strings.Contains(strings.ToLower(titleID), q) ||
				strings.Contains(strings.ToLower(titleEN), q) {
				results = append(results, map[string]interface{}{
					"type":     "lesson",
					"id":       lesson["id"],
					"title_id": titleID,
					"title_en": titleEN,
					"topic":    entry.Name(),
					"topic_slug": topicSlug,
					"topic_title_id": topicTitleID,
					"topic_title_en": topicTitleEN,
				})
			}
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(results)
}

func (h *TopicsHandler) findTopicDir(slug string) (string, error) {
	entries, err := os.ReadDir(h.contentDir)
	if err != nil {
		return "", err
	}
	for _, e := range entries {
		if e.IsDir() && strings.Contains(e.Name(), slug) {
			return filepath.Join(h.contentDir, e.Name()), nil
		}
	}
	return "", os.ErrNotExist
}
