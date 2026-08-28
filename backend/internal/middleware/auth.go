package middleware

import (
	"context"
	"net/http"
	"os"
	"strings"

	"github.com/golang-jwt/jwt/v5"
)

type contextKey string

const UserIDKey contextKey = "userID"

type AuthMiddleware struct {
	secret string
}

func NewAuthMiddleware(secret string) *AuthMiddleware {
	return &AuthMiddleware{secret: secret}
}

func (m *AuthMiddleware) Authenticate(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		tokenStr := ""

		// 1. Try Authorization header
		if auth := r.Header.Get("Authorization"); strings.HasPrefix(auth, "Bearer ") {
			tokenStr = strings.TrimPrefix(auth, "Bearer ")
		}

		// 2. Try cookie
		if tokenStr == "" {
			cookieName := os.Getenv("AUTH_COOKIE_NAME")
			if cookieName == "" {
				cookieName = "access_token"
			}
			if cookie, err := r.Cookie(cookieName); err == nil {
				tokenStr = cookie.Value
			}
		}

		if tokenStr == "" {
			http.Error(w, `{"error":"unauthorized"}`, http.StatusUnauthorized)
			return
		}

		token, err := jwt.Parse(tokenStr, func(t *jwt.Token) (interface{}, error) {
			if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, jwt.ErrSignatureInvalid
			}
			return []byte(m.secret), nil
		})
		if err != nil || !token.Valid {
			http.Error(w, `{"error":"invalid token"}`, http.StatusUnauthorized)
			return
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			http.Error(w, `{"error":"invalid claims"}`, http.StatusUnauthorized)
			return
		}

		userID, ok := claims["sub"].(string)
		if !ok {
			http.Error(w, `{"error":"invalid subject"}`, http.StatusUnauthorized)
			return
		}

		ctx := context.WithValue(r.Context(), UserIDKey, userID)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

// GetUserID extracts user ID from request context.
func GetUserID(r *http.Request) string {
	if id, ok := r.Context().Value(UserIDKey).(string); ok {
		return id
	}
	return ""
}
