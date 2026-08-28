package handler

import (
	"encoding/json"
	"net/http"

	"github.com/Kahfi10/go-learning/backend/internal/executor"
)

type ExecutorHandler struct{}

func NewExecutorHandler() *ExecutorHandler { return &ExecutorHandler{} }

type executeRequest struct {
	Code string `json:"code"`
}

func (h *ExecutorHandler) Execute(w http.ResponseWriter, r *http.Request) {
	var req executeRequest
	if !decodeJSONBody(w, r, &req, 64<<10) {
		return
	}
	if len(req.Code) > 50000 {
		jsonError(w, "code too large (max 50KB)", http.StatusBadRequest)
		return
	}

	result := executor.Run(req.Code)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}

func (h *ExecutorHandler) Templates(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(executor.Templates())
}
