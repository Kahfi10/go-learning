package handler

import (
	"context"
	"crypto/rand"
	"encoding/json"
	"encoding/base64"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"golang.org/x/crypto/bcrypt"

	"github.com/Kahfi10/go-learning/backend/internal/middleware"
)

type AuthHandler struct {
	db *pgxpool.Pool
}

type oauthProvider string

const (
	oauthCookieName = "oauth_state"
	oauthStateTTL   = 10 * time.Minute

	providerGoogle oauthProvider = "google"
	providerGitHub oauthProvider = "github"
)

type oauthStatePayload struct {
	Provider oauthProvider `json:"provider"`
	State    string        `json:"state"`
	Next     string        `json:"next"`
	CodeHash string        `json:"code_hash,omitempty"`
	IssuedAt int64         `json:"iat"`
}

type oauthUserInfo struct {
	Provider   oauthProvider
	ProviderID string
	Email      string
	Name       string
	AvatarURL  string
	Verified   bool
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

	token, err := generateJWT(id, os.Getenv("JWT_SECRET"), 30*24*time.Hour)
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

	token, err := generateJWT(id, os.Getenv("JWT_SECRET"), 30*24*time.Hour)
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
	clearOAuthStateCookie(w)
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

	var exists bool
	err = h.db.QueryRow(r.Context(), `SELECT EXISTS(SELECT 1 FROM users WHERE id = $1)`, userID).Scan(&exists)
	if err != nil || !exists {
		jsonError(w, "user not found", http.StatusUnauthorized)
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
	h.beginOAuth(w, r, providerGoogle)
}

func (h *AuthHandler) GoogleCallback(w http.ResponseWriter, r *http.Request) {
	h.finishOAuth(w, r, providerGoogle)
}

func (h *AuthHandler) GitHubOAuth(w http.ResponseWriter, r *http.Request) {
	h.beginOAuth(w, r, providerGitHub)
}

func (h *AuthHandler) GitHubCallback(w http.ResponseWriter, r *http.Request) {
	h.finishOAuth(w, r, providerGitHub)
}

func (h *AuthHandler) Me(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r)
	var id, name, email, langPref, provider string
	var avatarURL *string
	var xp, streak int
	err := h.db.QueryRow(r.Context(),
		`SELECT id, name, email, lang_pref, avatar_url, xp, streak_days, provider FROM users WHERE id = $1`,
		userID,
	).Scan(&id, &name, &email, &langPref, &avatarURL, &xp, &streak, &provider)
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
		"provider":   provider,
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
	req.Name = strings.TrimSpace(req.Name)
	req.LangPref = strings.TrimSpace(strings.ToLower(req.LangPref))
	if req.LangPref != "" && req.LangPref != "id" && req.LangPref != "en" {
		jsonError(w, "lang_pref must be 'id' or 'en'", http.StatusBadRequest)
		return
	}
	if req.Name == "" && req.LangPref == "" {
		jsonError(w, "no profile fields to update", http.StatusBadRequest)
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

func (h *AuthHandler) beginOAuth(w http.ResponseWriter, r *http.Request, provider oauthProvider) {
	config, err := getOAuthConfig(provider)
	if err != nil {
		jsonError(w, err.Error(), http.StatusNotImplemented)
		return
	}

	next := sanitizeNextPath(r.URL.Query().Get("next"))
	state, err := randomToken(32)
	if err != nil {
		jsonError(w, "failed to initialize oauth state", http.StatusInternalServerError)
		return
	}

	payload := oauthStatePayload{
		Provider: provider,
		State:    state,
		Next:     next,
		IssuedAt: time.Now().Unix(),
	}
	setOAuthStateCookie(w, payload)

	authURL := buildOAuthAuthorizeURL(config, state)
	http.Redirect(w, r, authURL, http.StatusFound)
}

func (h *AuthHandler) finishOAuth(w http.ResponseWriter, r *http.Request, provider oauthProvider) {
	config, err := getOAuthConfig(provider)
	if err != nil {
		h.redirectOAuthFailure(w, r, "/login", "oauth_not_configured")
		return
	}

	payload, err := readOAuthStateCookie(r)
	if err != nil || payload.Provider != provider {
		h.redirectOAuthFailure(w, r, "/login", "invalid_oauth_state")
		return
	}

	queryState := r.URL.Query().Get("state")
	if queryState == "" || queryState != payload.State {
		clearOAuthStateCookie(w)
		h.redirectOAuthFailure(w, r, payload.Next, "oauth_state_mismatch")
		return
	}

	code := r.URL.Query().Get("code")
	if code == "" {
		clearOAuthStateCookie(w)
		h.redirectOAuthFailure(w, r, payload.Next, "oauth_code_missing")
		return
	}

	userInfo, err := fetchOAuthUser(r.Context(), config, code)
	if err != nil {
		clearOAuthStateCookie(w)
		h.redirectOAuthFailure(w, r, payload.Next, "oauth_exchange_failed")
		return
	}
	if !userInfo.Verified || userInfo.Email == "" || userInfo.ProviderID == "" {
		clearOAuthStateCookie(w)
		h.redirectOAuthFailure(w, r, payload.Next, "oauth_email_not_verified")
		return
	}

	userID, created, err := h.findOrCreateOAuthUser(r.Context(), userInfo)
	if err != nil {
		clearOAuthStateCookie(w)
		if errors.Is(err, errOAuthConflict) {
			h.redirectOAuthFailure(w, r, payload.Next, "oauth_account_conflict")
			return
		}
		h.redirectOAuthFailure(w, r, payload.Next, "oauth_login_failed")
		return
	}

	token, err := generateJWT(userID, os.Getenv("JWT_SECRET"), 24*time.Hour)
	if err != nil {
		clearOAuthStateCookie(w)
		h.redirectOAuthFailure(w, r, payload.Next, "oauth_token_failed")
		return
	}

	clearOAuthStateCookie(w)
	setTokenCookie(w, token)
	redirectPath := payload.Next
	if created && redirectPath == "/dashboard" {
		redirectPath = "/modules"
	}
	http.Redirect(w, r, buildFrontendRedirectURL(redirectPath), http.StatusFound)
}

var errOAuthConflict = errors.New("oauth account conflict")

func (h *AuthHandler) findOrCreateOAuthUser(ctx context.Context, userInfo oauthUserInfo) (string, bool, error) {
	tx, err := h.db.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		return "", false, err
	}
	defer tx.Rollback(ctx)

	var userID string
	err = tx.QueryRow(ctx,
		`SELECT id FROM user_oauth_identities WHERE provider = $1 AND provider_user_id = $2`,
		string(userInfo.Provider), userInfo.ProviderID,
	).Scan(&userID)
	if err == nil {
		_, err = tx.Exec(ctx,
			`UPDATE users SET name = COALESCE(NULLIF($1,''), name), avatar_url = COALESCE(NULLIF($2,''), avatar_url) WHERE id = $3`,
			userInfo.Name, userInfo.AvatarURL, userID,
		)
		if err != nil {
			return "", false, err
		}
		if err := tx.Commit(ctx); err != nil {
			return "", false, err
		}
		return userID, false, nil
	}
	if !errors.Is(err, pgx.ErrNoRows) {
		return "", false, err
	}

	var existingID, existingProvider string
	err = tx.QueryRow(ctx,
		`SELECT id, provider FROM users WHERE email = $1`,
		strings.ToLower(strings.TrimSpace(userInfo.Email)),
	).Scan(&existingID, &existingProvider)
	if err == nil {
		if existingProvider == "local" {
			return "", false, errOAuthConflict
		}
		if existingProvider != string(userInfo.Provider) {
			return "", false, errOAuthConflict
		}
		_, err = tx.Exec(ctx,
			`INSERT INTO user_oauth_identities (id, user_id, provider, provider_user_id, email, created_at)
			 VALUES ($1, $2, $3, $4, $5, NOW())
			 ON CONFLICT (provider, provider_user_id) DO NOTHING`,
			uuid.New().String(), existingID, string(userInfo.Provider), userInfo.ProviderID, userInfo.Email,
		)
		if err != nil {
			return "", false, err
		}
		_, err = tx.Exec(ctx,
			`UPDATE users SET avatar_url = COALESCE(NULLIF($1,''), avatar_url), name = COALESCE(NULLIF($2,''), name) WHERE id = $3`,
			userInfo.AvatarURL, userInfo.Name, existingID,
		)
		if err != nil {
			return "", false, err
		}
		if err := tx.Commit(ctx); err != nil {
			return "", false, err
		}
		return existingID, false, nil
	}
	if !errors.Is(err, pgx.ErrNoRows) {
		return "", false, err
	}

	newUserID := uuid.New().String()
	_, err = tx.Exec(ctx,
		`INSERT INTO users (id, email, name, provider, provider_id, avatar_url)
		 VALUES ($1, $2, $3, $4, $5, $6)`,
		newUserID, strings.ToLower(strings.TrimSpace(userInfo.Email)), firstNonEmpty(userInfo.Name, strings.Split(userInfo.Email, "@")[0]), string(userInfo.Provider), userInfo.ProviderID, emptyToNil(userInfo.AvatarURL),
	)
	if err != nil {
		return "", false, err
	}
	_, err = tx.Exec(ctx,
		`INSERT INTO user_oauth_identities (id, user_id, provider, provider_user_id, email, created_at)
		 VALUES ($1, $2, $3, $4, $5, NOW())`,
		uuid.New().String(), newUserID, string(userInfo.Provider), userInfo.ProviderID, strings.ToLower(strings.TrimSpace(userInfo.Email)),
	)
	if err != nil {
		return "", false, err
	}

	if err := tx.Commit(ctx); err != nil {
		return "", false, err
	}
	return newUserID, true, nil
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
	duration := 30 * 24 * time.Hour
	setTokenCookieWithConfig(w, token, time.Now().Add(duration), int(duration.Seconds()))
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

type oauthConfig struct {
	Provider      oauthProvider
	ClientID      string
	ClientSecret  string
	AuthorizeURL  string
	TokenURL      string
	UserURL       string
	EmailURL      string
	RedirectURL   string
	Scopes        []string
	UseBasicAuth  bool
	ProfileHeader map[string]string
}

func getOAuthConfig(provider oauthProvider) (oauthConfig, error) {
	frontendURL := strings.TrimRight(getEnvOrFallback("FRONTEND_URL", "http://localhost:3006"), "/")
	baseAPI := frontendURL
	if apiBase := strings.TrimRight(os.Getenv("NEXT_PUBLIC_API_URL"), "/"); apiBase != "" {
		baseAPI = apiBase
	}
	switch provider {
	case providerGoogle:
		clientID := strings.TrimSpace(os.Getenv("GOOGLE_CLIENT_ID"))
		secret := strings.TrimSpace(os.Getenv("GOOGLE_CLIENT_SECRET"))
		if clientID == "" || secret == "" {
			return oauthConfig{}, fmt.Errorf("configure GOOGLE_CLIENT_ID to enable")
		}
		return oauthConfig{
			Provider:     providerGoogle,
			ClientID:     clientID,
			ClientSecret: secret,
			AuthorizeURL: "https://accounts.google.com/o/oauth2/v2/auth",
			TokenURL:     "https://oauth2.googleapis.com/token",
			UserURL:      "https://openidconnect.googleapis.com/v1/userinfo",
			RedirectURL:  fmt.Sprintf("%s/api/auth/google/callback", baseAPI),
			Scopes:       []string{"openid", "email", "profile"},
		}, nil
	case providerGitHub:
		clientID := strings.TrimSpace(os.Getenv("GITHUB_CLIENT_ID"))
		secret := strings.TrimSpace(os.Getenv("GITHUB_CLIENT_SECRET"))
		if clientID == "" || secret == "" {
			return oauthConfig{}, fmt.Errorf("configure GITHUB_CLIENT_ID to enable")
		}
		return oauthConfig{
			Provider:     providerGitHub,
			ClientID:     clientID,
			ClientSecret: secret,
			AuthorizeURL: "https://github.com/login/oauth/authorize",
			TokenURL:     "https://github.com/login/oauth/access_token",
			UserURL:      "https://api.github.com/user",
			EmailURL:     "https://api.github.com/user/emails",
			RedirectURL:  fmt.Sprintf("%s/api/auth/github/callback", baseAPI),
			Scopes:       []string{"read:user", "user:email"},
			ProfileHeader: map[string]string{
				"Accept":               "application/vnd.github+json",
				"X-GitHub-Api-Version": "2022-11-28",
			},
		}, nil
	default:
		return oauthConfig{}, fmt.Errorf("unsupported oauth provider")
	}
}

func buildOAuthAuthorizeURL(config oauthConfig, state string) string {
	params := url.Values{}
	params.Set("client_id", config.ClientID)
	params.Set("redirect_uri", config.RedirectURL)
	params.Set("response_type", "code")
	params.Set("scope", strings.Join(config.Scopes, " "))
	params.Set("state", state)
	if config.Provider == providerGoogle {
		params.Set("access_type", "offline")
		params.Set("prompt", "select_account")
	}
	return config.AuthorizeURL + "?" + params.Encode()
}

func fetchOAuthUser(ctx context.Context, config oauthConfig, code string) (oauthUserInfo, error) {
	token, err := exchangeOAuthCode(ctx, config, code)
	if err != nil {
		return oauthUserInfo{}, err
	}

	switch config.Provider {
	case providerGoogle:
		return fetchGoogleUser(ctx, config, token)
	case providerGitHub:
		return fetchGitHubUser(ctx, config, token)
	default:
		return oauthUserInfo{}, errors.New("unsupported oauth provider")
	}
}

func exchangeOAuthCode(ctx context.Context, config oauthConfig, code string) (string, error) {
	form := url.Values{}
	form.Set("code", code)
	form.Set("client_id", config.ClientID)
	form.Set("client_secret", config.ClientSecret)
	form.Set("redirect_uri", config.RedirectURL)
	form.Set("grant_type", "authorization_code")

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, config.TokenURL, strings.NewReader(form.Encode()))
	if err != nil {
		return "", err
	}
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	req.Header.Set("Accept", "application/json")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()
	body, _ := io.ReadAll(io.LimitReader(resp.Body, 1<<20))
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return "", fmt.Errorf("oauth token exchange failed: %s", resp.Status)
	}
	var payload struct {
		AccessToken string `json:"access_token"`
		Error       string `json:"error"`
	}
	if err := json.Unmarshal(body, &payload); err != nil {
		return "", err
	}
	if payload.AccessToken == "" {
		return "", fmt.Errorf("oauth access token missing: %s", payload.Error)
	}
	return payload.AccessToken, nil
}

