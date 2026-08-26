package db

import (
	"context"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"

	"github.com/jackc/pgx/v5/pgxpool"
)

// Connect creates a PostgreSQL connection pool.
func Connect(dbURL string) (*pgxpool.Pool, error) {
	if dbURL == "" {
		return nil, fmt.Errorf("DB_URL is not set")
	}
	pool, err := pgxpool.New(context.Background(), dbURL)
	if err != nil {
		return nil, fmt.Errorf("unable to create connection pool: %w", err)
	}
	if err := pool.Ping(context.Background()); err != nil {
		return nil, fmt.Errorf("unable to reach database: %w", err)
	}
	return pool, nil
}

func RunMigrations(pool *pgxpool.Pool, dir string) error {
	files, err := filepath.Glob(filepath.Join(dir, "*.sql"))
	if err != nil {
		return fmt.Errorf("failed to list migrations: %w", err)
	}
	sort.Strings(files)

	for _, file := range files {
		content, err := os.ReadFile(file)
		if err != nil {
			return fmt.Errorf("failed to read migration %s: %w", file, err)
		}

		statements := splitStatements(string(content))
		for _, stmt := range statements {
			if _, err := pool.Exec(context.Background(), stmt); err != nil {
				return fmt.Errorf("failed to execute migration %s: %w", filepath.Base(file), err)
			}
		}
	}

	return nil
}

func splitStatements(sql string) []string {
	lines := strings.Split(sql, "\n")
	filtered := make([]string, 0, len(lines))
	for _, line := range lines {
		trimmed := strings.TrimSpace(line)
		if strings.HasPrefix(trimmed, "--") || trimmed == "" {
			continue
		}
		filtered = append(filtered, line)
	}

	rawStatements := strings.Split(strings.Join(filtered, "\n"), ";")
	statements := make([]string, 0, len(rawStatements))
	for _, stmt := range rawStatements {
		trimmed := strings.TrimSpace(stmt)
		if trimmed == "" {
			continue
		}
		statements = append(statements, trimmed)
	}
	return statements
}
