"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Crown,
  Flame,
  Medal,
  Sparkles,
  Target,
  Trophy,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react";
import Navbar from "@/components/navigation/Navbar";
import { api, type LeaderboardEntry } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { cn, LEVEL_NAMES, formatXP } from "@/lib/utils";

const PERIODS = [
  { key: "alltime", label: "Semua Waktu" },
  { key: "month", label: "Bulan Ini" },
  { key: "week", label: "Minggu Ini" },
] as const;

const PODIUM_THEMES: Record<
  1 | 2 | 3,
  { accent: string; label: string; icon: LucideIcon; card: string; chip: string; soft: string }
> = {
  1: {
    accent: "#F5B400",
    label: "Champion",
    icon: Crown,
    card: "border-[#EAD083]/80 bg-[#FFF9EC] dark:border-[#5A4512] dark:bg-[#161208]",
    chip: "border-[#EAD083]/80 bg-white/75 text-[#A16800] dark:border-[#EAD083]/25 dark:bg-white/[0.06] dark:text-[#F4D67D]",
    soft: "bg-[#FFF1C4] dark:bg-[#2A210A]",
  },
  2: {
    accent: "#9CA7B6",
    label: "Runner Up",
    icon: Medal,
    card: "border-[#D5DBE5]/80 bg-[#F8FAFD] dark:border-[#434B57] dark:bg-[#0F1318]",
    chip: "border-[#D5DBE5]/80 bg-white/75 text-[#5D6776] dark:border-[#D5DBE5]/20 dark:bg-white/[0.06] dark:text-[#C9D0DB]",
    soft: "bg-[#EEF2F7] dark:bg-[#1A1F26]",
  },
  3: {
    accent: "#C98659",
    label: "Top 3",
    icon: Medal,
    card: "border-[#E6C3AD]/80 bg-[#FFF7F1] dark:border-[#523628] dark:bg-[#17100C]",
    chip: "border-[#E6C3AD]/80 bg-white/75 text-[#9A6038] dark:border-[#E6C3AD]/20 dark:bg-white/[0.06] dark:text-[#E4B897]",
    soft: "bg-[#F9E7DB] dark:bg-[#2A1B13]",
  },
};

function isPodiumRank(rank: number): rank is 1 | 2 | 3 {
  return rank === 1 || rank === 2 || rank === 3;
}

function levelName(level: number) {
  return LEVEL_NAMES[level] ?? "Go Learner";
}

function Avatar({ entry, size = "lg" }: { entry: LeaderboardEntry; size?: "lg" | "sm" }) {
  const dimension = size === "lg" ? "h-16 w-16 text-[22px]" : "h-11 w-11 text-[15px]";

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#0071E3] font-semibold text-white shadow-[0_12px_30px_rgba(0,113,227,0.18)]",
        dimension,
      )}
    >
      {entry.avatar_url ? (
        <img src={entry.avatar_url} alt={entry.name} className="h-full w-full object-cover" />
      ) : (
        entry.name.charAt(0).toUpperCase()
      )}
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  note,
  accent,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  note: string;
  accent: string;
}) {
  return (
    <article className="rounded-[22px] border border-[#D2D2D7]/60 bg-white/82 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.05)] backdrop-blur-sm dark:border-white/10 dark:bg-[#111214]/82 dark:shadow-[0_18px_40px_rgba(0,0,0,0.22)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#86868B]">{label}</p>
          <p className="mt-2 text-[13px] leading-5 text-[#86868B]">{note}</p>
        </div>
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl"
          style={{ backgroundColor: `${accent}14` }}
        >
          <Icon className="h-5 w-5" style={{ color: accent }} />
        </div>
      </div>
      <p className="mt-4 font-display text-[28px] font-semibold tracking-tight text-foreground">{value}</p>
    </article>
  );
}

