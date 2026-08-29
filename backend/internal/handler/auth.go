package handler

import (
	"encoding/json"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"golang.org/x/crypto/bcrypt"

	"github.com/Kahfi10/go-learning/backend/internal/middleware"
)

type AuthHandler struct {
	db *pgxpool.Pool
}

func NewAuthHandler(db *pgxpool.Pool) *AuthHandler {
	return &AuthHandler{db: db}
}

type registerRequest struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

type loginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func (h *AuthHandler) Register(w http.ResponseWriter, r *http.Request) {
	var req registerRequest
	if !decodeJSONBody(w, r, &req, 32<<10) {
		return
	}
	req.Name = strings.TrimSpace(req.Name)
	req.Email = strings.ToLower(strings.TrimSpace(req.Email))

	if req.Name == "" || req.Email == "" || req.Password == "" {
		jsonError(w, "name, email and password are required", http.StatusBadRequest)
		return
	}
	if !strings.Contains(req.Email, "@") {
		jsonError(w, "email is invalid", http.StatusBadRequest)
		return
	}
	if len(req.Password) < 8 {
		jsonError(w, "password must be at least 8 characters", http.StatusBadRequest)
		return
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		jsonError(w, "internal error", http.StatusInternalServerError)
		return
	}

	id := uuid.New().String()
	_, err = h.db.Exec(r.Context(),
		`INSERT INTO users (id, email, password_hash, name) VALUES ($1, $2, $3, $4)`,
		id, req.Email, string(hash), req.Name,
	)
	if err != nil {
		jsonError(w, "email already in use", http.StatusConflict)
		return
	}

	token, err := generateJWT(id, os.Getenv("JWT_SECRET"), 24*time.Hour)
	if err != nil {
		jsonError(w, "internal error", http.StatusInternalServerError)
		return
	}

	setTokenCookie(w, token)
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Cache-Control", "no-store")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"id":    id,
		"name":  req.Name,
		"email": req.Email,
		"token": token,
	})
}

func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req loginRequest
	if !decodeJSONBody(w, r, &req, 32<<10) {
		return
	}

	req.Email = strings.ToLower(strings.TrimSpace(req.Email))
	if req.Email == "" || req.Password == "" {
		jsonError(w, "email and password are required", http.StatusBadRequest)
		return
	}

	var id, hash, name string
	var avatarURL *string
	err := h.db.QueryRow(r.Context(),
		`SELECT id, password_hash, name, avatar_url FROM users WHERE email = $1 AND provider = 'local'`,
		req.Email,
	).Scan(&id, &hash, &name, &avatarURL)
	if err != nil {
		jsonError(w, "invalid credentials", http.StatusUnauthorized)
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(req.Password)); err != nil {
		jsonError(w, "invalid credentials", http.StatusUnauthorized)
		return
	}

	token, err := generateJWT(id, os.Getenv("JWT_SECRET"), 24*time.Hour)
	if err != nil {
		jsonError(w, "internal error", http.StatusInternalServerError)
		return
	}

	setTokenCookie(w, token)
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Cache-Control", "no-store")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"id":         id,
		"name":       name,
		"email":      req.Email,
		"avatar_url": avatarURL,
		"token":      token,
	})
}

func (h *AuthHandler) Logout(w http.ResponseWriter, r *http.Request) {
	setTokenCookieWithConfig(w, "", time.Unix(0, 0), -1)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "logged out"})
}

func (h *AuthHandler) Providers(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]bool{
		"local":  true,
		"google": os.Getenv("GOOGLE_CLIENT_ID") != "" && os.Getenv("GOOGLE_CLIENT_SECRET") != "",
		"github": os.Getenv("GITHUB_CLIENT_ID") != "" && os.Getenv("GITHUB_CLIENT_SECRET") != "",
	})
}

func (h *AuthHandler) Refresh(w http.ResponseWriter, r *http.Request) {
	cookie, err := r.Cookie(getEnvOrFallback("AUTH_COOKIE_NAME", "access_token"))
	if err != nil || cookie.Value == "" {
		jsonError(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	token, err := jwt.Parse(cookie.Value, func(t *jwt.Token) (interface{}, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, jwt.ErrSignatureInvalid
		}
		return []byte(os.Getenv("JWT_SECRET")), nil
	})
	if err != nil || !token.Valid {
		jsonError(w, "invalid token", http.StatusUnauthorized)
		return
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		jsonError(w, "invalid claims", http.StatusUnauthorized)
		return
	}

	userID, ok := claims["sub"].(string)
	if !ok || userID == "" {
		jsonError(w, "invalid subject", http.StatusUnauthorized)
		return
	}

	newToken, err := generateJWT(userID, os.Getenv("JWT_SECRET"), 24*time.Hour)
	if err != nil {
		jsonError(w, "internal error", http.StatusInternalServerError)
		return
	}

	setTokenCookie(w, newToken)
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Cache-Control", "no-store")
	json.NewEncoder(w).Encode(map[string]string{"token": newToken})
}

func (h *AuthHandler) GoogleOAuth(w http.ResponseWriter, r *http.Request) {
	jsonError(w, "configure GOOGLE_CLIENT_ID to enable", http.StatusNotImplemented)
}

func (h *AuthHandler) GoogleCallback(w http.ResponseWriter, r *http.Request) {
	jsonError(w, "not implemented", http.StatusNotImplemented)
}

func (h *AuthHandler) GitHubOAuth(w http.ResponseWriter, r *http.Request) {
	jsonError(w, "configure GITHUB_CLIENT_ID to enable", http.StatusNotImplemented)
}

func (h *AuthHandler) GitHubCallback(w http.ResponseWriter, r *http.Request) {
	jsonError(w, "not implemented", http.StatusNotImplemented)
}

func (h *AuthHandler) Me(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r)
	var id, name, email, langPref string
	var avatarURL *string
	var xp, streak int
	err := h.db.QueryRow(r.Context(),
		`SELECT id, name, email, lang_pref, avatar_url, xp, streak_days FROM users WHERE id = $1`,
		userID,
	).Scan(&id, &name, &email, &langPref, &avatarURL, &xp, &streak)
	if err != nil {
		jsonError(w, "user not found", http.StatusNotFound)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"id":         id,
		"name":       name,
		"email":      email,
		"lang_pref":  langPref,
		"avatar_url": avatarURL,
		"xp":         xp,
		"streak":     streak,
	})
}

