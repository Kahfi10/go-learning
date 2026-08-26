"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { api, type ActivityItem, type LessonResumeState, type ProgressItem } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const LOCAL_KEY = "golearn_progress";
const RESUME_KEY = "golearn_resume";
const BOOKMARKS_KEY = "golearn_bookmarks";

interface ContinueLearningItem {
  topic: string;
  lesson: string;
  viewedAt?: string;
}

interface TopicRecommendationItem {
  topic: string;
  reason: string;
}

interface BookmarkState {
	topics: string[];
	lessons: string[];
}

type ResumeMap = Record<string, LessonResumeState>;

function isSameResumeState(a: LessonResumeState, b: LessonResumeState) {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const key of keys) {
    if (a[key as keyof LessonResumeState] !== b[key as keyof LessonResumeState]) {
      return false;
    }
  }
  return true;
}

function loadLocal(): Record<string, ProgressItem> {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(LOCAL_KEY) ?? "{}"); } catch { return {}; }
}

function loadResume(): ResumeMap {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(RESUME_KEY) ?? "{}"); } catch { return {}; }
}

function loadBookmarks(): BookmarkState {
  if (typeof window === "undefined") return { topics: [], lessons: [] };
  try {
    const parsed = JSON.parse(localStorage.getItem(BOOKMARKS_KEY) ?? "{}");
    return {
      topics: Array.isArray(parsed.topics) ? parsed.topics : [],
      lessons: Array.isArray(parsed.lessons) ? parsed.lessons : [],
    };
  } catch {
    return { topics: [], lessons: [] };
  }
}

