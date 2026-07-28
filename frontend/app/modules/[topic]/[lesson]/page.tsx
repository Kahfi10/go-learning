"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronLeft, ChevronRight, CheckCircle2, Clock, Languages, Menu, X } from "lucide-react";
import Navbar from "@/components/navigation/Navbar";
import CodeEditor from "@/components/editor/CodeEditor";
import Quiz from "@/components/lesson/Quiz";
import { api, type Lesson, type TopicDetail } from "@/lib/api";
import { useProgress } from "@/hooks/useProgress";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels";

export default function LessonPage() {
  const { topic, lesson } = useParams<{ topic: string; lesson: string }>();
  const [data, setData] = useState<Lesson | null>(null);
  const [topicData, setTopicData] = useState<TopicDetail | null>(null);
  const [lang, setLang] = useState<"id" | "en">("id");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [quizDone, setQuizDone] = useState(false);
  const { isCompleted, markComplete, saveCode, getLastCode } = useProgress();

  useEffect(() => {
    api.topics.getLesson(topic, lesson).then(setData).catch(() => {});
    api.topics.get(topic).then(setTopicData).catch(() => {});
  }, [topic, lesson]);

  useEffect(() => {
    const saved = localStorage.getItem("golearn_lang");
    if (saved === "id" || saved === "en") setLang(saved);
  }, []);

  function toggleLang() {
    const next = lang === "id" ? "en" : "id";
    setLang(next);
    localStorage.setItem("golearn_lang", next);
  }

  async function handleComplete() {
    const code = getLastCode(topic, lesson);
    await markComplete(topic, lesson, code);
    toast.success("Lesson selesai! +50 XP 🎉");
    import("gsap").then(({ gsap }) => {
      gsap.from(".complete-btn", { scale: 1.15, duration: 0.4, ease: "elastic.out(1,0.5)" });
    });
  }

  async function handleQuizComplete(score: number) {
    setQuizDone(true);
    await api.progress.submitQuiz(lesson, { score, topic_slug: topic }).catch(() => {});
    if (score === data?.quiz.length) toast.success(`Quiz sempurna! +25 XP bonus 🏆`);
  }

  const lessons = topicData?.lessons ?? [];
  const currentIdx = lessons.findIndex(l => l.id === lesson);
  const prevLesson = lessons[currentIdx - 1];
  const nextLesson = lessons[currentIdx + 1];
  const done = isCompleted(topic, lesson);

  if (!data) return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-32 text-center text-[#86868B]">Memuat lesson...</div>
    </div>
  );

  const content = lang === "id" ? data.content_id : data.content_en;
  const title = lang === "id" ? data.title_id : data.title_en;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      {/* Sub-navbar */}
      <div className="fixed top-[52px] left-0 right-0 z-40 bg-background border-b border-[#D2D2D7]/50 px-4 py-2 flex items-center gap-3">
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1.5 rounded-md hover:bg-[#F5F5F7] transition-colors text-[#86868B]">
          {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 text-[12px] text-[#86868B] truncate">
            <Link href="/modules" className="hover:text-foreground">Kursus</Link>
            <ChevronRight className="w-3 h-3 flex-shrink-0" />
            <Link href={`/modules/${topic}`} className="hover:text-foreground truncate">{topicData?.title_id}</Link>
            <ChevronRight className="w-3 h-3 flex-shrink-0" />
            <span className="truncate text-foreground font-medium">{title}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button onClick={toggleLang}
            className="flex items-center gap-1.5 text-[12px] text-[#86868B] hover:text-foreground border border-[#D2D2D7] px-2.5 py-1 rounded-full transition-colors">
            <Languages className="w-3.5 h-3.5" /> {lang === "id" ? "ID" : "EN"}
          </button>
          {done ? (
            <div className="flex items-center gap-1.5 text-[12px] text-[#34C759] px-3 py-1 rounded-full bg-[#34C759]/10">
              <CheckCircle2 className="w-3.5 h-3.5" /> Selesai
            </div>
          ) : (
            <button onClick={handleComplete}
              className="complete-btn text-[12px] font-medium bg-[#0071E3] text-white px-3 py-1 rounded-full hover:bg-[#0077ED] transition-colors">
              Tandai Selesai
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-1 pt-[92px]">
        {/* Sidebar */}
        {sidebarOpen && (
          <aside className="fixed left-0 top-[92px] bottom-0 w-64 bg-background border-r border-[#D2D2D7]/50 z-30 overflow-y-auto p-4">
            <p className="text-[11px] font-semibold text-[#86868B] uppercase tracking-widest mb-3">Lessons</p>
            {lessons.map((l, i) => {
              const lDone = isCompleted(topic, l.id);
              return (
                <Link key={l.id} href={`/modules/${topic}/${l.id}`}
                  className={cn(
                    "flex items-center gap-2.5 px-3 py-2 rounded-[10px] mb-1 text-[13px] transition-colors",
                    l.id === lesson ? "bg-[#0071E3]/10 text-[#0071E3] font-medium" :
                    lDone ? "text-[#86868B]" : "text-foreground hover:bg-[#F5F5F7] dark:hover:bg-[#1C1C1E]"
                  )}>
                  <div className={cn("w-4 h-4 rounded-full flex items-center justify-center text-[10px] flex-shrink-0",
                    lDone ? "bg-[#34C759]/20 text-[#34C759]" : "bg-[#F5F5F7] dark:bg-[#2C2C2E] text-[#86868B]")}>
                    {lDone ? "✓" : i + 1}
                  </div>
                  <span className="truncate">{lang === "id" ? l.title_id : l.title_en}</span>
                </Link>
              );
            })}
          </aside>
        )}

        {/* Main content */}
        <main className={cn("flex-1 overflow-hidden transition-all", sidebarOpen ? "ml-64" : "ml-0")}>
          {/* Desktop: resizable panels */}
          <div className="hidden lg:block h-full">
            <PanelGroup direction="horizontal">
              <Panel defaultSize={55} minSize={35}>
                <div className="h-full overflow-y-auto px-8 py-8">
                  <LessonContent data={data} lang={lang} title={title} content={content}
                    onComplete={handleComplete} done={done} quizDone={quizDone}
                    onQuizComplete={handleQuizComplete} topic={topic} lesson={lesson} />
                  <LessonNavigation prev={prevLesson} next={nextLesson} topic={topic} lang={lang} />
                </div>
              </Panel>
              <PanelResizeHandle className="w-1.5 bg-[#D2D2D7]/30 hover:bg-[#0071E3]/30 transition-colors cursor-col-resize" />
              <Panel defaultSize={45} minSize={30}>
                <div className="h-full overflow-y-auto px-4 py-6">
                  <p className="text-[12px] font-semibold text-[#86868B] uppercase tracking-widest mb-3">Editor</p>
                  <CodeEditor
                    defaultCode={getLastCode(topic, lesson) ?? data.starterCode}
                    onCodeChange={(c) => saveCode(topic, lesson, c)}
                    height="calc(100vh - 200px)"
                  />
                </div>
              </Panel>
            </PanelGroup>
          </div>

          {/* Mobile: stacked */}
          <div className="lg:hidden px-5 py-6 space-y-8">
            <LessonContent data={data} lang={lang} title={title} content={content}
              onComplete={handleComplete} done={done} quizDone={quizDone}
              onQuizComplete={handleQuizComplete} topic={topic} lesson={lesson} />
            <div>
              <p className="text-[12px] font-semibold text-[#86868B] uppercase tracking-widest mb-3">Editor</p>
              <CodeEditor
                defaultCode={getLastCode(topic, lesson) ?? data.starterCode}
                onCodeChange={(c) => saveCode(topic, lesson, c)}
                height="300px"
              />
            </div>
            <LessonNavigation prev={prevLesson} next={nextLesson} topic={topic} lang={lang} />
          </div>
        </main>
      </div>
    </div>
  );
}

function LessonContent({ data, lang, title, content, onComplete, done, quizDone, onQuizComplete, topic, lesson }: any) {
  return (
    <div>
      <div className="flex items-center gap-2 text-[#86868B] text-[13px] mb-4">
        <Clock className="w-3.5 h-3.5" /> {data.estimatedMinutes} menit
      </div>
      <h1 className="font-display font-semibold text-[30px] tracking-tight text-foreground mb-6">{title}</h1>
      <div className="prose-golearn" dangerouslySetInnerHTML={{ __html: markdownToHtml(content) }} />
      {data.quiz?.length > 0 && (
        <div className="mt-10">
          <p className="text-[12px] font-semibold text-[#86868B] uppercase tracking-widest mb-4">Quiz</p>
          <Quiz questions={data.quiz} lang={lang} topicSlug={topic} lessonId={lesson} onComplete={onQuizComplete} />
        </div>
      )}
    </div>
  );
}

function LessonNavigation({ prev, next, topic, lang }: any) {
  return (
    <div className="flex items-center justify-between pt-8 mt-8 border-t border-[#D2D2D7]/50">
      {prev ? (
        <Link href={`/modules/${topic}/${prev.id}`}
          className="flex items-center gap-2 text-[#86868B] hover:text-foreground text-[14px] transition-colors">
          <ChevronLeft className="w-4 h-4" />
          <div>
            <p className="text-[11px] uppercase tracking-wide">Sebelumnya</p>
            <p className="font-medium">{lang === "id" ? prev.title_id : prev.title_en}</p>
          </div>
        </Link>
      ) : <div />}
      {next ? (
        <Link href={`/modules/${topic}/${next.id}`}
          className="flex items-center gap-2 text-[#0071E3] text-[14px] font-medium hover:text-[#0077ED] transition-colors">
          <div className="text-right">
            <p className="text-[11px] uppercase tracking-wide text-[#86868B]">Berikutnya</p>
            <p>{lang === "id" ? next.title_id : next.title_en}</p>
          </div>
          <ChevronRight className="w-4 h-4" />
        </Link>
      ) : <div />}
    </div>
  );
}

// Minimal markdown parser
function markdownToHtml(md: string): string {
  return md
    .replace(/```go\n([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
    .replace(/```\n?([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^\|(.+)\|$/gm, (row) => {
      const cells = row.split('|').filter(Boolean);
      return '<tr>' + cells.map(c => `<td>${c.trim()}</td>`).join('') + '</tr>';
    })
    .replace(/(<tr>[\s\S]*?<\/tr>)/g, '<table>$1</table>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>[\s\S]*?<\/li>)/g, '<ul>$1</ul>')
    .replace(/^(?!<[a-z])([\s\S]+?)(?=\n\n|$)/gm, (p) => p.trim() ? `<p>${p}</p>` : '')
    .replace(/\n{3,}/g, '\n\n');
}
