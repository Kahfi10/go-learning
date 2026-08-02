"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
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
  const { state } = useAuth();
  const [data, setData] = useState<Lesson | null>(null);
  const [topicData, setTopicData] = useState<TopicDetail | null>(null);
  const [lang, setLang] = useState<"id" | "en">("id");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"content" | "discussion">("content");
  const [xpGained, setXpGained] = useState(0);
  const { isCompleted, markComplete, saveCode, getLastCode, topicProgress } = useProgress();

  useEffect(() => {
    api.topics.getLesson(topic, lesson).then(setData).catch(() => {});
    api.topics.get(topic).then(setTopicData).catch(() => {});
    const saved = localStorage.getItem("golearn_lang");
    if (saved === "id" || saved === "en") setLang(saved as "id" | "en");
  }, [topic, lesson]);

  function toggleLang() {
    const next = lang === "id" ? "en" : "id";
    setLang(next);
    localStorage.setItem("golearn_lang", next);
  }

  async function handleComplete() {
    const code = getLastCode(topic, lesson);
    await markComplete(topic, lesson, code);
    setXpGained(50);
    toast.success("Lesson selesai! +50 XP 🎉", { duration: 3000 });
    // GSAP celebrate
    import("gsap").then(({ gsap }) => {
      gsap.from(".complete-btn", { scale: 1.2, duration: 0.4, ease: "elastic.out(1,0.5)" });
      gsap.from(".xp-badge", { scale: 0, opacity: 0, duration: 0.5, ease: "back.out(2)", delay: 0.1 });
    });
  }

  async function handleQuizComplete(score: number, total: number) {
    if (state.user) {
      await api.progress.submitQuiz(lesson, { score, topic_slug: topic }).catch(() => {});
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
            <Button size="sm" onClick={handleComplete} className="complete-btn text-[11px] px-3 py-1">
              Tandai Selesai
            </Button>
          )}
        </div>
      </div>

      {/* ── Main layout ─────────────────────────────── */}
      <div className="flex flex-1 pt-[92px]">
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
              {lessons.map((l, i) => {
                const lDone = isCompleted(topic, l.id);
                const isCurrent = l.id === lesson;
                return (
                  <Link key={l.id} href={`/modules/${topic}/${l.id}`}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-2.5 px-4 py-2.5 text-[13px] transition-colors group",
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
          <div className="hidden lg:flex h-[calc(100vh-92px)]">
            <PanelGroup direction="horizontal">
              <Panel defaultSize={55} minSize={35} className="overflow-y-auto">
                <div className="max-w-2xl mx-auto px-6 py-8">
                  <LessonContent
                    data={data} lang={lang} title={title} content={content}
                    topic={topic} lesson={lesson}
                    activeTab={activeTab} onTabChange={setActiveTab}
                    onComplete={handleComplete} done={done}
                    onQuizComplete={handleQuizComplete}
                  />
                  <LessonNav prev={prevLesson} next={nextLesson} topic={topic} lang={lang} />
                </div>
              </Panel>
              <PanelResizeHandle className="w-[3px] bg-[#D2D2D7]/30 hover:bg-[#0071E3]/40 transition-colors cursor-col-resize mx-0.5" />
              <Panel defaultSize={45} minSize={30} className="overflow-y-auto bg-[#F5F5F7]/50 dark:bg-[#0A0A0A]">
                <div className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[11px] font-semibold text-[#86868B] uppercase tracking-widest">Editor Go</p>
                    <div className="flex items-center gap-1 text-[11px] text-[#86868B]">
                      <Clock className="w-3 h-3" /> {data.estimatedMinutes} mnt
                    </div>
                  </div>
                  <CodeEditor
                    defaultCode={getLastCode(topic, lesson) ?? data.starterCode}
                    onCodeChange={(c) => saveCode(topic, lesson, c)}
                    height="calc(100vh - 180px)"
                  />
                </div>
              </Panel>
            </PanelGroup>
          </div>

          {/* Mobile: stacked */}
          <div className="lg:hidden px-4 py-6 space-y-6">
            <LessonContent
              data={data} lang={lang} title={title} content={content}
              topic={topic} lesson={lesson}
              activeTab={activeTab} onTabChange={setActiveTab}
              onComplete={handleComplete} done={done}
              onQuizComplete={handleQuizComplete}
            />
            <div>
              <p className="text-[11px] font-semibold text-[#86868B] uppercase tracking-widest mb-3">Editor Go</p>
              <CodeEditor
                defaultCode={getLastCode(topic, lesson) ?? data.starterCode}
                onCodeChange={(c) => saveCode(topic, lesson, c)}
                height="320px"
              />
            </div>
            <LessonNav prev={prevLesson} next={nextLesson} topic={topic} lang={lang} />
          </div>
        </main>
      </div>
    </div>
  );
}

/* ── Lesson Content ──────────────────────────────── */
function LessonContent({ data, lang, title, content, topic, lesson, activeTab, onTabChange, onComplete, done, onQuizComplete }: any) {
  return (
    <div>
      {/* Meta */}
      <div className="flex items-center gap-2.5 mb-4">
        <div className="flex items-center gap-1 text-[#86868B] text-[12px]">
          <Clock className="w-3.5 h-3.5" /> {data.estimatedMinutes} mnt
        </div>
        {done && (
          <div className="flex items-center gap-1 text-[12px] text-[#34C759]">
            <CheckCircle2 className="w-3.5 h-3.5" /> Selesai
          </div>
        )}
      </div>

      <h1 className="font-display font-semibold text-[28px] sm:text-[32px] tracking-tight text-foreground mb-6 leading-tight">
        {title}
      </h1>

      {/* Tabs: Materi | Diskusi */}
      <div className="flex items-center gap-1 mb-6 border-b border-[#D2D2D7]/40">
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
          <div className="prose-golearn" dangerouslySetInnerHTML={{ __html: mdToHtml(content) }} />

          {/* Quiz */}
          {data.quiz?.length > 0 && (
            <div className="mt-10">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-5 bg-[#0071E3] rounded-full" />
                <p className="font-semibold text-[15px] text-foreground">
                  {lang === "id" ? "Uji Pemahaman" : "Knowledge Check"}
                </p>
                <span className="text-[#86868B] text-[13px]">· {data.quiz.length} soal</span>
              </div>
              <Quiz questions={data.quiz} lang={lang} topicSlug={topic} lessonId={lesson} onComplete={onQuizComplete} />
            </div>
          )}

          {/* Mark complete CTA (bottom) */}
          {!done && (
            <div className="mt-10 p-5 bg-[#F5F5F7] dark:bg-[#1C1C1E] rounded-[16px] flex items-center justify-between gap-4">
              <div>
                <p className="font-medium text-[14px] text-foreground">Sudah paham materi ini?</p>
                <p className="text-[#86868B] text-[12px] mt-0.5">Tandai selesai dan dapatkan +50 XP</p>
              </div>
              <Button onClick={onComplete} className="shrink-0">
                Selesai +50 XP
              </Button>
            </div>
          )}
        </>
      ) : (
        <CommentThread topicSlug={topic} lessonId={lesson} lang={lang} />
      )}
    </div>
  );
}

/* ── Lesson Navigation ───────────────────────────── */
function LessonNav({ prev, next, topic, lang }: any) {
  return (
    <div className="flex items-center justify-between pt-8 mt-8 border-t border-[#D2D2D7]/40">
      {prev ? (
        <Link href={`/modules/${topic}/${prev.id}`}
          className="flex items-center gap-2 text-[#86868B] hover:text-foreground text-[13px] transition-colors group">
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <div>
            <p className="text-[10px] uppercase tracking-wide text-[#86868B]">Sebelumnya</p>
            <p className="font-medium text-foreground">{lang === "id" ? prev.title_id : prev.title_en}</p>
          </div>
        </Link>
      ) : <div />}
      {next ? (
        <Link href={`/modules/${topic}/${next.id}`}
          className="flex items-center gap-2 text-[#0071E3] text-[13px] font-medium hover:text-[#0077ED] transition-colors group">
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wide text-[#86868B]">Berikutnya</p>
            <p>{lang === "id" ? next.title_id : next.title_en}</p>
          </div>
          <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      ) : (
        <Link href={`/modules/${topic}`}
          className="flex items-center gap-2 text-[#34C759] text-[13px] font-medium">
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
  return md
    .replace(/```go\n([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
    .replace(/```\n?([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
    .replace(/`([^`\n]+)`/g, '<code>$1</code>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^\|(.+)\|$/gm, (row) => {
      const cells = row.split('|').filter(Boolean);
      if (cells.every(c => /^[-:]+$/.test(c.trim()))) return '';
      return '<tr>' + cells.map(c => `<td>${c.trim()}</td>`).join('') + '</tr>';
    })
    .replace(/(<tr>[\s\S]+?<\/tr>)/g, (match) => `<table>${match}</table>`)
    .replace(/^[-*] (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>[\s\S]+?<\/li>)/g, '<ul>$1</ul>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^([^<\n].+)$/gm, (line) => line.trim() && !line.startsWith('<') ? `<p>${line}</p>` : line);
}
