"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight, Code2, BookOpen, Trophy, Users,
  Zap, CheckCircle, Play, ChevronRight,
  Terminal, Cpu, Globe,
} from "lucide-react";
import Navbar from "@/components/navigation/Navbar";
import { cn } from "@/lib/utils";
import { api, type ExecuteResult } from "@/lib/api";

/* ─── Static Data ───────────────────────────────────────── */
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

const WHY_GO = [
  { icon: Zap,      stat: "10x",   label: "Lebih cepat dari Python",   sub: "Compiled, statically typed",          color: "#0071E3" },
  { icon: Cpu,      stat: "1M+",   label: "Goroutines sekaligus",       sub: "Concurrency built-in",                color: "#34C759" },
  { icon: Terminal, stat: "<10s",  label: "Build time proyek besar",    sub: "Compiler tercepat di kelasnya",       color: "#FF9500" },
  { icon: Globe,    stat: "Top 5", label: "Bahasa paling dicari",       sub: "Docker, K8s, Cloudflare pakai Go",   color: "#AF52DE" },
];

const HOW_STEPS = [
  { n: "01", title: "Pilih topik",       desc: "15 topik terstruktur dari dasar hingga production patterns." },
  { n: "02", title: "Baca & pahami",     desc: "Konten bilingual (ID/EN) dengan penjelasan mendalam dan contoh nyata." },
  { n: "03", title: "Langsung coding",   desc: "Editor Monaco embedded — jalankan Go di browser tanpa install apapun." },
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
    fmt.Printf("Worker %d ✓\\n", id)
}