func (h *AuthHandler) UpdateMe(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r)
	var req struct {
		Name     string `json:"name"`
		LangPref string `json:"lang_pref"`
	}
	if !decodeJSONBody(w, r, &req, 32<<10) {
		return
	}
	_, err := h.db.Exec(r.Context(),
		`UPDATE users SET name = COALESCE(NULLIF($1,''), name), lang_pref = COALESCE(NULLIF($2,''), lang_pref) WHERE id = $3`,
		req.Name, req.LangPref, userID,
	)
	if err != nil {
		jsonError(w, "update failed", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "updated"})
}

func (h *AuthHandler) ChangePassword(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r)
	var req struct {
		OldPassword string `json:"old_password"`
		NewPassword string `json:"new_password"`
	}
	if !decodeJSONBody(w, r, &req, 32<<10) {
		return
	}
	
	if len(req.NewPassword) < 8 {
		jsonError(w, "new password must be at least 8 characters", http.StatusBadRequest)
		return
	}

	var hash string
	err := h.db.QueryRow(r.Context(), `SELECT password_hash FROM users WHERE id = $1 AND provider = 'local'`, userID).Scan(&hash)
	if err != nil {
		jsonError(w, "user not found or is using external provider", http.StatusBadRequest)
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(req.OldPassword)); err != nil {
		jsonError(w, "incorrect old password", http.StatusUnauthorized)
		return
	}

	newHash, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		jsonError(w, "internal error", http.StatusInternalServerError)
		return
	}

	_, err = h.db.Exec(r.Context(), `UPDATE users SET password_hash = $1 WHERE id = $2`, string(newHash), userID)
	if err != nil {
		jsonError(w, "failed to update password", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "password updated"})
}

// ── helpers ──────────────────────────────────────────────────────────────

func generateJWT(userID, secret string, expiry time.Duration) (string, error) {
	claims := jwt.MapClaims{
		"sub": userID,
		"exp": time.Now().Add(expiry).Unix(),
		"iat": time.Now().Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(secret))
}

func setTokenCookie(w http.ResponseWriter, token string) {
	setTokenCookieWithConfig(w, token, time.Now().Add(24*time.Hour), 0)
}

func setTokenCookieWithConfig(w http.ResponseWriter, token string, expires time.Time, maxAge int) {
	http.SetCookie(w, &http.Cookie{
		Name:     getEnvOrFallback("AUTH_COOKIE_NAME", "access_token"),
		Value:    token,
		Path:     getEnvOrFallback("AUTH_COOKIE_PATH", "/"),
		Domain:   getEnvOrFallback("AUTH_COOKIE_DOMAIN", ""),
		Expires:  expires,
		MaxAge:   maxAge,
		HttpOnly: true,
		Secure:   getEnvBool("AUTH_COOKIE_SECURE", false),
		SameSite: getSameSiteMode(getEnvOrFallback("AUTH_COOKIE_SAMESITE", "lax")),
	})
}

func getEnvOrFallback(key, fallback string) string {
	v := strings.TrimSpace(os.Getenv(key))
	if v == "" {
		return fallback
	}
	return v
}

func getEnvBool(key string, fallback bool) bool {
	v := strings.TrimSpace(strings.ToLower(os.Getenv(key)))
	if v == "" {
		return fallback
	}
	parsed, err := strconv.ParseBool(v)
	if err != nil {
		return fallback
	}
	return parsed
}

func getSameSiteMode(value string) http.SameSite {
	switch strings.ToLower(strings.TrimSpace(value)) {
	case "strict":
		return http.SameSiteStrictMode
	case "none":
		return http.SameSiteNoneMode
	default:
		return http.SameSiteLaxMode
	}
}

func jsonError(w http.ResponseWriter, msg string, code int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	json.NewEncoder(w).Encode(map[string]string{"error": msg})
}
