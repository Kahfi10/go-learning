"use client";
import { type ReactElement, useEffect, useState } from "react";
import { Crown, Medal, Trophy } from "lucide-react";
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
  { accent: string; label: string; card: string; chip: string; order: string; icon: ReactElement }
> = {
  1: {
    accent: "#F5B400",
    label: "Champion",
    card: "border-[#F0D27A]/60 bg-[#FFF9E9] dark:border-[#5C4614] dark:bg-[#171208] lg:-translate-y-4",
    chip: "border-[#F0D27A]/60 bg-white/70 text-[#A36A00] dark:border-[#F0D27A]/25 dark:bg-white/[0.06] dark:text-[#F7D880]",
    order: "lg:order-2",
    icon: <Crown className="h-4 w-4" />,
  },
  2: {
    accent: "#A7B0BE",
    label: "Runner Up",
    card: "border-[#D8DDE6]/70 bg-[#F8FAFD] dark:border-[#404751] dark:bg-[#101419]",
    chip: "border-[#D8DDE6]/70 bg-white/70 text-[#5E6978] dark:border-[#D8DDE6]/20 dark:bg-white/[0.06] dark:text-[#C7CDD7]",
    order: "lg:order-1",
    icon: <Medal className="h-4 w-4" />,
  },
  3: {
    accent: "#C68456",
    label: "Top 3",
    card: "border-[#E2C0A8]/70 bg-[#FFF6F1] dark:border-[#513527] dark:bg-[#17100C]",
    chip: "border-[#E2C0A8]/70 bg-white/70 text-[#9D5E33] dark:border-[#E2C0A8]/20 dark:bg-white/[0.06] dark:text-[#E4B694]",
    order: "lg:order-3",
    icon: <Medal className="h-4 w-4" />,
  },
};

function isPodiumRank(rank: number): rank is 1 | 2 | 3 {
  return rank === 1 || rank === 2 || rank === 3;
}

