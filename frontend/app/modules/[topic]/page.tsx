"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, BookOpen, CheckCircle2, ChevronRight, Clock } from "lucide-react";
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
  const { isCompleted, topicProgress } = useProgress();

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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 sm:px-6 pb-24 pt-24">
        <section className="relative overflow-hidden rounded-[34px] border border-black/[0.06] bg-[#FBFBFD] p-8 shadow-[0_28px_80px_rgba(15,23,42,0.08)] dark:border-white/[0.08] dark:bg-[#0F0F11] dark:shadow-[0_28px_80px_rgba(0,0,0,0.32)] sm:p-10">
          <div className="pointer-events-none absolute -left-10 top-0 h-48 w-48 rounded-full blur-3xl" style={{ backgroundColor: `${data.color}16` }} />
          <div className="pointer-events-none absolute right-0 top-10 h-40 w-40 rounded-full bg-[#AF52DE]/10 blur-3xl" />

          <div className="relative">
            <Link
              href="/modules"
              className="inline-flex items-center gap-2 rounded-full border border-black/[0.06] bg-white/80 px-4 py-2 text-[13px] font-medium text-[#86868B] shadow-[0_10px_26px_rgba(15,23,42,0.04)] transition-colors hover:text-foreground dark:border-white/[0.08] dark:bg-white/[0.04] dark:shadow-none"
            >
              <ArrowLeft className="h-4 w-4" />
              Semua Topik
            </Link>

            <div className="mt-6 grid gap-8 xl:grid-cols-[minmax(0,1.15fr)_340px] xl:items-start">
              <div className="max-w-2xl">
                <div className="flex flex-wrap items-center gap-3">
                  <div
                    className="flex h-14 w-14 items-center justify-center rounded-[20px] text-[15px] font-semibold text-white shadow-[0_18px_36px_rgba(15,23,42,0.18)]"
                    style={{ backgroundColor: data.color }}
                  >
                    {String(data.number).padStart(2, "0")}
                  </div>

                  <span
                    className="rounded-full px-3 py-1.5 text-[12px] font-medium"
                    style={{
                      backgroundColor: `${LEVEL_COLOR[data.level] ?? "#86868B"}18`,
                      color: LEVEL_COLOR[data.level] ?? "#86868B",
                    }}
                  >
                    {data.level}
                  </span>

                  <div className="rounded-full border border-black/[0.06] bg-white/80 px-4 py-2 text-[13px] font-medium text-foreground shadow-[0_10px_26px_rgba(15,23,42,0.04)] dark:border-white/[0.08] dark:bg-white/[0.04] dark:shadow-none">
                    {lessonCount} lesson
                  </div>
                </div>

                <h1 className="mt-6 font-display text-[34px] font-semibold tracking-tight text-foreground sm:text-[42px] xl:text-[48px]">
                  {data.title_id}
                </h1>
                <p className="mt-4 max-w-xl text-[16px] leading-7 text-[#86868B] sm:text-[17px]">
                  {data.description_id}
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <div className="inline-flex items-center gap-2 rounded-full border border-black/[0.06] bg-white/80 px-4 py-2 text-[13px] font-medium text-foreground shadow-[0_10px_26px_rgba(15,23,42,0.04)] dark:border-white/[0.08] dark:bg-white/[0.04] dark:shadow-none">
                    <Clock className="h-4 w-4 text-[#86868B]" />
                    {data.estimatedMinutes} mnt total
                  </div>
                  <div className="rounded-full border border-black/[0.06] bg-white/80 px-4 py-2 text-[13px] font-medium text-foreground shadow-[0_10px_26px_rgba(15,23,42,0.04)] dark:border-white/[0.08] dark:bg-white/[0.04] dark:shadow-none">
                    {remainingLessons} lesson tersisa
                  </div>
                  <div
                    className={cn(
                      "rounded-full px-4 py-2 text-[13px] font-medium",
                      prog.done === 0
                        ? "bg-black/[0.04] text-[#86868B] dark:bg-white/[0.05]"
                        : prog.done < lessonCount
                          ? "bg-[#0071E3]/10 text-[#0071E3]"
                          : "bg-[#34C759]/12 text-[#34C759]",
                    )}
                  >
                    {prog.done === 0
                      ? "Belum dimulai"
                      : prog.done < lessonCount
                        ? `${prog.done}/${lessonCount} lesson selesai`
                        : "Topik selesai"}
                  </div>
                </div>
              </div>

              <div className="rounded-[28px] border border-black/[0.06] bg-white/80 p-6 shadow-[0_20px_50px_rgba(15,23,42,0.06)] backdrop-blur-sm dark:border-white/[0.08] dark:bg-white/[0.04] dark:shadow-[0_20px_50px_rgba(0,0,0,0.24)]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#86868B]">
                      Progress
                    </p>
                    <h2 className="mt-3 font-display text-[36px] font-semibold tracking-tight text-foreground">
                      {prog.pct}%
                    </h2>
                    <p className="mt-1 text-[14px] text-[#86868B]">
                      {lessonCount
                        ? `${prog.done} dari ${lessonCount} lesson selesai`
                        : "Belum ada lesson pada topik ini"}
                    </p>
                  </div>

                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-2xl"
                    style={{ backgroundColor: `${progressColor}14` }}
                  >
                    {prog.done === lessonCount && lessonCount > 0 ? (
                      <CheckCircle2 className="h-6 w-6 text-[#34C759]" />
                    ) : (
                      <BookOpen className="h-6 w-6" style={{ color: progressColor }} />
                    )}
                  </div>
                </div>

                <ProgressBar
                  className="mt-6"
                  value={prog.pct}
                  color={progressColor}
                  label={
                    lessonCount
                      ? `${prog.done} dari ${lessonCount} lesson selesai`
                      : "Topik ini belum memiliki lesson"
                  }
                />

                {lessonCount > 0 && (
                  <>
                    <div className="mt-5 flex gap-2">
                      {data.lessons.map((lesson) => {
                        const done = isCompleted(topic, lesson.id);
                        const isNext = !done && lesson.id === nextLesson?.id;

                        return (
                          <div
                            key={lesson.id}
                            className={cn(
                              "h-2 flex-1 rounded-full transition-colors",
                              done
                                ? "bg-[#34C759]"
                                : isNext
                                  ? "bg-[#0071E3]/55"
                                  : "bg-black/[0.08] dark:bg-white/[0.08]",
                            )}
                            style={isNext ? { backgroundColor: data.color } : undefined}
                          />
                        );
                      })}
                    </div>
                    <p className="mt-3 text-[13px] leading-6 text-[#86868B]">
                      {prog.done === lessonCount
                        ? "Semua lesson di topik ini sudah selesai. Kamu bisa review kapan saja."
                        : `Berikutnya: ${nextLessonLabel}`}
                    </p>
                  </>
                )}

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="rounded-[20px] bg-black/[0.03] p-4 dark:bg-white/[0.05]">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-[#86868B]">Tersisa</p>
                    <p className="mt-2 font-display text-[24px] font-semibold tracking-tight text-foreground">
                      {remainingLessons}
                    </p>
                  </div>
                  <div className="rounded-[20px] bg-black/[0.03] p-4 dark:bg-white/[0.05]">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-[#86868B]">Estimasi</p>
                    <p className="mt-2 font-display text-[24px] font-semibold tracking-tight text-foreground">
                      {remainingMinutes} mnt
                    </p>
                  </div>
                </div>

                <div className="mt-6">
                  {prog.done === 0 ? (
                    <>
                      <Link
                        href={nextLessonHref}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#0071E3] px-6 py-4 text-[15px] font-medium text-white shadow-[0_20px_40px_rgba(0,113,227,0.24)] transition-colors hover:bg-[#0077ED]"
                      >
                        Mulai topik
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                      <p className="mt-3 text-center text-[12px] text-[#86868B]">
                        Mulai dari lesson pertama dan bangun fondasi topik ini.
                      </p>
                    </>
                  ) : prog.done < lessonCount ? (
                    <>
                      <Link
                        href={nextLessonHref}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#0071E3] px-6 py-4 text-[15px] font-medium text-white shadow-[0_20px_40px_rgba(0,113,227,0.24)] transition-colors hover:bg-[#0077ED]"
                      >
                        Lanjutkan belajar
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                      <p className="mt-3 text-center text-[12px] text-[#86868B]">
                        Berikutnya: {nextLessonLabel}
                      </p>
                    </>
                  ) : (
                    <div className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#34C759]/10 px-6 py-4 text-[15px] font-medium text-[#34C759]">
                      <CheckCircle2 className="h-4 w-4" />
                      Topik selesai!
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#86868B]">
                Lessons
              </p>
              <h2 className="mt-2 font-display text-[28px] font-semibold tracking-tight text-foreground sm:text-[32px]">
                Urutan belajar topik ini
              </h2>
              <p className="mt-2 text-[14px] leading-6 text-[#86868B] sm:text-[15px]">
                Buka lesson mana saja, atau lanjutkan dari titik progress terakhirmu.
              </p>
            </div>

            <div className="rounded-full border border-black/[0.06] bg-white/80 px-4 py-2 text-[13px] font-medium text-[#86868B] shadow-[0_10px_26px_rgba(15,23,42,0.04)] dark:border-white/[0.08] dark:bg-white/[0.04] dark:shadow-none">
              {lessonCount} lesson
            </div>
          </div>

          {lessonCount === 0 ? (
            <section className="rounded-[30px] border border-black/[0.06] bg-[#FBFBFD] p-10 text-center shadow-[0_24px_60px_rgba(15,23,42,0.07)] dark:border-white/[0.08] dark:bg-[#101012] dark:shadow-[0_24px_60px_rgba(0,0,0,0.28)]">
              <div className="flex flex-col items-center justify-center rounded-[26px] border border-dashed border-black/[0.08] bg-black/[0.02] px-6 py-16 text-center dark:border-white/[0.1] dark:bg-white/[0.03]">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0071E3]/10 text-[#0071E3]">
                  <BookOpen className="h-7 w-7" />
                </div>
                <h3 className="mt-5 font-display text-[28px] font-semibold tracking-tight text-foreground">
                  Lesson belum tersedia
                </h3>
                <p className="mt-2 max-w-md text-[14px] leading-7 text-[#86868B]">
                  Konten lesson untuk topik ini akan muncul di sini setelah data tersedia.
                </p>
              </div>
            </section>
          ) : (
            <div className="space-y-3">
              {data.lessons.map((lesson, index) => {
                const done = isCompleted(topic, lesson.id);
                const isNext = !done && lesson.id === nextLesson?.id;

                return (
                  <Link
                    key={lesson.id}
                    href={`/modules/${topic}/${lesson.id}`}
                    className={cn(
                      "group relative block overflow-hidden rounded-[28px] border p-5 shadow-[0_18px_45px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_54px_rgba(15,23,42,0.08)] dark:shadow-[0_18px_45px_rgba(0,0,0,0.24)] dark:hover:shadow-[0_22px_54px_rgba(0,0,0,0.28)]",
                      done
                        ? "border-[#34C759]/20 bg-[#F7FFF9] dark:border-[#34C759]/20 dark:bg-[#0F1712]"
                        : "border-black/[0.06] bg-[#FBFBFD] dark:border-white/[0.08] dark:bg-[#101012]",
                    )}
                    style={isNext ? { boxShadow: `0 22px 54px ${data.color}12` } : undefined}
                  >
                    <div
                      className="pointer-events-none absolute inset-x-0 top-0 h-20 opacity-80"
                      style={{
                        background: `linear-gradient(180deg, ${(done ? "#34C759" : isNext ? data.color : "#FFFFFF")}12 0%, transparent 100%)`,
                      }}
                    />

                    <div className="relative flex flex-col gap-4 sm:grid sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center sm:gap-4">
                      <div
                        className={cn(
                          "flex h-12 w-12 items-center justify-center rounded-2xl border text-[14px] font-semibold",
                          done
                            ? "border-[#34C759]/20 bg-[#34C759]/12 text-[#34C759]"
                            : isNext
                              ? "border-transparent text-white"
                              : "border-black/[0.06] bg-white/90 text-foreground dark:border-white/[0.08] dark:bg-white/[0.05]",
                        )}
                        style={!done && isNext ? { backgroundColor: data.color } : undefined}
                      >
                        {done ? <CheckCircle2 className="h-5 w-5" /> : String(index + 1).padStart(2, "0")}
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#86868B]">
                            Lesson {String(index + 1).padStart(2, "0")}
                          </span>
                          <span
                            className={cn(
                              "rounded-full px-2.5 py-1 text-[11px] font-medium",
                              done
                                ? "bg-[#34C759]/12 text-[#34C759]"
                                : isNext
                                  ? "bg-[#0071E3]/10 text-[#0071E3]"
                                  : "bg-black/[0.04] text-[#86868B] dark:bg-white/[0.05]",
                            )}
                          >
                            {done ? "Selesai" : isNext ? "Berikutnya" : "Siap dipelajari"}
                          </span>
                        </div>

                        <h3 className="mt-3 truncate text-[17px] font-semibold tracking-tight text-foreground transition-colors group-hover:text-[#0071E3]">
                          {lesson.title_id}
                        </h3>

                        <div className="mt-2 flex flex-wrap items-center gap-3 text-[13px] text-[#86868B]">
                          <span className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5" />
                            {lesson.estimatedMinutes} mnt
                          </span>
                          <span>
                            {done
                              ? "Sudah selesai"
                              : isNext
                                ? "Lanjutkan dari sini"
                                : "Tersedia untuk dibuka kapan saja"}
                          </span>
                        </div>
                      </div>

                      <div className="mt-1 flex items-center justify-between gap-3 sm:mt-0 sm:flex-col sm:items-end">
                        <span
                          className={cn(
                            "rounded-full px-3 py-1.5 text-[12px] font-medium",
                            done
                              ? "bg-[#34C759]/12 text-[#34C759]"
                              : isNext
                                ? "text-white"
                                : "border border-black/[0.06] bg-white/85 text-[#86868B] dark:border-white/[0.08] dark:bg-white/[0.04]",
                          )}
                          style={!done && isNext ? { backgroundColor: data.color } : undefined}
                        >
                          {done ? "Completed" : isNext ? "Continue" : "Open"}
                        </span>

                        <ChevronRight
                          className={cn(
                            "h-4 w-4 transition-colors",
                            done ? "text-[#34C759]" : "text-[#86868B] group-hover:text-[#0071E3]",
                          )}
                        />
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