func fetchGoogleUser(ctx context.Context, config oauthConfig, token string) (oauthUserInfo, error) {
	var payload struct {
		Sub           string `json:"sub"`
		Email         string `json:"email"`
		EmailVerified bool   `json:"email_verified"`
		Name          string `json:"name"`
		Picture       string `json:"picture"`
	}
	if err := fetchJSON(ctx, config.UserURL, token, nil, &payload); err != nil {
		return oauthUserInfo{}, err
	}
	return oauthUserInfo{
		Provider:   providerGoogle,
		ProviderID: payload.Sub,
		Email:      strings.ToLower(strings.TrimSpace(payload.Email)),
		Name:       strings.TrimSpace(payload.Name),
		AvatarURL:  strings.TrimSpace(payload.Picture),
		Verified:   payload.EmailVerified,
	}, nil
}

func fetchGitHubUser(ctx context.Context, config oauthConfig, token string) (oauthUserInfo, error) {
	var user struct {
		ID        int64  `json:"id"`
		Name      string `json:"name"`
		Login     string `json:"login"`
		AvatarURL string `json:"avatar_url"`
		Email     string `json:"email"`
	}
	if err := fetchJSON(ctx, config.UserURL, token, config.ProfileHeader, &user); err != nil {
		return oauthUserInfo{}, err
	}
	if user.Email != "" {
		return oauthUserInfo{
			Provider:   providerGitHub,
			ProviderID: strconv.FormatInt(user.ID, 10),
			Email:      strings.ToLower(strings.TrimSpace(user.Email)),
			Name:       strings.TrimSpace(firstNonEmpty(user.Name, user.Login)),
			AvatarURL:  strings.TrimSpace(user.AvatarURL),
			Verified:   true,
		}, nil
	}

	var emails []struct {
		Email    string `json:"email"`
		Verified bool   `json:"verified"`
		Primary  bool   `json:"primary"`
	}
	if err := fetchJSON(ctx, config.EmailURL, token, config.ProfileHeader, &emails); err != nil {
		return oauthUserInfo{}, err
	}
	selected := ""
	verified := false
	for _, item := range emails {
		if item.Primary && item.Verified {
			selected = item.Email
			verified = true
			break
		}
	}
	if selected == "" {
		for _, item := range emails {
			if item.Verified {
				selected = item.Email
				verified = true
				break
			}
		}
	}
	return oauthUserInfo{
		Provider:   providerGitHub,
		ProviderID: strconv.FormatInt(user.ID, 10),
		Email:      strings.ToLower(strings.TrimSpace(selected)),
		Name:       strings.TrimSpace(firstNonEmpty(user.Name, user.Login)),
		AvatarURL:  strings.TrimSpace(user.AvatarURL),
		Verified:   verified,
	}, nil
}

