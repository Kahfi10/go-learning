const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8081";

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? "Request failed");
  }
  return res.json();
}

// ── Auth ──────────────────────────────────────────────────
export const api = {
  auth: {
    register: (data: { name: string; email: string; password: string }) =>
      request("/api/auth/register", { method: "POST", body: JSON.stringify(data) }),
    login: (data: { email: string; password: string }) =>
      request("/api/auth/login", { method: "POST", body: JSON.stringify(data) }),
    logout: () => request("/api/auth/logout", { method: "POST" }),
    me: () => request<UserProfile>("/api/auth/me"),
    updateMe: (data: { name?: string; lang_pref?: string }) =>
      request("/api/auth/me", { method: "PATCH", body: JSON.stringify(data) }),
  },
  topics: {
    list: () => request<Topic[]>("/api/topics"),
    get: (slug: string) => request<TopicDetail>(`/api/topics/${slug}`),
    getLesson: (slug: string, id: string) =>
      request<Lesson>(`/api/topics/${slug}/lessons/${id}`),
  },
  search: (q: string) => request<SearchResult[]>(`/api/search?q=${encodeURIComponent(q)}`),
  execute: (code: string) =>
    request<ExecuteResult>("/api/execute", { method: "POST", body: JSON.stringify({ code }) }),
  playground: {
    templates: () => request<Template[]>("/api/playground/templates"),
  },
  progress: {
    get: () => request<Record<string, ProgressItem>>("/api/progress"),
    update: (topic: string, lesson: string, data: { completed: boolean; last_code?: string }) =>
      request(`/api/progress/${topic}/${lesson}`, { method: "PUT", body: JSON.stringify(data) }),
    submitQuiz: (lessonId: string, data: { score: number; topic_slug: string; total_questions?: number }) =>
      request(`/api/quiz/${lessonId}/submit`, { method: "POST", body: JSON.stringify(data) }),
    stats: () => request<UserStats>("/api/me/stats"),
    badges: () => request<Badge[]>("/api/badges"),
  },
  leaderboard: (period: "alltime" | "month" | "week" = "alltime") =>
    request<LeaderboardEntry[]>(`/api/leaderboard?period=${period}`),
  discussions: {
    get: (topic: string, lesson: string, sort?: string) =>
      request<Comment[]>(`/api/discussions/${topic}/${lesson}${sort ? `?sort=${sort}` : ""}`),
    create: (data: { topic_slug: string; lesson_id: string; content: string; parent_id?: string }) =>
      request("/api/discussions", { method: "POST", body: JSON.stringify(data) }),
    upvote: (id: string) =>
      request(`/api/discussions/${id}/upvote`, { method: "POST" }),
    delete: (id: string) =>
      request(`/api/discussions/${id}`, { method: "DELETE" }),
  },
};

// ── Types ─────────────────────────────────────────────────
export interface UserProfile {
  id: string; name: string; email: string;
  avatar_url?: string; lang_pref: "id" | "en";
  xp: number; streak: number; token?: string;
}
export interface UserStats {
  xp: number; level: number; streak_days: number; lessons_completed: number;
}
export interface Topic {
  slug: string; number: number; title_id: string; title_en: string;
  description_id: string; description_en: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  color: string; estimatedMinutes: number;
  lessons?: LessonMeta[];
}
export interface LessonMeta {
  id: string; title_id: string; title_en: string; estimatedMinutes: number;
}
export interface TopicDetail extends Topic { lessons: LessonMeta[]; }
export interface QuizOption { question_id: string; question_en: string; options_id: string[]; options_en: string[]; correct: number; }
export interface Lesson {
  id: string; title_id: string; title_en: string; estimatedMinutes: number;
  content_id: string; content_en: string; starterCode: string; quiz: QuizOption[];
}
export interface ExecuteResult { stdout: string; stderr: string; executionTimeMs: number; timedOut: boolean; }
export interface Template { name: string; slug: string; code: string; }
export interface ProgressItem {
  completed: boolean;
  best_quiz_score?: number;
  last_code?: string;
  completed_at?: string;
}
export interface LessonResumeState {
  lang?: "id" | "en";
  activeTab?: "content" | "discussion";
  hasOpenedQuiz?: boolean;
  hasRunCode?: boolean;
  viewedAt?: string;
  scrollY?: number;
  lastQuizScore?: number;
  totalQuestions?: number;
}
export interface Badge {
  slug: string; name_id: string; name_en: string;
  description_id: string; description_en: string;
  icon: string; earned: boolean; earned_at?: string;
}
export interface LeaderboardEntry {
  rank: number; id: string; name: string; avatar_url?: string;
  xp: number; level: number; streak_days: number; lessons_done: number;
}
export interface Comment {
  id: string; user_id: string; user_name: string; avatar_url?: string;
  content: string; upvotes: number; is_pinned: boolean;
  parent_id?: string; created_at: string;
}
export interface SearchResult { type: string; id: string; title_id: string; title_en: string; topic: string; }
export interface SearchResult {
  type: string;
  id: string;
  title_id: string;
  title_en: string;
  topic: string;
  topic_slug?: string;
  topic_title_id?: string;
  topic_title_en?: string;
}
