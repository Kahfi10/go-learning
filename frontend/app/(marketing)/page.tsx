"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight, Code2, Trophy, Users,
  CheckCircle, Play, ChevronRight,
  Terminal,
} from "lucide-react";
import NavbarPill from "@/components/navigation/variants/NavbarPill";
import { cn } from "@/lib/utils";
import { api, type ExecuteResult } from "@/lib/api";

import { useAuth } from "@/context/AuthContext";
import WhyGoSandbox from "@/components/marketing/WhyGoSandbox";
import CommunityClosingSection from "@/components/marketing/CommunityClosingSection";
import EcosystemOrbitSection from "@/components/marketing/EcosystemOrbitSection";
import EditorialFooter from "@/components/marketing/EditorialFooter";

/* â”€â”€â”€ Static Data â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const TOPICS = [
  { n: "01", title: "Getting Started",      color: "#0071E3", level: "Beginner",     lessons: 4  },
  { n: "02", title: "Variables & Types",    color: "#34C759", level: "Beginner",     lessons: 5  },
  { n: "03", title: "Functions",            color: "#FF9500", level: "Beginner",     lessons: 6  },
  { n: "04", title: "Control Structures",   color: "#FF3B30", level: "Beginner",     lessons: 5  },
  { n: "05", title: "Collections",          color: "#5AC8FA", level: "Beginner",     lessons: 6  },
  { n: "06", title: "Structs & Methods",    color: "#AF52DE", level: "Beginner",     lessons: 5  },
  { n: "07", title: "Interfaces",           color: "#64D2FF", level: "Beginner",     lessons: 5  },
  { n: "08", title: "Pointers",             color: "#30D158", level: "Intermediate", lessons: 4  },
  { n: "09", title: "Error Handling",       color: "#FF453A", level: "Intermediate", lessons: 5  },
  { n: "10", title: "Goroutines & Channels",color: "#0A84FF", level: "Intermediate", lessons: 6  },
  { n: "11", title: "Packages & Modules",   color: "#BF5AF2", level: "Intermediate", lessons: 4  },
  { n: "12", title: "File I/O & OS",        color: "#FFD60A", level: "Intermediate", lessons: 5  },
  { n: "13", title: "Testing in Go",        color: "#32D74B", level: "Advanced",     lessons: 5  },
  { n: "14", title: "HTTP & Web",           color: "#FF9F0A", level: "Advanced",     lessons: 6  },
  { n: "15", title: "Go Patterns",          color: "#FF2D55", level: "Advanced",     lessons: 5  },
];

const HOW_STEPS = [
  { n: "01", title: "Pilih topik",       desc: "15 topik terstruktur dari dasar hingga production patterns." },
  { n: "02", title: "Baca & pahami",     desc: "Konten bilingual (ID/EN) dengan penjelasan mendalam dan contoh nyata." },
  { n: "03", title: "Langsung coding",   desc: "Editor Monaco embedded â€” jalankan Go di browser tanpa install apapun." },
  { n: "04", title: "Uji pemahaman",     desc: "Quiz per lesson, kumpulkan XP, naik level, dan bersaing di leaderboard." },
];

const FEATURES = [
  {
    icon: Code2,
    color: "#0071E3",
    tag: "Interactive Editor",
    title: "Tulis dan jalankan Go langsung di browser.",
    desc: "Editor Monaco (mesin VS Code) dengan syntax highlighting Go, auto-complete, dan shortcut Ctrl+Enter untuk run. Output muncul instan tanpa install Go.",
    stats: [{ v: "5s", l: "Max timeout" }, { v: "50KB", l: "Max code" }, { v: "0ms", l: "Setup" }],
  },
  {
    icon: Trophy,
    color: "#FF9500",
    tag: "Gamifikasi",
    title: "Belajar sambil berkompetisi.",
    desc: "Tiap lesson selesai = +50 XP. Quiz sempurna = +25 XP bonus. 10 level dari Gopher Pemula hingga Go Legend. 15 badges eksklusif dan leaderboard mingguan.",
    stats: [{ v: "10", l: "Level" }, { v: "15", l: "Badges" }, { v: "50+", l: "XP/lesson" }],
  },
  {
    icon: Users,
    color: "#34C759",
    tag: "Komunitas",
    title: "Belajar bersama, bukan sendirian.",
    desc: "Kolom diskusi threaded di tiap lesson. Tanya, jawab, dan upvote pertanyaan yang paling membantu. Belajar dari kesulitan sesama Go learners.",
    stats: [{ v: "24/7", l: "Diskusi" }, { v: "Top", l: "Jawaban" }, { v: "Live", l: "Komunitas" }],
  },
];

const CODE_TABS = [
  {
    label: "Goroutine",
    code: `package main

import (
    "fmt"
    "sync"
)

func worker(id int, wg *sync.WaitGroup) {
    defer wg.Done()
    fmt.Printf("Worker %d âœ“\\n", id)
}

func main() {
    var wg sync.WaitGroup
    for i := 1; i <= 3; i++ {
        wg.Add(1)
        go worker(i, &wg)
    }
    wg.Wait()
}`,
    output: "Worker 1 âœ“\nWorker 3 âœ“\nWorker 2 âœ“",
  },
  {
    label: "Interface",
    code: `package main

import (
    "fmt"
    "math"
)

type Shape interface {
    Area() float64
}

type Circle struct{ R float64 }
type Rect   struct{ W, H float64 }

func (c Circle) Area() float64 {
    return math.Pi * c.R * c.R
}
func (r Rect) Area() float64 {
    return r.W * r.H
}

func main() {
    shapes := []Shape{
        Circle{R: 5},
        Rect{W: 4, H: 6},
    }
    for _, s := range shapes {
        fmt.Printf("%.2f\\n", s.Area())
    }
}`,
    output: "78.54\n24.00",
  },
  {
    label: "HTTP",
    code: `package main

import (
    "encoding/json"
    "net/http"
)

type Res struct {
    Msg    string \`json:"message"\`
    Status int    \`json:"status"\`
}

func handler(
    w http.ResponseWriter,
    r *http.Request,
) {
    w.Header().Set(
        "Content-Type",
        "application/json",
    )
    json.NewEncoder(w).Encode(
        Res{"Hello dari Go!", 200},
    )
}

func main() {
    http.HandleFunc("/", handler)
    http.ListenAndServe(":8080", nil)
}`,
    output: '{"message":"Hello dari Go!","status":200}',
  },
];

const FAQS = [
  { q: "Apakah GoLearn benar-benar gratis?",           a: "Ya, 100% gratis. Semua 76 lessons, quiz, editor, dan fitur komunitas dapat diakses tanpa biaya apapun." },
  { q: "Perlu install Go dulu?",                        a: "Tidak perlu. Editor Monaco di browser terhubung langsung ke sandbox executor kami. Tulis dan jalankan kode tanpa setup." },
  { q: "Konten tersedia dalam bahasa Indonesia?",       a: "Ya. Semua lesson tersedia bilingual â€” toggle antara Bahasa Indonesia dan English kapan saja di setiap lesson." },
  { q: "Cocok untuk pemula yang belum kenal Go?",       a: "Sangat cocok. Topik 1-7 dirancang khusus untuk pemula, mulai dari instalasi dan Hello World." },
  { q: "Berapa lama menyelesaikan seluruh kurikulum?",  a: "Sekitar 30â€“40 jam belajar total. Bisa diselesaikan dalam 2â€“4 minggu dengan belajar 1â€“2 jam per hari." },
];

/* â”€â”€â”€ Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    let ctx: any;
    let mounted = true;
    const init = async () => {
      const { gsap }        = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      if (!mounted) return;
      gsap.registerPlugin(ScrollTrigger);

      ctx = gsap.context(() => {

        /* Hero timeline â€” smoother, more premium */
        const heroTl = gsap.timeline({ delay: 0.04 });
        heroTl
          .fromTo(".hero-title-line", { y: 24, opacity: 0.001 }, { y: 0, opacity: 1, duration: 0.7, ease: "expo.out", stagger: 0.06 })
          .fromTo(".hero-sub", { y: 14, opacity: 0.001 }, { y: 0, opacity: 1, duration: 0.55, ease: "power3.out" }, "-=0.24")
          .fromTo(".hero-cta-row", { y: 10, opacity: 0.001 }, { y: 0, opacity: 1, duration: 0.45, ease: "power3.out" }, "-=0.18")
          .fromTo(".hero-trust > *", { y: 6, opacity: 0.001 }, { y: 0, opacity: 1, duration: 0.38, ease: "power2.out", stagger: 0.03 }, "-=0.16")
          .fromTo(".hero-stats-item", { y: 12, opacity: 0.001 }, { y: 0, opacity: 1, duration: 0.38, ease: "power2.out", stagger: 0.04 }, "-=0.1")
          .fromTo(".hero-code-window", { x: 18, y: 6, opacity: 0.001 }, { x: 0, y: 0, opacity: 1, duration: 0.75, ease: "expo.out" }, "-=0.42");

        /* Breathing float after entrance */
        gsap.to(".hero-code-window", {
          y: -12,
          duration: 5,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          delay: 1.3,
        });

        /* Stats count-up & Entrance */
        gsap.fromTo(".stat-col",
          { y: 40, opacity: 0 },
          {
            y: 0, opacity: 1, stagger: 0.1, duration: 0.8, ease: "expo.out",
            scrollTrigger: { trigger: "#stats-section", start: "top 85%", once: true }
          }
        );

        document.querySelectorAll<HTMLElement>(".stat-num").forEach((el) => {
          const target = parseInt(el.getAttribute("data-target") ?? "0");
          const obj = { val: 0 };
          ScrollTrigger.create({
            trigger: el, start: "top 85%", once: true,
            onEnter: () => gsap.to(obj, {
              val: target, duration: 1.8, ease: "power3.out",
              snap: { val: 1 },
              onUpdate() { el.textContent = Math.round(obj.val).toLocaleString(); },
            }),
          });
        });

        /* How-steps alternating */
        document.querySelectorAll<HTMLElement>(".how-step").forEach((el, i) => {
          gsap.fromTo(el,
            { x: i % 2 === 0 ? -40 : 40, opacity: 0 },
            {
              x: 0, opacity: 1, duration: 0.8, ease: "expo.out",
              scrollTrigger: { trigger: el, start: "top 85%", once: true },
            }
          );
        });

        /* Topics cards stagger reveal */
        gsap.fromTo(".topic-card",
          { y: 30, scale: 0.94, opacity: 0 },
          {
            y: 0, scale: 1, opacity: 1, stagger: 0.05, duration: 0.6, ease: "expo.out",
            scrollTrigger: { trigger: "#topics-track", start: "top 85%", once: true },
          }
        );

        /* Feature panels */
        document.querySelectorAll<HTMLElement>(".feature-panel").forEach((el) => {
          gsap.fromTo(el,
            { y: 32, scale: 0.98, opacity: 0 },
            {
              y: 0, scale: 1, opacity: 1, duration: 0.8, ease: "expo.out",
              scrollTrigger: { trigger: el, start: "top 85%", once: true },
            }
          );
        });

        /* FAQ items */
        gsap.fromTo(".faq-item",
          { y: 16, opacity: 0 },
          {
            y: 0, opacity: 1, stagger: 0.06, duration: 0.5, ease: "expo.out",
            scrollTrigger: { trigger: ".faq-list", start: "top 85%", once: true },
          }
        );

      }, containerRef);
    };

    init();
    return () => ctx?.revert();
  }, []);

    return (
    <div ref={containerRef} className="bg-background overflow-x-hidden pt-20">
      <NavbarPill />

      {/* ── Hero Section ── */}
      <section className="relative h-[calc(100vh-80px)] min-h-[620px] overflow-hidden px-6 sm:px-10">
        {/* layered background */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0"
            style={{ background: "radial-gradient(ellipse 900px 700px at 60% 45%, rgba(0,113,227,0.055) 0%, transparent 65%)" }}
          />
          <div className="absolute inset-0 dark:opacity-0"
            style={{
              backgroundImage: "linear-gradient(rgba(0,113,227,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(0,113,227,0.025) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
              WebkitMaskImage: "radial-gradient(ellipse 80% 80% at 55% 45%, black 20%, transparent 70%)",
              maskImage: "radial-gradient(ellipse 80% 80% at 55% 45%, black 20%, transparent 70%)",
            }}
          />
        </div>

        {/* Full-height grid — left text | right GIF */}
        <div className="relative z-10 h-full mx-auto w-full max-w-screen-xl">
          <div className="h-full grid lg:grid-cols-[1fr_1.5fr] gap-8 lg:gap-10">

            {/* ── Left column ── */}
            <div className="flex items-center py-12 lg:py-0 text-center lg:text-left">
              <div className="w-full">

                {/* Chapter label */}
                <p className="hero-title-line inline-flex items-center gap-3 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-[#86868B] mb-5">
                  <span className="text-[#0071E3] font-bold">01</span>
                  <span>Hero · Platform Go</span>
                  <span className="hidden lg:block w-10 h-px bg-[#D2D2D7]/60 dark:bg-white/10 shrink-0" />
                </p>

                {/* Oversized title */}
                <h1 className="font-display font-bold text-foreground"
                  style={{ fontSize: "clamp(52px, 6.5vw, 96px)", letterSpacing: "-0.055em", lineHeight: "0.88", marginBottom: "20px" }}>
                  <span className="hero-title-line block">KUASAI</span>
                  <span className="hero-title-line block text-[#0071E3]">GO.</span>
                </h1>

                {/* Italic tagline */}
                <p className="hero-sub italic text-[#6E6E73] leading-relaxed max-w-[460px] mx-auto lg:mx-0 mb-7"
                  style={{ fontSize: "clamp(16px, 1.5vw, 18px)" }}>
                  Bangun masa depan dengan bahasa yang paling banyak dicari developer dunia.
                </p>

                <HeroActions />

                {/* Stats row */}
                <div className="flex border-t border-[#D2D2D7]/50 dark:border-white/[0.07] pt-5 mt-5 max-w-[440px] mx-auto lg:mx-0">
                  {[
                    { n: "76+",  l: "Lessons" },
                    { n: "15",   l: "Topik"   },
                    { n: "300+", l: "Quiz"    },
                    { n: "10",   l: "Level"   },
                  ].map((s, i) => (
                    <div key={i} className="hero-stats-item flex-1 pr-4 border-r border-[#D2D2D7]/50 dark:border-white/[0.07] mr-4 last:border-r-0 last:pr-0 last:mr-0">
                      <p className="font-display font-bold text-foreground" style={{ fontSize: "clamp(18px, 1.8vw, 24px)", letterSpacing: "-0.04em", lineHeight: "1" }}>{s.n}</p>
                      <p className="text-[#86868B] text-[10px] uppercase tracking-[0.08em] font-semibold mt-1">{s.l}</p>
                    </div>
                  ))}
                </div>

              </div>
            </div>

            {/* ── Right column: GIF fills full section height ── */}
            <div className="hidden lg:block h-full py-8 pr-2">
              <HeroCodePreview />
            </div>

          </div>
        </div>
      </section>

      {/* ── Stats Section ── */}
      <section id="stats-section" className="py-16 sm:py-24 px-6 sm:px-10 border-y border-[#D2D2D7]/50 dark:border-white/[0.06]">
        <div className="mx-auto max-w-screen-xl grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { label: "Lessons Tersedia", num: 76, suffix: "+" },
            { label: "Topik Terstruktur", num: 15, suffix: "" },
            { label: "Quiz Questions",   num: 300, suffix: "+" },
            { label: "Level Gamifikasi", num: 10, suffix: "" },
          ].map((s) => (
            <div key={s.label} className="stat-col text-center">
              <p className="font-display font-bold text-foreground mb-1 leading-none"
                style={{ fontSize: "clamp(40px, 5vw, 64px)" }}>
                <span className="stat-num" data-target={s.num}>0</span>
                <span>{s.suffix}</span>
              </p>
              <p className="text-[#86868B] text-[14px]">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Topics Carousel ── */}
      <section className="py-20 sm:py-32 overflow-hidden">
        <div className="mx-auto max-w-screen-xl px-6 sm:px-10 mb-10 sm:mb-14">
          <p className="text-[#0071E3] text-[12px] font-semibold uppercase tracking-[0.2em] mb-3">Kurikulum</p>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <h2 className="font-display font-semibold tracking-tight text-foreground leading-tight"
              style={{ fontSize: "clamp(32px, 4.5vw, 56px)" }}>
              15 topik, dari Gopher<br className="hidden sm:block" /> Pemula ke Production.
            </h2>
            <Link href="/modules" className="shrink-0 flex items-center gap-1.5 text-[#0071E3] text-[14px] font-medium hover:underline">
              Lihat semua <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
        <DragScroll>
          <div id="topics-track" className="flex gap-4 px-6 sm:px-10 pb-4" style={{ width: "max-content" }}>
            {TOPICS.map((t, i) => <TopicCard key={t.n} topic={t} index={i} />)}
          </div>
        </DragScroll>
      </section>

      {/* ── Code Showcase ── */}
      <section className="py-20 sm:py-28 px-6 sm:px-10 bg-[#F5F5F7] dark:bg-[#0A0A0A]">
        <div className="mx-auto max-w-screen-xl">
          <div className="text-center mb-10 sm:mb-14">
            <p className="text-[#0071E3] text-[12px] font-semibold uppercase tracking-[0.2em] mb-3">Live Editor</p>
            <h2 className="font-display font-semibold tracking-tight text-foreground"
              style={{ fontSize: "clamp(30px, 4vw, 52px)" }}>
              Tulis Go, jalankan langsung di browser.
            </h2>
          </div>
          <div className="max-w-[720px] mx-auto">
            <CodeShowcase tabs={CODE_TABS} />
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-20 sm:py-32 px-6 sm:px-10">
        <div className="mx-auto max-w-screen-xl">
          <div className="text-center mb-14 sm:mb-20">
            <p className="text-[#0071E3] text-[12px] font-semibold uppercase tracking-[0.2em] mb-3">Cara Kerja</p>
            <h2 className="font-display font-semibold tracking-tight text-foreground"
              style={{ fontSize: "clamp(30px, 4vw, 52px)" }}>
              Empat langkah menuju Go mastery.
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-5 max-w-4xl mx-auto">
            {HOW_STEPS.map((step) => (
              <div key={step.n} className="how-step rounded-[24px] p-7 sm:p-8 bg-[#F5F5F7] dark:bg-[#111214] border border-[#D2D2D7]/60 dark:border-white/[0.07]">
                <p className="font-mono text-[11px] text-[#86868B] tracking-[0.2em] mb-4">{step.n}</p>
                <h3 className="font-display font-semibold text-[22px] sm:text-[26px] text-foreground mb-2">{step.title}</h3>
                <p className="text-[#86868B] text-[14px] leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-20 sm:py-32 px-6 sm:px-10 bg-[#F5F5F7] dark:bg-[#0A0A0A]">
        <div className="mx-auto max-w-screen-xl">
          <div className="text-center mb-10 sm:mb-14">
            <p className="text-[#0071E3] text-[12px] font-semibold uppercase tracking-[0.2em] mb-3">Fitur</p>
            <h2 className="font-display font-semibold tracking-tight text-foreground"
              style={{ fontSize: "clamp(30px, 4vw, 52px)" }}>
              Semua yang dibutuhkan untuk belajar Go.
            </h2>
          </div>
          <FeatureSection items={FEATURES} />
        </div>
      </section>

      {/* ── Why Go Sandbox ── */}
      <WhyGoSandbox />

      {/* ── FAQ ── */}
      <section className="py-20 sm:py-32 px-6 sm:px-10">
        <div className="mx-auto max-w-screen-xl">
          <div className="text-center mb-12 max-w-3xl mx-auto">
            <p className="text-[#0071E3] text-[12px] font-semibold uppercase tracking-[0.2em] mb-3">FAQ</p>
            <h2 className="font-display font-semibold tracking-tight text-foreground"
              style={{ fontSize: "clamp(30px, 4vw, 52px)" }}>
              Pertanyaan yang sering ditanyakan.
            </h2>
          </div>
          <div className="faq-list flex flex-col gap-3 max-w-3xl mx-auto">
            {FAQS.map((faq, i) => <FaqItem key={i} q={faq.q} a={faq.a} />)}
          </div>
        </div>
      </section>

      <CommunityClosingSection />
      <EcosystemOrbitSection />
      <EditorialFooter />
    </div>
  );
}

/* â”€â”€â”€ Sub-components â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function CodeShowcase({ tabs }: { tabs: typeof CODE_TABS }) {
  const [active, setActive] = useState(0);
  return (
    <div className="bg-[#1C1C1E] rounded-[18px] overflow-hidden ring-1 ring-white/10 shadow-2xl">
      {/* Tabs */}
      <div className="flex items-center gap-1 px-4 pt-3 border-b border-white/[0.06]">
        <div className="flex gap-1.5 mr-3 shrink-0">
          <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
          <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
          <div className="w-3 h-3 rounded-full bg-[#28C840]" />
        </div>
        {tabs.map((t, i) => (
          <button key={t.label} onClick={() => setActive(i)}
            className={`px-3.5 py-2 text-[12px] font-mono rounded-t-md transition-colors ${
              active === i
                ? "bg-[#2C2C2E] text-white"
                : "text-white/35 hover:text-white/60"
            }`}>
            {t.label}.go
          </button>
        ))}
      </div>
      {/* Code */}
      <pre className="px-5 py-4 text-[12.5px] font-mono text-[#E5E5EA] leading-[1.7] overflow-x-auto min-h-[240px]">
        {tabs[active].code}
      </pre>
      {/* Output */}
      <div className="border-t border-white/[0.06] px-5 py-2.5 flex items-center gap-3">
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="w-2 h-2 rounded-full bg-[#30D158]" />
          <span className="text-[#30D158] text-[11px] font-mono font-medium">Output</span>
        </div>
        <span className="text-white/40 text-[12px] font-mono truncate">{tabs[active].output}</span>
      </div>
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="faq-item bg-background dark:bg-[#1C1C1E] rounded-[14px] overflow-hidden border border-[#D2D2D7]/50 dark:border-white/[0.07]">
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-[#F5F5F7] dark:hover:bg-[#242424] transition-colors gap-4">
        <span className="font-medium text-[14px] text-foreground">{q}</span>
        <ChevronRight className={`w-4 h-4 text-[#86868B] shrink-0 transition-transform duration-300 ${open ? "rotate-90" : ""}`} />
      </button>
      {open && (
        <div className="px-5 pb-4 text-[#86868B] text-[14px] leading-relaxed border-t border-[#D2D2D7]/30 dark:border-white/5 pt-3">
          {a}
        </div>
      )}
    </div>
  );
}

/* â”€â”€ DragScroll â€” mouse drag to scroll horizontally â”€â”€ */
function DragScroll({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  function onMouseDown(e: React.MouseEvent) {
    if (!ref.current) return;
    isDragging.current = true;
    startX.current = e.pageX - ref.current.offsetLeft;
    scrollLeft.current = ref.current.scrollLeft;
    ref.current.style.cursor = "grabbing";
    ref.current.style.userSelect = "none";
  }

  function onMouseMove(e: React.MouseEvent) {
    if (!isDragging.current || !ref.current) return;
    e.preventDefault();
    const x = e.pageX - ref.current.offsetLeft;
    const walk = (x - startX.current) * 1.2;
    ref.current.scrollLeft = scrollLeft.current - walk;
  }

  function onEnd() {
    isDragging.current = false;
    if (ref.current) {
      ref.current.style.cursor = "grab";
      ref.current.style.removeProperty("user-select");
    }
  }

  return (
    <div
      ref={ref}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onEnd}
      onMouseLeave={onEnd}
      className="overflow-x-auto overflow-y-visible"
      style={{ scrollbarWidth: "none", msOverflowStyle: "none", cursor: "grab" }}>
      {children}
    </div>
  );
}


function TopicCard({
  topic: t,
  index: i,
}: {
  topic: typeof TOPICS[0];
  index: number;
}) {
  const cardRef = useRef<HTMLAnchorElement>(null);

  function onEnter(e: React.MouseEvent<HTMLAnchorElement>) {
    const card = cardRef.current;
    if (!card) return;
    import("gsap").then(({ gsap }) => {
      gsap.to(card, {
        y: -6,
        scale: 1.015,
        boxShadow: "0 20px 40px rgba(15,23,42,0.10)",
        duration: 0.28,
        ease: "power2.out",
      });
    });
  }

  function onLeave() {
    const card = cardRef.current;
    if (!card) return;
    import("gsap").then(({ gsap }) => {
      gsap.to(card, {
        y: 0,
        scale: 1,
        boxShadow: "0 12px 30px rgba(15,23,42,0.04)",
        duration: 0.4,
        ease: "expo.out",
      });
    });
  }

  const levelColor = t.level === "Beginner" ? "#34C759" : t.level === "Intermediate" ? "#0071E3" : "#FF453A";

  const levelBadge = (
    <span
      className="text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0"
      style={{ backgroundColor: levelColor + "20", color: levelColor }}>
      {t.level}
    </span>
  );

  return (
    <Link
      ref={cardRef}
      href={`/modules/${slugFromTitle(t.title)}`}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      className="topic-card w-[220px] sm:w-[248px] h-[204px] rounded-[22px] p-6 shrink-0 block relative overflow-hidden cursor-pointer bg-white dark:bg-[#111214] shadow-[0_12px_30px_rgba(15,23,42,0.04)]"
      style={{
        border: "1px solid rgba(210,210,215,0.55)",
      }}>
      <div className="relative z-10 flex flex-col h-full justify-between">
        <div className="flex items-start justify-between gap-3">
          <span className="text-[11px] font-semibold text-[#86868B] tracking-[0.16em] uppercase">{t.n}</span>
          {levelBadge}
        </div>
        <div>
          <p className="font-display font-semibold text-[22px] tracking-[-0.03em] text-foreground leading-tight mb-2 text-balance">
            {t.title}
          </p>
          <p className="text-[#86868B] text-[13px] leading-relaxed">{t.lessons} lessons</p>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[12px] text-[#86868B]">Start topic</span>
          <ArrowRight className="w-4 h-4 text-[#0071E3]" />
        </div>
      </div>
    </Link>
  );
}

function FeatureSection({
  items,
}: {
  items: typeof FEATURES;
}) {
  return (
    <div className="grid md:grid-cols-2 gap-4 overflow-visible">
      <div className="feature-panel md:col-span-2 rounded-[24px] p-8 sm:p-10 bg-[#F5F5F7] dark:bg-[#1C1C1E] border border-[#D2D2D7]/60 dark:border-white/8 overflow-visible">
        <FeatureBentoCard item={items[0]} large />
      </div>
      <div className="feature-panel rounded-[24px] p-8 bg-background border border-[#D2D2D7]/60 dark:border-white/8 overflow-visible">
        <FeatureBentoCard item={items[1]} />
      </div>
      <div className="feature-panel rounded-[24px] p-8 bg-background border border-[#D2D2D7]/60 dark:border-white/8 overflow-visible">
        <FeatureBentoCard item={items[2]} />
      </div>
    </div>
  );
}

function FeatureBentoCard({ item, large = false }: { item: typeof FEATURES[number]; large?: boolean }) {
  return (
    <div className="relative flex flex-col gap-6 h-full justify-between overflow-visible">
      <div
        className="pointer-events-none absolute right-0 top-0 h-32 w-32 rounded-full blur-3xl"
        style={{ backgroundColor: `${item.color}10` }}
      />
      <div className="flex items-center gap-2.5">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: item.color + "18" }}>
          <item.icon className="w-5 h-5" style={{ color: item.color }} />
        </div>
        <span className="text-[12px] font-semibold uppercase tracking-widest" style={{ color: item.color }}>{item.tag}</span>
      </div>
      <div className="relative z-10">
        <h3 className={cn("font-display font-semibold tracking-tight text-foreground mb-3 leading-snug", large ? "text-[34px] sm:text-[40px]" : "text-[26px]")}>{item.title}</h3>
        <p className="text-[#86868B] text-[15px] leading-relaxed max-w-2xl text-justify">{item.desc}</p>
      </div>
      <div className="relative z-10 grid grid-cols-3 gap-3 max-w-md">
        {item.stats.map((s) => (
          <div key={s.l} className="rounded-[14px] bg-white dark:bg-[#2C2C2E] px-4 py-3 border border-[#D2D2D7]/50 dark:border-white/8">
            <p className="font-display font-semibold text-[24px] text-foreground">{s.v}</p>
            <p className="text-[#86868B] text-[11px] mt-0.5">{s.l}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function HeroActions() {
  const { state } = useAuth();
  return (
    <>
      <div className="hero-cta-row flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 mb-7 w-full max-w-[420px] mx-auto lg:mx-0">
        <Link href={state.user ? "/modules" : "/register"}
          className="hero-cta-btn group w-full sm:w-auto flex items-center justify-center gap-2 h-[46px] bg-[#0071E3] text-white text-[15px] font-medium px-7 rounded-full border border-transparent hover:bg-[#0077ED] transition-all shadow-sm hover:shadow-md shadow-[#0071E3]/20 whitespace-nowrap">
          {state.user ? "Lanjut Belajar" : "Mulai Belajar Gratis"}
          <ArrowRight className="w-4 h-4 shrink-0 group-hover:translate-x-1 transition-transform" />
        </Link>
        <Link href="/playground"
          className="hero-cta-btn w-full sm:w-auto flex items-center justify-center gap-2 h-[46px] text-foreground text-[15px] font-medium px-7 rounded-full border border-[#D2D2D7] dark:border-white/15 hover:bg-[#F5F5F7] dark:hover:bg-[#1C1C1E] transition-colors whitespace-nowrap">
          <Play className="w-4 h-4 shrink-0 text-[#0071E3]" /> Coba Playground
        </Link>
      </div>
      <div className="hero-trust flex flex-wrap justify-center lg:justify-start gap-x-5 gap-y-2 text-[13px] text-[#86868B]">
        {["Gratis selamanya", "Tanpa install", "Bilingual ID/EN"].map((t) => (
          <span key={t} className="flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-[#34C759] shrink-0" />{t}
          </span>
        ))}
      </div>
    </>
  );
}

function HeroCodePreview() {
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    let ctx: any;
    let mounted = true;
    import("gsap").then(({ gsap }) => {
      if (!mounted) return;
      ctx = gsap.context(() => {
        // Timeline for initial entrance
        const tl = gsap.timeline({ delay: 1.2 });
        
        // Element 1: Main GIF Frame
        tl.fromTo(".parallax-main", {
          y: 40,
          opacity: 0.001,
          scale: 0.95
        }, {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 1,
          ease: "expo.out"
        });

        // Element 2: Small badge (Top Right)
        tl.fromTo(".parallax-badge-1", {
          y: 20,
          x: -10,
          opacity: 0.001,
          scale: 0.5
        }, {
          y: 0,
          x: 0,
          opacity: 1,
          scale: 1,
          duration: 0.8,
          ease: "back.out(1.7)"
        }, "-=0.6");

        // Element 3: Small badge (Bottom Left)
        tl.fromTo(".parallax-badge-2", {
          y: -20,
          x: 10,
          opacity: 0.001,
          scale: 0.5
        }, {
          y: 0,
          x: 0,
          opacity: 1,
          scale: 1,
          duration: 0.8,
          ease: "back.out(1.7)"
        }, "-=0.6");

        // Continuous floating animation (different speeds for depth)
        gsap.to(".parallax-main", {
          y: -10,
          duration: 4,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        });

        gsap.to(".parallax-badge-1", {
          y: -15,
          duration: 3.5,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          delay: 0.2
        });

        gsap.to(".parallax-badge-2", {
          y: 12,
          duration: 4.5,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          delay: 0.5
        });

      }, containerRef);
    });
    return () => {
      mounted = false;
      ctx?.revert();
    };
  }, []);

  return (
    <div ref={containerRef} className="hero-code-window relative w-full h-full perspective-[1200px]">

      {/* Main Frame — fills full column height */}
      <div className="parallax-main relative z-10 bg-white dark:bg-[#1C1C1E] p-2.5 rounded-[24px] shadow-2xl ring-1 ring-[#D2D2D7]/50 dark:ring-white/10 h-full">
        <div className="bg-[#F5F5F7] dark:bg-[#0A0A0A] rounded-[18px] overflow-hidden h-full">
          <img
            src="/hero-gif.gif"
            alt="GoLearn Platform"
            className="w-full h-full object-cover object-top block"
          />
        </div>
      </div>

      {/* Floating Badge 1 — top right, inside frame */}
      <div className="parallax-badge-1 absolute top-5 right-5 z-20 bg-white/90 dark:bg-[#2C2C2E]/90 backdrop-blur-md px-4 py-3 rounded-2xl shadow-xl ring-1 ring-[#D2D2D7]/60 dark:ring-white/10 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-[#34C759]/15 flex items-center justify-center">
          <Trophy className="w-4 h-4 text-[#30D158]" />
        </div>
        <div>
          <p className="text-[10px] font-semibold text-[#86868B] uppercase tracking-wider mb-0.5">Lesson Selesai</p>
          <p className="text-[14px] font-display font-semibold text-foreground leading-[1.1]">+50 XP</p>
        </div>
      </div>

      {/* Floating Badge 2 — bottom left, inside frame */}
      <div className="parallax-badge-2 absolute bottom-10 left-5 z-20 bg-white/90 dark:bg-[#2C2C2E]/90 backdrop-blur-md px-4 py-3 rounded-2xl shadow-xl ring-1 ring-[#D2D2D7]/60 dark:ring-white/10 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-[#0071E3]/15 flex items-center justify-center">
          <Terminal className="w-4 h-4 text-[#0071E3]" />
        </div>
        <div>
          <p className="text-[10px] font-semibold text-[#86868B] uppercase tracking-wider mb-0.5">Executor</p>
          <p className="text-[13px] font-mono font-medium text-foreground leading-none">0.002s</p>
        </div>
      </div>

    </div>
  );
}

function slugFromTitle(title: string): string {
  const map: Record<string, string> = {
    "Getting Started": "getting-started", "Variables & Types": "variables-types",
    "Functions": "functions", "Control Structures": "control-structures",
    "Collections": "collections", "Structs & Methods": "structs-methods",
    "Interfaces": "interfaces", "Pointers": "pointers",
    "Error Handling": "error-handling", "Goroutines & Channels": "goroutines-channels",
    "Packages & Modules": "packages-modules", "File I/O & OS": "file-io",
    "Testing in Go": "testing", "HTTP & Web": "http-web", "Go Patterns": "go-patterns",
  };
  return map[title] ?? title.toLowerCase().replace(/\s+/g, "-");
}