func fetchJSON(ctx context.Context, endpoint, token string, headers map[string]string, out any) error {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, endpoint, nil)
	if err != nil {
		return err
	}
	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Accept", "application/json")
	for key, value := range headers {
		req.Header.Set(key, value)
	}
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return fmt.Errorf("oauth fetch failed: %s", resp.Status)
	}
	return json.NewDecoder(io.LimitReader(resp.Body, 1<<20)).Decode(out)
}

func sanitizeNextPath(raw string) string {
	raw = strings.TrimSpace(raw)
	if raw == "" || !strings.HasPrefix(raw, "/") || strings.HasPrefix(raw, "//") {
		return "/dashboard"
	}
	return raw
}

func setOAuthStateCookie(w http.ResponseWriter, payload oauthStatePayload) {
	data, _ := json.Marshal(payload)
	encoded := base64.RawURLEncoding.EncodeToString(data)
	http.SetCookie(w, &http.Cookie{
		Name:     oauthCookieName,
		Value:    encoded,
		Path:     getEnvOrFallback("AUTH_COOKIE_PATH", "/"),
		Domain:   getEnvOrFallback("AUTH_COOKIE_DOMAIN", ""),
		Expires:  time.Now().Add(oauthStateTTL),
		MaxAge:   int(oauthStateTTL.Seconds()),
		HttpOnly: true,
		Secure:   getEnvBool("AUTH_COOKIE_SECURE", false),
		SameSite: getSameSiteMode(getEnvOrFallback("AUTH_COOKIE_SAMESITE", "lax")),
	})
}

