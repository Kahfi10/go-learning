"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BookmarkCheck,
  BookOpen,
  Flame,
  Trophy,
  TrendingUp,
  Zap,
} from "lucide-react";
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Navbar from "@/components/navigation/Navbar";
import { api, type Topic, type UserStats } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useProgress } from "@/hooks/useProgress";
import { LEVEL_NAMES, formatXP, xpToLevel } from "@/lib/utils";

const XP_LEVELS = [0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 5000];

function getLessonCount(topic: Topic) {
  return topic.lessons?.length ?? 5;
}

export default function DashboardPage() {
  const router = useRouter();
  const { state } = useAuth();
  const { topicProgress, getRecentActivity, bookmarks } = useProgress();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);

  useEffect(() => {
    if (!state.loading && !state.user) {
      router.replace("/login?next=/dashboard");
    }
  }, [router, state.loading, state.user]);

  useEffect(() => {
    if (!state.user) return;

    api.progress.stats().then(setStats).catch(() => {});
    api.topics.list().then(setTopics).catch(() => {});
  }, [state.user]);

  const level = stats ? xpToLevel(stats.xp) : 1;
  const levelName = LEVEL_NAMES[level] ?? "Go Learner";
  const currentLevelXP = XP_LEVELS[level - 1] ?? 0;
  const hasNextLevel = level < XP_LEVELS.length;
  const nextLevelXP = hasNextLevel
    ? XP_LEVELS[level]
    : XP_LEVELS[XP_LEVELS.length - 1];
  const nextLevelName = LEVEL_NAMES[level + 1] ?? levelName;
  const xpPct = stats
    ? hasNextLevel
      ? Math.max(
          0,
          Math.min(
            100,
            Math.round(
              ((stats.xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100,
            ),
          ),
        )
      : 100
    : 0;
  const xpRemaining = stats && hasNextLevel ? Math.max(nextLevelXP - stats.xp, 0) : 0;

  const topicCards = topics.map((topic) => {
    const progress = topicProgress(topic.slug, getLessonCount(topic));
    return { topic, progress };
  });

  const chartData = topicCards.map(({ topic, progress }) => ({
    name: `T${String(topic.number).padStart(2, "0")}`,
    pct: progress.pct,
    color: topic.color,
  }));

  const startedTopics = topicCards.filter(({ progress }) => progress.done > 0).length;
  const completedTopics = topicCards.filter(({ progress }) => progress.pct === 100).length;
  const avgTopicProgress = chartData.length
    ? Math.round(chartData.reduce((sum, item) => sum + item.pct, 0) / chartData.length)
    : 0;
  const continueTopic =
    topicCards.find(({ progress }) => progress.done > 0 && progress.pct < 100) ??
    topicCards[0];
  const recentActivity = getRecentActivity(4);
  const bookmarkedCount = bookmarks.topics.length + bookmarks.lessons.length;

  const statCards = [
    {
      icon: Zap,
      label: "Total XP",
      value: stats ? formatXP(stats.xp) : "-",
      note: stats
        ? hasNextLevel
          ? `${xpRemaining} XP lagi menuju Level ${level + 1}`
          : "Kamu sudah mencapai level tertinggi"
        : "Akumulasi progres belajarmu",
      accent: "#0071E3",
    },
    {
      icon: Flame,
      label: "Streak",
      value: stats ? `${stats.streak_days} hari` : "-",
      note: stats?.streak_days
        ? "Konsistensi harian kamu sedang terjaga"
        : "Mulai bangun ritme harian pertamamu",
      accent: "#FF9500",
    },
    {
      icon: BookOpen,
      label: "Lesson Selesai",
      value: stats ? `${stats.lessons_completed}` : "-",
      note: stats?.lessons_completed
        ? `${startedTopics} topik sudah kamu sentuh`
        : "Lesson yang selesai akan tampil di sini",
      accent: "#34C759",
    },
    {
      icon: Trophy,
      label: "Level Saat Ini",
      value: stats ? `${level}` : "-",
      note: stats ? `${levelName}` : "Status level akan dimuat otomatis",
      accent: "#AF52DE",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 sm:px-6 pb-24 pt-24">
        <section className="relative mb-6 overflow-hidden rounded-[32px] border border-black/[0.06] bg-[#FBFBFD] p-8 shadow-[0_28px_80px_rgba(15,23,42,0.08)] dark:border-white/[0.08] dark:bg-[#0F0F11] dark:shadow-[0_28px_80px_rgba(0,0,0,0.32)] sm:p-10">
          <div className="pointer-events-none absolute -left-10 top-0 h-48 w-48 rounded-full bg-[#0071E3]/15 blur-3xl" />
          <div className="pointer-events-none absolute right-0 top-10 h-40 w-40 rounded-full bg-[#AF52DE]/12 blur-3xl" />

          <div className="relative grid gap-8 xl:grid-cols-[minmax(0,1.16fr)_320px] xl:items-start">
            <div className="max-w-2xl">
              <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[#86868B]">
                Dashboard
              </p>
              <h1 className="mt-4 max-w-3xl font-display text-[30px] font-semibold tracking-tight text-foreground sm:text-[38px] xl:text-[46px] leading-[1.06]">
                Halo, {state.user?.name?.split(" ")[0] ?? "Gopher"}
              </h1>
              <p className="mt-3 max-w-xl text-[16px] leading-7 text-[#86868B] sm:text-[17px]">
                {levelName}. Jaga momentum belajarmu dengan fokus pada topik yang sedang
                berjalan dan progres yang paling cepat berkembang.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <div className="rounded-full border border-black/[0.06] bg-white/80 px-4 py-2 text-[13px] font-medium text-foreground shadow-[0_10px_30px_rgba(15,23,42,0.05)] dark:border-white/[0.08] dark:bg-white/[0.04] dark:shadow-none">
                  Level {level}
                </div>
                <div className="rounded-full border border-black/[0.06] bg-white/80 px-4 py-2 text-[13px] font-medium text-foreground shadow-[0_10px_30px_rgba(15,23,42,0.05)] dark:border-white/[0.08] dark:bg-white/[0.04] dark:shadow-none">
                  {startedTopics}/{topics.length || 0} topik dimulai
                </div>
                <div className="rounded-full border border-black/[0.06] bg-white/80 px-4 py-2 text-[13px] font-medium text-foreground shadow-[0_10px_30px_rgba(15,23,42,0.05)] dark:border-white/[0.08] dark:bg-white/[0.04] dark:shadow-none">
                  {completedTopics} topik selesai
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-black/[0.06] bg-white/80 p-6 shadow-[0_20px_50px_rgba(15,23,42,0.06)] backdrop-blur-sm dark:border-white/[0.08] dark:bg-white/[0.04] dark:shadow-[0_20px_50px_rgba(0,0,0,0.24)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#86868B]">
                    Level Progress
                  </p>
                  <h2 className="mt-3 font-display text-[32px] font-semibold tracking-tight text-foreground">
                    Level {level}
                  </h2>
                  <p className="mt-1 text-[14px] text-[#86868B]">{levelName}</p>
                </div>
                <div className="rounded-full bg-[#0071E3]/10 px-3 py-1 text-[12px] font-medium text-[#0071E3]">
                  {stats ? `${formatXP(stats.xp)} XP` : "Memuat"}
                </div>
              </div>

              <div className="mt-6">
                <div className="mb-2 flex items-center justify-between text-[12px] text-[#86868B]">
                  <span>Progress level</span>
                  <span>{stats ? `${xpPct}%` : "-"}</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-black/[0.06] dark:bg-white/[0.08]">
                  <div
                    className="h-full rounded-full bg-[#0071E3] transition-all duration-700"
                    style={{ width: `${xpPct}%` }}
                  />
                </div>
                <p className="mt-3 text-[13px] leading-6 text-[#86868B]">
                  {stats
                    ? hasNextLevel
                      ? `${xpRemaining} XP lagi menuju Level ${level + 1} - ${nextLevelName}.`
                      : "Kamu sudah berada di level tertinggi saat ini."
                    : "Progres level akan tampil setelah data termuat."}
                </p>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-[20px] bg-black/[0.03] p-4 dark:bg-white/[0.05]">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-[#86868B]">
                    XP Saat Ini
                  </p>
                  <p className="mt-2 font-display text-[24px] font-semibold tracking-tight text-foreground">
                    {stats ? formatXP(stats.xp) : "-"}
                  </p>
                </div>
                <div className="rounded-[20px] bg-black/[0.03] p-4 dark:bg-white/[0.05]">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-[#86868B]">
                    Target Berikutnya
                  </p>
                  <p className="mt-2 font-display text-[24px] font-semibold tracking-tight text-foreground">
                    {hasNextLevel ? formatXP(nextLevelXP) : formatXP(currentLevelXP)}
                  </p>
                </div>
                <div className="rounded-[20px] bg-black/[0.03] p-4 dark:bg-white/[0.05]">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-[#86868B]">
                    Topik Aktif
                  </p>
                  <p className="mt-2 font-display text-[24px] font-semibold tracking-tight text-foreground">
                    {startedTopics}
                  </p>
                </div>
                <div className="rounded-[20px] bg-black/[0.03] p-4 dark:bg-white/[0.05]">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-[#86868B]">
                    Lesson Selesai
                  </p>
                  <p className="mt-2 font-display text-[24px] font-semibold tracking-tight text-foreground">
                    {stats?.lessons_completed ?? "-"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {statCards.map((card) => {
            const Icon = card.icon;

            return (
              <article
                key={card.label}
                className="group relative overflow-hidden rounded-[24px] border border-[#D2D2D7]/60 bg-white p-6 shadow-sm transition-transform duration-300 hover:-translate-y-1 dark:border-white/10 dark:bg-[#111214]"
              >
                <div
                  className="pointer-events-none absolute inset-x-0 top-0 h-24 opacity-80"
                  style={{
                    background: `linear-gradient(180deg, ${card.accent}15 0%, transparent 100%)`,
                  }}
                />

                <div className="relative flex h-full flex-col">
                  <div className="flex items-center justify-between gap-3">
                    <div
                      className="flex h-11 w-11 items-center justify-center rounded-[14px]"
                      style={{ backgroundColor: `${card.accent}14` }}
                    >
                      <Icon className="h-5 w-5" style={{ color: card.accent }} />
                    </div>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#86868B]">
                      {card.label}
                    </span>
                  </div>

                  <p className="mt-8 font-display text-[32px] font-semibold tracking-tight text-foreground">
                    {card.value}
                  </p>
                  <p className="mt-1 text-[13px] leading-6 text-[#86868B] line-clamp-2">{card.note}</p>
                </div>
              </article>
            );
          })}
        </section>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(320px,1fr)] lg:items-stretch">
          <article className="relative overflow-hidden rounded-[28px] border border-[#D2D2D7]/60 bg-white p-6 sm:p-8 shadow-sm dark:border-white/10 dark:bg-[#111214]">
            <div className="relative flex h-full flex-col">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                <div className="max-w-md">
                  <div className="flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-[0.18em] text-[#0071E3] mb-2">
                    <TrendingUp className="h-4 w-4" />
                    Progress Insights
                  </div>
                  <h2 className="font-display text-[22px] font-semibold tracking-tight text-foreground sm:text-[26px] mb-2">
                    Progress per topik terlihat lebih jelas
                  </h2>
                  <p className="text-[14px] leading-relaxed text-[#86868B]">
                    Lihat distribusi progres untuk mengetahui topik mana yang sedang aktif,
                    tertinggal, atau siap dituntaskan.
                  </p>
                </div>

                <div className="rounded-[20px] bg-[#F5F5F7] dark:bg-[#1C1C1E] px-5 py-4 text-right">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-[#86868B]">
                    Rata-rata
                  </p>
                  <p className="mt-1 font-display text-[26px] font-semibold tracking-tight text-foreground">
                    {avgTopicProgress}%
                  </p>
                </div>
              </div>

              <div className="mt-6 h-[260px] w-full">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} barSize={16}>
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 11, fill: "#86868B" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        domain={[0, 100]}
                        tick={{ fontSize: 11, fill: "#86868B" }}
                        axisLine={false}
                        tickLine={false}
                        width={34}
                        tickFormatter={(value) => `${value}%`}
                      />
                      <Tooltip
                        cursor={{ fill: "rgba(0, 113, 227, 0.06)" }}
                        contentStyle={{
                          background: "#111113",
                          border: "1px solid rgba(255,255,255,0.08)",
                          borderRadius: 16,
                          fontSize: 12,
                          boxShadow: "0 16px 40px rgba(0,0,0,0.28)",
                        }}
                        labelStyle={{ color: "#E5E5EA", marginBottom: 4 }}
                        itemStyle={{ color: "#C7C7CC" }}
                        formatter={(value: number | string) => [`${value}%`, "Progress"]}
                      />
                      <Bar dataKey="pct" radius={[8, 8, 0, 0]}>
                        {chartData.map((entry, index) => (
                          <Cell key={index} fill={entry.color || "#0071E3"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center rounded-[24px] border border-dashed border-black/[0.08] bg-black/[0.02] text-center dark:border-white/[0.1] dark:bg-white/[0.03]">
                    <TrendingUp className="h-8 w-8 text-[#0071E3]" />
                    <p className="mt-4 text-[15px] font-medium text-foreground">
                      Belum ada progres topik
                    </p>
                    <p className="mt-1 max-w-sm text-[13px] leading-6 text-[#86868B]">
                      Setelah kamu mulai belajar, distribusi progres setiap topik akan tampil di sini.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </article>

          <div className="flex h-full flex-col gap-5">
            {continueTopic ? (
              <article className="relative flex-1 overflow-hidden rounded-[28px] border border-[#D2D2D7]/60 bg-white p-6 sm:p-8 shadow-sm dark:border-white/10 dark:bg-[#111214]">
                <div
                  className="pointer-events-none absolute inset-x-0 top-0 h-28 blur-[40px] opacity-20"
                  style={{ backgroundColor: continueTopic.topic.color }}
                />

                <div className="relative flex h-full flex-col">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#86868B] mb-2">
                        {continueTopic.progress.done > 0 ? "Lanjutkan Belajar" : "Mulai Belajar"}
                      </p>
                      <h2 className="font-display text-[26px] font-semibold tracking-tight text-foreground leading-snug">
                        {continueTopic.progress.done > 0 ? "Satu langkah lagi" : "Topik rekomendasi"}
                      </h2>
                    </div>
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-[16px] text-[15px] font-bold text-white shadow-sm"
                      style={{ backgroundColor: continueTopic.topic.color }}
                    >
                      {String(continueTopic.topic.number).padStart(2, "0")}
                    </div>
                  </div>

                  <div className="mt-8 rounded-[20px] bg-[#F5F5F7]/60 dark:bg-[#1C1C1E]/60 p-5 border border-transparent dark:border-white/5">
                    <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#86868B] mb-1">
                      {continueTopic.topic.title_id}
                    </p>
                    <p className="text-[14px] leading-relaxed text-[#86868B] mb-4">
                      {continueTopic.progress.done} dari {continueTopic.progress.total} lesson sudah selesai.
                    </p>

                    <div>
                      <div className="mb-2 flex items-center justify-between text-[12px] font-medium text-[#86868B]">
                        <span>Progress topik</span>
                        <span>{continueTopic.progress.pct}%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-[#D2D2D7]/40 dark:bg-white/10">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${continueTopic.progress.pct}%`,
                            backgroundColor: continueTopic.topic.color,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 flex flex-wrap gap-3">
                    <Link
                      href={`/modules/${continueTopic.topic.slug}`}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0071E3] px-6 py-3 text-[14px] font-medium text-white shadow-sm transition-colors hover:bg-[#0077ED]"
                    >
                      {continueTopic.progress.done > 0 ? "Lanjutkan Belajar" : "Mulai Belajar"}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                    <div className="inline-flex items-center justify-center rounded-full bg-[#F5F5F7] dark:bg-[#1C1C1E] px-5 py-3 text-[13px] font-medium text-[#86868B] border border-transparent dark:border-white/5">
                      Target: {hasNextLevel ? `${xpRemaining} XP lagi` : "Level maksimum"}
                    </div>
                  </div>
                </div>
              </article>
            ) : (
              <article className="flex flex-1 flex-col justify-between rounded-[28px] border border-[#D2D2D7]/60 bg-white p-6 sm:p-8 shadow-sm dark:border-white/10 dark:bg-[#111214]">
                <div>
                  <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#86868B] mb-2">
                    Siap Mulai
                  </p>
                  <h2 className="font-display text-[26px] font-semibold tracking-tight text-foreground leading-snug mb-3">
                    Pilih topik pertamamu
                  </h2>
                  <p className="text-[15px] leading-relaxed text-[#86868B]">
                    Belum ada topik yang bisa dilanjutkan. Buka modul dan mulai progres pertamamu.
                  </p>
                </div>

                <Link
                  href="/modules"
                  className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-[#0071E3] px-6 py-3 text-[14px] font-medium text-white shadow-sm transition-colors hover:bg-[#0077ED]"
                >
                  Lihat semua topik
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </article>
            )}

            <Link
              href="/leaderboard"
              className="group relative overflow-hidden rounded-[24px] border border-[#D2D2D7]/60 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:border-white/10 dark:bg-[#111214]"
            >
              <div className="pointer-events-none absolute -right-10 top-0 h-24 w-24 rounded-full bg-[#FF9500]/10 blur-2xl" />

              <div className="relative flex items-center justify-between gap-5">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#86868B] mb-1">
                    Leaderboard
                  </p>
                  <p className="text-[16px] font-semibold text-foreground tracking-tight mb-1">
                    Bandingkan progresmu
                  </p>
                  <p className="text-[13px] leading-relaxed text-[#86868B]">
                    Lihat posisimu di papan peringkat.
                  </p>
                </div>

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] bg-[#FF9500]/10 text-[#FF9500]">
                  <Trophy className="h-6 w-6" />
                </div>
              </div>
            </Link>

            <article className="rounded-[24px] border border-[#D2D2D7]/60 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#111214]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#86868B] mb-3">Recent Activity</p>
              <div className="space-y-3">
                {recentActivity.length > 0 ? recentActivity.map((item) => (
                  <Link key={`${item.topic_slug}/${item.lesson_id}`} href={`/modules/${item.topic_slug}/${item.lesson_id}`} className="flex items-center justify-between gap-3 rounded-[14px] bg-[#F5F5F7] dark:bg-[#1C1C1E] px-3 py-3">
                    <div>
                      <p className="text-[13px] font-medium text-foreground">{item.topic_slug}</p>
                      <p className="text-[12px] text-[#86868B]">Lesson {item.lesson_id}</p>
                    </div>
                    <span className="text-[12px] text-[#86868B]">{item.completed ? "Done" : "Open"}</span>
                  </Link>
                )) : (
                  <p className="text-[13px] text-[#86868B]">Belum ada aktivitas terbaru.</p>
                )}
              </div>
              <div className="mt-4 pt-4 border-t border-[#D2D2D7]/40 dark:border-white/8">
                <div className="flex items-center gap-2 text-[12px] text-[#86868B]">
                  <BookmarkCheck className="h-3.5 w-3.5 text-[#0071E3]" />
                  <p>Bookmarks tersimpan: <span className="text-foreground font-medium">{bookmarkedCount}</span></p>
                </div>
              </div>
            </article>
          </div>
        </section>
      </main>
    </div>
  );
}