func main() {
    var wg sync.WaitGroup
    for i := 1; i <= 3; i++ {
        wg.Add(1)
        go worker(i, &wg)
    }
    wg.Wait()
}`,
    output: "Worker 1 ✓\nWorker 3 ✓\nWorker 2 ✓",
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
  { q: "Konten tersedia dalam bahasa Indonesia?",       a: "Ya. Semua lesson tersedia bilingual — toggle antara Bahasa Indonesia dan English kapan saja di setiap lesson." },
  { q: "Cocok untuk pemula yang belum kenal Go?",       a: "Sangat cocok. Topik 1-7 dirancang khusus untuk pemula, mulai dari instalasi dan Hello World." },
  { q: "Berapa lama menyelesaikan seluruh kurikulum?",  a: "Sekitar 30–40 jam belajar total. Bisa diselesaikan dalam 2–4 minggu dengan belajar 1–2 jam per hari." },
];

/* ─── Page ──────────────────────────────────────────────── */
export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    let ctx: any;
    const init = async () => {
      const { gsap }        = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      ctx = gsap.context(() => {

        /* Hero timeline — smoother, more premium */
        const heroTl = gsap.timeline({ delay: 0.04 });
        heroTl
          .from(".hero-badge", { y: 14, duration: 0.5, ease: "power3.out" })
          .from(".hero-title-line", { y: 24, duration: 0.7, ease: "expo.out", stagger: 0.06 }, "-=0.16")
          .from(".hero-sub", { y: 14, duration: 0.55, ease: "power3.out" }, "-=0.24")
          .from(".hero-cta-row > *", { y: 10, duration: 0.45, ease: "power3.out", stagger: 0.05 }, "-=0.18")
          .from(".hero-trust > *", { y: 6, duration: 0.38, ease: "power2.out", stagger: 0.03 }, "-=0.16")
          .from(".hero-code-window", { x: 18, y: 6, duration: 0.75, ease: "expo.out" }, "-=0.42");

        /* Breathing float after entrance */
        gsap.to(".hero-code-window", {
          y: -10,
          duration: 4.8,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          delay: 1.3,
        });

        /* Subtle shimmer on run button */
        gsap.to(".hero-run-btn", {
          boxShadow: "0 0 0 1px rgba(0,113,227,0.35), 0 8px 28px rgba(0,113,227,0.22)",
          duration: 1.8,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: 1.8,
        });

        /* Stats count-up */
        document.querySelectorAll<HTMLElement>(".stat-num").forEach((el) => {
          const target = parseInt(el.getAttribute("data-target") ?? "0");
          const obj = { val: 0 };
          ScrollTrigger.create({
            trigger: el, start: "top 88%", once: true,
            onEnter: () => gsap.to(obj, {
              val: target, duration: 1.8, ease: "power3.out",
              snap: { val: 1 },
              onUpdate() { el.textContent = Math.round(obj.val).toLocaleString(); },
            }),
          });
        });

        /* Why-go cards stagger */
        gsap.from(".why-card", {
          y: 40, scale: 0.97, stagger: 0.09, duration: 0.65, ease: "expo.out",
          scrollTrigger: { trigger: ".why-grid", start: "top 80%", once: true },
        });

        /* How-steps alternating */
        document.querySelectorAll<HTMLElement>(".how-step").forEach((el, i) => {
          gsap.from(el, {
            x: i % 2 === 0 ? -36 : 36, duration: 0.7, ease: "expo.out",
            scrollTrigger: { trigger: el, start: "top 82%", once: true },
          });
        });

          /* Topics cards stagger reveal */
          gsap.from(".topic-card", {
            y: 30, scale: 0.94, stagger: 0.05, duration: 0.6, ease: "expo.out",
            scrollTrigger: { trigger: "#topics-track", start: "top 85%", once: true },
          });

        /* Feature panels */
        document.querySelectorAll<HTMLElement>(".feature-panel").forEach((el) => {
          gsap.from(el, {
            y: 32, scale: 0.98, duration: 0.8, ease: "expo.out",
            scrollTrigger: { trigger: el, start: "top 82%", once: true },
          });
        });

        /* FAQ items */
        gsap.from(".faq-item", {
          y: 16, stagger: 0.06, duration: 0.5, ease: "expo.out",
          scrollTrigger: { trigger: ".faq-list", start: "top 82%", once: true },
        });

        /* Final CTA */
        gsap.from(".final-cta", {
          y: 28, duration: 0.8, ease: "expo.out",
          scrollTrigger: { trigger: ".final-cta", start: "top 85%", once: true },
        });

      }, containerRef);
    };

    init();
    return () => ctx?.revert();
  }, []);

  return (
    <div ref={containerRef} className="bg-background overflow-x-hidden">
      <Navbar />

      {/* ══════════════════════════════════════════
          HERO  — two-column grid
      ══════════════════════════════════════════ */}
      <section className="relative min-h-screen pt-20 sm:pt-24 pb-6 sm:pb-8 px-4 sm:px-6 overflow-x-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0 flex items-start justify-center overflow-hidden">
          <div className="mt-[-80px] w-[600px] sm:w-[900px] h-[400px] sm:h-[500px] rounded-full bg-[#0071E3]/6 blur-[100px] sm:blur-[120px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-6xl min-h-[calc(100vh-100px)] flex flex-col justify-between">
          <div className="flex flex-col items-center text-center pt-2 sm:pt-4">
            <div className="hero-badge inline-flex items-center gap-2 bg-[#0071E3]/10 border border-[#0071E3]/20 text-[#0071E3] text-[12px] sm:text-[13px] font-medium px-3 sm:px-4 py-1.5 rounded-full mb-5 sm:mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0071E3] animate-pulse shrink-0" />
              Platform Belajar Go #1 Bahasa Indonesia
            </div>

            <div className="max-w-3xl">
              <h1 className="hero-title font-display font-semibold leading-[1.05] tracking-[-0.04em] text-foreground mb-4 sm:mb-5"
                style={{ fontSize: "clamp(34px, 6vw, 72px)" }}>
                <span className="hero-title-line block">Kuasai Go.</span>
                <span className="hero-title-line block text-[#0071E3]">Dengan Cara</span>
                <span className="hero-title-line block">yang Elegan.</span>
              </h1>

              <p className="hero-sub mx-auto text-[15px] sm:text-[18px] text-[#86868B] leading-relaxed mb-6 sm:mb-8 max-w-2xl">
                76 lessons interaktif, bilingual ID/EN, dengan editor Go langsung di browser.
                Dari <span className="text-foreground font-medium">Hello World</span> hingga{" "}
                <span className="text-foreground font-medium">production patterns</span>.
              </p>
            </div>

            <div className="hero-cta-row flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2 sm:gap-3 mb-6 sm:mb-8 w-full max-w-[420px] sm:max-w-none">
              <Link href="/modules"
                className="group inline-flex items-center justify-center gap-2 h-11 sm:h-auto bg-[#0071E3] text-white text-[14px] sm:text-[15px] leading-none font-medium px-5 sm:px-6 py-2.5 sm:py-3 rounded-full hover:bg-[#0077ED] transition-all shadow-lg shadow-[#0071E3]/20 hover:-translate-y-0.5 active:translate-y-0 whitespace-nowrap">
                Mulai Belajar Gratis
                <ArrowRight className="w-4 h-4 shrink-0 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link href="/playground"
                className="inline-flex items-center justify-center gap-2 h-11 sm:h-auto text-foreground text-[14px] sm:text-[15px] leading-none font-medium px-5 sm:px-6 py-2.5 sm:py-3 rounded-full border border-[#D2D2D7] dark:border-white/15 hover:bg-[#F5F5F7] dark:hover:bg-[#1C1C1E] transition-colors whitespace-nowrap">
                <Play className="w-4 h-4 shrink-0 text-[#0071E3]" /> Coba Playground
              </Link>
            </div>

            <div className="hero-trust flex flex-wrap justify-center gap-x-4 sm:gap-x-5 gap-y-2 text-[12px] sm:text-[13px] text-[#86868B]">
              {["Gratis selamanya", "Tanpa install", "Bilingual ID/EN", "76 lessons"].map((t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-[#34C759] shrink-0" />{t}
                </span>
              ))}
            </div>
          </div>

          <div className="flex justify-center pt-8 sm:pt-10">
            <HeroCodePreview />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          STATS
      ══════════════════════════════════════════ */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 border-t border-[#D2D2D7]/40">
        <div className="mx-auto max-w-4xl grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
          {[
            { target: 15,  suffix: "",  label: "Topik Go"         },
            { target: 76,  suffix: "+", label: "Lessons"          },
            { target: 300, suffix: "+", label: "Soal Quiz"        },
            { target: 0,   suffix: "",  label: "Install Required" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="font-display font-semibold tracking-[-0.05em] text-foreground leading-none"
                style={{ fontSize: "clamp(36px, 5vw, 68px)" }}>
                <span className="stat-num" data-target={s.target}>0</span>
                <span className="text-[#0071E3]">{s.suffix}</span>
              </div>
              <p className="text-[#86868B] text-[13px] sm:text-[15px] mt-2 sm:mt-3">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          WHY GO — bento grid, big cards
      ══════════════════════════════════════════ */}
      <section className="py-20 px-4 sm:px-6 bg-[#F5F5F7] dark:bg-[#0A0A0A]">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10">
            <p className="text-[#86868B] text-[11px] sm:text-[12px] font-semibold uppercase tracking-[0.15em] mb-3">Mengapa Go?</p>
            <h2 className="font-display font-semibold text-[28px] sm:text-[40px] lg:text-[48px] tracking-[-0.03em] text-foreground leading-[1.07]">
              Bahasa yang dibangun untuk masa depan.
            </h2>
          </div>

          {/* Bento 2×2 — stat font menggunakan fluid size */}
          <div className="why-grid grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            {WHY_GO.map((w) => (
              <div key={w.label}
                className="why-card bg-background dark:bg-[#1C1C1E] rounded-[20px] p-6 sm:p-8 min-h-[180px] sm:min-h-[210px] flex flex-col justify-between group hover:scale-[1.01] transition-transform duration-300 overflow-hidden">
                {/* Top */}
                <div className="flex items-start justify-between gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: w.color + "18" }}>
                    <w.icon className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: w.color }} />
                  </div>
                  <span className="text-[#86868B] text-[12px] sm:text-[13px] leading-relaxed text-right max-w-[160px] text-justify">
                    {w.sub}
                  </span>
                </div>
                {/* Bottom */}
                <div>
                  <p className="font-display font-semibold tracking-[-0.04em] leading-none mb-2"
                    style={{
                      color: w.color,
                      fontSize: "clamp(36px, 5vw, 60px)",
                    }}>
                    {w.stat}
                  </p>
                  <p className="font-semibold text-[14px] sm:text-[16px] text-foreground">{w.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Companies */}
          <div className="mt-16 sm:mt-20 pb-2 text-center">
            <p className="text-[#86868B] text-[12px] sm:text-[13px] mb-3">Dipercaya oleh</p>
            <div className="flex flex-wrap items-center justify-center gap-x-6 sm:gap-x-8 gap-y-2">
              {["Google", "Docker", "Kubernetes", "Cloudflare", "Uber", "Dropbox"].map((c) => (
                <span key={c} className="text-[#86868B] text-[13px] sm:text-[14px] font-medium hover:text-foreground transition-colors">
                  {c}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          HOW IT WORKS — 2×2 grid
      ══════════════════════════════════════════ */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 overflow-visible">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10">
            <p className="text-[#86868B] text-[11px] sm:text-[12px] font-semibold uppercase tracking-[0.15em] mb-3">Cara Kerja</p>
            <h2 className="font-display font-semibold tracking-[-0.03em] text-foreground"
              style={{ fontSize: "clamp(26px, 4vw, 48px)" }}>
              Belajar yang benar-benar efektif.
            </h2>
          </div>

          {/* 2×2 grid desktop, 1 col mobile */}
          <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
            {HOW_STEPS.map((s, i) => (
              <div key={s.n}
                className="how-step bg-[#F5F5F7] dark:bg-[#1C1C1E] rounded-[20px] p-6 sm:p-7 group hover:bg-[#EBEBED] dark:hover:bg-[#242424] transition-colors">
                {/* Step number badge */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#0071E3]/10 flex items-center justify-center shrink-0 group-hover:bg-[#0071E3]/20 transition-colors">
                    <span className="font-display font-semibold text-[15px] text-[#0071E3]">{s.n}</span>
                  </div>
                  <h3 className="font-semibold text-[17px] sm:text-[18px] text-foreground">{s.title}</h3>
                </div>
                <p className="text-[#86868B] text-[14px] sm:text-[15px] leading-relaxed text-justify">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          CODE SHOWCASE
      ══════════════════════════════════════════ */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-[#F5F5F7] dark:bg-[#0A0A0A]">
        <div className="mx-auto max-w-4xl">
          <div className="mb-10">
            <p className="text-[#86868B] text-[12px] font-semibold uppercase tracking-[0.15em] mb-3">Contoh Kode</p>
            <h2 className="font-display font-semibold text-[36px] sm:text-[48px] tracking-[-0.03em] text-foreground">
              Go itu elegan dan ekspresif.
            </h2>
          </div>
          <CodeShowcase tabs={CODE_TABS} />
        </div>
      </section>

      {/* ══════════════════════════════════════════
          TOPICS — rich cards + GSAP stagger + hover tilt
      ══════════════════════════════════════════ */}
      <section className="pt-16 sm:pt-20 pb-24 sm:pb-28 bg-[#F5F5F7] dark:bg-[#0A0A0A] overflow-visible relative z-10">
        {/* Header — split into 2 stable rows to avoid overlap */}
        <div className="px-4 sm:px-6 max-w-6xl mx-auto mb-10 sm:mb-12">
          <div className="flex items-end justify-between gap-4 flex-wrap mb-4">
            <div>
              <p className="text-[#86868B] text-[11px] font-semibold uppercase tracking-[0.18em] mb-1.5">Kurikulum</p>
              <h2
                className="font-display font-semibold tracking-[-0.03em] text-foreground"
                style={{ fontSize: "clamp(22px, 3.5vw, 44px)" }}
              >
                15 topik · 76 lessons
              </h2>
            </div>
            <Link
              href="/modules"
              className="flex items-center gap-1.5 text-[#0071E3] text-[13px] font-medium hover:gap-2.5 transition-all shrink-0"
            >
              Lihat semua <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>

        {/* Drag-to-scroll track */}
        <DragScroll>
          <div id="topics-track" className="flex items-stretch gap-3 sm:gap-4 px-4 sm:px-6 pt-4 pb-8 sm:pb-10" style={{ width: "max-content" }}>
            {TOPICS.map((t, i) => (
              <TopicCard key={t.n} topic={t} index={i} />
            ))}
            {/* CTA card */}
            <div
              className="w-[220px] sm:w-[240px] rounded-[22px] p-6 shrink-0 flex flex-col justify-between relative overflow-hidden border border-[#D2D2D7]/60 dark:border-white/8 bg-white dark:bg-[#111214] shadow-[0_12px_30px_rgba(15,23,42,0.04)]"
            >
              <div>
                <p className="text-[#86868B] text-[11px] font-semibold uppercase tracking-[0.16em] mb-3">Start Here</p>
                <p className="font-display font-semibold text-[22px] text-foreground mb-2 leading-tight">Mulai perjalanan Go kamu.</p>
                <p className="text-[#86868B] text-[13px] leading-relaxed">Masuk ke semua topik, pilih lesson pertama, lalu mulai coding langsung di browser.</p>
              </div>
              <Link href="/modules"
                className="inline-flex items-center gap-1.5 text-[#0071E3] text-[13px] font-semibold hover:gap-2.5 transition-all mt-6 self-start">
                Buka semua topik <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </DragScroll>

        {/* Level legend */}
        <div className="flex items-center gap-5 px-4 sm:px-6 mt-2">
          {[["#34C759","Beginner"],["#0071E3","Intermediate"],["#FF453A","Advanced"]].map(([c,l]) => (
            <div key={l} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c }} />
              <span className="text-[#86868B] text-[12px]">{l}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FEATURES DEEP DIVE
      ══════════════════════════════════════════ */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 relative z-0">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 sm:mb-12">
            <div>
              <p className="text-[#86868B] text-[12px] font-semibold uppercase tracking-[0.15em] mb-3">Fitur</p>
              <h2 className="font-display font-semibold text-[36px] sm:text-[48px] tracking-[-0.03em] text-foreground">
                Dirancang untuk belajar<br className="hidden sm:block" /> yang sesungguhnya.
              </h2>
            </div>
          </div>

          <FeatureSection items={FEATURES} />
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FAQ
      ══════════════════════════════════════════ */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-[#F5F5F7] dark:bg-[#0A0A0A]">
        <div className="mx-auto max-w-3xl">
          <div className="mb-10">
            <p className="text-[#86868B] text-[12px] font-semibold uppercase tracking-[0.15em] mb-3">FAQ</p>
            <h2 className="font-display font-semibold text-[36px] sm:text-[44px] tracking-[-0.03em] text-foreground">
              Pertanyaan yang sering ditanya.
            </h2>
          </div>
          <div className="faq-list space-y-2">
            {FAQS.map((f, i) => <FaqItem key={i} q={f.q} a={f.a} />)}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FINAL CTA
      ══════════════════════════════════════════ */}
      <section className="py-28 px-6 relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="w-[700px] h-[300px] rounded-full bg-[#0071E3]/5 blur-[100px]" />
        </div>
        <div className="final-cta relative mx-auto max-w-xl text-center">
          <p className="text-[#86868B] text-[12px] font-semibold uppercase tracking-[0.15em] mb-5">Mulai hari ini</p>
          <h2 className="font-display font-semibold text-[40px] sm:text-[52px] tracking-[-0.04em] text-foreground mb-4 leading-[1.06]">
            Satu commit pertama<br />untuk masa depan.
          </h2>
          <p className="text-[#86868B] text-[17px] mb-8 leading-relaxed">
            Gratis. Tanpa kartu kredit. Tanpa install.<br />
            Mulai belajar Go dalam 30 detik.
          </p>
          <Link href="/register"
            className="group inline-flex items-center gap-2 bg-[#0071E3] text-white text-[16px] font-medium px-8 py-3.5 rounded-full hover:bg-[#0077ED] transition-all shadow-xl shadow-[#0071E3]/20 hover:-translate-y-0.5 active:translate-y-0">
            Buat Akun Gratis
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <div className="flex flex-wrap items-center justify-center gap-5 mt-7 text-[13px] text-[#86868B]">
            {["Gratis selamanya", "76 lessons", "Bilingual ID/EN", "Tanpa setup"].map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-[#34C759] shrink-0" /> {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-[#D2D2D7]/40 py-12 px-6">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8 mb-8">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#0071E3] flex items-center justify-center shrink-0">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <span className="font-display font-semibold text-[15px] text-foreground">GoLearn</span>
            </div>
            <div className="flex flex-wrap gap-x-7 gap-y-2 text-[13px] text-[#86868B]">
              {[
                ["/modules",     "Kursus"],
                ["/playground",  "Playground"],
                ["/leaderboard", "Leaderboard"],
                ["/dashboard",   "Dashboard"],
                ["/login",       "Masuk"],
                ["/register",    "Daftar"],
              ].map(([href, label]) => (
                <Link key={href} href={href} className="hover:text-foreground transition-colors">{label}</Link>
              ))}
            </div>
          </div>
          <div className="border-t border-[#D2D2D7]/40 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-[#86868B] text-[13px]">© 2026 GoLearn. Dibuat untuk Go learners Indonesia.</p>
            <Link href="https://github.com/Kahfi10/go-learning"
              className="text-[#86868B] text-[13px] hover:text-foreground transition-colors">
              GitHub →
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ─── Sub-components ─────────────────────────────────────── */
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

/* ── DragScroll — mouse drag to scroll horizontally ── */
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

function HeroCodePreview() {
	const INITIAL_CODE = `package main