func clearOAuthStateCookie(w http.ResponseWriter) {
	http.SetCookie(w, &http.Cookie{
		Name:     oauthCookieName,
		Value:    "",
		Path:     getEnvOrFallback("AUTH_COOKIE_PATH", "/"),
		Domain:   getEnvOrFallback("AUTH_COOKIE_DOMAIN", ""),
		Expires:  time.Unix(0, 0),
		MaxAge:   -1,
		HttpOnly: true,
		Secure:   getEnvBool("AUTH_COOKIE_SECURE", false),
		SameSite: getSameSiteMode(getEnvOrFallback("AUTH_COOKIE_SAMESITE", "lax")),
	})
}

func readOAuthStateCookie(r *http.Request) (oauthStatePayload, error) {
	cookie, err := r.Cookie(oauthCookieName)
	if err != nil || cookie.Value == "" {
		return oauthStatePayload{}, errors.New("oauth state cookie missing")
	}
	raw, err := base64.RawURLEncoding.DecodeString(cookie.Value)
	if err != nil {
		return oauthStatePayload{}, err
	}
	var payload oauthStatePayload
	if err := json.Unmarshal(raw, &payload); err != nil {
		return oauthStatePayload{}, err
	}
	if payload.IssuedAt == 0 || time.Since(time.Unix(payload.IssuedAt, 0)) > oauthStateTTL {
		return oauthStatePayload{}, errors.New("oauth state expired")
	}
	return payload, nil
}

