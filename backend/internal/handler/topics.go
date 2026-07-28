package handler

import (
	"encoding/json"
	"net/http"
	"os"
	"path/filepath"
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
		topics = append(topics, json.RawMessage(data))
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

	// List lessons
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
		// Return only lesson metadata (id, title, estimatedMinutes) not full content
		var lesson map[string]interface{}
		if err := json.Unmarshal(data, &lesson); err != nil {
			continue
		}
		summary := map[string]interface{}{
			"id":               lesson["id"],
			"title_id":         lesson["title_id"],
			"title_en":         lesson["title_en"],
			"estimatedMinutes": lesson["estimatedMinutes"],
		}
		b, _ := json.Marshal(summary)
		lessons = append(lessons, json.RawMessage(b))
	}

	var meta map[string]interface{}
	json.Unmarshal(metaData, &meta)
	meta["lessons"] = lessons

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(meta)
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
		dir := filepath.Join(h.contentDir, entry.Name())
		lessons, _ := os.ReadDir(dir)
		for _, le := range lessons {
			if le.IsDir() || le.Name() == "meta.json" {
				continue
			}
			data, err := os.ReadFile(filepath.Join(dir, le.Name()))
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
