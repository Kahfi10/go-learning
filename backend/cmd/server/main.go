package main

import (
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"
	chimiddleware "github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/joho/godotenv"

	"github.com/Kahfi10/go-learning/backend/internal/db"
	"github.com/Kahfi10/go-learning/backend/internal/handler"
	"github.com/Kahfi10/go-learning/backend/internal/middleware"
)

func main() {
	_ = godotenv.Load()

	database, err := db.Connect(os.Getenv("DB_URL"))
	if err != nil {
		log.Fatalf("failed to connect to database: %v", err)
	}
	defer database.Close()

	if err := db.RunMigrations(database, getEnv("MIGRATIONS_DIR", "./internal/db/migrations")); err != nil {
		log.Fatalf("failed to run migrations: %v", err)
	}

	r := chi.NewRouter()
	authLimiter := middleware.NewRateLimiter(8, time.Minute)
	registerLimiter := middleware.NewRateLimiter(5, time.Minute)
	executorLimiter := middleware.NewRateLimiter(10, time.Minute)
	discussionLimiter := middleware.NewRateLimiter(20, time.Minute)

	// Global middleware
	r.Use(chimiddleware.Logger)
	r.Use(chimiddleware.Recoverer)
	r.Use(chimiddleware.Timeout(30 * time.Second))
	r.Use(middleware.SecurityHeaders)
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   getAllowedOrigins(getEnv("FRONTEND_URL", "http://localhost:3006")),
		AllowedMethods:   []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	// Handlers
	authH := handler.NewAuthHandler(database)
	topicsH := handler.NewTopicsHandler()
	progressH := handler.NewProgressHandler(database)
	executorH := handler.NewExecutorHandler()
	leaderboardH := handler.NewLeaderboardHandler(database)
	discussionH := handler.NewDiscussionHandler(database)

	// Auth middleware
	authMiddleware := middleware.NewAuthMiddleware(os.Getenv("JWT_SECRET"))

	// Routes
	r.Get("/api/health", handler.Health)

	// Auth routes
	r.Route("/api/auth", func(r chi.Router) {
		r.Get("/providers", authH.Providers)
		r.With(registerLimiter.Middleware).Post("/register", authH.Register)
		r.With(authLimiter.Middleware).Post("/login", authH.Login)
		r.Post("/logout", authH.Logout)
		r.Post("/refresh", authH.Refresh)
		r.Get("/google", authH.GoogleOAuth)
		r.Get("/google/callback", authH.GoogleCallback)
		r.Get("/github", authH.GitHubOAuth)
		r.Get("/github/callback", authH.GitHubCallback)
		r.With(authMiddleware.Authenticate).Get("/me", authH.Me)
		r.With(authMiddleware.Authenticate).Patch("/me", authH.UpdateMe)
	})

	// Public content routes
	r.Route("/api/topics", func(r chi.Router) {
		r.Get("/", topicsH.ListTopics)
		r.Get("/{slug}", topicsH.GetTopic)
		r.Get("/{slug}/lessons/{lessonID}", topicsH.GetLesson)
	})
	r.Get("/api/search", topicsH.Search)

	// Code executor
	r.With(executorLimiter.Middleware).Post("/api/execute", executorH.Execute)
	r.Get("/api/playground/templates", executorH.Templates)

	// Protected routes
	r.Group(func(r chi.Router) {
		r.Use(authMiddleware.Authenticate)
		r.Get("/api/progress", progressH.GetProgress)
		r.Get("/api/progress/activity", progressH.GetActivity)
		r.Put("/api/progress/{topic}/{lesson}", progressH.UpdateProgress)
		r.Post("/api/quiz/{lessonID}/submit", progressH.SubmitQuiz)
		r.Get("/api/me/stats", progressH.GetStats)
		r.Get("/api/badges", progressH.GetBadges)
	})

	// Leaderboard & Discussion (public read, auth write)
	r.Get("/api/leaderboard", leaderboardH.GetLeaderboard)
	r.Route("/api/discussions", func(r chi.Router) {
		r.Get("/{topic}/{lesson}", discussionH.GetComments)
		r.With(authMiddleware.Authenticate, discussionLimiter.Middleware).Post("/", discussionH.CreateComment)
		r.With(authMiddleware.Authenticate, discussionLimiter.Middleware).Post("/{id}/upvote", discussionH.ToggleUpvote)
		r.With(authMiddleware.Authenticate).Delete("/{id}", discussionH.DeleteComment)
	})

	port := getEnv("PORT", "8081")
	log.Printf("GoLearn API running on :%s", port)
	if err := http.ListenAndServe(":"+port, r); err != nil {
		log.Fatalf("server error: %v", err)
	}
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func getAllowedOrigins(raw string) []string {
	parts := strings.Split(raw, ",")
	origins := make([]string, 0, len(parts))
	for _, part := range parts {
		trimmed := strings.TrimSpace(part)
		if trimmed != "" {
			origins = append(origins, trimmed)
		}
	}
	if len(origins) == 0 {
		return []string{"http://localhost:3006"}
	}
	return origins
}
