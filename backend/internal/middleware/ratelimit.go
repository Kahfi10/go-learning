package middleware

import (
	"net"
	"net/http"
	"sync"
	"time"
)

type visitor struct {
	count   int
	resetAt time.Time
}

type RateLimiter struct {
	mu       sync.Mutex
	max      int
	window   time.Duration
	visitors map[string]visitor
}

func NewRateLimiter(max int, window time.Duration) *RateLimiter {
	return &RateLimiter{
		max:      max,
		window:   window,
		visitors: map[string]visitor{},
	}
}

func (l *RateLimiter) Middleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ip := clientIP(r)
		now := time.Now()

		l.mu.Lock()
		entry := l.visitors[ip]
		if now.After(entry.resetAt) {
			entry = visitor{count: 0, resetAt: now.Add(l.window)}
		}
		entry.count++
		l.visitors[ip] = entry
		l.mu.Unlock()

		if entry.count > l.max {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusTooManyRequests)
			_, _ = w.Write([]byte(`{"error":"rate limit exceeded"}`))
			return
		}

		next.ServeHTTP(w, r)
	})
}

func clientIP(r *http.Request) string {
	host, _, err := net.SplitHostPort(r.RemoteAddr)
	if err == nil && host != "" {
		return host
	}
	return r.RemoteAddr
}
