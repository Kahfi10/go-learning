"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Clock, ChevronRight, BookOpen } from "lucide-react";
import Navbar from "@/components/navigation/Navbar";
import { api, type Topic } from "@/lib/api";
import { useProgress } from "@/hooks/useProgress";
import { cn } from "@/lib/utils";

const LEVELS = ["All", "Beginner", "Intermediate", "Advanced"] as const;
type Level = (typeof LEVELS)[number];

const LEVEL_COLOR: Record<string, string> = {
  Beginner: "#34C759", Intermediate: "#0071E3", Advanced: "#FF453A",
};

export default function ModulesPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [filter, setFilter] = useState<Level>("All");
  const { topicProgress } = useProgress();
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.topics.list().then(setTopics).catch(() => {});
  }, []);

  useEffect(() => {
    if (!topics.length) return;
    import("gsap").then(({ gsap }) => {
      import("gsap/ScrollTrigger").then(({ ScrollTrigger }) => {
        gsap.registerPlugin(ScrollTrigger);
        gsap.fromTo(".topic-card-item",
          { opacity: 0, y: 28 },
          { opacity: 1, y: 0, duration: 0.5, ease: "expo.out", stagger: 0.06,
            scrollTrigger: { trigger: ".topic-card-item", start: "top 90%", once: true } }
        );
      });
    });
  }, [topics, filter]);

  const filtered = filter === "All" ? topics : topics.filter(t => t.level === filter);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-20 px-6 mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-10">
          <p className="text-[#86868B] text-[13px] font-medium uppercase tracking-widest mb-3">Kurikulum</p>
          <h1 className="font-display font-semibold text-[40px] tracking-tight text-foreground">Semua Topik Go</h1>
          <p className="text-[#86868B] text-[17px] mt-2">15 topik · 76 lessons · Bilingual ID/EN</p>
        </div>

        {/* Level filter */}
        <div className="flex items-center gap-2 mb-8 flex-wrap">
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

        {/* Grid */}
        <div ref={gridRef} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((topic) => {
            const prog = topicProgress(topic.slug, 5);
            return (
              <Link key={topic.slug} href={`/modules/${topic.slug}`}
                className="topic-card-item group bg-[#F5F5F7] dark:bg-[#1C1C1E] rounded-[18px] p-6 hover:scale-[1.01] transition-transform duration-200 block">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-[13px] font-bold"
                    style={{ backgroundColor: topic.color }}>
                    {String(topic.number).padStart(2, "0")}
                  </div>
                  <span className="text-[11px] font-medium px-2.5 py-1 rounded-full"
                    style={{ backgroundColor: (LEVEL_COLOR[topic.level] ?? "#86868B") + "18", color: LEVEL_COLOR[topic.level] ?? "#86868B" }}>
                    {topic.level}
                  </span>
                </div>
                <h2 className="font-semibold text-[16px] text-foreground mb-1 group-hover:text-[#0071E3] transition-colors">
                  {topic.title_id}
                </h2>
                <p className="text-[#86868B] text-[13px] line-clamp-2 mb-4">{topic.description_id}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[#86868B] text-[12px]">
                    <Clock className="w-3 h-3" /> {topic.estimatedMinutes} mnt
                  </div>
                  {prog.done > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-[#D2D2D7] rounded-full overflow-hidden">
                        <div className="h-full bg-[#34C759] rounded-full transition-all" style={{ width: `${prog.pct}%` }} />
                      </div>
                      <span className="text-[11px] text-[#86868B]">{prog.pct}%</span>
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>

        {!topics.length && (
          <div className="text-center py-20 text-[#86868B]">
            <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p>Memuat topik...</p>
          </div>
        )}
      </div>
    </div>
  );
}
