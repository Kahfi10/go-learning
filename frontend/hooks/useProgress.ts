"use client";
import { useEffect, useState } from "react";
import { api, type ProgressItem } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const LOCAL_KEY = "golearn_progress";

function loadLocal(): Record<string, ProgressItem> {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(LOCAL_KEY) ?? "{}"); } catch { return {}; }
}

export function useProgress() {
  const { state } = useAuth();
  const [progress, setProgress] = useState<Record<string, ProgressItem>>(loadLocal);

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

  function topicProgress(topicSlug: string, totalLessons: number) {
    const done = Object.entries(progress).filter(
      ([key, v]) => key.startsWith(`${topicSlug}/`) && v.completed
    ).length;
    return { done, total: totalLessons, pct: totalLessons ? Math.round((done / totalLessons) * 100) : 0 };
  }

  async function markComplete(topic: string, lesson: string, code?: string) {
    const key = `${topic}/${lesson}`;
    const updated = { ...progress, [key]: { completed: true, completed_at: new Date().toISOString() } };
    setProgress(updated);
    localStorage.setItem(LOCAL_KEY, JSON.stringify(updated));
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
  }

  return { progress, isCompleted, topicProgress, markComplete, getLastCode, saveCode };
}
