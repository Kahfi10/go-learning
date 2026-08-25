"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ChevronRight,
  Clock,
  Search,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import Navbar from "@/components/navigation/Navbar";
import { ProgressBar } from "@/components/ui/progress";
import { LevelBadge } from "@/components/ui/badge";
import { api, type Topic } from "@/lib/api";
import { useProgress } from "@/hooks/useProgress";
import { cn } from "@/lib/utils";

const LEVELS = ["All", "Beginner", "Intermediate", "Advanced"] as const;
type Level = (typeof LEVELS)[number];
const FALLBACK_LESSON_COUNT = 5;

function getLessonCount(topic: Topic) {
  return (topic as Topic & { lessons?: unknown[] }).lessons?.length ?? FALLBACK_LESSON_COUNT;
}

export default function ModulesPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [filter, setFilter] = useState<Level>("All");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { topicProgress } = useProgress();

  useEffect(() => {
    api.topics
      .list()
      .then((data) => setTopics(data ?? []))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (!topics.length) return;
    import("gsap").then(({ gsap }) => {
      import("gsap/ScrollTrigger").then(({ ScrollTrigger }) => {
        gsap.registerPlugin(ScrollTrigger);
        gsap.from(".topic-grid-card", {
          y: 24,
          scale: 0.97,
          stagger: 0.05,
          duration: 0.55,
          ease: "expo.out",
          scrollTrigger: { trigger: ".topic-grid", start: "top 85%", once: true },
        });
      });
    });
  }, [topics]);

  const query = search.trim().toLowerCase();
  const filtered = topics.filter((topic) => {
    const matchLevel = filter === "All" || topic.level === filter;
    const matchSearch =
      !query ||
      topic.title_id.toLowerCase().includes(query) ||
      topic.title_en.toLowerCase().includes(query);
    return matchLevel && matchSearch;
  });

  const totalDone = topics.reduce(
    (acc, topic) => acc + topicProgress(topic.slug, getLessonCount(topic)).done,
    0,
  );
  const totalLessons = topics.reduce((acc, topic) => acc + getLessonCount(topic), 0);
  const overallPct = totalLessons ? Math.round((totalDone / totalLessons) * 100) : 0;
  const startedTopics = topics.filter((topic) => topicProgress(topic.slug, getLessonCount(topic)).done > 0).length;
  const completedTopics = topics.filter(
    (topic) => topicProgress(topic.slug, getLessonCount(topic)).pct === 100,
  ).length;
  const hasActiveFilters = Boolean(search) || filter !== "All";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 sm:px-6 pb-24 pt-24">
        <section className="relative overflow-hidden rounded-[34px] border border-black/[0.06] bg-[#FBFBFD] p-8 shadow-[0_28px_80px_rgba(15,23,42,0.08)] dark:border-white/[0.08] dark:bg-[#0F0F11] dark:shadow-[0_28px_80px_rgba(0,0,0,0.32)] sm:p-10">
          <div className="pointer-events-none absolute -left-10 top-0 h-48 w-48 rounded-full bg-[#0071E3]/15 blur-3xl" />
          <div className="pointer-events-none absolute right-0 top-10 h-40 w-40 rounded-full bg-[#AF52DE]/12 blur-3xl" />

          <div className="relative grid gap-8 xl:grid-cols-[minmax(0,1.12fr)_320px] xl:items-start">
            <div className="max-w-2xl">
              <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[#86868B]">
                GoLearn Modules
              </p>
              <h1 className="mt-4 max-w-3xl font-display text-[30px] font-semibold tracking-tight text-foreground sm:text-[38px] xl:text-[46px] leading-[1.06]">
                Semua topik Go, dirancang lebih rapi untuk fokus belajar.
              </h1>
              <p className="mt-3 max-w-xl text-[16px] leading-7 text-[#86868B] sm:text-[17px]">
                Jelajahi semua topik, lanjutkan progress yang sedang berjalan, dan pilih
                jalur belajar yang paling relevan untuk ritme belajarmu.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <div className="rounded-full border border-black/[0.06] bg-white/80 px-4 py-2 text-[13px] font-medium text-foreground shadow-[0_10px_30px_rgba(15,23,42,0.05)] dark:border-white/[0.08] dark:bg-white/[0.04] dark:shadow-none">
                  {topics.length} topik
                </div>
                <div className="rounded-full border border-black/[0.06] bg-white/80 px-4 py-2 text-[13px] font-medium text-foreground shadow-[0_10px_30px_rgba(15,23,42,0.05)] dark:border-white/[0.08] dark:bg-white/[0.04] dark:shadow-none">
                  {totalLessons} lesson
                </div>
                <div className="rounded-full border border-black/[0.06] bg-white/80 px-4 py-2 text-[13px] font-medium text-foreground shadow-[0_10px_30px_rgba(15,23,42,0.05)] dark:border-white/[0.08] dark:bg-white/[0.04] dark:shadow-none">
                  Bilingual ID/EN
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-black/[0.06] bg-white/80 p-6 shadow-[0_20px_50px_rgba(15,23,42,0.06)] backdrop-blur-sm dark:border-white/[0.08] dark:bg-white/[0.04] dark:shadow-[0_20px_50px_rgba(0,0,0,0.24)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#86868B]">
                    Progress Overview
                  </p>
                  <h2 className="mt-3 font-display text-[36px] font-semibold tracking-tight text-foreground">
                    {overallPct}%
                  </h2>
                  <p className="mt-1 text-[14px] text-[#86868B]">
                    {totalLessons
                      ? `${totalDone} dari ${totalLessons} lesson selesai`
                      : "Progress akan tampil saat data tersedia"}
                  </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0071E3]/10 text-[#0071E3]">
                  <Sparkles className="h-6 w-6" />
                </div>
              </div>

              <ProgressBar
                className="mt-6"
                value={overallPct}
                label={
                  totalLessons
                    ? `${totalDone} dari ${totalLessons} lesson selesai`
                    : "Belum ada data lesson"
                }
              />

              <div className="mt-6 grid grid-cols-3 gap-3">
                <div className="rounded-[20px] bg-black/[0.03] p-4 dark:bg-white/[0.05]">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-[#86868B]">Topik</p>
                  <p className="mt-2 font-display text-[24px] font-semibold tracking-tight text-foreground">
                    {topics.length}
                  </p>
                </div>
                <div className="rounded-[20px] bg-black/[0.03] p-4 dark:bg-white/[0.05]">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-[#86868B]">Dimulai</p>
                  <p className="mt-2 font-display text-[24px] font-semibold tracking-tight text-foreground">
                    {startedTopics}
                  </p>
                </div>
                <div className="rounded-[20px] bg-black/[0.03] p-4 dark:bg-white/[0.05]">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-[#86868B]">Selesai</p>
                  <p className="mt-2 font-display text-[24px] font-semibold tracking-tight text-foreground">
                    {completedTopics}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-[30px] border border-black/[0.06] bg-[#FBFBFD] p-5 shadow-[0_24px_60px_rgba(15,23,42,0.07)] dark:border-white/[0.08] dark:bg-[#101012] dark:shadow-[0_24px_60px_rgba(0,0,0,0.28)] sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#86868B]">
                Explore
              </p>
              <h2 className="mt-2 font-display text-[28px] font-semibold tracking-tight text-foreground sm:text-[32px]">
                Temukan topik yang ingin kamu kuasai.
              </h2>
              <p className="mt-2 text-[14px] leading-6 text-[#86868B] sm:text-[15px]">
                {isLoading
                  ? "Memuat katalog topik..."
                  : `${filtered.length} topik cocok${filter !== "All" ? ` untuk level ${filter}` : ""}${query ? ` dengan kata kunci \"${search}\"` : ""}.`}
              </p>
            </div>

            {hasActiveFilters && (
              <button
                onClick={() => {
                  setSearch("");
                  setFilter("All");
                }}
                className="inline-flex items-center justify-center rounded-full border border-black/[0.06] bg-white/80 px-4 py-2.5 text-[13px] font-medium text-foreground transition-colors hover:bg-white dark:border-white/[0.08] dark:bg-white/[0.04] dark:hover:bg-white/[0.08]"
              >
                Reset filter
              </button>
            )}
          </div>

          <div className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#86868B]" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Cari topik berdasarkan nama..."
                className="h-14 w-full rounded-[22px] border border-black/[0.06] bg-white/85 pl-12 pr-4 text-[14px] text-foreground shadow-[0_12px_30px_rgba(15,23,42,0.05)] outline-none transition-all placeholder:text-[#86868B] focus:border-[#0071E3]/30 focus:ring-2 focus:ring-[#0071E3]/20 dark:border-white/[0.08] dark:bg-white/[0.04] dark:shadow-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="hidden h-12 items-center gap-2 rounded-[18px] border border-black/[0.06] bg-white/80 px-4 text-[12px] font-semibold uppercase tracking-[0.16em] text-[#86868B] shadow-[0_10px_26px_rgba(15,23,42,0.04)] dark:border-white/[0.08] dark:bg-white/[0.04] dark:shadow-none sm:inline-flex">
                <SlidersHorizontal className="h-4 w-4" />
                Level
              </div>

              {LEVELS.map((level) => (
                <button
                  key={level}
                  onClick={() => setFilter(level)}
                  className={cn(
                    "rounded-full px-4 py-2.5 text-[13px] font-medium transition-all",
                    filter === level
                      ? "bg-[#0071E3] text-white shadow-[0_14px_34px_rgba(0,113,227,0.22)]"
                      : "border border-black/[0.06] bg-white/80 text-[#86868B] hover:text-foreground dark:border-white/[0.08] dark:bg-white/[0.04] dark:hover:bg-white/[0.08]",
                  )}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#86868B]">
                Topics
              </p>
              <h2 className="mt-2 font-display text-[28px] font-semibold tracking-tight text-foreground sm:text-[32px]">
                Koleksi belajar Go
              </h2>
            </div>

            <div className="rounded-full border border-black/[0.06] bg-white/80 px-4 py-2 text-[13px] font-medium text-[#86868B] shadow-[0_10px_26px_rgba(15,23,42,0.04)] dark:border-white/[0.08] dark:bg-white/[0.04] dark:shadow-none">
              {isLoading ? "Memuat..." : `${filtered.length} hasil`}
            </div>
          </div>

          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-[28px] border border-black/[0.06] bg-[#FBFBFD] p-6 shadow-[0_20px_50px_rgba(15,23,42,0.06)] animate-pulse dark:border-white/[0.08] dark:bg-[#101012] dark:shadow-[0_20px_50px_rgba(0,0,0,0.24)]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-black/[0.06] dark:bg-white/[0.08]" />
                    <div className="h-6 w-24 rounded-full bg-black/[0.06] dark:bg-white/[0.08]" />
                  </div>
                  <div className="mt-6 h-6 w-36 rounded-full bg-black/[0.06] dark:bg-white/[0.08]" />
                  <div className="mt-3 h-12 rounded-[18px] bg-black/[0.04] dark:bg-white/[0.05]" />
                  <div className="mt-8 rounded-[22px] border border-black/[0.06] bg-white/80 p-4 dark:border-white/[0.08] dark:bg-white/[0.04]">
                    <div className="h-4 w-28 rounded-full bg-black/[0.06] dark:bg-white/[0.08]" />
                    <div className="mt-3 h-2 rounded-full bg-black/[0.06] dark:bg-white/[0.08]" />
                    <div className="mt-4 h-4 w-full rounded-full bg-black/[0.05] dark:bg-white/[0.06]" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <section className="rounded-[30px] border border-black/[0.06] bg-[#FBFBFD] p-10 shadow-[0_24px_60px_rgba(15,23,42,0.07)] dark:border-white/[0.08] dark:bg-[#101012] dark:shadow-[0_24px_60px_rgba(0,0,0,0.28)]">
              <div className="flex flex-col items-center justify-center rounded-[26px] border border-dashed border-black/[0.08] bg-black/[0.02] px-6 py-16 text-center dark:border-white/[0.1] dark:bg-white/[0.03]">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0071E3]/10 text-[#0071E3]">
                  <Search className="h-7 w-7" />
                </div>
                <h2 className="mt-5 font-display text-[28px] font-semibold tracking-tight text-foreground">
                  {hasActiveFilters ? "Topik yang kamu cari belum ditemukan" : "Belum ada topik tersedia"}
                </h2>
                <p className="mt-2 max-w-md text-[14px] leading-7 text-[#86868B]">
                  {hasActiveFilters
                    ? "Coba ubah kata kunci atau pilih level lain untuk melihat topik yang tersedia."
                    : "Topik akan muncul di sini setelah data modul tersedia dari backend."}
                </p>

                {hasActiveFilters && (
                  <button
                    onClick={() => {
                      setSearch("");
                      setFilter("All");
                    }}
                    className="mt-6 rounded-full bg-[#0071E3] px-5 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-[#0077ED]"
                  >
                    Tampilkan semua topik
                  </button>
                )}
              </div>
            </section>
          ) : (
            <div className="topic-grid grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filtered.map((topic) => {
                const lessonCount = getLessonCount(topic);
                const prog = topicProgress(topic.slug, lessonCount);
                const isStarted = prog.done > 0;
                const isComplete = prog.pct === 100;
                const statusLabel = isComplete
                  ? "Selesai"
                  : isStarted
                    ? "Sedang berjalan"
                    : "Belum dimulai";
                const actionLabel = isComplete ? "Pelajari ulang" : isStarted ? "Lanjutkan" : "Mulai";

                return (
                  <Link
                    key={topic.slug}
                    href={`/modules/${topic.slug}`}
                    className="topic-grid-card group relative block overflow-hidden rounded-[28px] border border-black/[0.06] bg-[#FBFBFD] p-6 shadow-[0_20px_50px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_26px_60px_rgba(15,23,42,0.08)] dark:border-white/[0.08] dark:bg-[#101012] dark:shadow-[0_20px_50px_rgba(0,0,0,0.24)] dark:hover:shadow-[0_26px_60px_rgba(0,0,0,0.28)]"
                  >
                    <div
                      className="pointer-events-none absolute inset-x-0 top-0 h-28 opacity-80"
                      style={{
                        background: `linear-gradient(180deg, ${topic.color}18 0%, transparent 100%)`,
                      }}
                    />
                    <div
                      className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full blur-3xl"
                      style={{ backgroundColor: `${topic.color}22` }}
                    />

                    <div className="relative flex h-full flex-col">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="flex h-12 w-12 items-center justify-center rounded-2xl text-[14px] font-semibold text-white shadow-[0_14px_30px_rgba(15,23,42,0.18)]"
                            style={{ backgroundColor: topic.color }}
                          >
                            {String(topic.number).padStart(2, "0")}
                          </div>
                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#86868B]">
                              Topik {String(topic.number).padStart(2, "0")}
                            </p>
                            <p className="mt-1 text-[13px] text-[#86868B]">{lessonCount} lesson</p>
                          </div>
                        </div>

                        <LevelBadge level={topic.level} />
                      </div>

                      <div className="mt-6">
                        <span
                          className={cn(
                            "inline-flex rounded-full px-3 py-1 text-[12px] font-medium",
                            isComplete
                              ? "bg-[#34C759]/12 text-[#34C759]"
                              : isStarted
                                ? "bg-[#0071E3]/10 text-[#0071E3]"
                                : "bg-black/[0.04] text-[#86868B] dark:bg-white/[0.05]",
                          )}
                        >
                          {statusLabel}
                        </span>

                        <h2 className="mt-4 font-display text-[24px] font-semibold tracking-tight text-foreground transition-colors group-hover:text-[#0071E3]">
                          {topic.title_id}
                        </h2>
                        <p className="mt-3 min-h-[48px] text-[14px] leading-6 text-[#86868B]">
                          {topic.description_id}
                        </p>
                      </div>

                      <div className="mt-6 rounded-[22px] border border-black/[0.06] bg-white/80 p-4 shadow-[0_12px_30px_rgba(15,23,42,0.05)] dark:border-white/[0.08] dark:bg-white/[0.04] dark:shadow-none">
                        <ProgressBar
                          value={prog.pct}
                          color={isComplete ? "#34C759" : topic.color}
                          label={`${prog.done}/${lessonCount} lesson selesai`}
                        />

                        <div className="mt-4 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-1.5 text-[12px] text-[#86868B]">
                            <Clock className="h-3.5 w-3.5" />
                            {topic.estimatedMinutes} mnt
                          </div>

                          <div className="inline-flex items-center gap-1.5 text-[13px] font-medium text-foreground transition-colors group-hover:text-[#0071E3]">
                            {actionLabel}
                            <ChevronRight className="h-4 w-4" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