func randomToken(length int) (string, error) {
	buf := make([]byte, length)
	if _, err := rand.Read(buf); err != nil {
		return "", err
	}
	return base64.RawURLEncoding.EncodeToString(buf), nil
}

func firstNonEmpty(values ...string) string {
	for _, value := range values {
		trimmed := strings.TrimSpace(value)
		if trimmed != "" {
			return trimmed
		}
	}
	return ""
}

func emptyToNil(value string) any {
	trimmed := strings.TrimSpace(value)
	if trimmed == "" {
		return nil
	}
	return trimmed
}

func (h *AuthHandler) redirectOAuthFailure(w http.ResponseWriter, r *http.Request, nextPath, code string) {
	target := sanitizeNextPath(nextPath)
	separator := "?"
	if strings.Contains(target, "?") {
		separator = "&"
	}
	http.Redirect(w, r, buildFrontendRedirectURL(target+separator+"auth_error="+url.QueryEscape(code)), http.StatusFound)
}

func buildFrontendRedirectURL(path string) string {
	frontendURL := strings.TrimRight(getEnvOrFallback("FRONTEND_URL", "http://localhost:3006"), "/")
	if path == "" {
		path = "/dashboard"
	}
	if strings.HasPrefix(path, "http://") || strings.HasPrefix(path, "https://") {
		return frontendURL + "/dashboard"
	}
	if !strings.HasPrefix(path, "/") {
		path = "/" + path
	}
	return frontendURL + path
}
