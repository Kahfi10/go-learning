"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Clock, ChevronRight, CheckCircle2, Lock, ArrowLeft } from "lucide-react";
import Navbar from "@/components/navigation/Navbar";
import { api, type TopicDetail } from "@/lib/api";
import { useProgress } from "@/hooks/useProgress";
import { cn } from "@/lib/utils";

const LEVEL_COLOR: Record<string, string> = {
  Beginner: "#34C759", Intermediate: "#0071E3", Advanced: "#FF453A",
};

export default function TopicPage() {
  const { topic } = useParams<{ topic: string }>();
  const [data, setData] = useState<TopicDetail | null>(null);
  const { isCompleted, topicProgress } = useProgress();

  useEffect(() => {
    api.topics.get(topic).then(setData).catch(() => {});
  }, [topic]);

  if (!data) return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-32 text-center text-[#86868B]">Memuat topik...</div>
    </div>
  );

  const prog = topicProgress(topic, data.lessons?.length ?? 0);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-20 px-6 mx-auto max-w-3xl">
        {/* Back */}
        <Link href="/modules" className="inline-flex items-center gap-1.5 text-[#86868B] text-[13px] hover:text-foreground transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Semua Topik
        </Link>

        {/* Hero */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-[15px] font-bold"
              style={{ backgroundColor: data.color }}>
              {String(data.number).padStart(2, "0")}
            </div>
            <span className="text-[12px] font-medium px-3 py-1 rounded-full"
              style={{ backgroundColor: (LEVEL_COLOR[data.level] ?? "#86868B") + "18", color: LEVEL_COLOR[data.level] ?? "#86868B" }}>
              {data.level}
            </span>
          </div>
          <h1 className="font-display font-semibold text-[36px] tracking-tight text-foreground mb-3">{data.title_id}</h1>
          <p className="text-[#86868B] text-[17px] leading-relaxed mb-5">{data.description_id}</p>
          <div className="flex items-center gap-4 text-[13px] text-[#86868B]">
            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {data.estimatedMinutes} mnt</span>
            <span>{data.lessons?.length ?? 0} lessons</span>
            {prog.done > 0 && <span className="text-[#34C759]">{prog.done}/{prog.total} selesai</span>}
          </div>

          {/* Progress bar */}
          {prog.done > 0 && (
            <div className="mt-4 h-1.5 bg-[#D2D2D7] rounded-full overflow-hidden max-w-xs">
              <div className="h-full bg-[#34C759] rounded-full transition-all duration-500" style={{ width: `${prog.pct}%` }} />
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="mb-10">
          {prog.done === 0 ? (
            <Link href={`/modules/${topic}/${data.lessons?.[0]?.id ?? "01"}`}
              className="inline-flex items-center gap-2 bg-[#0071E3] text-white text-[15px] font-medium px-6 py-3 rounded-full hover:bg-[#0077ED] transition-colors">
              Mulai Topik <ChevronRight className="w-4 h-4" />
            </Link>
          ) : prog.done < (data.lessons?.length ?? 0) ? (
            <Link href={`/modules/${topic}/${data.lessons?.find(l => !isCompleted(topic, l.id))?.id ?? "01"}`}
              className="inline-flex items-center gap-2 bg-[#0071E3] text-white text-[15px] font-medium px-6 py-3 rounded-full hover:bg-[#0077ED] transition-colors">
              Lanjutkan <ChevronRight className="w-4 h-4" />
            </Link>
          ) : (
            <div className="inline-flex items-center gap-2 bg-[#34C759]/10 text-[#34C759] text-[15px] font-medium px-6 py-3 rounded-full">
              <CheckCircle2 className="w-4 h-4" /> Topik selesai!
            </div>
          )}
        </div>

        {/* Lesson list */}
        <div className="border-t border-[#D2D2D7]">
          {data.lessons?.map((lesson, i) => {
            const done = isCompleted(topic, lesson.id);
            return (
              <Link key={lesson.id} href={`/modules/${topic}/${lesson.id}`}
                className={cn(
                  "flex items-center gap-4 py-4 border-b border-[#D2D2D7]/60 group hover:bg-[#F5F5F7]/50 dark:hover:bg-[#1C1C1E]/50 px-2 -mx-2 rounded-lg transition-colors"
                )}>
                <div className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-semibold flex-shrink-0",
                  done ? "bg-[#34C759]/15 text-[#34C759]" : "bg-[#F5F5F7] dark:bg-[#2C2C2E] text-[#86868B]"
                )}>
                  {done ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn("text-[15px] font-medium truncate", done ? "text-[#86868B]" : "text-foreground group-hover:text-[#0071E3] transition-colors")}>
                    {lesson.title_id}
                  </p>
                  <p className="text-[12px] text-[#86868B] flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3" /> {lesson.estimatedMinutes} mnt
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-[#86868B] group-hover:text-[#0071E3] transition-colors flex-shrink-0" />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
