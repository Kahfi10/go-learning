package main

import (
	"log"
	"net/http"
	"os"
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

	r := chi.NewRouter()

	// Global middleware
	r.Use(chimiddleware.Logger)
	r.Use(chimiddleware.Recoverer)
	r.Use(chimiddleware.Timeout(30 * time.Second))
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{getEnv("FRONTEND_URL", "http://localhost:3006")},
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
		r.Post("/register", authH.Register)
		r.Post("/login", authH.Login)
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
	r.Post("/api/execute", executorH.Execute)
	r.Get("/api/playground/templates", executorH.Templates)

	// Protected routes
	r.Group(func(r chi.Router) {
		r.Use(authMiddleware.Authenticate)
		r.Get("/api/progress", progressH.GetProgress)
		r.Put("/api/progress/{topic}/{lesson}", progressH.UpdateProgress)
		r.Post("/api/quiz/{lessonID}/submit", progressH.SubmitQuiz)
		r.Get("/api/me/stats", progressH.GetStats)
		r.Get("/api/badges", progressH.GetBadges)
	})

	// Leaderboard & Discussion (public read, auth write)
	r.Get("/api/leaderboard", leaderboardH.GetLeaderboard)
	r.Route("/api/discussions", func(r chi.Router) {
		r.Get("/{topic}/{lesson}", discussionH.GetComments)
		r.With(authMiddleware.Authenticate).Post("/", discussionH.CreateComment)
		r.With(authMiddleware.Authenticate).Post("/{id}/upvote", discussionH.ToggleUpvote)
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
