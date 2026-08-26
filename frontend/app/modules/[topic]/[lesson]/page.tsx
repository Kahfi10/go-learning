"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  ChevronLeft, ChevronRight, CheckCircle2, Clock,
  Languages, Menu, X, MessageCircle, Zap,
} from "lucide-react";
import Navbar from "@/components/navigation/Navbar";
import CodeEditor from "@/components/editor/CodeEditor";
import Quiz from "@/components/lesson/Quiz";
import CommentThread from "@/components/discussion/CommentThread";
import { ProgressBar } from "@/components/ui/progress";
import { LevelBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api, type Lesson, type TopicDetail } from "@/lib/api";
import { useProgress } from "@/hooks/useProgress";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels";

export default function LessonPage() {
  const { topic, lesson } = useParams<{ topic: string; lesson: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { state } = useAuth();
  const [data, setData] = useState<Lesson | null>(null);
  const [topicData, setTopicData] = useState<TopicDetail | null>(null);
  const [lang, setLang] = useState<"id" | "en">("id");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"content" | "discussion">("content");
  const [xpGained, setXpGained] = useState(0);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [completionLoading, setCompletionLoading] = useState(false);
  const [showMobileEditor, setShowMobileEditor] = useState(false);
  const initializedLessonKeyRef = useRef<string | null>(null);
  const {
    isCompleted,
    markComplete,
    saveCode,
    getLastCode,
    topicProgress,
    getResumeState,
    saveResumeState,
    markLessonViewed,
  } = useProgress();

  useEffect(() => {
    api.topics.getLesson(topic, lesson).then(setData).catch(() => {});
    api.topics.get(topic).then(setTopicData).catch(() => {});

    const lessonKey = `${topic}/${lesson}`;
    if (initializedLessonKeyRef.current === lessonKey) {
      return;
    }
    initializedLessonKeyRef.current = lessonKey;

    const saved = localStorage.getItem("golearn_lang");
    const resume = getResumeState(topic, lesson);
    const requestedTab = searchParams.get("tab");
    if (resume.lang) {
      setLang(resume.lang);
    } else if (saved === "id" || saved === "en") {
      setLang(saved as "id" | "en");
    }
    if (requestedTab === "discussion" || requestedTab === "content") {
      setActiveTab(requestedTab);
    } else if (resume.activeTab) {
      setActiveTab(resume.activeTab);
    }
    markLessonViewed(topic, lesson);
  }, [getResumeState, lesson, markLessonViewed, searchParams, topic]);

  useEffect(() => {
    saveResumeState(topic, lesson, { lang, activeTab });
  }, [activeTab, lang, lesson, saveResumeState, topic]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    const currentQueryTab = params.get("tab");

    if (activeTab === "discussion") {
      if (currentQueryTab === "discussion") return;
      params.set("tab", "discussion");
    } else {
      if (currentQueryTab !== null) {
        params.delete("tab");
      } else {
        return;
      }
    }

    const nextQuery = params.toString();
    router.replace(`/modules/${topic}/${lesson}${nextQuery ? `?${nextQuery}` : ""}`, { scroll: false });
  }, [activeTab, lesson, router, searchParams, topic]);

  useEffect(() => {
    if (!data) return;
    import("gsap").then(({ gsap }) => {
      gsap.fromTo(
        ".lesson-hero",
        { y: 12, opacity: 0.001 },
        { y: 0, opacity: 1, duration: 0.45, ease: "expo.out" }
      );
      gsap.fromTo(
        ".lesson-sidebar-item",
        { x: -8, opacity: 0.001 },
        { x: 0, opacity: 1, duration: 0.35, ease: "power2.out", stagger: 0.03 }
      );
    });
  }, [data, topic, lesson]);

  useEffect(() => {
    import("gsap").then(({ gsap }) => {
      gsap.fromTo(
        ".lesson-tab-panel",
        { y: 10, opacity: 0.001 },
        { y: 0, opacity: 1, duration: 0.35, ease: "expo.out" }
      );
    });
  }, [activeTab]);

  function toggleLang() {
    const next = lang === "id" ? "en" : "id";
    setLang(next);
    localStorage.setItem("golearn_lang", next);
    saveResumeState(topic, lesson, { lang: next });
  }

  async function handleComplete() {
    const resume = getResumeState(topic, lesson);
    if (!resume.hasRunCode && !resume.hasOpenedQuiz) {
      toast.error("Interaksi dulu dengan editor atau quiz sebelum menandai lesson selesai.");
      return;
    }

    setCompletionLoading(true);
    const code = getLastCode(topic, lesson);
    await markComplete(topic, lesson, code);
    setXpGained(50);
    toast.success("Lesson selesai! +50 XP 🎉", { duration: 3000 });
    // GSAP celebrate
    import("gsap").then(({ gsap }) => {
      gsap.from(".complete-btn", { scale: 1.2, duration: 0.4, ease: "elastic.out(1,0.5)" });
      gsap.from(".xp-badge", { scale: 0, opacity: 0, duration: 0.5, ease: "back.out(2)", delay: 0.1 });
    });
    setCompletionLoading(false);
  }

  async function handleQuizComplete(score: number, total: number) {
    setQuizScore(score);
    saveResumeState(topic, lesson, {
      hasOpenedQuiz: true,
      lastQuizScore: score,
      totalQuestions: total,
      viewedAt: new Date().toISOString(),
    });
    if (state.user) {
      await api.progress.submitQuiz(lesson, { score, topic_slug: topic, total_questions: total }).catch(() => {});
    }
    if (score === total) {
      toast.success(`Quiz sempurna! +25 XP bonus 🏆`, { duration: 3000 });
    }
  }

  const lessons = topicData?.lessons ?? [];
  const currentIdx = lessons.findIndex(l => l.id === lesson);
  const prevLesson = lessons[currentIdx - 1];
  const nextLesson = lessons[currentIdx + 1];
  const done = isCompleted(topic, lesson);
  const prog = topicProgress(topic, lessons.length);
  const resume = getResumeState(topic, lesson);
  const totalQuizQuestions = data?.quiz?.length ?? resume.totalQuestions ?? 0;
  const completionHint = !done && !resume.hasRunCode && !resume.hasOpenedQuiz
    ? "Jalankan kode atau buka quiz dulu untuk mengaktifkan completion."
    : quizScore !== null
      ? `Quiz terakhir: ${quizScore}/${totalQuizQuestions}`
      : resume.hasRunCode
        ? "Editor sudah digunakan. Kamu bisa tandai selesai kapan saja."
        : undefined;

  if (!data) return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-[#86868B]">
          <div className="w-8 h-8 rounded-full border-2 border-[#0071E3]/30 border-t-[#0071E3] animate-spin" />
          <p className="text-[14px]">Memuat lesson...</p>
        </div>
      </div>
    </div>
  );

  const content = lang === "id" ? data.content_id : data.content_en;
  const title = lang === "id" ? data.title_id : data.title_en;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      {/* ── Sub-navbar ──────────────────────────────── */}
      <div className="fixed top-[52px] left-0 right-0 z-40 bg-background/95 backdrop-blur-sm border-b border-[#D2D2D7]/40 px-4 h-11 flex items-center gap-3">
        {/* Sidebar toggle */}
        <button onClick={() => setSidebarOpen(!sidebarOpen)}
          className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-[#F5F5F7] dark:hover:bg-white/8 text-[#86868B] transition-colors shrink-0">
          {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>

        {/* Breadcrumb */}
        <div className="flex-1 min-w-0 flex items-center gap-1 text-[12px] text-[#86868B]">
          <Link href="/modules" className="hover:text-foreground transition-colors shrink-0">Kursus</Link>
          <ChevronRight className="w-3 h-3 shrink-0" />
          <Link href={`/modules/${topic}`} className="hover:text-foreground transition-colors truncate hidden sm:block max-w-[120px]">
            {topicData?.title_id ?? topic}
          </Link>
          <ChevronRight className="w-3 h-3 shrink-0 hidden sm:block" />
          <span className="text-foreground font-medium truncate">{title}</span>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Lang toggle */}
          <button onClick={toggleLang}
            className="flex items-center gap-1 text-[11px] text-[#86868B] hover:text-foreground border border-[#D2D2D7]/60 px-2 py-0.5 rounded-full transition-colors">
            <Languages className="w-3 h-3" /> {lang.toUpperCase()}
          </button>

          {/* XP badge (shown after complete) */}
          {xpGained > 0 && (
            <div className="xp-badge flex items-center gap-1 bg-[#34C759]/15 text-[#34C759] text-[11px] font-medium px-2 py-0.5 rounded-full">
              <Zap className="w-3 h-3" /> +{xpGained} XP
            </div>
          )}

          {/* Complete button */}
          {done ? (
            <div className="flex items-center gap-1 text-[11px] text-[#34C759] px-2.5 py-1 rounded-full bg-[#34C759]/10">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Selesai</span>
            </div>
          ) : (
            <Button
              size="sm"
              onClick={handleComplete}
              loading={completionLoading}
              disabled={!resume.hasRunCode && !resume.hasOpenedQuiz}
              className="complete-btn text-[11px] px-3 py-1"
            >
              Tandai Selesai
            </Button>
          )}
        </div>
      </div>

      {/* ── Main layout ─────────────────────────────── */}
      <div className="flex flex-1 pt-[92px] bg-[#FCFCFD] dark:bg-[#09090A]">
        {/* Sidebar */}
        {sidebarOpen && (
          <aside className="fixed left-0 top-[92px] bottom-0 w-60 bg-background dark:bg-[#0A0A0A] border-r border-[#D2D2D7]/40 z-30 overflow-y-auto">
            {/* Topic progress */}
            <div className="p-4 border-b border-[#D2D2D7]/40">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[12px] font-semibold text-foreground">{topicData?.title_id}</span>
                <LevelBadge level={topicData?.level ?? "Beginner"} />
              </div>
              <ProgressBar value={prog.pct} label={`${prog.done}/${prog.total} lesson`} />
            </div>

            {/* Lesson list */}
            <div className="py-2">
              <div className="px-4 pb-2">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#86868B]">Outline Topic</p>
              </div>
              {lessons.map((l, i) => {
                const lDone = isCompleted(topic, l.id);
                const isCurrent = l.id === lesson;
                return (
                  <Link key={l.id} href={`/modules/${topic}/${l.id}`}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "lesson-sidebar-item flex items-center gap-2.5 px-4 py-2.5 text-[13px] transition-colors group",
                      isCurrent
                        ? "bg-[#0071E3]/8 text-[#0071E3] font-medium border-r-2 border-[#0071E3]"
                        : "text-foreground hover:bg-[#F5F5F7] dark:hover:bg-white/4"
                    )}>
                    <div className={cn(
                      "w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0",
                      lDone ? "bg-[#34C759]/15 text-[#34C759]" :
                      isCurrent ? "bg-[#0071E3]/15 text-[#0071E3]" :
                      "bg-[#F5F5F7] dark:bg-white/8 text-[#86868B]"
                    )}>
                      {lDone ? "✓" : i + 1}
                    </div>
                    <span className="truncate leading-tight">{lang === "id" ? l.title_id : l.title_en}</span>
                  </Link>
                );
              })}
            </div>
          </aside>
        )}

        {/* Content */}
          <main className={cn("flex-1 min-w-0 transition-all duration-200", sidebarOpen ? "lg:ml-60" : "")}>

          {/* Desktop: resizable panels */}
          <div className="hidden lg:flex h-[calc(100vh-92px)] p-3 gap-3">
            <PanelGroup direction="horizontal">
              <Panel defaultSize={54} minSize={35} className="overflow-y-auto rounded-[24px] border border-[#D2D2D7]/40 dark:border-white/8 bg-background shadow-sm" style={{ overflowY: 'auto' }}>
                <div className="max-w-3xl mx-auto px-8 py-8 xl:px-10">
                  <LessonContent
                    data={data} lang={lang} title={title} content={content}
                    topic={topic} lesson={lesson}
                    activeTab={activeTab} onTabChange={setActiveTab}
                    onComplete={handleComplete} done={done}
                    completionEnabled={Boolean(resume.hasRunCode || resume.hasOpenedQuiz)}
                    completionHint={completionHint}
                    onQuizOpen={() => saveResumeState(topic, lesson, { hasOpenedQuiz: true, viewedAt: new Date().toISOString() })}
                    onQuizComplete={handleQuizComplete}
                  />
                  <LessonNav prev={prevLesson} next={nextLesson} topic={topic} lang={lang} />
                </div>
              </Panel>
              <PanelResizeHandle className="mx-1 flex items-center justify-center">
                <div className="h-12 w-[4px] rounded-full bg-[#D2D2D7]/40 hover:bg-[#0071E3]/40 transition-colors cursor-col-resize" />
              </PanelResizeHandle>
              <Panel defaultSize={46} minSize={30} className="overflow-y-auto rounded-[24px] border border-[#D2D2D7]/40 dark:border-white/8 bg-[#F7F7F8] dark:bg-[#101113] shadow-sm">
                <div className="sticky top-0 z-10 border-b border-[#D2D2D7]/35 dark:border-white/6 bg-[#F7F7F8]/95 dark:bg-[#101113]/95 backdrop-blur-sm px-5 py-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[11px] font-semibold text-[#86868B] uppercase tracking-widest">Editor Workspace</p>
                      <p className="mt-1 text-[14px] font-medium text-foreground">Eksperimen langsung di samping materi</p>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-[#86868B] shrink-0">
                      <Clock className="w-3 h-3" /> {data.estimatedMinutes} mnt
                    </div>
                  </div>
                </div>
                <div className="p-5">
                  <CodeEditor
                    defaultCode={getLastCode(topic, lesson) ?? data.starterCode}
                    onCodeChange={(c) => saveCode(topic, lesson, c)}
                    onRun={() => saveResumeState(topic, lesson, { hasRunCode: true, viewedAt: new Date().toISOString() })}
                    height="calc(100vh - 220px)"
                  />
                  {completionHint && !done && (
                    <div className="mt-4 rounded-[14px] border border-[#D2D2D7]/35 dark:border-white/6 bg-white/80 dark:bg-[#17181A] px-4 py-3">
                      <p className="text-[12px] leading-relaxed text-[#86868B]">{completionHint}</p>
                    </div>
                  )}
                </div>
              </Panel>
            </PanelGroup>
          </div>

          {/* Mobile: stacked */}
          <div className="lg:hidden px-4 py-5 space-y-5">
            <LessonContent
              data={data} lang={lang} title={title} content={content}
              topic={topic} lesson={lesson}
              activeTab={activeTab} onTabChange={setActiveTab}
              onComplete={handleComplete} done={done}
              completionEnabled={Boolean(resume.hasRunCode || resume.hasOpenedQuiz)}
              completionHint={completionHint}
              onQuizOpen={() => saveResumeState(topic, lesson, { hasOpenedQuiz: true, viewedAt: new Date().toISOString() })}
              onQuizComplete={handleQuizComplete}
            />
            <div className="rounded-[20px] border border-[#D2D2D7]/35 dark:border-white/6 bg-white dark:bg-[#111214] shadow-sm overflow-hidden">
              <button
                type="button"
                onClick={() => setShowMobileEditor((prev) => !prev)}
                className="w-full flex items-center justify-between gap-4 px-4 py-4 text-left"
              >
                <div>
                  <p className="text-[11px] font-semibold text-[#86868B] uppercase tracking-widest">Editor Go</p>
                  <p className="mt-1 text-[14px] font-medium text-foreground">
                    {showMobileEditor ? "Sembunyikan editor" : "Buka editor latihan"}
                  </p>
                </div>
                <ChevronRight className={cn("w-4 h-4 text-[#86868B] transition-transform", showMobileEditor && "rotate-90")} />
              </button>

              {showMobileEditor && (
                <div className="border-t border-[#D2D2D7]/35 dark:border-white/6 p-4">
                  <CodeEditor
                    defaultCode={getLastCode(topic, lesson) ?? data.starterCode}
                    onCodeChange={(c) => saveCode(topic, lesson, c)}
                    onRun={() => saveResumeState(topic, lesson, { hasRunCode: true, viewedAt: new Date().toISOString() })}
                    height="320px"
                  />
                  {completionHint && !done && (
                    <div className="mt-4 rounded-[14px] border border-[#D2D2D7]/35 dark:border-white/6 bg-[#F7F7F8] dark:bg-[#17181A] px-4 py-3">
                      <p className="text-[12px] leading-relaxed text-[#86868B]">{completionHint}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
            <LessonNav prev={prevLesson} next={nextLesson} topic={topic} lang={lang} />
          </div>

          <div className="lg:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-30 w-[calc(100%-24px)] max-w-md rounded-full border border-[#D2D2D7]/50 dark:border-white/10 bg-white/92 dark:bg-[#111214]/92 backdrop-blur-xl shadow-[0_12px_30px_rgba(0,0,0,0.12)] px-3 py-2">
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setShowMobileEditor((prev) => !prev)}
                className={cn(
                  "flex items-center justify-center gap-1 rounded-full px-3 py-2 text-[12px] font-medium transition-colors",
                  showMobileEditor
                    ? "bg-[#0071E3] text-white"
                    : "bg-[#F5F5F7] dark:bg-[#1C1C1E] text-foreground"
                )}
              >
                Editor
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("discussion")}
                className={cn(
                  "flex items-center justify-center gap-1 rounded-full px-3 py-2 text-[12px] font-medium transition-colors",
                  activeTab === "discussion"
                    ? "bg-[#0071E3] text-white"
                    : "bg-[#F5F5F7] dark:bg-[#1C1C1E] text-foreground"
                )}
              >
                Diskusi
              </button>
              {done ? (
                <div className="flex items-center justify-center gap-1 rounded-full px-3 py-2 text-[12px] font-medium bg-[#34C759]/10 text-[#34C759]">
                  Selesai
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleComplete}
                  disabled={!resume.hasRunCode && !resume.hasOpenedQuiz}
                  className={cn(
                    "flex items-center justify-center gap-1 rounded-full px-3 py-2 text-[12px] font-medium transition-colors",
                    !resume.hasRunCode && !resume.hasOpenedQuiz
                      ? "bg-[#F5F5F7] dark:bg-[#1C1C1E] text-[#86868B]"
                      : "bg-[#34C759] text-white"
                  )}
                >
                  Selesai
                </button>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

/* ── Lesson Content ──────────────────────────────── */
function LessonContent({
  data,
  lang,
  title,
  content,
  topic,
  lesson,
  activeTab,
  onTabChange,
  onComplete,
  done,
  onQuizComplete,
  onQuizOpen,
  completionEnabled,
  completionHint,
}: any) {
  const proseRef = useRef<HTMLDivElement>(null);
  const lessonSections = useMemo(() => extractSectionTitles(content), [content]);
  const introText = useMemo(() => extractIntroText(content), [content]);
  const [activeSection, setActiveSection] = useState<string>(lessonSections[0] ?? "");
  const [readingProgress, setReadingProgress] = useState(0);

  useEffect(() => {
    setActiveSection(lessonSections[0] ?? "");
  }, [lessonSections]);

  useEffect(() => {
    const root = proseRef.current;
    if (!root) return;

    const buttons = Array.from(root.querySelectorAll<HTMLButtonElement>(".docs-code-copy"));
    const cleanups = buttons.map((button) => {
      const handler = async () => {
        const raw = button.dataset.code ? decodeURIComponent(button.dataset.code) : "";
        await navigator.clipboard.writeText(raw);
        const previous = button.textContent;
        button.textContent = lang === "id" ? "Tersalin" : "Copied";
        window.setTimeout(() => {
          button.textContent = previous;
        }, 1200);
      };

      button.addEventListener("click", handler);
      return () => button.removeEventListener("click", handler);
    });

    return () => {
      cleanups.forEach((cleanup) => cleanup());
    };
  }, [content, lang]);

  useEffect(() => {
    const root = proseRef.current;
    if (!root) return;

    const headings = Array.from(root.querySelectorAll<HTMLElement>("h2"));
    if (headings.length === 0) {
      setReadingProgress(0);
      return;
    }

    headings.forEach((heading, index) => {
      if (!heading.id) {
        heading.id = `lesson-section-${index + 1}`;
      }
    });

    const onScroll = () => {
      const viewportHeight = window.innerHeight;
      const doc = document.documentElement;
      const maxScrollable = Math.max(doc.scrollHeight - viewportHeight, 1);
      const nextProgress = Math.max(0, Math.min(100, Math.round((window.scrollY / maxScrollable) * 100)));
      setReadingProgress(nextProgress);

      const current = headings.reduce<{ id: string; label: string; top: number } | null>((closest, heading) => {
        const rect = heading.getBoundingClientRect();
        if (rect.top > viewportHeight * 0.3) return closest;
        return {
          id: heading.id,
          label: heading.textContent ?? "",
          top: rect.top,
        };
      }, null);

      if (current?.label) {
        setActiveSection(current.label);
      }
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [content]);

  function scrollToSection(index: number) {
    const root = proseRef.current;
    if (!root) return;
    const headings = Array.from(root.querySelectorAll<HTMLElement>("h2"));
    const target = headings[index];
    if (!target) return;
    const y = window.scrollY + target.getBoundingClientRect().top - 112;
    window.scrollTo({ top: y, behavior: "smooth" });
  }

  return (
    <div>
      <div className="mb-5 rounded-full bg-[#F1F2F4] dark:bg-[#161719] overflow-hidden h-1.5">
        <div className="h-full rounded-full bg-[#0071E3] transition-[width] duration-300 ease-out" style={{ width: `${readingProgress}%` }} />
      </div>

      <div className="lesson-hero mb-8 rounded-[22px] border border-[#D2D2D7]/45 dark:border-white/8 bg-[#FAFAFB] dark:bg-[#111214] p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F5F5F7] dark:bg-[#1C1C1E] px-3 py-1.5 text-[12px] font-medium text-[#86868B]">
            <Clock className="w-3.5 h-3.5" /> {data.estimatedMinutes} mnt
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F5F5F7] dark:bg-[#1C1C1E] px-3 py-1.5 text-[12px] font-medium text-[#86868B]">
            <MessageCircle className="w-3.5 h-3.5" /> {lessonSections.length || 1} section
          </span>
          {data.quiz?.length > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0071E3]/8 px-3 py-1.5 text-[12px] font-medium text-[#0071E3]">
              Quiz {data.quiz.length} soal
            </span>
          )}
          {done && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#34C759]/10 px-3 py-1.5 text-[12px] font-medium text-[#34C759]">
              <CheckCircle2 className="w-3.5 h-3.5" /> Selesai
            </span>
          )}
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_240px] lg:items-start">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0071E3] mb-2.5">
              Developer Guide
            </p>
            <h1 className="font-display font-semibold text-[28px] sm:text-[34px] tracking-tight text-foreground mb-3 leading-[1.08]">
              {title}
            </h1>
            <p className="text-[14px] sm:text-[15px] leading-relaxed text-[#86868B] max-w-2xl text-balance">
              {introText || "Pelajari konsep utama lesson ini, pahami contoh kodenya, lalu uji pemahamanmu lewat quiz dan editor interaktif."}
            </p>
          </div>

          <div className="rounded-[16px] border border-[#D2D2D7]/35 dark:border-white/6 bg-white/65 dark:bg-[#17181A] p-4">
            <div className="flex items-center justify-between gap-3 mb-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#86868B]">
                Progress Membaca
              </p>
              <span className="text-[11px] font-medium text-[#0071E3]">{readingProgress}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-[#E8E9EC] dark:bg-[#222326] overflow-hidden mb-4">
              <div className="h-full rounded-full bg-[#0071E3] transition-[width] duration-300 ease-out" style={{ width: `${readingProgress}%` }} />
            </div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#86868B] mb-2.5">
              Yang Akan Dipelajari
            </p>
            <div className="space-y-1.5">
              {lessonSections.slice(0, 5).map((section, index) => {
                const isActive = activeSection === section;
                return (
                  <button
                    key={section}
                    type="button"
                    onClick={() => scrollToSection(index)}
                    className={cn(
                      "w-full flex items-start gap-3 rounded-[12px] px-2.5 py-2 text-left transition-colors",
                      isActive
                        ? "bg-[#0071E3]/8 text-[#0071E3]"
                        : "hover:bg-[#F5F5F7] dark:hover:bg-[#111214] text-foreground"
                    )}
                  >
                    <span className={cn(
                      "mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold shrink-0 border",
                      isActive
                        ? "bg-white text-[#0071E3] border-[#0071E3]/20 dark:bg-[#111214]"
                        : "bg-[#F5F5F7] dark:bg-[#111214] text-[#86868B] border-[#D2D2D7]/35 dark:border-white/6"
                    )}>
                      {index + 1}
                    </span>
                    <p className={cn("text-[12px] leading-relaxed", isActive ? "text-[#0071E3]" : "text-foreground")}>{section}</p>
                  </button>
                );
              })}
              {lessonSections.length === 0 && (
                <p className="text-[13px] leading-relaxed text-[#86868B]">
                  Materi inti akan muncul terstruktur di bawah ini bersama contoh dan referensi praktis.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: Materi | Diskusi */}
      <div className="relative flex items-center gap-1 mb-6 border-b border-[#D2D2D7]/40 overflow-x-auto no-scrollbar">
        {[
          { key: "content", label: lang === "id" ? "Materi" : "Content" },
          { key: "discussion", label: lang === "id" ? "Diskusi" : "Discussion", icon: MessageCircle },
        ].map((t) => (
          <button key={t.key} onClick={() => onTabChange(t.key)}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2.5 text-[13px] font-medium border-b-2 -mb-px transition-colors",
              activeTab === t.key
                ? "border-[#0071E3] text-[#0071E3]"
                : "border-transparent text-[#86868B] hover:text-foreground"
            )}>
            {t.icon && <t.icon className="w-3.5 h-3.5" />}
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "content" ? (
        <>
          <div className="lesson-tab-panel mb-6 rounded-[16px] border border-[#D2D2D7]/35 dark:border-white/6 bg-[#F7F7F8] dark:bg-[#17181A] p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#0071E3] mb-2">
              Cara Belajar Terbaik
            </p>
            <p className="text-[13px] leading-relaxed text-[#86868B]">
              Baca konsep inti, perhatikan contoh kode, lalu jalankan eksperimen singkat di editor kanan agar pemahamanmu lebih cepat menempel.
            </p>
          </div>

          <div ref={proseRef} className="lesson-tab-panel prose-golearn" dangerouslySetInnerHTML={{ __html: mdToHtml(content) }} />

          {lessonSections.length > 0 && (
            <div className="lesson-tab-panel mt-10 rounded-[20px] border border-[#D2D2D7]/35 dark:border-white/6 bg-[#FAFAFB] dark:bg-[#111214] p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-5">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#86868B] mb-2">
                    Ringkasan Lesson
                  </p>
                  <h3 className="font-display text-[20px] font-semibold tracking-tight text-foreground">
                    Peta materi yang sudah kamu baca
                  </h3>
                </div>
                <span className="rounded-full bg-[#F5F5F7] dark:bg-[#1C1C1E] px-3 py-1.5 text-[12px] font-medium text-[#86868B]">
                  {lessonSections.length} bagian
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {lessonSections.map((section, index) => (
                  <div key={section} className="rounded-[14px] border border-[#D2D2D7]/30 dark:border-white/5 bg-white/70 dark:bg-[#17181A] p-3.5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#86868B] mb-1.5">
                      Section {index + 1}
                    </p>
                    <p className="text-[13px] font-medium text-foreground leading-relaxed">{section}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quiz */}
          {data.quiz?.length > 0 && (
            <div className="lesson-tab-panel mt-10">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-5 bg-[#0071E3] rounded-full" />
                <p className="font-semibold text-[15px] text-foreground">
                  {lang === "id" ? "Uji Pemahaman" : "Knowledge Check"}
                </p>
                <span className="text-[#86868B] text-[13px]">· {data.quiz.length} soal</span>
              </div>
              <Quiz
                questions={data.quiz}
                lang={lang}
                topicSlug={topic}
                lessonId={lesson}
                onOpen={onQuizOpen}
                onComplete={onQuizComplete}
              />
            </div>
          )}

          {/* Mark complete CTA (bottom) */}
          {!done && (
            <div className="lesson-tab-panel mt-10 p-5 bg-[#FAFAFB] dark:bg-[#17181A] rounded-[18px] flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-[#D2D2D7]/35 dark:border-white/6">
              <div>
                <p className="font-medium text-[14px] text-foreground">Sudah paham materi ini?</p>
                <p className="text-[#86868B] text-[12px] mt-0.5">
                  {completionHint ?? "Tandai selesai dan dapatkan +50 XP"}
                </p>
              </div>
              <Button onClick={onComplete} disabled={!completionEnabled} className="shrink-0 w-full sm:w-auto justify-center">
                Selesai +50 XP
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="lesson-tab-panel">
          <CommentThread topicSlug={topic} lessonId={lesson} lang={lang} />
        </div>
      )}
    </div>
  );
}

/* ── Lesson Navigation ───────────────────────────── */
function LessonNav({ prev, next, topic, lang }: any) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 pt-8 mt-8 border-t border-[#D2D2D7]/40">
      {prev ? (
        <Link href={`/modules/${topic}/${prev.id}`}
          className="flex items-center gap-3 rounded-[18px] border border-[#D2D2D7]/35 dark:border-white/6 bg-white dark:bg-[#111214] px-4 py-4 text-[13px] transition-colors group hover:border-[#0071E3]/25 hover:bg-[#FAFAFB] dark:hover:bg-[#17181A]">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F5F5F7] dark:bg-[#1C1C1E] text-[#86868B] shrink-0">
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-wide text-[#86868B]">Sebelumnya</p>
            <p className="font-medium text-foreground truncate">{lang === "id" ? prev.title_id : prev.title_en}</p>
          </div>
        </Link>
      ) : <div className="hidden sm:block" />}
      {next ? (
        <Link href={`/modules/${topic}/${next.id}`}
          className="flex items-center justify-between gap-3 rounded-[18px] border border-[#D2D2D7]/35 dark:border-white/6 bg-white dark:bg-[#111214] px-4 py-4 text-[13px] font-medium transition-colors group hover:border-[#0071E3]/25 hover:bg-[#FAFAFB] dark:hover:bg-[#17181A]">
          <div className="min-w-0 text-right sm:text-left ml-auto sm:ml-0 order-2 sm:order-1">
            <p className="text-[10px] uppercase tracking-wide text-[#86868B]">Berikutnya</p>
            <p className="text-[#0071E3] truncate">{lang === "id" ? next.title_id : next.title_en}</p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0071E3]/10 text-[#0071E3] shrink-0 order-1 sm:order-2">
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>
      ) : (
        <Link href={`/modules/${topic}`}
          className="flex items-center justify-center gap-2 rounded-[18px] border border-[#34C759]/20 bg-[#34C759]/8 px-4 py-4 text-[#34C759] text-[13px] font-medium sm:col-start-2">
          <CheckCircle2 className="w-4 h-4" />
          Selesai semua!
        </Link>
      )}
    </div>
  );
}

/* ── Minimal markdown parser ─────────────────────── */
function mdToHtml(md: string): string {
  if (!md) return "";

  const normalized = md.replace(/\r\n/g, "\n").trim();

  let blockId = 0;
  const blocks: Record<string, string> = {};

  const withCodePlaceholders = normalized.replace(/```(.*?)\n([\s\S]*?)```/g, (_, lang, code) => {
    const id = `__CODE_BLOCK_${blockId++}__`;
    const safeLang = escapeHtml(lang.trim() || "text");
    const safeClass = safeLang.replace(/[^a-zA-Z0-9-_]/g, "") || "text";
    const safeCode = escapeHtml(code.replace(/\n$/, ""));
    blocks[id] = `<div class="docs-code-block"><div class="docs-code-toolbar"><span class="docs-code-lang">${safeLang}</span><button type="button" class="docs-code-copy" data-code="${encodeURIComponent(code)}">Copy</button></div><pre><code class="language-${safeClass}">${safeCode}</code></pre></div>`;
    return id;
  });

  const html = withCodePlaceholders
    .split(/\n{2,}/)
    .map((block) => renderMarkdownBlock(block.trim()))
    .filter(Boolean)
    .join("");

  return Object.entries(blocks).reduce((acc, [id, markup]) => acc.split(id).join(markup), html);
}

function renderMarkdownBlock(block: string): string {
  if (!block) return "";
  if (block.startsWith("__CODE_BLOCK_")) return block;
  if (isMarkdownTable(block)) return renderMarkdownTable(block);
  if (/^>\s?/.test(block)) return renderMarkdownCallout(block);
  if (/^[-*]\s+.+/m.test(block) && block.split("\n").every((line) => /^[-*]\s+/.test(line.trim()))) {
    return `<ul>${block.split("\n").map((line) => `<li>${renderInlineMarkdown(line.replace(/^[-*]\s+/, ""))}</li>`).join("")}</ul>`;
  }
  if (/^###\s+/.test(block)) return `<h3>${renderInlineMarkdown(block.replace(/^###\s+/, ""))}</h3>`;
  if (/^##\s+/.test(block)) return `<h2>${renderInlineMarkdown(block.replace(/^##\s+/, ""))}</h2>`;
  if (/^#\s+/.test(block)) return `<h1>${renderInlineMarkdown(block.replace(/^#\s+/, ""))}</h1>`;
  return `<p>${renderInlineMarkdown(block).replace(/\n/g, "<br />")}</p>`;
}

function renderInlineMarkdown(text: string): string {
  return escapeHtml(text)
    .replace(/`([^`\n]+)`/g, "<code>$1</code>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>");
}

function isMarkdownTable(block: string): boolean {
  const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);
  if (lines.length < 2) return false;
  const separator = lines[1].replace(/\|/g, "").trim();
  return lines[0].startsWith("|") && /^[:\-\s]+$/.test(separator);
}

function renderMarkdownTable(block: string): string {
  const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);
  const headers = parseTableLine(lines[0]);
  const rows = lines.slice(2).map(parseTableLine);

  return `<div class="docs-table-card"><table><thead><tr>${headers.map((cell) => `<th>${renderInlineMarkdown(cell)}</th>`).join("")}</tr></thead><tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${renderInlineMarkdown(cell)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
}

function parseTableLine(line: string): string[] {
  return line.replace(/^\|/, "").replace(/\|$/, "").split("|").map((cell) => cell.trim());
}

function renderMarkdownCallout(block: string): string {
  const content = block.split("\n").map((line) => line.replace(/^>\s?/, "").trim()).join(" ");
  return `<div class="docs-callout"><p class="docs-callout-label">Catatan</p><p>${renderInlineMarkdown(content)}</p></div>`;
}

function extractSectionTitles(markdown: string): string[] {
  return Array.from(markdown.matchAll(/^##\s+(.+)$/gm), (match) => match[1].trim());
}

function extractIntroText(markdown: string): string {
  const blocks = markdown.replace(/\r\n/g, "\n").trim().split(/\n{2,}/);
  const firstParagraph = blocks.find((block) => {
    const trimmed = block.trim();
    return trimmed &&
      !trimmed.startsWith("#") &&
      !trimmed.startsWith("|") &&
      !trimmed.startsWith("```") &&
      !/^[-*]\s+/.test(trimmed) &&
      !trimmed.startsWith(">");
  });

  return firstParagraph ? stripMarkdown(firstParagraph).slice(0, 180) : "";
}

function stripMarkdown(text: string): string {
  return text
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/\[(.+?)\]\(.+?\)/g, "$1")
    .replace(/<[^>]+>/g, "")
    .trim();
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
