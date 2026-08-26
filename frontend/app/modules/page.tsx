"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  PlayCircle,
  Bookmark,
  BookmarkCheck,
  ChevronRight,
  Clock,
  Search,
  Sparkles,
  BookOpen,
  CheckCircle2,
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
  const [lessonMatches, setLessonMatches] = useState<Record<string, string[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const {
    topicProgress,
    getContinueLearning,
    getRecommendedTopic,
    getRecentlyViewed,
    getRecentActivity,
    bookmarks,
    isTopicBookmarked,
    toggleTopicBookmark,
  } = useProgress();

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
  useEffect(() => {
    if (!query) {
      setLessonMatches({});
      return;
    }

    let cancelled = false;
    api.search(query)
      .then((results) => {
        if (cancelled) return;
        const grouped = (results ?? []).reduce<Record<string, string[]>>((acc, item) => {
          const topicKey = item.topic_slug ?? item.topic.replace(/^topic-\d+-/, "");
          const label = item.title_id;
          acc[topicKey] = acc[topicKey] ? Array.from(new Set([...acc[topicKey], label])) : [label];
          return acc;
        }, {});
        setLessonMatches(grouped);
      })
      .catch(() => {
        if (!cancelled) setLessonMatches({});
      });

    return () => {
      cancelled = true;
    };
  }, [query]);

  const enrichedTopics = useMemo(() => {
    return topics.map((topic) => {
      const lessonCount = getLessonCount(topic);
      const prog = topicProgress(topic.slug, lessonCount);
      const matchedLessons = lessonMatches[topic.slug] ?? [];
      const state = prog.pct === 100 ? "completed" : prog.done > 0 ? "in_progress" : "not_started";
      return { topic, lessonCount, prog, matchedLessons, state };
    });
  }, [lessonMatches, topicProgress, topics]);

  const filtered = enrichedTopics.filter(({ topic, matchedLessons }) => {
    const matchLevel = filter === "All" || topic.level === filter;
    const matchSearch =
      !query ||
      topic.title_id.toLowerCase().includes(query) ||
      topic.title_en.toLowerCase().includes(query) ||
      topic.description_id.toLowerCase().includes(query) ||
      topic.description_en.toLowerCase().includes(query) ||
      matchedLessons.length > 0;
    return matchLevel && matchSearch;
  });

  const continueLearning = getContinueLearning();
  const continueTopic = continueLearning
    ? topics.find((topic) => topic.slug === continueLearning.topic)
    : undefined;
  const recommendedTopicMeta = getRecommendedTopic(topics.map((topic) => topic.slug));
  const recommendedTopic = recommendedTopicMeta
    ? topics.find((topic) => topic.slug === recommendedTopicMeta.topic)
    : undefined;
  const recentlyViewed = getRecentlyViewed(3);
  const recentActivity = getRecentActivity(4);

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

      <main className="pb-24 pt-32 sm:pt-40">
        <section className="mx-auto max-w-7xl px-4 sm:px-6 mb-16 sm:mb-24 relative overflow-hidden">
          <div className="absolute top-1/2 right-10 -translate-y-1/2 w-72 h-72 rounded-full bg-[#0071E3]/5 blur-3xl pointer-events-none hidden lg:block" />
          <div className="absolute top-0 right-40 w-56 h-56 rounded-full bg-[#34C759]/5 blur-3xl pointer-events-none hidden lg:block" />
          
          <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-12 items-center relative z-10">
            <div className="flex flex-col gap-4 text-left max-w-2xl">
              <p className="text-[#0071E3] text-[13px] font-semibold uppercase tracking-[0.2em] mb-1">
                Katalog Pembelajaran
              </p>
              <h1 className="font-display text-[44px] sm:text-[60px] lg:text-[72px] font-semibold tracking-[-0.04em] text-foreground leading-[1.05]">
                Belajar Go.<br />
                Topik demi topik.
              </h1>
              <p className="text-[17px] sm:text-[20px] leading-relaxed text-[#86868B] max-w-xl text-balance mt-2">
                Daftar lengkap kurikulum GoLearn. Mulai dari konsep dasar hingga teknik mahir. Semuanya tersedia langsung di browser kamu.
              </p>
            </div>

            <div className="hidden lg:grid grid-cols-2 gap-4">
              <div className="rounded-[24px] border border-[#D2D2D7]/60 dark:border-white/10 bg-white/50 dark:bg-[#111214]/50 p-6 flex flex-col justify-center items-center text-center">
                <p className="font-display text-[40px] font-bold text-foreground leading-none mb-1">{topics.length}</p>
                <p className="text-[13px] font-medium text-[#86868B]">Topik Tersedia</p>
              </div>
              <div className="rounded-[24px] border border-[#D2D2D7]/60 dark:border-white/10 bg-white/50 dark:bg-[#111214]/50 p-6 flex flex-col justify-center items-center text-center">
                <p className="font-display text-[40px] font-bold text-[#0071E3] leading-none mb-1">{totalLessons}</p>
                <p className="text-[13px] font-medium text-[#86868B]">Total Lessons</p>
              </div>
              <div className="rounded-[24px] border border-[#D2D2D7]/60 dark:border-white/10 bg-white/50 dark:bg-[#111214]/50 p-6 flex flex-col justify-center items-center text-center col-span-2 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-[#0071E3]/10 to-[#34C759]/10 opacity-50" />
                <div className="relative z-10 flex items-center justify-between w-full px-4">
                  <div className="text-left">
                    <p className="text-[12px] font-semibold uppercase tracking-wider text-[#86868B] mb-1">Progress Keseluruhan</p>
                    <p className="font-display text-[32px] font-bold text-foreground leading-none">{overallPct}%</p>
                  </div>
                  <ProgressBar value={overallPct} className="w-1/2" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {continueTopic && continueLearning && (
          <section className="mx-auto max-w-7xl px-4 sm:px-6 mb-10 sm:mb-12">
            <div className="rounded-[28px] border border-[#D2D2D7]/60 dark:border-white/10 bg-white dark:bg-[#111214] p-6 sm:p-7 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#0071E3] mb-2">
                  Continue Learning
                </p>
                <h2 className="font-display text-[24px] sm:text-[28px] font-semibold tracking-tight text-foreground mb-2">
                  {continueTopic.title_id}
                </h2>
                <p className="text-[15px] leading-relaxed text-[#86868B] max-w-2xl">
                  Lanjutkan dari lesson terakhir yang kamu buka. Draft code dan context lesson tetap tersimpan.
                </p>
                {recentlyViewed.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {recentlyViewed.map((item) => (
                      <span
                        key={`${item.topic}/${item.lesson}`}
                        className="rounded-full bg-[#F5F5F7] dark:bg-[#1C1C1E] px-3 py-1.5 text-[12px] font-medium text-[#86868B]"
                      >
                        {item.topic}/{item.lesson}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <Link
                href={`/modules/${continueLearning.topic}/${continueLearning.lesson}`}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0071E3] px-6 py-3 text-[14px] font-medium text-white shadow-sm transition-colors hover:bg-[#0077ED]"
              >
                <PlayCircle className="h-4 w-4" />
                Buka lesson terakhir
              </Link>
            </div>
          </section>
        )}

        {recommendedTopic && (!continueTopic || recommendedTopic.slug !== continueTopic.slug) && (
          <section className="mx-auto max-w-7xl px-4 sm:px-6 mb-10 sm:mb-12">
            <div className="rounded-[24px] border border-[#D2D2D7]/50 dark:border-white/8 bg-[#F7FAFF] dark:bg-[#101722] p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#0071E3] mb-2">Rekomendasi Berikutnya</p>
                <h2 className="font-display text-[22px] font-semibold tracking-tight text-foreground mb-2">{recommendedTopic.title_id}</h2>
                <p className="text-[14px] leading-relaxed text-[#86868B] max-w-2xl">{recommendedTopicMeta?.reason}. Cocok untuk progres belajar kamu saat ini.</p>
              </div>
              <Link href={`/modules/${recommendedTopic.slug}`} className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0071E3] px-5 py-3 text-[14px] font-medium text-white shadow-sm transition-colors hover:bg-[#0077ED]">
                Lihat topik
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </section>
        )}

        {recentActivity.length > 0 && (
          <section className="mx-auto max-w-7xl px-4 sm:px-6 mb-10 sm:mb-12">
            <div className="rounded-[24px] border border-[#D2D2D7]/50 dark:border-white/8 bg-[#FAFAFB] dark:bg-[#111214] p-5 sm:p-6">
              <div className="flex items-center justify-between gap-4 mb-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#86868B] mb-1">Aktivitas Terbaru</p>
                  <h2 className="font-display text-[22px] font-semibold tracking-tight text-foreground">Kembali ke titik terakhir belajarmu</h2>
                </div>
                {bookmarks.topics.length + bookmarks.lessons.length > 0 && (
                  <span className="rounded-full bg-[#F5F5F7] dark:bg-[#1C1C1E] px-3 py-1.5 text-[12px] font-medium text-[#86868B]">
                    {bookmarks.topics.length + bookmarks.lessons.length} bookmark
                  </span>
                )}
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {recentActivity.map((item) => (
                  <Link
                    key={`${item.topic_slug}/${item.lesson_id}`}
                    href={`/modules/${item.topic_slug}/${item.lesson_id}`}
                    className="rounded-[18px] border border-[#D2D2D7]/35 dark:border-white/6 bg-white dark:bg-[#17181A] p-4 hover:border-[#0071E3]/25 transition-colors"
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#86868B] mb-1">{item.topic_slug}</p>
                    <p className="text-[15px] font-semibold text-foreground mb-2">Lesson {item.lesson_id}</p>
                    <p className="text-[12px] text-[#86868B]">
                      {item.completed ? "Selesai" : item.last_viewed_at ? "Dilihat baru-baru ini" : "Aktif"}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Tabs & Search Bar ── */}
        <section className="sticky top-[52px] z-30 bg-background/95 backdrop-blur-xl border-b border-[#D2D2D7]/40 dark:border-white/10 shadow-sm transition-all mb-12 sm:mb-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 flex flex-col md:flex-row md:items-center justify-between gap-4 py-4">
            
            {/* Minimalist Tabs */}
            <div className="flex items-center gap-6 overflow-x-auto no-scrollbar">
              {LEVELS.map((level) => (
                <button
                  key={level}
                  onClick={() => setFilter(level)}
                  className={cn(
                    "text-[14px] font-medium transition-all py-2 border-b-2 whitespace-nowrap",
                    filter === level
                      ? "text-foreground border-foreground"
                      : "text-[#86868B] hover:text-foreground border-transparent"
                  )}
                >
                  {level}
                </button>
              ))}
            </div>

            {/* Compact Search */}
            <div className="relative w-full md:max-w-[320px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868B]" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Cari topik..."
                className="w-full h-10 rounded-[12px] bg-[#F5F5F7] dark:bg-[#1C1C1E] border border-transparent dark:border-white/5 pl-9 pr-4 text-[13px] text-foreground outline-none transition-all placeholder:text-[#86868B] focus:border-[#0071E3]/50 focus:bg-white dark:focus:bg-[#111214] focus:ring-1 focus:ring-[#0071E3]/50"
              />
            </div>

          </div>
        </section>

        {/* ── Topics List (Rows instead of Grid) ── */}
        <section className="mx-auto max-w-5xl px-4 sm:px-6">
            {isLoading ? (
              <div className="grid gap-4">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div
                    key={index}
                    className="flex flex-col sm:flex-row gap-5 p-6 rounded-[24px] border border-[#D2D2D7]/40 dark:border-white/10 bg-[#F5F5F7]/30 dark:bg-[#1C1C1E]/30 animate-pulse"
                  >
                    <div className="h-16 w-16 rounded-[18px] bg-[#D2D2D7]/50 dark:bg-white/10 shrink-0" />
                    <div className="flex-1 w-full">
                      <div className="h-5 w-1/3 rounded-full bg-[#D2D2D7]/50 dark:bg-white/10 mb-3" />
                      <div className="h-3 w-2/3 rounded-full bg-[#D2D2D7]/40 dark:bg-white/5 mb-2" />
                      <div className="h-3 w-1/2 rounded-full bg-[#D2D2D7]/40 dark:bg-white/5" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-[24px] border border-[#D2D2D7]/60 dark:border-white/10 bg-[#F5F5F7]/30 dark:bg-[#1C1C1E]/30 px-6 py-24 text-center">
                <div className="w-16 h-16 rounded-full bg-[#0071E3]/10 flex items-center justify-center mb-6">
                  <Search className="w-8 h-8 text-[#0071E3]" />
                </div>
                <h2 className="font-display text-[24px] font-semibold text-foreground mb-2">
                  Topik tidak ditemukan
                </h2>
                <p className="text-[15px] text-[#86868B] max-w-md">
                  Coba sesuaikan kata kunci pencarian atau ganti filter level.
                </p>
              </div>
            ) : (
              <div className="topic-grid flex flex-col gap-4">
                {filtered.map(({ topic, lessonCount, prog, matchedLessons, state }) => {
                  const isStarted = state === "in_progress";
                  const isComplete = state === "completed";
                  const statusLabel = isComplete ? "Selesai" : isStarted ? "Berjalan" : "Mulai";
                  const bookmarked = isTopicBookmarked(topic.slug);

                  return (
                    <Link
                      key={topic.slug}
                      href={`/modules/${topic.slug}`}
                      className="topic-grid-card group relative flex flex-col sm:flex-row gap-6 p-6 sm:p-7 rounded-[24px] bg-white dark:bg-[#111214] border border-[#D2D2D7]/60 dark:border-white/10 transition-all duration-300 hover:shadow-[0_12px_30px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_12px_30px_rgba(0,0,0,0.2)] hover:border-black/[0.08] dark:hover:border-white/20 hover:-translate-y-0.5 overflow-hidden"
                    >
                      {/* Left: Icon & Level */}
                      <div className="flex flex-row sm:flex-col items-center sm:items-start gap-4 shrink-0">
                        <div
                          className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center rounded-[16px] sm:rounded-[20px] text-[18px] sm:text-[22px] font-display font-bold text-white shadow-sm"
                          style={{ backgroundColor: topic.color }}
                        >
                          {String(topic.number).padStart(2, "0")}
                        </div>
                        <LevelBadge level={topic.level} />
                        <button
                          type="button"
                          onClick={(event) => {
                            event.preventDefault();
                            void toggleTopicBookmark(topic.slug);
                          }}
                          className="inline-flex items-center gap-1 rounded-full bg-[#F5F5F7] dark:bg-[#1C1C1E] px-3 py-1.5 text-[11px] font-medium text-[#86868B] hover:text-[#0071E3] transition-colors"
                        >
                          {bookmarked ? <BookmarkCheck className="w-3.5 h-3.5 text-[#0071E3]" /> : <Bookmark className="w-3.5 h-3.5" />}
                          {bookmarked ? "Tersimpan" : "Simpan"}
                        </button>
                      </div>

                      {/* Middle: Content */}
                      <div className="flex-1 flex flex-col justify-center min-w-0">
                        <h2 className="font-display text-[22px] sm:text-[24px] font-semibold tracking-tight text-foreground mb-2 group-hover:text-[#0071E3] transition-colors leading-snug truncate">
                          {topic.title_id}
                        </h2>
                        <p className="text-[14px] sm:text-[15px] leading-relaxed text-[#86868B] line-clamp-2 mb-4">
                          {topic.description_id}
                        </p>
                        {matchedLessons.length > 0 && (
                          <div className="mb-4 flex flex-wrap gap-2">
                            {matchedLessons.slice(0, 2).map((label) => (
                              <span
                                key={label}
                                className="rounded-full bg-[#0071E3]/8 px-3 py-1 text-[11px] font-medium text-[#0071E3]"
                              >
                                Lesson: {label}
                              </span>
                            ))}
                            {matchedLessons.length > 2 && (
                              <span className="rounded-full bg-[#F5F5F7] dark:bg-[#1C1C1E] px-3 py-1 text-[11px] font-medium text-[#86868B]">
                                +{matchedLessons.length - 2} match
                              </span>
                            )}
                          </div>
                        )}
                        
                        {/* Meta info */}
                        <div className="flex flex-wrap items-center gap-4 text-[12px] font-medium text-[#86868B]">
                          <div className="flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5" />
                            {lessonCount} Lesson
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            {topic.estimatedMinutes} Menit
                          </div>
                          <div className="flex items-center gap-1.5">
                            <ArrowRight className="w-3.5 h-3.5" />
                            {prog.done}/{lessonCount} lesson
                          </div>
                          {isStarted && !isComplete && (
                            <div className="flex items-center gap-1.5 text-[#0071E3]">
                              <span>{prog.pct}% Selesai</span>
                            </div>
                          )}
                          {isComplete && (
                            <div className="flex items-center gap-1.5 text-[#34C759]">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Selesai
                            </div>
                          )}
                          {bookmarked && (
                            <div className="flex items-center gap-1.5 text-[#0071E3]">
                              <BookmarkCheck className="w-3.5 h-3.5" /> Bookmarked
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right: Action/CTA */}
                      <div className="sm:self-center shrink-0 mt-2 sm:mt-0">
                        <div className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 sm:px-5 sm:py-2.5 text-[13px] font-medium transition-colors bg-[#F5F5F7] dark:bg-[#1C1C1E] text-foreground group-hover:bg-[#0071E3] group-hover:text-white">
                          {statusLabel}
                          <ChevronRight className="w-4 h-4" />
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