function SpotlightCard({
  entry,
  isMe,
  compact = false,
  periodLabel,
}: {
  entry: LeaderboardEntry;
  isMe: boolean;
  compact?: boolean;
  periodLabel: string;
}) {
  const theme = PODIUM_THEMES[isPodiumRank(entry.rank) ? entry.rank : 3];
  const Icon = theme.icon;

  return (
    <article
      className={cn(
        "relative overflow-hidden rounded-[30px] border p-6 shadow-[0_22px_55px_rgba(15,23,42,0.06)] dark:shadow-[0_22px_55px_rgba(0,0,0,0.24)]",
        theme.card,
        compact ? "h-full" : "min-h-[340px] sm:min-h-[380px]",
        isMe ? "ring-2 ring-[#0071E3]/20" : "",
      )}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-24"
        style={{ background: `linear-gradient(180deg, ${theme.accent}22 0%, transparent 100%)` }}
      />
      <div
        className="pointer-events-none absolute -right-6 top-8 h-28 w-28 rounded-full blur-3xl"
        style={{ backgroundColor: `${theme.accent}18` }}
      />

      <div className="relative flex h-full flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className={cn("inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-medium", theme.chip)}>
            <Icon className="h-4 w-4" />
            <span>
              #{entry.rank} {theme.label}
            </span>
          </div>
          {isMe && (
            <span className="rounded-full bg-[#0071E3]/10 px-2.5 py-1 text-[11px] font-medium text-[#0071E3]">
              Kamu
            </span>
          )}
        </div>

        <div className="mt-6 flex items-center gap-4">
          <Avatar entry={entry} size={compact ? "sm" : "lg"} />
          <div className="min-w-0">
            <h3 className={cn("truncate font-display font-semibold tracking-tight text-foreground leading-[1.14] pb-[0.08em]", compact ? "text-[22px]" : "text-[30px] sm:text-[34px]")}>{entry.name}</h3>
            <p className="mt-1 text-[13px] text-[#86868B]">
              Level {entry.level} · {levelName(entry.level)}
            </p>
          </div>
        </div>

        <div className={cn("grid gap-3", compact ? "mt-6 grid-cols-2" : "mt-8 grid-cols-3") }>
          <div className={cn("rounded-[20px] p-4", theme.soft)}>
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#86868B]">XP</p>
            <p className="mt-2 font-display text-[22px] font-semibold tracking-tight text-foreground">{formatXP(entry.xp)}</p>
          </div>
          <div className={cn("rounded-[20px] p-4", theme.soft)}>
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#86868B]">Lesson</p>
            <p className="mt-2 font-display text-[22px] font-semibold tracking-tight text-foreground">{entry.lessons_done}</p>
          </div>
          {!compact && (
            <div className={cn("rounded-[20px] p-4", theme.soft)}>
              <p className="text-[11px] uppercase tracking-[0.14em] text-[#86868B]">Streak</p>
              <p className="mt-2 font-display text-[22px] font-semibold tracking-tight text-foreground">{entry.streak_days}</p>
            </div>
          )}
          {compact && (
            <div className={cn("rounded-[20px] p-4", theme.soft)}>
              <p className="text-[11px] uppercase tracking-[0.14em] text-[#86868B]">Streak</p>
              <p className="mt-2 font-display text-[22px] font-semibold tracking-tight text-foreground">{entry.streak_days}</p>
            </div>
          )}
        </div>

        {!compact && (
          <div className="mt-auto pt-5">
            <p className="text-[13px] leading-6 text-[#6E6E73] dark:text-[#A1A1AA]">
              Memimpin periode {periodLabel.toLowerCase()} dengan kombinasi XP, lesson selesai, dan ritme belajar yang paling konsisten.
            </p>
          </div>
        )}
      </div>
    </article>
  );
}

