"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, BookOpen, Bookmark, BookmarkCheck, CheckCircle2, ChevronRight, Clock, TriangleAlert } from "lucide-react";
import Navbar from "@/components/navigation/Navbar";
import { ProgressBar } from "@/components/ui/progress";
import { api, type TopicDetail } from "@/lib/api";
import { useProgress } from "@/hooks/useProgress";
import { cn } from "@/lib/utils";

const LEVEL_COLOR: Record<string, string> = {
  Beginner: "#34C759",
  Intermediate: "#0071E3",
  Advanced: "#FF453A",
};

export default function TopicPage() {
  const { topic } = useParams<{ topic: string }>();
  const [data, setData] = useState<TopicDetail | null>(null);
  const { isCompleted, topicProgress, isTopicBookmarked, toggleTopicBookmark } = useProgress();

  useEffect(() => {
    api.topics.get(topic).then(setData).catch(() => {});
  }, [topic]);

  if (!data) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="mx-auto max-w-5xl px-6 pb-24 pt-24">
          <div className="rounded-[32px] border border-black/[0.06] bg-[#FBFBFD] p-10 text-center text-[#86868B] shadow-[0_24px_60px_rgba(15,23,42,0.07)] dark:border-white/[0.08] dark:bg-[#101012] dark:shadow-[0_24px_60px_rgba(0,0,0,0.28)]">
            Memuat topik...
          </div>
        </main>
      </div>
    );
  }

  const lessonCount = data.lessons?.length ?? 0;
  const prog = topicProgress(topic, lessonCount);
  const nextLesson = data.lessons?.find((lesson) => !isCompleted(topic, lesson.id)) ?? data.lessons?.[0];
  const remainingLessons = Math.max(lessonCount - prog.done, 0);
  const remainingMinutes =
    data.lessons?.reduce(
      (acc, lesson) => acc + (isCompleted(topic, lesson.id) ? 0 : lesson.estimatedMinutes),
      0,
    ) ?? 0;
  const nextLessonHref = `/modules/${topic}/${nextLesson?.id ?? "01"}`;
  const nextLessonLabel = nextLesson?.title_id ?? "Lesson pertama";
  const progressColor = prog.done === lessonCount && lessonCount > 0 ? "#34C759" : data.color;
  const topicBookmarked = isTopicBookmarked(topic);
  const prerequisiteNotice = topic !== "getting-started" && prog.done === 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 sm:px-6 pb-24 pt-32">
        <div className="mb-8">
          <Link
            href="/modules"
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#86868B] transition-colors hover:text-[#0071E3]"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Katalog
          </Link>
        </div>

        <section className="relative w-full mb-12 sm:mb-16">
          <div className="grid xl:grid-cols-[1fr_auto] gap-8 xl:gap-16 items-end">
            <div className="max-w-2xl">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-[12px] text-[15px] font-semibold text-white shadow-sm"
                  style={{ backgroundColor: data.color }}
                >
                  {String(data.number).padStart(2, "0")}
                </div>
                <span
                  className="rounded-full px-3 py-1 text-[12px] font-semibold uppercase tracking-wider"
                  style={{
                    backgroundColor: `${LEVEL_COLOR[data.level] ?? "#86868B"}18`,
                    color: LEVEL_COLOR[data.level] ?? "#86868B",
                  }}
                >
                  {data.level}
                </span>
              </div>

              <h1 className="font-display text-[40px] sm:text-[48px] xl:text-[56px] font-semibold tracking-[-0.04em] text-foreground leading-[1.05] mb-5">
                {data.title_id}
              </h1>
              <p className="text-[17px] sm:text-[19px] leading-relaxed text-[#86868B] max-w-xl text-balance">
                {data.description_id}
              </p>

              <div className="mt-8 flex flex-wrap gap-2">
                <div className="inline-flex items-center gap-1.5 rounded-full border border-transparent bg-[#F5F5F7] dark:bg-[#1C1C1E] px-4 py-2 text-[13px] font-medium text-[#86868B]">
                  <Clock className="h-4 w-4" />
                  {data.estimatedMinutes} mnt total
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-full border border-transparent bg-[#F5F5F7] dark:bg-[#1C1C1E] px-4 py-2 text-[13px] font-medium text-[#86868B]">
                  <BookOpen className="h-4 w-4" />
                  {lessonCount} lesson
                </div>
                <button
                  type="button"
                  onClick={() => void toggleTopicBookmark(topic)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-transparent bg-[#F5F5F7] dark:bg-[#1C1C1E] px-4 py-2 text-[13px] font-medium text-[#86868B] hover:text-[#0071E3] transition-colors"
                >
                  {topicBookmarked ? <BookmarkCheck className="h-4 w-4 text-[#0071E3]" /> : <Bookmark className="h-4 w-4" />}
                  {topicBookmarked ? "Tersimpan" : "Simpan topik"}
                </button>
              </div>

              {prerequisiteNotice && (
                <div className="mt-5 inline-flex items-start gap-2 rounded-[16px] border border-[#FF9500]/15 bg-[#FF9500]/8 px-4 py-3 text-[13px] leading-relaxed text-[#8A5800] dark:text-[#FFCC80]">
                  <TriangleAlert className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>Disarankan menuntaskan topik sebelumnya terlebih dahulu agar materi ini lebih mudah diikuti.</span>
                </div>
              )}
            </div>

            <div className="w-full xl:w-[340px] bg-white dark:bg-[#111214] rounded-[24px] p-6 sm:p-7 border border-[#D2D2D7]/60 dark:border-white/10 shadow-sm">
              <div className="flex items-start justify-between gap-4 mb-5">
                <div>
                  <p className="text-[12px] font-semibold uppercase tracking-[0.15em] text-[#86868B]">
                    Progress Topik
                  </p>
                  <h2 className="mt-2 font-display text-[36px] font-semibold tracking-tight text-foreground leading-none">
                    {prog.pct}%
                  </h2>
                </div>
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full"
                  style={{ backgroundColor: `${progressColor}14` }}
                >
                  {prog.done === lessonCount && lessonCount > 0 ? (
                    <CheckCircle2 className="h-5 w-5" style={{ color: progressColor }} />
                  ) : (
                    <BookOpen className="h-5 w-5" style={{ color: progressColor }} />
                  )}
                </div>
              </div>

              <ProgressBar
                value={prog.pct}
                color={progressColor}
                label={lessonCount ? `${prog.done} dari ${lessonCount} lesson selesai` : "Topik belum memiliki lesson"}
              />

              {lessonCount > 0 && (
                <div className="mt-5">
                  <div className="flex gap-1.5">
                    {data.lessons.map((lesson) => {
                      const done = isCompleted(topic, lesson.id);
                      const isNext = !done && lesson.id === nextLesson?.id;
                      return (
                        <div
                          key={lesson.id}
                          className={cn(
                            "h-1.5 flex-1 rounded-full transition-colors",
                            done
                              ? "bg-[#34C759]"
                              : isNext
                                ? "bg-[#0071E3]/55"
                                : "bg-[#D2D2D7]/60 dark:bg-white/10",
                          )}
                          style={isNext ? { backgroundColor: data.color } : done ? { backgroundColor: progressColor } : undefined}
                        />
                      );
                    })}
                  </div>
                  <p className="mt-3 text-[12px] leading-relaxed text-[#86868B]">
                    {prog.done === lessonCount
                      ? "Topik sudah selesai."
                      : `Berikutnya: ${nextLessonLabel}`}
                  </p>
                </div>
              )}

              <div className="mt-6 pt-5 border-t border-[#D2D2D7]/40 dark:border-white/10 grid grid-cols-2 gap-2 text-center">
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-[#86868B] mb-1">Selesai</p>
                  <p className="font-semibold text-[17px] text-foreground">{prog.done}</p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-[#86868B] mb-1">Tersisa</p>
                  <p className="font-semibold text-[17px] text-foreground">{remainingLessons}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-24">
          <div className="mb-8 flex items-center justify-between border-b border-[#D2D2D7]/40 dark:border-white/10 pb-4">
            <h2 className="font-display text-[24px] font-semibold tracking-tight text-foreground">
              Daftar Lesson
            </h2>
            <span className="text-[13px] font-medium text-[#86868B]">
              {lessonCount} {lessonCount === 1 ? "lesson" : "lessons"}
            </span>
          </div>

          <div className="grid gap-4">
            {data.lessons?.map((lesson, idx) => {
              const done = isCompleted(topic, lesson.id);
              const isNext = !done && lesson.id === nextLesson?.id;

              return (
                <Link
                  key={lesson.id}
                  href={`/modules/${topic}/${lesson.id}`}
                  className={cn(
                    "group relative flex flex-col sm:flex-row sm:items-center justify-between gap-5 rounded-[24px] p-6 transition-all duration-300",
                    isNext
                      ? "bg-white dark:bg-[#1C1C1E] border border-[#D2D2D7]/60 dark:border-white/10 shadow-[0_12px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_12px_30px_rgba(0,0,0,0.2)] hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_16px_40px_rgba(0,0,0,0.3)] ring-1 ring-[#D2D2D7]/50 dark:ring-white/10"
                      : "bg-[#F5F5F7]/50 dark:bg-[#111214]/50 hover:bg-white dark:hover:bg-[#1C1C1E] border border-transparent dark:border-white/5 hover:border-[#D2D2D7]/60 dark:hover:border-white/10",
                  )}
                >
                  <div className="flex items-start sm:items-center gap-5">
                    <div
                      className={cn(
                        "flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] text-[16px] font-display font-semibold transition-colors",
                        done
                          ? "bg-[#34C759]/15 text-[#30D158]"
                          : isNext
                            ? "bg-[#0071E3] text-white shadow-md shadow-[#0071E3]/20"
                            : "bg-[#D2D2D7]/30 dark:bg-white/10 text-[#86868B]",
                      )}
                    >
                      {done ? <CheckCircle2 className="h-5 w-5" /> : idx + 1}
                    </div>

                    <div>
                      <h3
                        className={cn(
                          "font-display text-[19px] font-semibold tracking-tight transition-colors",
                          done ? "text-foreground" : isNext ? "text-[#0071E3]" : "text-foreground",
                        )}
                      >
                        {lesson.title_id}
                      </h3>
                      <p className="mt-1 text-[14px] text-[#86868B] leading-relaxed">
                        {lesson.title_id} {/* Gunakan title_id karena deskripsi di LessonMeta mungkin belum tersedia secara global */}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 sm:ml-auto">
                    <div className="flex items-center gap-1.5 text-[13px] font-medium text-[#86868B]">
                      <Clock className="h-4 w-4" />
                      {lesson.estimatedMinutes} mnt
                    </div>

                    <div
                      className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-full transition-transform",
                        isNext
                          ? "bg-[#0071E3]/10 text-[#0071E3] group-hover:translate-x-1"
                          : "text-[#86868B] group-hover:text-foreground group-hover:translate-x-1",
                      )}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  </div>
                </Link>
              );
            })}
            
            {lessonCount === 0 && (
              <div className="py-12 text-center text-[#86868B]">
                Belum ada lesson pada topik ini.
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
