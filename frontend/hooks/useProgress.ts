"use client";
import { useCallback, useEffect, useState } from "react";
import { api, type LessonResumeState, type ProgressItem } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const LOCAL_KEY = "golearn_progress";
const RESUME_KEY = "golearn_resume";

interface ContinueLearningItem {
  topic: string;
  lesson: string;
  viewedAt?: string;
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

export function useProgress() {
  const { state } = useAuth();
  const [progress, setProgress] = useState<Record<string, ProgressItem>>(loadLocal);
  const [resume, setResume] = useState<ResumeMap>(loadResume);

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
      }).catch(() => {});
    }
  }, [state.user]);

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
  }, [saveResumeState]);

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
      await api.progress.update(topic, lesson, { completed: true, last_code: code }).catch(() => {});
    }
  }, [saveResumeState, state.user]);

  const getLastCode = useCallback((topic: string, lesson: string): string | undefined => {
    const key = `${topic}_${lesson}_code`;
    return typeof window !== "undefined" ? localStorage.getItem(key) ?? undefined : undefined;
  }, []);

  const saveCode = useCallback((topic: string, lesson: string, code: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(`${topic}_${lesson}_code`, code);
    }
    saveResumeState(topic, lesson, { viewedAt: new Date().toISOString() });
  }, [saveResumeState]);

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
    isCompleted,
    topicProgress,
    lessonState,
    markComplete,
    getLastCode,
    saveCode,
    getResumeState,
    saveResumeState,
    markLessonViewed,
    getContinueLearning,
    getRecentlyViewed,
  };
}
