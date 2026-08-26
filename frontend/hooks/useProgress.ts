"use client";
import { useEffect, useState } from "react";
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

  function persistResume(next: ResumeMap) {
    setResume(next);
    if (typeof window !== "undefined") {
      localStorage.setItem(RESUME_KEY, JSON.stringify(next));
    }
  }

  useEffect(() => {
    if (state.user) {
      api.progress.get().then((data) => {
        setProgress(data);
        localStorage.setItem(LOCAL_KEY, JSON.stringify(data));
      }).catch(() => {});
    }
  }, [state.user]);

  function isCompleted(topic: string, lesson: string) {
    return progress[`${topic}/${lesson}`]?.completed ?? false;
  }

  function getResumeState(topic: string, lesson: string): LessonResumeState {
    return resume[`${topic}/${lesson}`] ?? {};
  }

  function saveResumeState(topic: string, lesson: string, patch: Partial<LessonResumeState>) {
    const key = `${topic}/${lesson}`;
    const prev = resume[key] ?? {};
    persistResume({
      ...resume,
      [key]: {
        ...prev,
        ...patch,
        viewedAt: patch.viewedAt ?? new Date().toISOString(),
      },
    });
  }

  function markLessonViewed(topic: string, lesson: string) {
    saveResumeState(topic, lesson, { viewedAt: new Date().toISOString() });
  }

  function topicProgress(topicSlug: string, totalLessons: number) {
    const done = Object.entries(progress).filter(
      ([key, v]) => key.startsWith(`${topicSlug}/`) && v.completed
    ).length;
    return { done, total: totalLessons, pct: totalLessons ? Math.round((done / totalLessons) * 100) : 0 };
  }

  function lessonState(topic: string, lesson: string) {
    const completed = isCompleted(topic, lesson);
    const state = getResumeState(topic, lesson);
    if (completed) return "completed" as const;
    if (state.viewedAt || getLastCode(topic, lesson)) return "in_progress" as const;
    return "not_started" as const;
  }

  async function markComplete(topic: string, lesson: string, code?: string) {
    const key = `${topic}/${lesson}`;
    const updated = { ...progress, [key]: { completed: true, completed_at: new Date().toISOString() } };
    setProgress(updated);
    localStorage.setItem(LOCAL_KEY, JSON.stringify(updated));
    saveResumeState(topic, lesson, { viewedAt: new Date().toISOString() });
    if (state.user) {
      await api.progress.update(topic, lesson, { completed: true, last_code: code }).catch(() => {});
    }
  }

  function getLastCode(topic: string, lesson: string): string | undefined {
    const key = `${topic}_${lesson}_code`;
    return typeof window !== "undefined" ? localStorage.getItem(key) ?? undefined : undefined;
  }

  function saveCode(topic: string, lesson: string, code: string) {
    if (typeof window !== "undefined") {
      localStorage.setItem(`${topic}_${lesson}_code`, code);
    }
    saveResumeState(topic, lesson, { viewedAt: new Date().toISOString() });
  }

  function getContinueLearning(): ContinueLearningItem | null {
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
  }

  function getRecentlyViewed(limit = 5): ContinueLearningItem[] {
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
  }

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