function RankRow({ entry, isMe }: { entry: LeaderboardEntry; isMe: boolean }) {
  const podium = isPodiumRank(entry.rank);
  const theme = podium ? PODIUM_THEMES[entry.rank as 1 | 2 | 3] : null;

  return (
    <article
      className={cn(
        "grid gap-4 rounded-[24px] border px-4 py-4 transition-all duration-300 sm:grid-cols-[78px_minmax(0,1.4fr)_120px_108px_108px] sm:items-center",
        isMe
          ? "border-[#0071E3]/25 bg-[#0071E3]/[0.06] dark:bg-[#0071E3]/10"
          : "border-black/[0.06] bg-white/82 shadow-[0_12px_30px_rgba(15,23,42,0.05)] hover:-translate-y-0.5 hover:border-black/[0.08] hover:shadow-[0_18px_40px_rgba(15,23,42,0.07)] dark:border-white/[0.08] dark:bg-white/[0.04] dark:shadow-[0_12px_30px_rgba(0,0,0,0.2)] dark:hover:border-white/[0.12]",
      )}
    >
      <div className="flex items-center gap-3 sm:justify-center">
        <div
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] border text-[13px] font-semibold",
            podium && theme
              ? theme.chip
              : "border-black/[0.06] bg-[#F5F5F7] text-foreground dark:border-white/[0.08] dark:bg-white/[0.05]",
          )}
        >
          #{entry.rank}
        </div>
        <div className="sm:hidden">
          <p className="text-[11px] uppercase tracking-[0.16em] text-[#86868B]">Peringkat</p>
          <p className="text-[13px] font-medium text-foreground">#{entry.rank}</p>
        </div>
      </div>

      <div className="flex min-w-0 items-center gap-3">
        <Avatar entry={entry} size="sm" />
        <div className="min-w-0">
          <p className={cn("truncate text-[15px] font-medium", isMe ? "text-[#0071E3]" : "text-foreground")}>
            {entry.name} {isMe && <span className="text-[11px]">(Kamu)</span>}
          </p>
          <p className="text-[12px] text-[#86868B]">
            Level {entry.level} · {levelName(entry.level)}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between sm:block">
        <span className="text-[12px] text-[#86868B] sm:hidden">XP</span>
        <p className={cn("text-[15px] font-semibold sm:text-right", isMe ? "text-[#0071E3]" : "text-foreground")}>
          {formatXP(entry.xp)}
        </p>
      </div>

      <div className="flex items-center justify-between sm:block">
        <span className="text-[12px] text-[#86868B] sm:hidden">Lesson</span>
        <p className="text-[14px] text-foreground sm:text-right">{entry.lessons_done}</p>
      </div>

      <div className="flex items-center justify-between sm:block">
        <span className="text-[12px] text-[#86868B] sm:hidden">Streak</span>
        <p className="text-[14px] text-foreground sm:text-right">{entry.streak_days}</p>
      </div>
    </article>
  );
}

