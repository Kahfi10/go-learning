"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Clock, ChevronRight, Search } from "lucide-react";
import Navbar from "@/components/navigation/Navbar";
import { ProgressBar } from "@/components/ui/progress";
import { LevelBadge } from "@/components/ui/badge";
import { api, type Topic } from "@/lib/api";
import { useProgress } from "@/hooks/useProgress";
import { cn } from "@/lib/utils";

const LEVELS = ["All", "Beginner", "Intermediate", "Advanced"] as const;
type Level = (typeof LEVELS)[number];

export default function ModulesPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [filter, setFilter] = useState<Level>("All");
  const [search, setSearch] = useState("");
  const { topicProgress } = useProgress();
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.topics.list().then((t) => setTopics(t ?? [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (!topics.length) return;
    import("gsap").then(({ gsap }) => {
      import("gsap/ScrollTrigger").then(({ ScrollTrigger }) => {
        gsap.registerPlugin(ScrollTrigger);
        gsap.from(".topic-grid-card", {
          y: 24, scale: 0.97, stagger: 0.05, duration: 0.55, ease: "expo.out",
          scrollTrigger: { trigger: ".topic-grid", start: "top 85%", once: true },
        });
      });
    });
  }, [topics]);

  const filtered = topics.filter(t => {
    const matchLevel = filter === "All" || t.level === filter;
    const matchSearch = !search || t.title_id.toLowerCase().includes(search.toLowerCase()) || t.title_en.toLowerCase().includes(search.toLowerCase());
    return matchLevel && matchSearch;
  });

  const totalDone = topics.reduce((acc, t) => acc + topicProgress(t.slug, t.lessons?.length ?? 5).done, 0);
  const totalLessons = topics.reduce((acc, t) => acc + (t.lessons?.length ?? 5), 0);
  const overallPct = totalLessons ? Math.round((totalDone / totalLessons) * 100) : 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-20 px-4 sm:px-6 mx-auto max-w-5xl">

        {/* Header */}
        <div className="mb-8">
          <p className="text-[#86868B] text-[11px] font-semibold uppercase tracking-widest mb-2">GoLearn</p>
          <h1 className="font-display font-semibold text-[32px] sm:text-[40px] tracking-tight text-foreground mb-1">
            Semua Topik Go
          </h1>
          <p className="text-[#86868B] text-[15px]">15 topik · 76 lessons · Bilingual ID/EN</p>

          {/* Overall progress */}
          {overallPct > 0 && (
            <div className="mt-4 max-w-sm">
              <ProgressBar value={overallPct} label={`${totalDone} dari ${totalLessons} lesson selesai`} />
            </div>
          )}
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868B]" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cari topik..."
              className="w-full pl-9 pr-4 py-2 text-[13px] bg-[#F5F5F7] dark:bg-[#1C1C1E] rounded-full outline-none focus:ring-2 focus:ring-[#0071E3]/30 transition-all text-foreground placeholder:text-[#86868B]"
            />
          </div>
          {/* Level filter */}
          <div className="flex items-center gap-2 flex-wrap">
            {LEVELS.map((l) => (
              <button key={l} onClick={() => setFilter(l)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-[13px] font-medium transition-colors",
                  filter === l
                    ? "bg-[#0071E3] text-white"
                    : "bg-[#F5F5F7] dark:bg-[#1C1C1E] text-[#86868B] hover:text-foreground"
                )}>
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div ref={gridRef} className="topic-grid grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((topic) => {
            const prog = topicProgress(topic.slug, (topic as any).lessons?.length ?? 5);
            const isStarted = prog.done > 0;
            const isComplete = prog.pct === 100;

            return (
              <Link key={topic.slug} href={`/modules/${topic.slug}`}
                className="topic-grid-card group bg-[#F5F5F7] dark:bg-[#1C1C1E] rounded-[18px] p-5 hover:scale-[1.01] hover:shadow-md transition-all duration-200 block relative overflow-hidden">

                {/* Decorative number bg */}
                <span className="absolute right-3 bottom-[-8px] font-display font-bold text-[72px] leading-none select-none pointer-events-none"
                  style={{ color: topic.color, opacity: 0.07 }}>
                  {String(topic.number).padStart(2, "0")}
                </span>

                <div className="relative z-10">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-[12px] font-bold shrink-0"
                      style={{ backgroundColor: topic.color }}>
                      {String(topic.number).padStart(2, "0")}
                    </div>
                    <LevelBadge level={topic.level} />
                  </div>

                  {/* Title */}
                  <h2 className="font-semibold text-[16px] text-foreground mb-1 group-hover:text-[#0071E3] transition-colors leading-tight">
                    {topic.title_id}
                  </h2>
                  <p className="text-[#86868B] text-[13px] line-clamp-2 mb-4">{topic.description_id}</p>

                  {/* Footer */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-1 text-[#86868B] text-[12px]">
                      <Clock className="w-3 h-3" /> {topic.estimatedMinutes} mnt
                    </div>

                    {isComplete ? (
                      <span className="text-[12px] text-[#34C759] font-medium flex items-center gap-1">
                        ✓ Selesai
                      </span>
                    ) : isStarted ? (
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-[#D2D2D7]/50 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${prog.pct}%`, backgroundColor: topic.color }} />
                        </div>
                        <span className="text-[11px] text-[#86868B]">{prog.pct}%</span>
                      </div>
                    ) : (
                      <ChevronRight className="w-4 h-4 text-[#D2D2D7] group-hover:text-[#0071E3] transition-colors" />
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="text-center py-20 text-[#86868B]">
            <p className="text-[15px]">Tidak ada topik yang cocok dengan pencarian "{search}"</p>
            <button onClick={() => { setSearch(""); setFilter("All"); }}
              className="mt-3 text-[#0071E3] text-[13px] hover:underline">
              Reset filter
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