export function useProgress() {
  const { state } = useAuth();
  const [progress, setProgress] = useState<Record<string, ProgressItem>>(loadLocal);
  const [resume, setResume] = useState<ResumeMap>(loadResume);
  const [bookmarks, setBookmarks] = useState<BookmarkState>(loadBookmarks);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const draftSyncTimersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const persistBookmarks = useCallback((next: BookmarkState) => {
    setBookmarks(next);
    if (typeof window !== "undefined") {
      localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(next));
    }
  }, []);

  const syncBookmarksFromProgress = useCallback((source: Record<string, ProgressItem>) => {
    const nextTopics = new Set<string>();
    const nextLessons = new Set<string>();

    Object.entries(source).forEach(([key, value]) => {
      const [topic, lesson] = key.split("/");
      if (value.topic_bookmarked) nextTopics.add(topic);
      if (value.lesson_bookmarked) nextLessons.add(`${topic}/${lesson}`);
    });

    persistBookmarks({ topics: Array.from(nextTopics), lessons: Array.from(nextLessons) });
  }, [persistBookmarks]);

  const persistResume = useCallback((updater: ResumeMap | ((prev: ResumeMap) => ResumeMap)) => {
    setResume((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      if (next === prev) return prev;
      if (typeof window !== "undefined") {
        localStorage.setItem(RESUME_KEY, JSON.stringify(next));
      }
      return next;
    });
  }, []);

  useEffect(() => {
    if (state.user) {
      api.progress.get().then((data) => {
        setProgress(data);
        localStorage.setItem(LOCAL_KEY, JSON.stringify(data));
        syncBookmarksFromProgress(data);
        if (typeof window !== "undefined") {
          Object.entries(data).forEach(([key, value]) => {
            if (value.last_code) {
              const [topic, lesson] = key.split("/");
              const localKey = `${topic}_${lesson}_code`;
              if (!localStorage.getItem(localKey)) {
                localStorage.setItem(localKey, value.last_code);
              }
            }
          });
        }
      }).catch(() => {});

      api.progress.activity().then((items) => {
        setActivity(items ?? []);
      }).catch(() => {
        setActivity([]);
      });
    }
  }, [state.user, syncBookmarksFromProgress]);

  const isCompleted = useCallback((topic: string, lesson: string) => {
    return progress[`${topic}/${lesson}`]?.completed ?? false;
  }, [progress]);

  const getResumeState = useCallback((topic: string, lesson: string): LessonResumeState => {
    return resume[`${topic}/${lesson}`] ?? {};
  }, [resume]);

  const saveResumeState = useCallback((topic: string, lesson: string, patch: Partial<LessonResumeState>) => {
    const key = `${topic}/${lesson}`;
    persistResume((prev) => {
      const current = prev[key] ?? {};
      const nextEntry = {
        ...current,
        ...patch,
        viewedAt: patch.viewedAt ?? current.viewedAt ?? new Date().toISOString(),
      };

      if (isSameResumeState(current, nextEntry)) {
        return prev;
      }

      return {
        ...prev,
        [key]: nextEntry,
      };
    });
  }, [persistResume]);

  const markLessonViewed = useCallback((topic: string, lesson: string) => {
    saveResumeState(topic, lesson, { viewedAt: new Date().toISOString() });
    if (state.user) {
      api.progress.update(topic, lesson, { mark_viewed: true }).catch(() => {});
    }
  }, [saveResumeState, state.user]);

  const topicProgress = useCallback((topicSlug: string, totalLessons: number) => {
    const done = Object.entries(progress).filter(
      ([key, v]) => key.startsWith(`${topicSlug}/`) && v.completed
    ).length;
    return { done, total: totalLessons, pct: totalLessons ? Math.round((done / totalLessons) * 100) : 0 };
  }, [progress]);

  const lessonState = useCallback((topic: string, lesson: string) => {
    const completed = isCompleted(topic, lesson);
    const state = getResumeState(topic, lesson);
    if (completed) return "completed" as const;
    if (state.viewedAt || getLastCode(topic, lesson)) return "in_progress" as const;
    return "not_started" as const;
  }, [getResumeState, isCompleted]);

  const markComplete = useCallback(async (topic: string, lesson: string, code?: string) => {
    const key = `${topic}/${lesson}`;
    const completedAt = new Date().toISOString();
    setProgress((prev) => {
      const updated = {
        ...prev,
        [key]: {
          ...prev[key],
          completed: true,
          completed_at: prev[key]?.completed_at ?? completedAt,
        },
      };
      localStorage.setItem(LOCAL_KEY, JSON.stringify(updated));
      return updated;
    });
    saveResumeState(topic, lesson, { viewedAt: new Date().toISOString() });
    if (state.user) {
      await api.progress.update(topic, lesson, { completed: true, last_code: code, mark_viewed: true }).catch(() => {});
    }
  }, [saveResumeState, state.user]);

  const getLastCode = useCallback((topic: string, lesson: string): string | undefined => {
    const key = `${topic}_${lesson}_code`;
    if (typeof window !== "undefined") {
      const local = localStorage.getItem(key);
      if (local) return local;
    }
    return progress[`${topic}/${lesson}`]?.last_code ?? undefined;
  }, [progress]);

  const saveCode = useCallback((topic: string, lesson: string, code: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(`${topic}_${lesson}_code`, code);
    }
    saveResumeState(topic, lesson, { viewedAt: new Date().toISOString() });
    setProgress((prev) => {
      const key = `${topic}/${lesson}`;
      const updated = {
        ...prev,
        [key]: {
          ...prev[key],
          completed: prev[key]?.completed ?? false,
          last_code: code,
        },
      };
      localStorage.setItem(LOCAL_KEY, JSON.stringify(updated));
      return updated;
    });
    if (state.user) {
      const syncKey = `${topic}/${lesson}`;
      const existingTimer = draftSyncTimersRef.current[syncKey];
      if (existingTimer) {
        clearTimeout(existingTimer);
      }
      draftSyncTimersRef.current[syncKey] = setTimeout(() => {
        api.progress.update(topic, lesson, { last_code: code }).catch(() => {});
        delete draftSyncTimersRef.current[syncKey];
      }, 700);
    }
  }, [saveResumeState, state.user]);

  useEffect(() => {
    return () => {
      Object.values(draftSyncTimersRef.current).forEach((timer) => clearTimeout(timer));
    };
  }, []);

  const toggleTopicBookmark = useCallback(async (topic: string) => {
    const isBookmarked = bookmarks.topics.includes(topic);
    const next = isBookmarked
      ? { ...bookmarks, topics: bookmarks.topics.filter((item) => item !== topic) }
      : { ...bookmarks, topics: [...bookmarks.topics, topic] };
    persistBookmarks(next);

    setProgress((prev) => {
      const entries = Object.entries(prev).filter(([key]) => key.startsWith(`${topic}/`));
      if (entries.length === 0) return prev;
      const updated = { ...prev };
      entries.forEach(([key, value]) => {
        updated[key] = { ...value, topic_bookmarked: !isBookmarked };
      });
      localStorage.setItem(LOCAL_KEY, JSON.stringify(updated));
      return updated;
    });

    if (state.user) {
      await api.progress.update(topic, "01", { topic_bookmarked: !isBookmarked }).catch(() => {});
    }
  }, [bookmarks, persistBookmarks, state.user]);

  const toggleLessonBookmark = useCallback(async (topic: string, lesson: string) => {
    const key = `${topic}/${lesson}`;
    const isBookmarked = bookmarks.lessons.includes(key);
    const next = isBookmarked
      ? { ...bookmarks, lessons: bookmarks.lessons.filter((item) => item !== key) }
      : { ...bookmarks, lessons: [...bookmarks.lessons, key] };
    persistBookmarks(next);

    setProgress((prev) => {
      const updated = {
        ...prev,
        [key]: {
          ...prev[key],
          completed: prev[key]?.completed ?? false,
          lesson_bookmarked: !isBookmarked,
        },
      };
      localStorage.setItem(LOCAL_KEY, JSON.stringify(updated));
      return updated;
    });

    if (state.user) {
      await api.progress.update(topic, lesson, { lesson_bookmarked: !isBookmarked }).catch(() => {});
    }
  }, [bookmarks, persistBookmarks, state.user]);

  const isTopicBookmarked = useCallback((topic: string) => bookmarks.topics.includes(topic), [bookmarks.topics]);
  const isLessonBookmarked = useCallback((topic: string, lesson: string) => bookmarks.lessons.includes(`${topic}/${lesson}`), [bookmarks.lessons]);

  const getRecentActivity = useCallback((limit = 5) => activity.slice(0, limit), [activity]);

  const getContinueLearning = useCallback((): ContinueLearningItem | null => {
    const items = Object.entries(resume)
      .filter(([key]) => !progress[key]?.completed)
      .sort((a, b) => {
        const aViewed = a[1]?.viewedAt ? new Date(a[1].viewedAt).getTime() : 0;
        const bViewed = b[1]?.viewedAt ? new Date(b[1].viewedAt).getTime() : 0;
        return bViewed - aViewed;
      });

    const [key, value] = items[0] ?? [];
    if (!key) return null;
    const [topic, lesson] = key.split("/");
    return { topic, lesson, viewedAt: value?.viewedAt };
  }, [progress, resume]);

  const getRecommendedTopic = useCallback((orderedTopics: string[]): TopicRecommendationItem | null => {
    const continueItem = getContinueLearning();
    if (continueItem) {
      return { topic: continueItem.topic, reason: "Lanjutkan dari progress terakhir" };
    }

    const bookmarkedTopic = orderedTopics.find((topic) => bookmarks.topics.includes(topic));
    if (bookmarkedTopic) {
      return { topic: bookmarkedTopic, reason: "Topik yang sudah kamu simpan" };
    }

    const firstUntouched = orderedTopics.find((topic) => {
      const entries = Object.entries(progress).filter(([key]) => key.startsWith(`${topic}/`));
      return entries.length === 0 || entries.some(([, value]) => !value.completed);
    });

    if (firstUntouched) {
      return { topic: firstUntouched, reason: "Langkah berikutnya di kurikulum" };
    }

    return orderedTopics[0] ? { topic: orderedTopics[0], reason: "Ulangi dari topik awal" } : null;
  }, [bookmarks.topics, getContinueLearning, progress]);

  const getRecentlyViewed = useCallback((limit = 5): ContinueLearningItem[] => {
    return Object.entries(resume)
      .filter(([, value]) => Boolean(value?.viewedAt))
      .sort((a, b) => {
        const aViewed = a[1]?.viewedAt ? new Date(a[1].viewedAt).getTime() : 0;
        const bViewed = b[1]?.viewedAt ? new Date(b[1].viewedAt).getTime() : 0;
        return bViewed - aViewed;
      })
      .slice(0, limit)
      .map(([key, value]) => {
        const [topic, lesson] = key.split("/");
        return { topic, lesson, viewedAt: value?.viewedAt };
      });
  }, [resume]);

  return {
    progress,
    resume,
    bookmarks,
    activity,
    isCompleted,
    topicProgress,
    lessonState,
    markComplete,
    getLastCode,
    saveCode,
    getResumeState,
    saveResumeState,
    markLessonViewed,
    isTopicBookmarked,
    isLessonBookmarked,
    toggleTopicBookmark,
    toggleLessonBookmark,
    getRecentActivity,
    getContinueLearning,
    getRecommendedTopic,
    getRecentlyViewed,
  };
}
