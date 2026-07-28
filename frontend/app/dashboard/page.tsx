"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Flame, Zap, BookOpen, Trophy, ArrowRight, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import Navbar from "@/components/navigation/Navbar";
import { api, type UserStats, type Topic } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useProgress } from "@/hooks/useProgress";
import { cn, xpToLevel, LEVEL_NAMES, formatXP } from "@/lib/utils";

// XP threshold for each level
const XP_LEVELS = [0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 5000];

export default function DashboardPage() {
  const router = useRouter();
  const { state } = useAuth();
  const { topicProgress } = useProgress();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);

  useEffect(() => {
    if (!state.loading && !state.user) router.push("/login");
  }, [state]);

  useEffect(() => {
    if (state.user) {
      api.progress.stats().then(setStats).catch(() => {});
      api.topics.list().then(setTopics).catch(() => {});
    }
  }, [state.user]);

  const level = stats ? xpToLevel(stats.xp) : 1;
  const currentLevelXP = XP_LEVELS[level - 1] ?? 0;
  const nextLevelXP = XP_LEVELS[level] ?? 5000;
  const xpPct = stats ? Math.round(((stats.xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100) : 0;

  const chartData = topics.map(t => {
    const prog = topicProgress(t.slug, 5);
    return { name: `T${String(t.number).padStart(2,"0")}`, pct: prog.pct, color: t.color };
  });

  // Find first incomplete topic/lesson for "continue learning"
  const continueTopic = topics.find(t => {
    const prog = topicProgress(t.slug, 5);
    return prog.done > 0 && prog.pct < 100;
  }) ?? topics[0];

  const STAT_CARDS = [
    { icon: Zap, label: "Total XP", value: stats ? formatXP(stats.xp) : "—", color: "#0071E3", bg: "#0071E3" },
    { icon: Flame, label: "Streak", value: stats ? `${stats.streak_days} hari` : "—", color: "#FF9500", bg: "#FF9500" },
    { icon: BookOpen, label: "Lesson Selesai", value: stats ? `${stats.lessons_completed}` : "—", color: "#34C759", bg: "#34C759" },
    { icon: Trophy, label: "Level Saat Ini", value: stats ? `${level}` : "—", color: "#AF52DE", bg: "#AF52DE" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-20 px-6 mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-10">
          <p className="text-[#86868B] text-[13px] uppercase tracking-widest mb-2">Dashboard</p>
          <h1 className="font-display font-semibold text-[36px] tracking-tight text-foreground">
            Halo, {state.user?.name?.split(" ")[0] ?? "Gopher"} 👋
          </h1>
          <p className="text-[#86868B] mt-1">{LEVEL_NAMES[level] ?? "Go Learner"}</p>
        </div>

        {/* Level progress */}
        {stats && (
          <div className="bg-[#F5F5F7] dark:bg-[#1C1C1E] rounded-[18px] p-6 mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[14px] font-medium text-foreground">Level {level} — {LEVEL_NAMES[level]}</span>
              <span className="text-[13px] text-[#86868B]">{stats.xp} / {nextLevelXP} XP</span>
            </div>
            <div className="h-2 bg-[#D2D2D7] rounded-full overflow-hidden">
              <div className="h-full bg-[#0071E3] rounded-full transition-all duration-700" style={{ width: `${xpPct}%` }} />
            </div>
            <p className="text-[12px] text-[#86868B] mt-2">{nextLevelXP - (stats?.xp ?? 0)} XP lagi ke Level {level + 1}</p>
          </div>
        )}

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {STAT_CARDS.map((c) => (
            <div key={c.label} className="bg-[#F5F5F7] dark:bg-[#1C1C1E] rounded-[18px] p-5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: c.bg + "20" }}>
                <c.icon className="w-4.5 h-4.5" style={{ color: c.color }} />
              </div>
              <p className="font-display font-semibold text-[28px] tracking-tight text-foreground">{c.value}</p>
              <p className="text-[#86868B] text-[12px] mt-1">{c.label}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Progress chart */}
          <div className="lg:col-span-2 bg-[#F5F5F7] dark:bg-[#1C1C1E] rounded-[18px] p-6">
            <div className="flex items-center gap-2 mb-5">
              <TrendingUp className="w-4 h-4 text-[#0071E3]" />
              <p className="font-medium text-[15px] text-foreground">Progress per Topik</p>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} barSize={14}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#86868B" }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#86868B" }} axisLine={false} tickLine={false} width={32} tickFormatter={(v) => `${v}%`} />
                <Tooltip
                  contentStyle={{ background: "#1C1C1E", border: "none", borderRadius: 10, fontSize: 12 }}
                  labelStyle={{ color: "#E5E5EA" }} itemStyle={{ color: "#86868B" }}
                  formatter={(v: any) => [`${v}%`, "Progress"]}
                />
                <Bar dataKey="pct" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={entry.color || "#0071E3"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Continue learning */}
          <div className="flex flex-col gap-4">
            {continueTopic && (
              <div className="bg-[#0071E3]/10 dark:bg-[#0071E3]/10 rounded-[18px] p-5 flex-1">
                <p className="text-[11px] font-semibold text-[#0071E3] uppercase tracking-widest mb-3">Lanjutkan</p>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-[12px] font-bold mb-3"
                  style={{ backgroundColor: continueTopic.color }}>
                  {String(continueTopic.number).padStart(2, "0")}
                </div>
                <p className="font-semibold text-foreground text-[15px] mb-1">{continueTopic.title_id}</p>
                <p className="text-[#86868B] text-[12px] mb-4">{topicProgress(continueTopic.slug, 5).done} / {topicProgress(continueTopic.slug, 5).total} lesson</p>
                <Link href={`/modules/${continueTopic.slug}`}
                  className="inline-flex items-center gap-1.5 bg-[#0071E3] text-white text-[13px] font-medium px-4 py-2 rounded-full hover:bg-[#0077ED] transition-colors">
                  Lanjutkan <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
            <Link href="/leaderboard"
              className="bg-[#F5F5F7] dark:bg-[#1C1C1E] rounded-[18px] p-5 hover:bg-[#EBEBED] dark:hover:bg-[#2C2C2E] transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-[14px] text-foreground">Leaderboard</p>
                  <p className="text-[#86868B] text-[12px] mt-1">Lihat ranking kamu</p>
                </div>
                <Trophy className="w-5 h-5 text-[#FF9500]" />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