import "fmt"

func main() {
    topics := []string{"Variables", "Functions", "Goroutines"}
    for i, topic := range topics {
        fmt.Printf("%d. %s\\n", i+1, topic)
    }
}`;
	const [code, setCode] = useState(INITIAL_CODE);

	const [result, setResult] = useState<ExecuteResult | null>({
		stdout: "1. Variables\n2. Functions\n3. Goroutines\n",
		stderr: "",
		executionTimeMs: 2,
		timedOut: false,
	});
	const [running, setRunning] = useState(false);
	const [flash, setFlash] = useState(false);
	const lineCount = code.split("\n").length;
	const frameRef = useRef<HTMLDivElement>(null);

	async function handleRun() {
		setRunning(true);
		try {
			import("gsap").then(({ gsap }) => {
				gsap.timeline()
					.to(".hero-run-btn", { scale: 0.96, duration: 0.08, ease: "power2.out" })
					.to(".hero-run-btn", { scale: 1, duration: 0.18, ease: "back.out(2)" });
			});
			const res = await api.execute(code);
			setResult(res);
			setFlash(true);
			setTimeout(() => setFlash(false), 600);
			import("gsap").then(({ gsap }) => {
				gsap.fromTo(
					".hero-output-line",
					{ y: 10, opacity: 0.35, filter: "blur(3px)" },
					{ y: 0, opacity: 1, filter: "blur(0px)", duration: 0.45, ease: "expo.out" }
				);
				gsap.fromTo(
					".hero-output-panel",
					{ boxShadow: "0 0 0 rgba(48,209,88,0)" },
					{ boxShadow: "0 0 0 1px rgba(48,209,88,0.25), 0 0 18px rgba(48,209,88,0.12)", duration: 0.35, yoyo: true, repeat: 1 }
				);
				gsap.fromTo(
					".hero-stats-card",
					{ y: 4 },
					{ y: 0, duration: 0.35, stagger: 0.05, ease: "power2.out" }
				);
			});
		} catch {
			setResult({ stdout: "", stderr: "Run gagal", executionTimeMs: 0, timedOut: false });
		} finally {
			setRunning(false);
		}
	}

	function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
		if (!frameRef.current) return;
		const rect = frameRef.current.getBoundingClientRect();
		const x = ((e.clientX - rect.left) / rect.width - 0.5) * 10;
		const y = ((e.clientY - rect.top) / rect.height - 0.5) * -8;
		import("gsap").then(({ gsap }) => {
			gsap.to(frameRef.current, {
				rotateY: x,
				rotateX: y,
				transformPerspective: 1200,
				duration: 0.35,
				ease: "power2.out",
			});
		});
	}

	function handleMouseLeave() {
		if (!frameRef.current) return;
		import("gsap").then(({ gsap }) => {
			gsap.to(frameRef.current, {
				rotateX: 0,
				rotateY: 0,
				duration: 0.6,
				ease: "expo.out",
			});
		});
	}

	return (
		<div className="hero-code-window hidden md:block w-full max-w-[560px] mx-auto">
			<div
				ref={frameRef}
				className="bg-[#1C1C1E] rounded-[18px] overflow-hidden shadow-2xl ring-1 ring-white/10 transition-transform duration-500"
				onMouseMove={handleMouseMove}
				onMouseLeave={handleMouseLeave}
			>
				<div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06]">
          <div className="flex gap-1.5 shrink-0">
            <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
            <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
            <div className="w-3 h-3 rounded-full bg-[#28C840]" />
          </div>
          <span className="ml-2 text-white/30 text-[12px] font-mono truncate">topic-10 · goroutines.go</span>
					<button
						onClick={handleRun}
						disabled={running}
						className="hero-run-btn ml-auto flex items-center gap-1 bg-[#0071E3] hover:bg-[#0077ED] disabled:opacity-60 transition-all px-2.5 py-1 rounded-md shrink-0"
					>
						<Play className="w-3 h-3 text-white" />
						<span className="text-white text-[11px] font-medium">{running ? "Running" : "Run"}</span>
					</button>
				</div>
				<div className="flex">
					<div className="select-none px-3 py-4 text-white/20 text-[12px] font-mono leading-[1.75] text-right border-r border-white/[0.05] w-9 shrink-0">
						{Array.from({ length: lineCount }, (_, i) => <div key={i}>{i + 1}</div>)}
					</div>
					<textarea
						value={code}
						onChange={(e) => setCode(e.target.value)}
						spellCheck={false}
						className="flex-1 px-4 py-4 text-[12.5px] font-mono leading-[1.75] overflow-x-auto text-[#E5E5EA] min-w-0 bg-transparent outline-none resize-none min-h-[300px] caret-[#0071E3]"
					/>
				</div>
				<div className={cn("hero-output-panel border-t border-white/[0.06] px-4 py-2.5 flex items-center gap-3 transition-colors", flash && "bg-[#30D158]/10") }>
					<div className="flex items-center gap-1.5 shrink-0">
						<div className={cn("w-2 h-2 rounded-full", result?.stderr ? "bg-[#FF453A]" : "bg-[#30D158]")} />
						<span className={cn("text-[11px] font-mono font-medium", result?.stderr ? "text-[#FF453A]" : "text-[#30D158]")}>Output</span>
					</div>
					<span className="hero-output-line text-white/50 text-[12px] font-mono truncate">{(result?.stderr || result?.stdout || "").trim().replace(/\n/g, " · ")}</span>
					<span className="ml-auto text-white/25 text-[11px] font-mono shrink-0">{result?.executionTimeMs ?? 0}ms</span>
				</div>
        <div className="border-t border-white/[0.06] px-4 py-2 flex items-center gap-2">
          <span className="text-[11px] text-white/30 font-mono">Lesson 10 selesai</span>
          <span className="ml-auto bg-[#34C759]/15 text-[#30D158] text-[11px] font-medium px-2 py-0.5 rounded-full">+50 XP</span>
        </div>
      </div>

			<div className="hidden xl:grid grid-cols-3 gap-2 mt-3">
				{[
					{ v: "15", l: "Topik" },
					{ v: `${lineCount}`, l: "Lines" },
					{ v: running ? "..." : `${result?.executionTimeMs ?? 0}ms`, l: "Run" },
				].map((s) => (
					<div key={s.l} className="hero-stats-card bg-[#F5F5F7] dark:bg-[#1C1C1E] rounded-[10px] py-2.5 text-center">
            <p className="font-display font-semibold text-[18px] text-foreground">{s.v}</p>
            <p className="text-[#86868B] text-[11px]">{s.l}</p>
          </div>
        ))}
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