export default function LeaderboardPage() {
  const { state } = useAuth();
  const [period, setPeriod] = useState<"alltime" | "month" | "week">("alltime");
  const [data, setData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .leaderboard(period)
      .then((entries) => {
        setData(entries ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [period]);

  useEffect(() => {
    if (!data.length) return;

    import("gsap").then(({ gsap }) => {
      gsap.from(".lb-row", {
        opacity: 0,
        x: -20,
        duration: 0.4,
        ease: "expo.out",
        stagger: 0.04,
      });
    });
  }, [data, period]);

  const periodLabel = PERIODS.find((item) => item.key === period)?.label ?? "Semua Waktu";
  const meEntry = data.find((entry) => state.user?.id === entry.id);
  const topThree = data.slice(0, 3);
  const remaining = data.slice(3);

  const summaryCards = [
    {
      label: "Pemain aktif",
      value: loading ? "..." : `${data.length}`,
      note: `Periode ${periodLabel.toLowerCase()}`,
    },
    {
      label: "Skor tertinggi",
      value: loading ? "..." : data[0] ? formatXP(data[0].xp) : "-",
      note: data[0] ? data[0].name : "Belum ada peringkat",
    },
    {
      label: state.user ? "Posisimu" : "Status",
      value: loading
        ? "..."
        : meEntry
          ? `#${meEntry.rank}`
          : state.user
            ? "Belum masuk"
            : "Tamu",
      note: meEntry ? `${formatXP(meEntry.xp)} XP` : "XP akan muncul saat kamu ikut belajar",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 sm:px-6 pb-24 pt-24">
        <section className="relative mb-6 overflow-hidden rounded-[32px] border border-black/[0.06] bg-[#FBFBFD] p-8 shadow-[0_28px_80px_rgba(15,23,42,0.08)] dark:border-white/[0.08] dark:bg-[#0F0F11] dark:shadow-[0_28px_80px_rgba(0,0,0,0.32)] sm:p-10">
          <div className="pointer-events-none absolute -left-12 top-0 h-48 w-48 rounded-full bg-[#0071E3]/14 blur-3xl" />
          <div className="pointer-events-none absolute right-0 top-6 h-40 w-40 rounded-full bg-[#F5B400]/10 blur-3xl" />

          <div className="relative grid gap-8 xl:grid-cols-[minmax(0,1.25fr)_340px] xl:items-start">
            <div className="max-w-2xl">
              <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[#86868B]">
                Kompetisi
              </p>
              <h1 className="mt-4 font-display text-[34px] font-semibold tracking-tight text-foreground sm:text-[42px] xl:text-[48px]">
                Leaderboard GoLearn
              </h1>
              <p className="mt-3 max-w-xl text-[16px] leading-7 text-[#86868B] sm:text-[17px]">
                Papan peringkat untuk melihat siapa yang paling konsisten, paling cepat
                bertumbuh, dan bagaimana posisimu di antara learner lain.
              </p>

              <div className="mt-8 flex flex-wrap gap-2">
                {PERIODS.map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setPeriod(item.key)}
                    className={cn(
                      "rounded-full px-4 py-2 text-[13px] font-medium transition-all",
                      period === item.key
                        ? "bg-[#0071E3] text-white shadow-[0_14px_34px_rgba(0,113,227,0.22)]"
                        : "border border-black/[0.06] bg-white/80 text-[#86868B] hover:text-foreground dark:border-white/[0.08] dark:bg-white/[0.04] dark:hover:bg-white/[0.08]",
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {summaryCards.map((card) => (
                <article
                  key={card.label}
                  className="rounded-[24px] border border-black/[0.06] bg-white/80 p-4 shadow-[0_14px_35px_rgba(15,23,42,0.05)] backdrop-blur-sm dark:border-white/[0.08] dark:bg-white/[0.04] dark:shadow-none"
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#86868B]">
                    {card.label}
                  </p>
                  <p className="mt-3 font-display text-[28px] font-semibold tracking-tight text-foreground">
                    {card.value}
                  </p>
                  <p className="mt-1 text-[13px] leading-6 text-[#86868B]">{card.note}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {loading ? (
          <>
            <section className="mb-6 grid gap-4 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    "overflow-hidden rounded-[28px] border border-black/[0.06] bg-[#FBFBFD] p-6 shadow-[0_20px_50px_rgba(15,23,42,0.06)] animate-pulse dark:border-white/[0.08] dark:bg-[#101012] dark:shadow-[0_20px_50px_rgba(0,0,0,0.24)]",
                    index === 1 ? "lg:-translate-y-4" : "",
                  )}
                >
                  <div className="h-6 w-28 rounded-full bg-black/[0.06] dark:bg-white/[0.08]" />
                  <div className="mt-6 flex items-center gap-4">
                    <div className="h-14 w-14 rounded-full bg-black/[0.06] dark:bg-white/[0.08]" />
                    <div className="space-y-2">
                      <div className="h-4 w-32 rounded-full bg-black/[0.06] dark:bg-white/[0.08]" />
                      <div className="h-3 w-24 rounded-full bg-black/[0.05] dark:bg-white/[0.06]" />
                    </div>
                  </div>
                  <div className="mt-8 grid grid-cols-3 gap-3">
                    {Array.from({ length: 3 }).map((__, metricIndex) => (
                      <div
                        key={metricIndex}
                        className="h-20 rounded-[20px] bg-black/[0.04] dark:bg-white/[0.05]"
                      />
                    ))}
                  </div>
                </div>
              ))}
            </section>

            <section className="rounded-[30px] border border-black/[0.06] bg-[#FBFBFD] p-4 shadow-[0_24px_60px_rgba(15,23,42,0.07)] dark:border-white/[0.08] dark:bg-[#101012] dark:shadow-[0_24px_60px_rgba(0,0,0,0.28)] sm:p-5">
              <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="grid gap-4 rounded-[24px] border border-black/[0.06] bg-white/80 px-4 py-4 animate-pulse sm:grid-cols-[68px_minmax(0,1fr)_120px_112px] sm:items-center dark:border-white/[0.08] dark:bg-white/[0.04]"
                  >
                    <div className="h-11 w-11 rounded-2xl bg-black/[0.06] dark:bg-white/[0.08]" />
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-black/[0.06] dark:bg-white/[0.08]" />
                      <div className="space-y-2">
                        <div className="h-4 w-32 rounded-full bg-black/[0.06] dark:bg-white/[0.08]" />
                        <div className="h-3 w-24 rounded-full bg-black/[0.05] dark:bg-white/[0.06]" />
                      </div>
                    </div>
                    <div className="h-4 w-16 rounded-full bg-black/[0.06] justify-self-end dark:bg-white/[0.08]" />
                    <div className="h-4 w-14 rounded-full bg-black/[0.06] justify-self-end dark:bg-white/[0.08]" />
                  </div>
                ))}
              </div>
            </section>
          </>
        ) : data.length === 0 ? (
          <section className="rounded-[30px] border border-black/[0.06] bg-[#FBFBFD] p-10 shadow-[0_24px_60px_rgba(15,23,42,0.07)] dark:border-white/[0.08] dark:bg-[#101012] dark:shadow-[0_24px_60px_rgba(0,0,0,0.28)]">
            <div className="flex flex-col items-center justify-center rounded-[26px] border border-dashed border-black/[0.08] bg-black/[0.02] px-6 py-16 text-center dark:border-white/[0.1] dark:bg-white/[0.03]">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0071E3]/10 text-[#0071E3]">
                <Trophy className="h-7 w-7" />
              </div>
              <h2 className="mt-5 font-display text-[28px] font-semibold tracking-tight text-foreground">
                Belum ada data untuk {periodLabel.toLowerCase()}
              </h2>
              <p className="mt-2 max-w-md text-[14px] leading-7 text-[#86868B]">
                Aktivitas belajar akan muncul di leaderboard setelah XP tercatat pada periode ini.
              </p>
              {period !== "alltime" && (
                <button
                  onClick={() => setPeriod("alltime")}
                  className="mt-6 rounded-full bg-[#0071E3] px-5 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-[#0077ED]"
                >
                  Lihat semua waktu
                </button>
              )}
            </div>
          </section>
        ) : (
          <>
            <section className="mb-6">
              <div className="mb-4 flex items-end justify-between gap-4">
                <div>
                  <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#86868B]">
                    Podium
                  </p>
                  <h2 className="mt-2 font-display text-[28px] font-semibold tracking-tight text-foreground">
                    Tiga teratas untuk {periodLabel.toLowerCase()}
                  </h2>
                </div>
                <p className="text-[13px] text-[#86868B]">XP tertinggi tampil paling menonjol</p>
              </div>

              <div className="grid gap-4 lg:grid-cols-3 lg:items-end">
                {topThree.map((entry) => {
                  const theme = PODIUM_THEMES[isPodiumRank(entry.rank) ? entry.rank : 3];
                  const isMe = state.user?.id === entry.id;

                  return (
                    <article
                      key={entry.id}
                      className={cn(
                        "lb-row relative overflow-hidden rounded-[28px] border p-6 shadow-[0_20px_50px_rgba(15,23,42,0.06)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.24)]",
                        theme.card,
                        theme.order,
                        isMe ? "ring-2 ring-[#0071E3]/20" : "",
                      )}
                    >
                      <div
                        className="pointer-events-none absolute -right-8 top-0 h-32 w-32 rounded-full blur-3xl"
                        style={{ backgroundColor: `${theme.accent}20` }}
                      />

                      <div className="relative flex h-full flex-col">
                        <div className="flex items-start justify-between gap-3">
                          <div
                            className={cn(
                              "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-medium",
                              theme.chip,
                            )}
                          >
                            {theme.icon}
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
                          <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#0071E3] text-[20px] font-semibold text-white">
                            {entry.avatar_url ? (
                              <img
                                src={entry.avatar_url}
                                alt={entry.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              entry.name.charAt(0).toUpperCase()
                            )}
                          </div>

                          <div className="min-w-0">
                            <h3 className="truncate font-display text-[24px] font-semibold tracking-tight text-foreground">
                              {entry.name}
                            </h3>
                            <p className="mt-1 text-[13px] text-[#86868B]">
                              Level {entry.level} · {LEVEL_NAMES[entry.level]}
                            </p>
                          </div>
                        </div>

                        <div className="mt-8 grid grid-cols-3 gap-3">
                          <div className="rounded-[20px] bg-black/[0.04] p-4 dark:bg-white/[0.05]">
                            <p className="text-[11px] uppercase tracking-[0.14em] text-[#86868B]">
                              XP
                            </p>
                            <p className="mt-2 font-display text-[22px] font-semibold tracking-tight text-foreground">
                              {formatXP(entry.xp)}
                            </p>
                          </div>
                          <div className="rounded-[20px] bg-black/[0.04] p-4 dark:bg-white/[0.05]">
                            <p className="text-[11px] uppercase tracking-[0.14em] text-[#86868B]">
                              Lesson
                            </p>
                            <p className="mt-2 font-display text-[22px] font-semibold tracking-tight text-foreground">
                              {entry.lessons_done}
                            </p>
                          </div>
                          <div className="rounded-[20px] bg-black/[0.04] p-4 dark:bg-white/[0.05]">
                            <p className="text-[11px] uppercase tracking-[0.14em] text-[#86868B]">
                              Streak
                            </p>
                            <p className="mt-2 font-display text-[22px] font-semibold tracking-tight text-foreground">
                              {entry.streak_days}
                            </p>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>

            {remaining.length > 0 && (
              <section className="rounded-[30px] border border-black/[0.06] bg-[#FBFBFD] p-4 shadow-[0_24px_60px_rgba(15,23,42,0.07)] dark:border-white/[0.08] dark:bg-[#101012] dark:shadow-[0_24px_60px_rgba(0,0,0,0.28)] sm:p-5">
                <div className="mb-3 hidden grid-cols-[68px_minmax(0,1fr)_120px_112px] gap-4 px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#86868B] sm:grid">
                  <span>Peringkat</span>
                  <span>Pengguna</span>
                  <span className="text-right">XP</span>
                  <span className="text-right">Lesson</span>
                </div>

                <div className="space-y-3">
                  {remaining.map((entry) => {
                    const isMe = state.user?.id === entry.id;

                    return (
                      <article
                        key={entry.id}
                        className={cn(
                          "lb-row grid gap-4 rounded-[24px] border border-black/[0.06] bg-white/80 px-4 py-4 shadow-[0_12px_30px_rgba(15,23,42,0.05)] transition-all duration-300 sm:grid-cols-[68px_minmax(0,1fr)_120px_112px] sm:items-center dark:border-white/[0.08] dark:bg-white/[0.04] dark:shadow-[0_12px_30px_rgba(0,0,0,0.2)]",
                          isMe
                            ? "border-[#0071E3]/25 bg-[#0071E3]/[0.07] dark:bg-[#0071E3]/10"
                            : "hover:-translate-y-0.5 hover:border-black/[0.08] hover:shadow-[0_18px_40px_rgba(15,23,42,0.07)] dark:hover:border-white/[0.12]",
                        )}
                      >
                        <div className="flex items-center gap-3 sm:justify-center">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-black/[0.06] bg-[#F5F5F7] text-[13px] font-semibold text-foreground dark:border-white/[0.08] dark:bg-white/[0.05]">
                            #{entry.rank}
                          </div>
                          <div className="sm:hidden">
                            <p className="text-[12px] text-[#86868B]">Peringkat</p>
                            <p className="text-[13px] font-medium text-foreground">#{entry.rank}</p>
                          </div>
                        </div>

                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#0071E3] text-[14px] font-semibold text-white">
                            {entry.avatar_url ? (
                              <img
                                src={entry.avatar_url}
                                alt={entry.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              entry.name.charAt(0).toUpperCase()
                            )}
                          </div>

                          <div className="min-w-0">
                            <p className={cn("truncate text-[15px] font-medium", isMe ? "text-[#0071E3]" : "text-foreground")}>
                              {entry.name} {isMe && <span className="text-[11px]">(Kamu)</span>}
                            </p>
                            <p className="text-[12px] text-[#86868B]">
                              Level {entry.level} · {LEVEL_NAMES[entry.level]} · {entry.streak_days} hari streak
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
                          <p className="mt-1 hidden text-[11px] text-[#86868B] sm:block sm:text-right">
                            {entry.streak_days} hari streak
                          </p>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}
