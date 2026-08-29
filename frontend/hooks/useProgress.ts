"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { api, type ActivityItem, type LessonResumeState, type ProgressItem } from "@/lib/api";
import { codeStorageKey, legacyCodeStorageKey, LEARNING_STORAGE_KEYS } from "@/lib/clientState";
import { useAuth } from "@/context/AuthContext";

const LOCAL_KEY = LEARNING_STORAGE_KEYS.progress;
const RESUME_KEY = LEARNING_STORAGE_KEYS.resume;
const BOOKMARKS_KEY = LEARNING_STORAGE_KEYS.bookmarks;

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

function latestTimestamp(item?: ProgressItem) {
  const timestamps = [item?.last_viewed_at, item?.completed_at]
    .filter(Boolean)
    .map((value) => new Date(value as string).getTime())
    .filter((value) => Number.isFinite(value));
  return timestamps.length ? Math.max(...timestamps) : 0;
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

function mergeProgressState(local: Record<string, ProgressItem>, remote: Record<string, ProgressItem>) {
  const merged: Record<string, ProgressItem> = { ...remote };

  Object.entries(local).forEach(([key, localItem]) => {
    const remoteItem = remote[key];
    if (!remoteItem) {
      merged[key] = localItem;
      return;
    }

    const localIsNewer = latestTimestamp(localItem) >= latestTimestamp(remoteItem);

    merged[key] = {
      completed: remoteItem.completed || localItem.completed,
      best_quiz_score: Math.max(remoteItem.best_quiz_score ?? 0, localItem.best_quiz_score ?? 0) || undefined,
      last_code: localIsNewer ? (localItem.last_code || remoteItem.last_code) : (remoteItem.last_code || localItem.last_code),
      completed_at: remoteItem.completed_at || localItem.completed_at,
      last_viewed_at: localIsNewer ? (localItem.last_viewed_at || remoteItem.last_viewed_at) : (remoteItem.last_viewed_at || localItem.last_viewed_at),
      topic_bookmarked: localIsNewer
        ? (localItem.topic_bookmarked ?? remoteItem.topic_bookmarked)
        : (remoteItem.topic_bookmarked ?? localItem.topic_bookmarked),
      lesson_bookmarked: localIsNewer
        ? (localItem.lesson_bookmarked ?? remoteItem.lesson_bookmarked)
        : (remoteItem.lesson_bookmarked ?? localItem.lesson_bookmarked),
    };
  });

  return merged;
}

export function useProgress() {
  const { state } = useAuth();
  const [progress, setProgress] = useState<Record<string, ProgressItem>>(loadLocal);
  const [resume, setResume] = useState<ResumeMap>(loadResume);
  const [bookmarks, setBookmarks] = useState<BookmarkState>(loadBookmarks);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const draftSyncTimersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const defaultPassingScore = 70;

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
        const local = loadLocal();
        const merged = mergeProgressState(local, data ?? {});
        setProgress(merged);
        localStorage.setItem(LOCAL_KEY, JSON.stringify(merged));
        syncBookmarksFromProgress(merged);
        if (typeof window !== "undefined") {
          Object.entries(merged).forEach(([key, value]) => {
            if (value.last_code) {
              const [topic, lesson] = key.split("/");
              const localKey = codeStorageKey(topic, lesson);
              const legacyKey = legacyCodeStorageKey(topic, lesson);
              const existing = localStorage.getItem(localKey) ?? localStorage.getItem(legacyKey);
              if (!existing) {
                localStorage.setItem(localKey, value.last_code);
              } else if (localStorage.getItem(legacyKey) && !localStorage.getItem(localKey)) {
                localStorage.setItem(localKey, existing);
                localStorage.removeItem(legacyKey);
              }
            }
          });
        }

        if (state.user) {
          Object.entries(merged).forEach(([key, value]) => {
            const [topic, lesson] = key.split("/");
            const remoteItem = (data ?? {})[key];
            const shouldSyncBack = !remoteItem ||
              value.last_code !== remoteItem.last_code ||
              value.topic_bookmarked !== remoteItem.topic_bookmarked ||
              value.lesson_bookmarked !== remoteItem.lesson_bookmarked ||
              value.completed !== remoteItem.completed;
            if (shouldSyncBack) {
              api.progress.update(topic, lesson, {
                completed: value.completed,
                last_code: value.last_code,
                topic_bookmarked: value.topic_bookmarked,
                lesson_bookmarked: value.lesson_bookmarked,
              }).catch(() => {});
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

  const getBestQuizScore = useCallback((topic: string, lesson: string) => {
    return progress[`${topic}/${lesson}`]?.best_quiz_score ?? 0;
  }, [progress]);

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
    const now = new Date().toISOString();
    saveResumeState(topic, lesson, { viewedAt: now });
    setProgress((prev) => {
      const key = `${topic}/${lesson}`;
      const updated = {
        ...prev,
        [key]: {
          ...prev[key],
          completed: prev[key]?.completed ?? false,
          last_viewed_at: now,
        },
      };
      if (typeof window !== "undefined") {
        localStorage.setItem(LOCAL_KEY, JSON.stringify(updated));
      }
      return updated;
    });
    if (state.user) {
      api.progress.update(topic, lesson, { mark_viewed: true }).catch(() => {});
    }
  }, [saveResumeState, state.user]);

  const hasPassedLesson = useCallback((topic: string, lesson: string, passingScore = defaultPassingScore, totalQuestionsOverride?: number) => {
    const key = `${topic}/${lesson}`;
    const resumeState = getResumeState(topic, lesson);
    const totalQuestions = totalQuestionsOverride ?? resumeState.totalQuestions ?? 0;
    const bestScore = progress[key]?.best_quiz_score ?? resumeState.lastQuizScore ?? 0;

    if (!isCompleted(topic, lesson)) return false;
    if (resumeState.passedQuiz === true) return true;
    if (totalQuestions <= 0) return true;

    return Math.round((bestScore / totalQuestions) * 100) >= passingScore;
  }, [defaultPassingScore, getResumeState, isCompleted, progress]);

  const topicProgress = useCallback((topicSlug: string, totalLessons: number, lessons?: Array<{ id: string; quizCount?: number }>) => {
    const done = lessons?.length
      ? lessons.filter((lesson) => hasPassedLesson(topicSlug, lesson.id, defaultPassingScore, lesson.quizCount)).length
      : Object.entries(progress).filter(([key, value]) => {
          if (!key.startsWith(`${topicSlug}/`) || !value.completed) return false;
          const [, lesson] = key.split("/");
          return hasPassedLesson(topicSlug, lesson, defaultPassingScore);
        }).length;

    return { done, total: totalLessons, pct: totalLessons ? Math.round((done / totalLessons) * 100) : 0 };
  }, [defaultPassingScore, hasPassedLesson, progress]);

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

  const recordQuizResult = useCallback((topic: string, lesson: string, score: number, totalQuestions: number) => {
    const key = `${topic}/${lesson}`;
    const now = new Date().toISOString();

    saveResumeState(topic, lesson, {
      hasOpenedQuiz: true,
      passedQuiz: totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) >= defaultPassingScore : true,
      lastQuizScore: score,
      totalQuestions,
      viewedAt: now,
    });

    setProgress((prev) => {
      const updated = {
        ...prev,
        [key]: {
          ...prev[key],
          completed: prev[key]?.completed ?? false,
          best_quiz_score: Math.max(prev[key]?.best_quiz_score ?? 0, score),
          last_viewed_at: now,
        },
      };
      localStorage.setItem(LOCAL_KEY, JSON.stringify(updated));
      return updated;
    });
  }, [defaultPassingScore, saveResumeState]);

  const getLastCode = useCallback((topic: string, lesson: string): string | undefined => {
    const key = codeStorageKey(topic, lesson);
    const oldKey = legacyCodeStorageKey(topic, lesson);
    if (typeof window !== "undefined") {
      const local = localStorage.getItem(key);
      if (local) return local;
      const legacy = localStorage.getItem(oldKey);
      if (legacy) {
        localStorage.setItem(key, legacy);
        localStorage.removeItem(oldKey);
        return legacy;
      }
    }
    return progress[`${topic}/${lesson}`]?.last_code ?? undefined;
  }, [progress]);

  const saveCode = useCallback((topic: string, lesson: string, code: string) => {
    const now = new Date().toISOString();
    if (typeof window !== "undefined") {
      localStorage.setItem(codeStorageKey(topic, lesson), code);
    }
    saveResumeState(topic, lesson, { viewedAt: now });
    setProgress((prev) => {
      const key = `${topic}/${lesson}`;
      const updated = {
        ...prev,
        [key]: {
          ...prev[key],
          completed: prev[key]?.completed ?? false,
          last_code: code,
          last_viewed_at: now,
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
      await api.progress.update(topic, "01", { topic_bookmarked: !isBookmarked, mark_viewed: true }).catch(() => {});
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
      await api.progress.update(topic, lesson, { lesson_bookmarked: !isBookmarked, mark_viewed: true }).catch(() => {});
    }
  }, [bookmarks, persistBookmarks, state.user]);

  const isTopicBookmarked = useCallback((topic: string) => bookmarks.topics.includes(topic), [bookmarks.topics]);
  const isLessonBookmarked = useCallback((topic: string, lesson: string) => bookmarks.lessons.includes(`${topic}/${lesson}`), [bookmarks.lessons]);

  const getRecentActivity = useCallback((limit = 5) => activity.slice(0, limit), [activity]);

  const getContinueLearning = useCallback((): ContinueLearningItem | null => {
    const items = Object.entries(resume)
      .filter(([key]) => {
        const [topic, lesson] = key.split("/");
        return !hasPassedLesson(topic, lesson, defaultPassingScore);
      })
      .sort((a, b) => {
        const aViewed = a[1]?.viewedAt ? new Date(a[1].viewedAt).getTime() : 0;
        const bViewed = b[1]?.viewedAt ? new Date(b[1].viewedAt).getTime() : 0;
        return bViewed - aViewed;
      });

    const [key, value] = items[0] ?? [];
    if (!key) return null;
    const [topic, lesson] = key.split("/");
    return { topic, lesson, viewedAt: value?.viewedAt };
  }, [defaultPassingScore, hasPassedLesson, resume]);

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
      return entries.length === 0 || entries.some(([key]) => {
        const [, lesson] = key.split("/");
        return !hasPassedLesson(topic, lesson, defaultPassingScore);
      });
    });

    if (firstUntouched) {
      return { topic: firstUntouched, reason: "Langkah berikutnya di kurikulum" };
    }

    return orderedTopics[0] ? { topic: orderedTopics[0], reason: "Ulangi dari topik awal" } : null;
  }, [bookmarks.topics, defaultPassingScore, getContinueLearning, hasPassedLesson, progress]);

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
    hasPassedLesson,
    topicProgress,
    lessonState,
    markComplete,
    recordQuizResult,
    getBestQuizScore,
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
