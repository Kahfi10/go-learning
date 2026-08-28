package handler

import (
	"encoding/json"
	"io"
	"net/http"
)

func decodeJSONBody(w http.ResponseWriter, r *http.Request, dst interface{}, maxBytes int64) bool {
	r.Body = http.MaxBytesReader(w, r.Body, maxBytes)
	dec := json.NewDecoder(r.Body)
	dec.DisallowUnknownFields()
	if err := dec.Decode(dst); err != nil {
		jsonError(w, "invalid request body", http.StatusBadRequest)
		return false
	}
	if err := dec.Decode(&struct{}{}); err != io.EOF {
		jsonError(w, "request body must contain a single JSON object", http.StatusBadRequest)
		return false
	}
	return true
}
