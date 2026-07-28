import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatXP(xp: number): string {
  if (xp >= 1000) return `${(xp / 1000).toFixed(1)}k`;
  return xp.toString();
}

export function xpToLevel(xp: number): number {
  const thresholds = [0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 5000];
  let level = 1;
  for (let i = 0; i < thresholds.length; i++) {
    if (xp >= thresholds[i]) level = i + 1;
  }
  return level;
}

export const LEVEL_NAMES: Record<number, string> = {
  1: "Gopher Pemula",
  2: "Gopher Junior",
  3: "Gopher Aktif",
  4: "Go Developer",
  5: "Go Enthusiast",
  6: "Go Practitioner",
  7: "Go Specialist",
  8: "Go Expert",
  9: "Go Master",
  10: "Go Legend",
};

export function getLevelName(level: number, lang: "id" | "en" = "id"): string {
  return LEVEL_NAMES[level] ?? "Go Legend";
}

export function timeAgo(date: string | Date): string {
  const now = new Date();
  const d = typeof date === "string" ? new Date(date) : date;
  const diff = (now.getTime() - d.getTime()) / 1000;
  if (diff < 60) return "baru saja";
  if (diff < 3600) return `${Math.floor(diff / 60)} mnt lalu`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
  return `${Math.floor(diff / 86400)} hari lalu`;
}
