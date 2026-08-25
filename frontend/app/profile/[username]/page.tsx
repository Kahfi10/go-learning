"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Award,
  BookOpen,
  Cpu,
  Crown,
  Flame,
  GraduationCap,
  MessageCircle,
  Play,
  Shield,
  Star,
  ThumbsUp,
  TrendingUp,
  Trophy,
  Zap,
  type LucideIcon,
} from "lucide-react";
import Navbar from "@/components/navigation/Navbar";
import { useAuth } from "@/context/AuthContext";
import { api, type Badge, type UserStats } from "@/lib/api";
import { LEVEL_NAMES, formatXP, xpToLevel } from "@/lib/utils";

const BADGE_ICON_MAP: Record<string, LucideIcon> = {
  star: Star,
  book: BookOpen,
  trophy: Trophy,
  zap: Zap,
  flame: Flame,
  fire: Flame,
  "graduation-cap": GraduationCap,
  award: Award,
  crown: Crown,
  cpu: Cpu,
  play: Play,
  chart: TrendingUp,
  message: MessageCircle,
  "thumbs-up": ThumbsUp,
  shield: Shield,
};

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const { state } = useAuth();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const isMe = state.user?.name === username || username === "me";

  useEffect(() => {
    if (state.user && isMe) {
      api.progress.stats().then(setStats).catch(() => {});
      api.progress.badges().then(setBadges).catch(() => {});
    }
  }, [state.user, isMe]);

  const user = state.user;
  const level = stats ? xpToLevel(stats.xp) : 1;
  const earnedBadges = badges.filter((badge) => badge.earned).length;
  const profileName = user?.name ?? username;
  const statCards = stats
    ? [
        {
          icon: Zap,
          label: "Total XP",
          value: formatXP(stats.xp),
          note: "Akumulasi pengalaman belajar",
          accent: "#0071E3",
        },
        {
          icon: Flame,
          label: "Current Streak",
          value: `${stats.streak_days}d`,
          note: "Hari konsisten tanpa jeda",
          accent: "#FF9500",
        },
        {
          icon: BookOpen,
          label: "Lessons Completed",
          value: `${stats.lessons_completed}`,
          note: "Lesson yang sudah diselesaikan",
          accent: "#34C759",
        },
      ]
    : [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 sm:px-6 pb-24 pt-24">
        <section className="relative overflow-hidden rounded-[32px] border border-black/[0.06] bg-[#FBFBFD] p-8 shadow-[0_28px_80px_rgba(15,23,42,0.08)] dark:border-white/[0.08] dark:bg-[#0F0F11] dark:shadow-[0_28px_80px_rgba(0,0,0,0.32)] sm:p-10">
          <div className="pointer-events-none absolute -left-10 top-0 h-48 w-48 rounded-full bg-[#0071E3]/15 blur-3xl" />
          <div className="pointer-events-none absolute right-0 top-8 h-40 w-40 rounded-full bg-[#AF52DE]/10 blur-3xl" />

          <div className="relative grid gap-8 xl:grid-cols-[minmax(0,1.16fr)_320px] xl:items-start">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[#86868B]">
                Profil
              </p>

              <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-center">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[#0071E3] text-[30px] font-semibold text-white shadow-[0_18px_40px_rgba(0,113,227,0.24)]">
                  {profileName?.charAt(0).toUpperCase() ?? "G"}
                </div>

                <div className="min-w-0">
                  <h1 className="font-display text-[32px] font-semibold tracking-tight text-foreground sm:text-[40px] xl:text-[44px]">
                    {profileName}
                  </h1>
                  <p className="mt-2 text-[16px] text-[#86868B]">
                    Level {level} · {LEVEL_NAMES[level]}
                  </p>
                  {user?.email && (
                    <p className="mt-1 truncate text-[14px] text-[#86868B]">{user.email}</p>
                  )}
                </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <div className="rounded-full border border-black/[0.06] bg-white/80 px-4 py-2 text-[13px] font-medium text-foreground shadow-[0_10px_30px_rgba(15,23,42,0.05)] dark:border-white/[0.08] dark:bg-white/[0.04] dark:shadow-none">
                  {stats ? `${formatXP(stats.xp)} XP terkumpul` : "Progress akan muncul di sini"}
                </div>
                <div className="rounded-full border border-black/[0.06] bg-white/80 px-4 py-2 text-[13px] font-medium text-foreground shadow-[0_10px_30px_rgba(15,23,42,0.05)] dark:border-white/[0.08] dark:bg-white/[0.04] dark:shadow-none">
                  {stats ? `${stats.lessons_completed} lesson selesai` : "Stat lesson menunggu data"}
                </div>
                <div className="rounded-full border border-black/[0.06] bg-white/80 px-4 py-2 text-[13px] font-medium text-foreground shadow-[0_10px_30px_rgba(15,23,42,0.05)] dark:border-white/[0.08] dark:bg-white/[0.04] dark:shadow-none">
                  {earnedBadges} badge didapat
                </div>
              </div>
            </div>

            <aside className="rounded-[28px] border border-black/[0.06] bg-white/80 p-6 shadow-[0_20px_50px_rgba(15,23,42,0.06)] backdrop-blur-sm dark:border-white/[0.08] dark:bg-white/[0.04] dark:shadow-[0_20px_50px_rgba(0,0,0,0.24)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#86868B]">
                    Ringkasan
                  </p>
                  <h2 className="mt-3 font-display text-[28px] font-semibold tracking-tight text-foreground">
                    Level {level}
                  </h2>
                  <p className="mt-1 text-[14px] text-[#86868B]">{LEVEL_NAMES[level]}</p>
                </div>

                <div className="rounded-full bg-[#0071E3]/10 px-3 py-1 text-[12px] font-medium text-[#0071E3]">
                  {isMe ? "Profil aktif" : "Publik"}
                </div>
              </div>

              <div className="mt-6 grid gap-3">
                <div className="rounded-[20px] bg-black/[0.03] p-4 dark:bg-white/[0.05]">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-[#86868B]">Total XP</p>
                  <p className="mt-2 font-display text-[26px] font-semibold tracking-tight text-foreground">
                    {stats ? formatXP(stats.xp) : "-"}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-[20px] bg-black/[0.03] p-4 dark:bg-white/[0.05]">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-[#86868B]">Streak</p>
                    <p className="mt-2 font-display text-[22px] font-semibold tracking-tight text-foreground">
                      {stats ? `${stats.streak_days}d` : "-"}
                    </p>
                  </div>
                  <div className="rounded-[20px] bg-black/[0.03] p-4 dark:bg-white/[0.05]">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-[#86868B]">Badges</p>
                    <p className="mt-2 font-display text-[22px] font-semibold tracking-tight text-foreground">
                      {earnedBadges}
                    </p>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </section>

        {stats && (
          <section className="mt-6 grid gap-4 md:grid-cols-3">
            {statCards.map((item) => {
              const Icon = item.icon;

              return (
                <article
                  key={item.label}
                  className="group relative overflow-hidden rounded-[28px] border border-black/[0.06] bg-[#FBFBFD] p-5 shadow-[0_18px_45px_rgba(15,23,42,0.06)] transition-transform duration-300 hover:-translate-y-1 dark:border-white/[0.08] dark:bg-[#101012] dark:shadow-[0_18px_45px_rgba(0,0,0,0.24)]"
                >
                  <div
                    className="pointer-events-none absolute inset-x-0 top-0 h-24"
                    style={{
                      background: `linear-gradient(180deg, ${item.accent}1F 0%, transparent 100%)`,
                    }}
                  />

                  <div className="relative flex h-full flex-col">
                    <div className="flex items-center justify-between gap-3">
                      <div
                        className="flex h-11 w-11 items-center justify-center rounded-2xl"
                        style={{ backgroundColor: `${item.accent}16` }}
                      >
                        <Icon className="h-5 w-5" style={{ color: item.accent }} />
                      </div>
                      <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#86868B]">
                        {item.label}
                      </span>
                    </div>

                    <p className="mt-8 font-display text-[34px] font-semibold tracking-tight text-foreground">
                      {item.value}
                    </p>
                    <p className="mt-2 text-[13px] leading-6 text-[#86868B]">{item.note}</p>
                  </div>
                </article>
              );
            })}
          </section>
        )}

        <section className="mt-6 rounded-[30px] border border-black/[0.06] bg-[#FBFBFD] p-6 shadow-[0_24px_60px_rgba(15,23,42,0.07)] dark:border-white/[0.08] dark:bg-[#101012] dark:shadow-[0_24px_60px_rgba(0,0,0,0.28)] sm:p-7">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#86868B]">
                Badges
              </p>
              <h2 className="mt-2 font-display text-[28px] font-semibold tracking-tight text-foreground">
                Koleksi pencapaian
              </h2>
              <p className="mt-2 max-w-2xl text-[14px] leading-6 text-[#86868B]">
                Semua badge yang sudah didapat dan target yang masih terkunci tetap terlihat dalam satu grid.
              </p>
            </div>

            <div className="rounded-full bg-black/[0.03] px-4 py-2 text-[13px] font-medium text-foreground dark:bg-white/[0.05]">
              {earnedBadges}/{badges.length} badge terbuka
            </div>
          </div>

          {badges.length > 0 ? (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {badges.map((badge) => {
                const Icon = BADGE_ICON_MAP[badge.icon] ?? Award;

                return (
                  <article
                    key={badge.slug}
                    className={`group relative overflow-hidden rounded-[26px] border p-5 transition-all duration-300 ${
                      badge.earned
                        ? "border-black/[0.06] bg-white/80 shadow-[0_16px_40px_rgba(15,23,42,0.06)] dark:border-white/[0.08] dark:bg-white/[0.04] dark:shadow-[0_16px_40px_rgba(0,0,0,0.22)]"
                        : "border-black/[0.05] bg-black/[0.02] opacity-70 dark:border-white/[0.08] dark:bg-white/[0.03]"
                    }`}
                  >
                    <div
                      className={`pointer-events-none absolute inset-x-0 top-0 h-24 ${
                        badge.earned ? "bg-gradient-to-b from-[#0071E3]/12 to-transparent" : "bg-gradient-to-b from-black/[0.03] to-transparent dark:from-white/[0.03]"
                      }`}
                    />

                    <div className="relative flex h-full flex-col">
                      <div className="flex items-start justify-between gap-3">
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                            badge.earned ? "bg-[#0071E3]/10 text-[#0071E3]" : "bg-black/[0.04] text-[#86868B] dark:bg-white/[0.06]"
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>

                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                            badge.earned
                              ? "bg-[#34C759]/10 text-[#34C759]"
                              : "bg-black/[0.04] text-[#86868B] dark:bg-white/[0.06]"
                          }`}
                        >
                          {badge.earned ? "Didapat" : "Terkunci"}
                        </span>
                      </div>

                      <div className="mt-5">
                        <h3 className="font-display text-[22px] font-semibold tracking-tight text-foreground">
                          {badge.name_id}
                        </h3>
                        <p className="mt-2 text-[13px] leading-6 text-[#86868B]">{badge.description_id}</p>
                      </div>

                      <div className="mt-5 border-t border-black/[0.05] pt-4 text-[12px] text-[#86868B] dark:border-white/[0.08]">
                        {badge.earned_at
                          ? `Didapat pada ${new Date(badge.earned_at).toLocaleDateString("id-ID")}`
                          : "Selesaikan milestone terkait untuk membuka badge ini."}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="mt-6 rounded-[24px] border border-dashed border-black/[0.08] bg-black/[0.02] px-6 py-14 text-center text-[14px] text-[#86868B] dark:border-white/[0.1] dark:bg-white/[0.03]">
              Badge akan muncul setelah progres pengguna dimuat.
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