export default function LeaderboardPage() {
  const { state } = useAuth();
  const [period, setPeriod] = useState<"alltime" | "month" | "week">("alltime");
  const [data, setData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    api
      .leaderboard(period)
      .then((entries) => {
        if (cancelled) return;
        setData(entries ?? []);
      })
      .catch(() => {
        if (cancelled) return;
        setData([]);
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [period]);

  const periodLabel = PERIODS.find((item) => item.key === period)?.label ?? "Semua Waktu";
  const meEntry = data.find((entry) => state.user?.id === entry.id);
  const leader = data[0];
  const challengers = data.slice(1, 3);
  const participantCount = data.length;
  const isSparse = participantCount <= 2;
  const isMedium = participantCount >= 3 && participantCount <= 8;
  const isCrowded = participantCount >= 9;

  const summaryCards = [
    {
      icon: Users,
      label: "Pemain aktif",
      value: loading ? "..." : `${data.length}`,
      note: `Peserta pada periode ${periodLabel.toLowerCase()}`,
      accent: "#0071E3",
    },
    {
      icon: Trophy,
      label: "Skor tertinggi",
      value: loading ? "..." : leader ? formatXP(leader.xp) : "-",
      note: leader ? leader.name : "Belum ada pemimpin periode ini",
      accent: "#F5B400",
    },
    {
      icon: Target,
      label: state.user ? "Posisimu" : "Status",
      value: loading ? "..." : meEntry ? `#${meEntry.rank}` : state.user ? "Belum masuk" : "Tamu",
      note: meEntry ? `${formatXP(meEntry.xp)} XP terkumpul` : "XP akan muncul setelah progress belajarmu tercatat",
      accent: "#34C759",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto w-full max-w-screen-2xl px-4 md:px-8 pb-24 pt-32 sm:px-6">
        <section className="relative overflow-hidden rounded-[36px] border border-black/[0.06] bg-[#FBFBFD] p-5 shadow-[0_28px_80px_rgba(15,23,42,0.08)] dark:border-white/[0.08] dark:bg-[#0F0F11] dark:shadow-[0_28px_80px_rgba(0,0,0,0.32)] sm:p-8 lg:p-10 xl:p-9">
          <div className="pointer-events-none absolute -left-10 top-0 h-48 w-48 rounded-full bg-[#0071E3]/15 blur-3xl" />
          <div className="pointer-events-none absolute right-0 top-10 h-40 w-40 rounded-full bg-[#AF52DE]/12 blur-3xl" />

          <div className="relative grid gap-6 2xl:grid-cols-[minmax(0,1.05fr)_360px] 2xl:items-center 2xl:gap-8">
            <div className="max-w-3xl 2xl:pr-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#0071E3]/15 bg-[#0071E3]/8 px-3 py-1.5 text-[12px] font-medium text-[#0071E3] dark:border-[#4AA3FF]/20 dark:bg-[#0071E3]/10 dark:text-[#75B8FF]">
                <Sparkles className="h-3.5 w-3.5" />
                Kompetisi dan progres belajar
              </div>

              <h1 className="mt-5 font-display text-[34px] font-semibold tracking-[-0.04em] text-foreground sm:text-[48px] xl:text-[56px] 2xl:text-[64px] leading-[1.04] max-w-[12ch] sm:max-w-none">
                Leaderboard GoLearn
              </h1>
              <p className="mt-4 max-w-2xl text-[16px] leading-7 text-[#6E6E73] dark:text-[#A1A1AA] sm:text-[18px] 2xl:max-w-2xl">
                Lihat siapa yang paling konsisten belajar, siapa yang sedang melesat paling cepat, dan bagaimana posisi kamu di antara learner lain.
              </p>

              <div className="mt-8 flex flex-wrap gap-2">
                {PERIODS.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setPeriod(item.key)}
                    className={cn(
                      "rounded-full px-5 py-2.5 text-[13px] font-medium transition-colors whitespace-nowrap",
                      period === item.key
                        ? "bg-[#0071E3] text-white shadow-sm"
                        : "border border-[#D2D2D7]/60 bg-white/80 text-[#86868B] hover:text-foreground dark:border-white/10 dark:bg-[#1C1C1E] dark:hover:bg-[#242426]",
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                {state.user ? (
                  meEntry ? (
                    <div className="inline-flex items-center gap-2 rounded-full border border-[#0071E3]/15 bg-[#0071E3]/8 px-4 py-2 text-[13px] font-medium text-[#0071E3]">
                      <Target className="h-4 w-4" />
                      Kamu sedang di peringkat #{meEntry.rank}
                    </div>
                  ) : (
                    <Link
                      href="/modules"
                      className="inline-flex items-center gap-2 rounded-full bg-[#0071E3] px-5 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-[#0077ED]"
                    >
                      Mulai kumpulkan XP
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  )
                ) : (
                  <Link
                    href="/register"
                    className="inline-flex items-center gap-2 rounded-full bg-[#0071E3] px-5 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-[#0077ED]"
                  >
                    Buat akun untuk ikut ranking
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                )}

                <Link
                  href="/modules"
                  className="inline-flex items-center gap-2 rounded-full border border-[#D2D2D7]/60 bg-white/80 px-5 py-2.5 text-[13px] font-medium text-foreground transition-colors hover:bg-[#F5F5F7] dark:border-white/10 dark:bg-[#1C1C1E] dark:hover:bg-[#242426]"
                >
                  <BookOpen className="h-4 w-4 text-[#0071E3]" />
                  Jelajahi kursus
                </Link>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-3 2xl:grid-cols-1 2xl:self-stretch">
              {summaryCards.map((card) => (
                <SummaryCard key={card.label} {...card} />
              ))}
            </div>
          </div>
        </section>

        {loading ? (
          <>
            <section className="mt-8 grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_0.9fr]">
              <div className="rounded-[32px] border border-[#D2D2D7]/60 bg-[#F5F5F7]/50 p-8 animate-pulse dark:border-white/10 dark:bg-[#1C1C1E]/50">
                <div className="h-6 w-28 rounded-full bg-[#D2D2D7]/50 dark:bg-white/10" />
                <div className="mt-8 flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-[#D2D2D7]/50 dark:bg-white/10" />
                  <div className="space-y-3">
                    <div className="h-5 w-40 rounded-full bg-[#D2D2D7]/50 dark:bg-white/10" />
                    <div className="h-3 w-28 rounded-full bg-[#D2D2D7]/40 dark:bg-white/5" />
                  </div>
                </div>
                <div className="mt-8 grid grid-cols-3 gap-3">
                  <div className="h-24 rounded-[20px] bg-[#D2D2D7]/40 dark:bg-white/5" />
                  <div className="h-24 rounded-[20px] bg-[#D2D2D7]/40 dark:bg-white/5" />
                  <div className="h-24 rounded-[20px] bg-[#D2D2D7]/40 dark:bg-white/5" />
                </div>
              </div>
              <div className="grid gap-5">
                {Array.from({ length: 2 }).map((_, index) => (
                  <div key={index} className="rounded-[30px] border border-[#D2D2D7]/60 bg-[#F5F5F7]/50 p-6 animate-pulse dark:border-white/10 dark:bg-[#1C1C1E]/50">
                    <div className="h-5 w-24 rounded-full bg-[#D2D2D7]/50 dark:bg-white/10" />
                    <div className="mt-6 flex items-center gap-3">
                      <div className="h-11 w-11 rounded-full bg-[#D2D2D7]/50 dark:bg-white/10" />
                      <div className="space-y-2">
                        <div className="h-4 w-24 rounded-full bg-[#D2D2D7]/50 dark:bg-white/10" />
                        <div className="h-3 w-20 rounded-full bg-[#D2D2D7]/40 dark:bg-white/5" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="mt-8 rounded-[32px] border border-black/[0.06] bg-[#FBFBFD] p-5 shadow-[0_24px_60px_rgba(15,23,42,0.07)] dark:border-white/[0.08] dark:bg-[#101012] dark:shadow-[0_24px_60px_rgba(0,0,0,0.28)]">
              <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="grid gap-4 rounded-[24px] border border-black/[0.06] bg-white/80 px-4 py-4 animate-pulse sm:grid-cols-[78px_minmax(0,1.4fr)_120px_108px_108px] sm:items-center dark:border-white/[0.08] dark:bg-white/[0.04]">
                    <div className="h-12 w-12 rounded-[16px] bg-black/[0.06] dark:bg-white/[0.08]" />
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 rounded-full bg-black/[0.06] dark:bg-white/[0.08]" />
                      <div className="space-y-2">
                        <div className="h-4 w-32 rounded-full bg-black/[0.06] dark:bg-white/[0.08]" />
                        <div className="h-3 w-24 rounded-full bg-black/[0.05] dark:bg-white/[0.06]" />
                      </div>
                    </div>
                    <div className="h-4 w-16 rounded-full bg-black/[0.06] justify-self-end dark:bg-white/[0.08]" />
                    <div className="h-4 w-12 rounded-full bg-black/[0.06] justify-self-end dark:bg-white/[0.08]" />
                    <div className="h-4 w-12 rounded-full bg-black/[0.06] justify-self-end dark:bg-white/[0.08]" />
                  </div>
                ))}
              </div>
            </section>
          </>
        ) : data.length === 0 ? (
          <section className="mt-8 rounded-[32px] border border-black/[0.06] bg-[#FBFBFD] p-10 shadow-[0_24px_60px_rgba(15,23,42,0.07)] dark:border-white/[0.08] dark:bg-[#101012] dark:shadow-[0_24px_60px_rgba(0,0,0,0.28)]">
            <div className="flex flex-col items-center justify-center rounded-[28px] border border-dashed border-black/[0.08] bg-black/[0.02] px-6 py-16 text-center dark:border-white/[0.1] dark:bg-white/[0.03]">
              <div className="flex h-16 w-16 items-center justify-center rounded-[20px] bg-[#0071E3]/10 text-[#0071E3]">
                <Trophy className="h-8 w-8" />
              </div>
              <h2 className="mt-5 font-display text-[30px] font-semibold tracking-tight text-foreground">
                Belum ada leaderboard untuk {periodLabel.toLowerCase()}
              </h2>
              <p className="mt-3 max-w-md text-[15px] leading-7 text-[#86868B]">
                Aktivitas belajar akan muncul di sini setelah peserta mulai menyelesaikan lesson dan mengumpulkan XP pada periode ini.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Link
                  href={state.user ? "/modules" : "/register"}
                  className="inline-flex items-center gap-2 rounded-full bg-[#0071E3] px-5 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-[#0077ED]"
                >
                  {state.user ? "Mulai belajar sekarang" : "Buat akun dan mulai belajar"}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                {period !== "alltime" && (
                  <button
                    type="button"
                    onClick={() => setPeriod("alltime")}
                    className="rounded-full border border-[#D2D2D7]/60 bg-white px-5 py-2.5 text-[13px] font-medium text-foreground transition-colors hover:bg-[#F5F5F7] dark:border-white/10 dark:bg-[#1C1C1E] dark:hover:bg-[#242426]"
                  >
                    Lihat semua waktu
                  </button>
                )}
              </div>
            </div>
          </section>
        ) : (
          <>
            <section className="mt-8">
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#86868B]">Sorotan</p>
                  <h2 className="mt-2 font-display text-[30px] font-semibold tracking-tight text-foreground">
                    {leader ? `Pemain teratas ${periodLabel.toLowerCase()}` : "Papan peringkat"}
                  </h2>
                </div>
                <p className="text-[13px] text-[#86868B]">
                  {isSparse ? "Mode spotlight untuk peserta yang masih sedikit." : isMedium ? "Podium dan ranking ringkas untuk kompetisi yang mulai hidup." : "Layout dipadatkan untuk menjaga ranking tetap nyaman dibaca."}
                </p>
              </div>

              {leader && challengers.length > 0 ? (
                <div className={cn(
                  "grid gap-5 xl:items-stretch",
                  isMedium ? "xl:grid-cols-[minmax(0,1.05fr)_0.95fr]" : "xl:grid-cols-[minmax(0,1.08fr)_0.92fr]",
                )}>
                  <SpotlightCard entry={leader} isMe={state.user?.id === leader.id} periodLabel={periodLabel} />
                  <div className={cn("grid gap-5", isSparse ? "sm:grid-cols-1" : "sm:grid-cols-2 xl:grid-cols-1")}>
                    {challengers.map((entry) => (
                      <SpotlightCard
                        key={entry.id}
                        entry={entry}
                        isMe={state.user?.id === entry.id}
                        compact
                        periodLabel={periodLabel}
                      />
                    ))}
                  </div>
                </div>
              ) : leader ? (
                <div className={cn("mx-auto", isSparse ? "max-w-3xl" : "max-w-4xl")}>
                  <SpotlightCard entry={leader} isMe={state.user?.id === leader.id} periodLabel={periodLabel} />
                </div>
              ) : null}
            </section>

            <section className="mt-8 rounded-[32px] border border-black/[0.06] bg-[#FBFBFD] p-5 shadow-[0_24px_60px_rgba(15,23,42,0.07)] dark:border-white/[0.08] dark:bg-[#101012] dark:shadow-[0_24px_60px_rgba(0,0,0,0.28)] sm:p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#86868B]">Semua Peringkat</p>
                  <h2 className="mt-2 font-display text-[28px] font-semibold tracking-tight text-foreground">
                    Ranking lengkap peserta
                  </h2>
                  <p className="mt-2 text-[14px] leading-6 text-[#86868B]">
                    Urutan berdasarkan XP, dengan lesson selesai dan streak sebagai sinyal konsistensi belajar.
                  </p>
                </div>
                <div className="rounded-full bg-black/[0.03] px-4 py-2 text-[13px] font-medium text-foreground dark:bg-white/[0.05]">
                  {data.length} peserta tercatat
                </div>
              </div>

              <div className="mt-6 mb-3 hidden grid-cols-[78px_minmax(0,1.4fr)_120px_108px_108px] gap-4 px-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#86868B] sm:grid">
                <span>Peringkat</span>
                <span>Peserta</span>
                <span className="text-right">XP</span>
                <span className="text-right">Lesson</span>
                <span className="text-right">Streak</span>
              </div>

              <div className={cn("space-y-3", isCrowded && "space-y-2") }>
                {data.map((entry) => (
                  <RankRow key={entry.id} entry={entry} isMe={state.user?.id === entry.id} />
                ))}
              </div>
            </section>

            {!state.user && (
              <section className="mt-8 rounded-[30px] border border-[#0071E3]/15 bg-[#F7FAFF] p-6 dark:border-[#4AA3FF]/15 dark:bg-[#101722] sm:p-7">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#0071E3]">Ikut Kompetisi</p>
                    <h3 className="mt-2 font-display text-[24px] font-semibold tracking-tight text-foreground">
                      Masuk supaya progress kamu mulai dihitung
                    </h3>
                    <p className="mt-2 max-w-2xl text-[14px] leading-6 text-[#86868B]">
                      Daftar akun, selesaikan lesson pertama, lalu XP kamu akan otomatis masuk ke leaderboard.
                    </p>
                  </div>
                  <Link
                    href="/register"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0071E3] px-6 py-3 text-[14px] font-medium text-white transition-colors hover:bg-[#0077ED]"
                  >
                    Buat akun gratis
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}
