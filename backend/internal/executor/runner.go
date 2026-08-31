package executor

import (
	"bytes"
	"context"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"

	"github.com/google/uuid"
)

// Result holds the output of a code execution.
type Result struct {
	Stdout          string `json:"stdout"`
	Stderr          string `json:"stderr"`
	ExecutionTimeMs int64  `json:"executionTimeMs"`
	TimedOut        bool   `json:"timedOut"`
}

// semaphore limits concurrent code executions to avoid resource exhaustion.
var semaphore = make(chan struct{}, 2)

func Run(code string) Result {
	select {
	case semaphore <- struct{}{}:
		defer func() { <-semaphore }()
	default:
		return Result{Stderr: "error: executor is busy, try again in a moment"}
	}

	// Sanitize: block dangerous patterns
	if containsDangerous(code) {
		return Result{Stderr: "error: forbidden syscall or import detected"}
	}

	id := uuid.New().String()
	dir := filepath.Join(os.TempDir(), "golearn-"+id)
	if err := os.MkdirAll(dir, 0750); err != nil {
		return Result{Stderr: "internal error: cannot create temp dir"}
	}
	defer os.RemoveAll(dir)

	srcFile := filepath.Join(dir, "main.go")
	if err := os.WriteFile(srcFile, []byte(code), 0600); err != nil {
		return Result{Stderr: "internal error: cannot write source"}
	}

	// Give `go run` a bit more room on cold start while still preventing abuse.
	ctx, cancel := context.WithTimeout(context.Background(), 8*time.Second)
	defer cancel()

	var stdout, stderr bytes.Buffer
	cmd := exec.CommandContext(ctx, "go", "run", srcFile)
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr
	cmd.Dir = dir

	start := time.Now()
	err := cmd.Run()
	elapsed := time.Since(start).Milliseconds()

	timedOut := ctx.Err() == context.DeadlineExceeded

	if err != nil && !timedOut {
		return Result{
			Stdout:          capOutput(stdout.String()),
			Stderr:          capOutput(stderr.String()),
			ExecutionTimeMs: elapsed,
			TimedOut:        false,
		}
	}

	return Result{
		Stdout:          capOutput(stdout.String()),
		Stderr:          capOutput(stderr.String()),
		ExecutionTimeMs: elapsed,
		TimedOut:        timedOut,
	}
}

// containsDangerous checks the submitted code against a blocklist of dangerous patterns.
// NOTE: dangerousPatterns below is the enforced list; the inline slice inside containsDangerous
// is intentionally more targeted and takes precedence.
var dangerousPatterns = []string{
	"os/exec", "syscall", "unsafe", "plugin", "cgo",
}

func containsDangerous(code string) bool {
	lower := strings.ToLower(code)
	for _, p := range dangerousPatterns {
		if strings.Contains(lower, strings.ToLower(p)) {
			return true
		}
	}
	return false
}

func capOutput(s string) string {
	const max = 12000
	if len(s) <= max {
		return s
	}
	return s[:max] + "\n... output truncated ..."
}

// Templates returns pre-built code snippet templates.
func Templates() []map[string]string {
	return []map[string]string{
		{"name": "Hello World", "slug": "hello-world", "code": helloWorld},
		{"name": "Goroutine", "slug": "goroutine", "code": goroutine},
		{"name": "Channel", "slug": "channel", "code": channel},
		{"name": "HTTP Server", "slug": "http-server", "code": httpServer},
		{"name": "JSON Marshal", "slug": "json-marshal", "code": jsonMarshal},
		{"name": "Sort Slice", "slug": "sort-slice", "code": sortSlice},
	}
}

const helloWorld = `package main

import "fmt"

func main() {
	fmt.Println("Hello, GoLearn! 🚀")
}
`

const goroutine = `package main

import (
	"fmt"
	"sync"
)

func worker(id int, wg *sync.WaitGroup) {
	defer wg.Done()
	fmt.Printf("Worker %d starting\n", id)
	// simulate work
	fmt.Printf("Worker %d done\n", id)
}

func main() {
	var wg sync.WaitGroup
	for i := 1; i <= 3; i++ {
		wg.Add(1)
		go worker(i, &wg)
	}
	wg.Wait()
	fmt.Println("All workers done")
}
`

const channel = `package main

import "fmt"

func sum(s []int, c chan int) {
	total := 0
	for _, v := range s {
		total += v
	}
	c <- total
}

func main() {
	s := []int{7, 2, 8, -9, 4, 0}
	c := make(chan int)
	go sum(s[:len(s)/2], c)
	go sum(s[len(s)/2:], c)
	x, y := <-c, <-c
	fmt.Println(x, y, x+y)
}
`

const httpServer = `package main

import (
	"fmt"
	"net/http"
)

func handler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "Hello from GoLearn server!")
}

func main() {
	http.HandleFunc("/", handler)
	fmt.Println("Server starting on :8080")
	// http.ListenAndServe(":8080", nil)
}
`

const jsonMarshal = `package main

import (
	"encoding/json"
	"fmt"
)

type Person struct {
	Name string ` + "`json:\"name\"`" + `
	Age  int    ` + "`json:\"age\"`" + `
	City string ` + "`json:\"city,omitempty\"`" + `
}

func main() {
	p := Person{Name: "Kahfi", Age: 25, City: "Jakarta"}
	b, _ := json.Marshal(p)
	fmt.Println(string(b))

	var p2 Person
	json.Unmarshal(b, &p2)
	fmt.Printf("Name: %s, Age: %d\n", p2.Name, p2.Age)
}
`

const sortSlice = `package main

import (
	"fmt"
	"sort"
)

func main() {
	nums := []int{5, 2, 8, 1, 9, 3}
	sort.Ints(nums)
	fmt.Println("Sorted ints:", nums)

	words := []string{"banana", "apple", "cherry"}
	sort.Strings(words)
	fmt.Println("Sorted strings:", words)

	type Person struct{ Name string; Age int }
	people := []Person{{"Budi", 30}, {"Ani", 25}, {"Citra", 28}}
	sort.Slice(people, func(i, j int) bool {
		return people[i].Age < people[j].Age
	})
	for _, p := range people {
		fmt.Printf("%s: %d\n", p.Name, p.Age)
	}
}
`
