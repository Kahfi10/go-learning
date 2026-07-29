"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight, Code2, BookOpen, Trophy, Users,
  Zap, CheckCircle, Play, ChevronDown,
  Terminal, GitBranch, Cpu, Globe,
} from "lucide-react";
import Navbar from "@/components/navigation/Navbar";

/* ─── Data ──────────────────────────────────────────────── */
const TOPICS = [
  { n: "01", title: "Getting Started", color: "#0071E3", level: "Beginner", lessons: 4 },
  { n: "02", title: "Variables & Types", color: "#34C759", level: "Beginner", lessons: 5 },
  { n: "03", title: "Functions", color: "#FF9500", level: "Beginner", lessons: 6 },
  { n: "04", title: "Control Structures", color: "#FF3B30", level: "Beginner", lessons: 5 },
  { n: "05", title: "Collections", color: "#5AC8FA", level: "Beginner", lessons: 6 },
  { n: "06", title: "Structs & Methods", color: "#AF52DE", level: "Beginner", lessons: 5 },
  { n: "07", title: "Interfaces", color: "#64D2FF", level: "Beginner", lessons: 5 },
  { n: "08", title: "Pointers", color: "#30D158", level: "Intermediate", lessons: 4 },
  { n: "09", title: "Error Handling", color: "#FF453A", level: "Intermediate", lessons: 5 },
  { n: "10", title: "Goroutines & Channels", color: "#0A84FF", level: "Intermediate", lessons: 6 },
  { n: "11", title: "Packages & Modules", color: "#BF5AF2", level: "Intermediate", lessons: 4 },
  { n: "12", title: "File I/O & OS", color: "#FFD60A", level: "Intermediate", lessons: 5 },
  { n: "13", title: "Testing in Go", color: "#32D74B", level: "Advanced", lessons: 5 },
  { n: "14", title: "HTTP & Web", color: "#FF9F0A", level: "Advanced", lessons: 6 },
  { n: "15", title: "Go Patterns", color: "#FF2D55", level: "Advanced", lessons: 5 },
];

const WHY_GO = [
  { icon: Zap, stat: "10x", label: "Lebih cepat dari Python", sub: "Compiled, statically typed, zero overhead", color: "#0071E3" },
  { icon: Cpu, stat: "1M+", label: "Goroutines sekaligus", sub: "Concurrency built-in, bukan afterthought", color: "#34C759" },
  { icon: Terminal, stat: "<10s", label: "Build time proyek besar", sub: "Compiler tercepat di kelasnya", color: "#FF9500" },
  { icon: Globe, stat: "Top 5", label: "Bahasa paling dicari", sub: "Docker, Kubernetes, Cloudflare pakai Go", color: "#AF52DE" },
];

const HOW_STEPS = [
  { n: "01", title: "Pilih topik", desc: "15 topik terstruktur dari dasar hingga production patterns. Mulai dari mana saja." },
  { n: "02", title: "Baca & pahami", desc: "Konten bilingual (ID/EN) dengan penjelasan mendalam, contoh nyata, dan diagram." },
  { n: "03", title: "Langsung coding", desc: "Editor Monaco embedded. Tulis dan jalankan Go di browser — tanpa install apapun." },
  { n: "04", title: "Uji pemahaman", desc: "Quiz per lesson, kumpulkan XP, naik level, dan bersaing di leaderboard." },
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
    fmt.Printf("Worker %d selesai\\n", id)
}

func main() {
    var wg sync.WaitGroup
    for i := 1; i <= 5; i++ {
        wg.Add(1)
        go worker(i, &wg) // goroutine!
    }
    wg.Wait()
}`,
    output: "Worker 3 selesai\nWorker 1 selesai\nWorker 5 selesai\nWorker 2 selesai\nWorker 4 selesai",
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

type Circle struct{ Radius float64 }
type Rect struct{ W, H float64 }

func (c Circle) Area() float64 {
    return math.Pi * c.Radius * c.Radius
}
func (r Rect) Area() float64 { return r.W * r.H }

func printArea(s Shape) {
    fmt.Printf("Area: %.2f\\n", s.Area())
}

func main() {
    printArea(Circle{Radius: 5})
    printArea(Rect{W: 4, H: 6})
}`,
    output: "Area: 78.54\nArea: 24.00",
  },
  {
    label: "HTTP Server",
    code: `package main

import (
    "encoding/json"
    "net/http"
)

type Response struct {
    Message string \`json:"message"\`
    Status  int    \`json:"status"\`
}

func handler(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(Response{
        Message: "Hello dari Go!",
        Status:  200,
    })
}

func main() {
    http.HandleFunc("/", handler)
    http.ListenAndServe(":8080", nil)
}`,
    output: '{"message":"Hello dari Go!","status":200}',
  },
];

const FAQS = [
  { q: "Apakah GoLearn benar-benar gratis?", a: "Ya, 100% gratis. Semua 76 lessons, quiz, editor, dan fitur komunitas dapat diakses tanpa biaya." },
  { q: "Perlu install Go dulu?", a: "Tidak. Editor Monaco di browser langsung terhubung ke sandbox executor kami. Tulis dan jalankan kode tanpa setup." },
  { q: "Apakah konten tersedia dalam bahasa Indonesia?", a: "Ya. Semua lesson tersedia bilingual — toggle antara Bahasa Indonesia dan English kapan saja." },
  { q: "Cocok untuk pemula total?", a: "Sangat cocok. Topik 1-7 dirancang untuk pemula yang belum pernah kenal Go. Dimulai dari Hello World." },
  { q: "Berapa lama untuk menyelesaikan seluruh kurikulum?", a: "Sekitar 30-40 jam belajar total, tergantung kecepatan masing-masing. Bisa diselesaikan dalam 2-4 minggu." },
];

/* ─── Component ─────────────────────────────────────────── */
export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const codeTabRef = useRef<number>(0);

  useEffect(() => {
    let ctx: any;

    const init = async () => {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      ctx = gsap.context(() => {

        /* ── Hero: staggered word reveal ── */
        gsap.set(".hero-word", { opacity: 0, y: 60, rotateX: -40 });
        gsap.to(".hero-word", {
          opacity: 1, y: 0, rotateX: 0,
          duration: 0.9, ease: "expo.out",
          stagger: 0.08, delay: 0.2,
        });
        gsap.from(".hero-sub", { opacity: 0, y: 30, duration: 0.8, ease: "expo.out", delay: 0.7 });
        gsap.from(".hero-cta-row", { opacity: 0, y: 20, duration: 0.7, ease: "expo.out", delay: 0.9 });
        gsap.from(".hero-badge", { opacity: 0, scale: 0.8, duration: 0.5, ease: "back.out(2)", delay: 0.1 });
        gsap.from(".scroll-hint", { opacity: 0, y: -10, duration: 0.6, ease: "expo.out", delay: 1.4 });

        /* ── Code preview float ── */
        gsap.to(".code-preview", {
          y: -12, duration: 3, ease: "sine.inOut", yoyo: true, repeat: -1,
        });
        gsap.from(".code-preview", { opacity: 0, y: 60, scale: 0.95, duration: 1, ease: "expo.out", delay: 0.8 });

        /* ── Stats counter ── */
        document.querySelectorAll(".stat-num").forEach((el) => {
          const target = parseInt(el.getAttribute("data-target") ?? "0");
          const obj = { val: 0 };
          ScrollTrigger.create({
            trigger: el,
            start: "top 85%",
            once: true,
            onEnter: () => gsap.to(obj, {
              val: target, duration: 2, ease: "power3.out",
              snap: { val: 1 },
              onUpdate() { el.textContent = Math.round(obj.val).toLocaleString(); },
            }),
          });
        });

        /* ── Why Go cards ── */
        gsap.from(".why-card", {
          opacity: 0, y: 50, scale: 0.94,
          duration: 0.7, ease: "expo.out", stagger: 0.1,
          scrollTrigger: { trigger: ".why-grid", start: "top 75%", once: true },
        });

        /* ── How steps: slide in alternating ── */
        document.querySelectorAll(".how-step").forEach((el, i) => {
          gsap.from(el, {
            opacity: 0, x: i % 2 === 0 ? -50 : 50,
            duration: 0.8, ease: "expo.out",
            scrollTrigger: { trigger: el, start: "top 80%", once: true },
          });
        });

        /* ── Topic cards horizontal scroll (pin) ── */
        const track = document.querySelector(".topics-track") as HTMLElement;
        if (track) {
          const totalWidth = track.scrollWidth - window.innerWidth + 96;
          gsap.to(track, {
            x: -totalWidth,
            ease: "none",
            scrollTrigger: {
              trigger: ".topics-scroll-section",
              start: "top top",
              end: () => `+=${totalWidth}`,
              pin: true,
              scrub: 1,
              anticipatePin: 1,
            },
          });
        }

        /* ── Feature sections: scale reveal ── */
        gsap.utils.toArray<HTMLElement>(".feature-panel").forEach((panel) => {
          gsap.from(panel, {
            opacity: 0, scale: 0.96, y: 40,
            duration: 0.9, ease: "expo.out",
            scrollTrigger: { trigger: panel, start: "top 80%", once: true },
          });
        });

        /* ── FAQ items ── */
        gsap.from(".faq-item", {
          opacity: 0, y: 20, duration: 0.5, ease: "expo.out", stagger: 0.07,
          scrollTrigger: { trigger: ".faq-list", start: "top 80%", once: true },
        });

        /* ── CTA final ── */
        gsap.from(".final-cta", {
          opacity: 0, y: 40, scale: 0.97, duration: 0.9, ease: "expo.out",
          scrollTrigger: { trigger: ".final-cta", start: "top 85%", once: true },
        });

      });
    };

    init();
    return () => ctx?.revert();
  }, []);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navbar />

      {/* ═══════════════════════════════════════════════════
          HERO
      ═══════════════════════════════════════════════════ */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center pt-16 px-6 overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#0071E3]/8 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="hero-badge inline-flex items-center gap-2 bg-[#0071E3]/10 border border-[#0071E3]/20 text-[#0071E3] text-[13px] font-medium px-4 py-1.5 rounded-full mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0071E3] animate-pulse" />
            Platform Belajar Go #1 Bahasa Indonesia
          </div>

          {/* Headline — tiap kata dibungkus untuk stagger */}
          <h1 className="font-display font-semibold leading-[1.02] tracking-[-0.04em] mb-6" style={{ perspective: "1000px" }}>
            {["Kuasai", "Go.", "Dengan", "Cara", "Yang", "Elegan."].map((w, i) => (
              <span key={i} className="hero-word inline-block mr-[0.22em]"
                style={{ fontSize: "clamp(42px, 7vw, 80px)", color: i === 1 ? "#0071E3" : "hsl(var(--foreground))" }}>
                {w}
              </span>
            ))}
          </h1>

          <p className="hero-sub text-[18px] sm:text-[20px] text-[#86868B] max-w-2xl mx-auto mb-10 leading-relaxed">
            76 lessons interaktif, bilingual, dengan editor Go langsung di browser.
            Dari <span className="text-foreground font-medium">Hello World</span> hingga{" "}
            <span className="text-foreground font-medium">production-ready patterns</span>.
          </p>

          <div className="hero-cta-row flex flex-col sm:flex-row items-center justify-center gap-3 mb-16">
            <Link href="/modules"
              className="group inline-flex items-center gap-2 bg-[#0071E3] text-white text-[16px] font-medium px-7 py-3.5 rounded-full hover:bg-[#0077ED] transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[#0071E3]/25">
              Mulai Belajar Gratis
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/playground"
              className="inline-flex items-center gap-2 text-foreground text-[16px] font-medium px-7 py-3.5 rounded-full border border-[#D2D2D7] hover:bg-[#F5F5F7] dark:hover:bg-[#1C1C1E] transition-all hover:scale-[1.02]">
              <Play className="w-4 h-4 text-[#0071E3]" /> Coba Playground
            </Link>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-5 text-[13px] text-[#86868B]">
            {["✓ Gratis selamanya", "✓ Tanpa install", "✓ Bilingual ID/EN", "✓ 76 lessons", "✓ Code di browser"].map(t => (
              <span key={t}>{t}</span>
            ))}
          </div>
        </div>

        {/* Code preview floating */}
        <div className="code-preview relative mt-14 mx-auto w-full max-w-2xl">
          <div className="bg-[#1C1C1E] rounded-[20px] overflow-hidden shadow-2xl ring-1 ring-white/10">
            <div className="flex items-center gap-2 px-5 py-3.5 border-b border-white/8">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
                <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                <div className="w-3 h-3 rounded-full bg-[#28C840]" />
              </div>
              <span className="ml-2 text-white/30 text-[12px] font-mono">lesson-10 · goroutines.go</span>
              <div className="ml-auto flex items-center gap-1.5 bg-[#0071E3] px-3 py-1 rounded-md cursor-pointer hover:bg-[#0077ED] transition-colors">
                <Play className="w-3 h-3 text-white" />
                <span className="text-white text-[11px] font-medium">Run</span>
              </div>
            </div>
            <div className="flex">
              <div className="px-4 py-5 text-white/20 text-[13px] font-mono leading-[1.8] text-right select-none border-r border-white/5 min-w-[40px]">
                {[1,2,3,4,5,6,7,8,9,10,11,12,13].map(n => <div key={n}>{n}</div>)}
              </div>
              <pre className="flex-1 px-5 py-5 text-[13px] font-mono leading-[1.8] overflow-x-auto text-[#E5E5EA]">
                <span className="text-[#FF7AB2]">package</span><span> main{"\n\n"}</span>
                <span className="text-[#FF7AB2]">import</span><span className="text-[#FF8170]"> (</span>
                <span>{"\n\t"}</span><span className="text-[#FC6A5D]">"fmt"</span>
                <span>{"\n\t"}</span><span className="text-[#FC6A5D]">"sync"</span>
                <span>{"\n"}</span><span className="text-[#FF8170]">){"\n\n"}</span>
                <span className="text-[#FF7AB2]">func</span><span className="text-[#6BDFFF]"> worker</span>
                <span>(id </span><span className="text-[#5DD8FF]">int</span>
                <span>, wg *sync.</span><span className="text-[#5DD8FF]">WaitGroup</span><span>) {"{"}{"\n"}</span>
                <span>{"\t"}</span><span className="text-[#FF7AB2]">defer</span><span> wg.</span>
                <span className="text-[#6BDFFF]">Done</span><span>(){"\n\t"}</span>
                <span>fmt.</span><span className="text-[#6BDFFF]">Printf</span>
                <span>(</span><span className="text-[#FC6A5D]">"Worker %d ✓\n"</span>
                <span>, id){"\n}"}</span>
              </pre>
            </div>
            <div className="border-t border-white/8 px-5 py-3 flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-[#30D158]" />
                <span className="text-[#30D158] text-[11px] font-mono font-medium">Output</span>
              </div>
              <span className="text-white/50 text-[12px] font-mono">Worker 1 ✓  Worker 3 ✓  Worker 2 ✓ ...</span>
              <span className="ml-auto text-white/25 text-[11px] font-mono">2ms</span>
            </div>
          </div>

          {/* Floating badges around code */}
          <div className="absolute -left-4 top-8 bg-[#34C759]/15 border border-[#34C759]/30 text-[#34C759] text-[11px] font-medium px-3 py-1.5 rounded-full hidden sm:block">
            Lesson 10 · Goroutines
          </div>
          <div className="absolute -right-4 bottom-8 bg-[#0071E3]/15 border border-[#0071E3]/30 text-[#0071E3] text-[11px] font-medium px-3 py-1.5 rounded-full hidden sm:block">
            +50 XP saat selesai
          </div>
        </div>

        {/* Scroll hint */}
        <div className="scroll-hint absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[#86868B]">
          <span className="text-[12px]">Scroll</span>
          <ChevronDown className="w-4 h-4 animate-bounce" />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          STATS
      ═══════════════════════════════════════════════════ */}
      <section className="py-20 px-6 border-t border-[#D2D2D7]/40">
        <div className="mx-auto max-w-4xl grid grid-cols-2 sm:grid-cols-4 gap-8">
          {[
            { target: 15, suffix: "", label: "Topik Go" },
            { target: 76, suffix: "+", label: "Lessons" },
            { target: 300, suffix: "+", label: "Soal Quiz" },
            { target: 0, suffix: "", label: "Install Required" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="font-display font-semibold text-[52px] sm:text-[64px] tracking-[-0.04em] text-foreground leading-none">
                <span className="stat-num" data-target={s.target}>0</span>
                <span className="text-[#0071E3]">{s.suffix}</span>
              </div>
              <p className="text-[#86868B] text-[15px] mt-2">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          WHY GO — 4 cards with big stats
      ═══════════════════════════════════════════════════ */}
      <section className="py-24 px-6 bg-[#F5F5F7] dark:bg-[#0A0A0A]">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <p className="text-[#86868B] text-[12px] font-semibold uppercase tracking-[0.15em] mb-4">Mengapa Go?</p>
            <h2 className="font-display font-semibold text-[40px] sm:text-[52px] tracking-[-0.03em] text-foreground leading-[1.05]">
              Bahasa yang dibangun<br />untuk masa depan.
            </h2>
          </div>
          <div className="why-grid grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {WHY_GO.map((w) => (
              <div key={w.label} className="why-card bg-background dark:bg-[#1C1C1E] rounded-[20px] p-6">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-5"
                  style={{ backgroundColor: w.color + "18" }}>
                  <w.icon className="w-5 h-5" style={{ color: w.color }} />
                </div>
                <p className="font-display font-semibold text-[36px] tracking-tight mb-1"
                  style={{ color: w.color }}>{w.stat}</p>
                <p className="font-semibold text-[15px] text-foreground mb-1">{w.label}</p>
                <p className="text-[#86868B] text-[13px] leading-relaxed">{w.sub}</p>
              </div>
            ))}
          </div>

          {/* Companies using Go */}
          <div className="mt-14 text-center">
            <p className="text-[#86868B] text-[13px] mb-6">Dipercaya perusahaan teknologi terbesar dunia</p>
            <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
              {["Google", "Docker", "Kubernetes", "Cloudflare", "Uber", "Dropbox", "Twitch"].map(c => (
                <span key={c} className="text-[#86868B] text-[14px] font-medium hover:text-foreground transition-colors">{c}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          HOW IT WORKS
      ═══════════════════════════════════════════════════ */}
      <section className="py-24 px-6">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <p className="text-[#86868B] text-[12px] font-semibold uppercase tracking-[0.15em] mb-4">Cara Kerja</p>
            <h2 className="font-display font-semibold text-[40px] sm:text-[52px] tracking-[-0.03em] text-foreground">
              Belajar yang benar-benar efektif.
            </h2>
          </div>
          <div className="space-y-5">
            {HOW_STEPS.map((s, i) => (
              <div key={s.n} className="how-step flex items-start gap-6 p-6 bg-[#F5F5F7] dark:bg-[#1C1C1E] rounded-[20px] hover:bg-[#EBEBED] dark:hover:bg-[#242424] transition-colors group">
                <div className="w-12 h-12 rounded-2xl bg-[#0071E3]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#0071E3]/20 transition-colors">
                  <span className="font-display font-semibold text-[15px] text-[#0071E3]">{s.n}</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-[18px] text-foreground mb-1">{s.title}</h3>
                  <p className="text-[#86868B] text-[15px] leading-relaxed">{s.desc}</p>
                </div>
                <ArrowRight className="w-5 h-5 text-[#D2D2D7] group-hover:text-[#0071E3] group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          CODE EXAMPLES — 3 tabs
      ═══════════════════════════════════════════════════ */}
      <section className="py-24 px-6 bg-[#F5F5F7] dark:bg-[#0A0A0A]">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-14">
            <p className="text-[#86868B] text-[12px] font-semibold uppercase tracking-[0.15em] mb-4">Contoh Kode</p>
            <h2 className="font-display font-semibold text-[40px] sm:text-[48px] tracking-[-0.03em] text-foreground">
              Go itu elegan dan ekspresif.
            </h2>
          </div>
          <CodeShowcase tabs={CODE_TABS} />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          CURRICULUM — HORIZONTAL SCROLL
      ═══════════════════════════════════════════════════ */}
      <div className="topics-scroll-section overflow-hidden">
        <div className="pt-24 pl-6 pb-6">
          <p className="text-[#86868B] text-[12px] font-semibold uppercase tracking-[0.15em] mb-4">Kurikulum</p>
          <h2 className="font-display font-semibold text-[40px] sm:text-[52px] tracking-[-0.03em] text-foreground mb-3">
            15 topik. 76 lessons.
          </h2>
          <p className="text-[#86868B] text-[17px]">Scroll → untuk melihat semua</p>
        </div>
        <div className="topics-track flex gap-4 px-6 pb-10 w-max">
          {TOPICS.map((t) => (
            <Link key={t.n} href={`/modules/${slugFromTitle(t.title)}`}
              className="feature-panel w-[200px] bg-[#F5F5F7] dark:bg-[#1C1C1E] rounded-[18px] p-5 flex-shrink-0 hover:scale-[1.03] transition-transform duration-200 block group">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-[13px] font-bold mb-4"
                style={{ backgroundColor: t.color }}>
                {t.n}
              </div>
              <p className="font-semibold text-[14px] text-foreground group-hover:text-[#0071E3] transition-colors leading-tight mb-2">
                {t.title}
              </p>
              <p className="text-[#86868B] text-[12px] mb-3">{t.lessons} lessons</p>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: t.level === "Beginner" ? "#34C75918" : t.level === "Intermediate" ? "#0071E318" : "#FF453A18",
                  color: t.level === "Beginner" ? "#34C759" : t.level === "Intermediate" ? "#0071E3" : "#FF453A",
                }}>
                {t.level}
              </span>
            </Link>
          ))}
          {/* End card */}
          <div className="w-[200px] bg-[#0071E3] rounded-[18px] p-5 flex-shrink-0 flex flex-col justify-between">
            <div>
              <p className="font-semibold text-[14px] text-white mb-2">Siap mulai?</p>
              <p className="text-white/70 text-[12px]">Mulai dari topik 01 dan selesaikan satu per satu.</p>
            </div>
            <Link href="/modules"
              className="inline-flex items-center gap-1.5 text-white text-[13px] font-medium mt-4 hover:gap-2.5 transition-all">
              Lihat semua <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════
          FEATURES DEEP DIVE — 3 panels
      ═══════════════════════════════════════════════════ */}
      <section className="py-24 px-6">
        <div className="mx-auto max-w-5xl space-y-5">
          <div className="text-center mb-16">
            <p className="text-[#86868B] text-[12px] font-semibold uppercase tracking-[0.15em] mb-4">Fitur</p>
            <h2 className="font-display font-semibold text-[40px] sm:text-[52px] tracking-[-0.03em] text-foreground">
              Dirancang untuk belajar<br />yang sesungguhnya.
            </h2>
          </div>

          {[
            {
              icon: Code2, color: "#0071E3", tag: "Interactive Editor",
              title: "Tulis dan jalankan Go\nlangsung di browser.",
              desc: "Editor Monaco (mesin VS Code) dengan syntax highlighting Go, auto-complete, dan keyboard shortcut Ctrl+Enter untuk run. Output muncul instan — tanpa install Go.",
              stats: [{ v: "5s", l: "Max timeout" }, { v: "50KB", l: "Max code size" }, { v: "0ms", l: "Setup time" }],
            },
            {
              icon: Trophy, color: "#FF9500", tag: "Gamifikasi",
              title: "Belajar sambil\nberkompetisi.",
              desc: "Tiap lesson selesai = +50 XP. Quiz sempurna = +25 XP bonus. 10 level dari Gopher Pemula hingga Go Legend. 15 badges eksklusif. Leaderboard mingguan dan bulanan.",
              stats: [{ v: "10", l: "Level" }, { v: "15", l: "Badges" }, { v: "50+", l: "XP per lesson" }],
            },
            {
              icon: Users, color: "#34C759", tag: "Komunitas",
              title: "Belajar bersama,\nbukan sendirian.",
              desc: "Kolom diskusi threaded di setiap lesson. Tanya, jawab, upvote pertanyaan yang paling membantu. Komentar pinned dari instruktur. Belajar dari kesulitan orang lain.",
              stats: [{ v: "∞", l: "Komentar" }, { v: "↑", l: "Upvote system" }, { v: "🧵", l: "Threaded" }],
            },
          ].map((f, i) => (
            <div key={f.tag}
              className={`feature-panel rounded-[24px] p-8 sm:p-10 flex flex-col sm:flex-row items-start gap-8 ${i % 2 === 1 ? "bg-[#F5F5F7] dark:bg-[#1C1C1E]" : "bg-background border border-[#D2D2D7]/50 dark:border-white/8"}`}>
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: f.color + "18" }}>
                    <f.icon className="w-4 h-4" style={{ color: f.color }} />
                  </div>
                  <span className="text-[12px] font-semibold uppercase tracking-widest" style={{ color: f.color }}>{f.tag}</span>
                </div>
                <h3 className="font-display font-semibold text-[28px] sm:text-[34px] tracking-tight text-foreground mb-4 whitespace-pre-line">
                  {f.title}
                </h3>
                <p className="text-[#86868B] text-[16px] leading-relaxed">{f.desc}</p>
              </div>
              <div className="flex sm:flex-col gap-4 sm:gap-3 shrink-0">
                {f.stats.map((s) => (
                  <div key={s.l} className="bg-background dark:bg-[#2C2C2E] rounded-[14px] px-5 py-4 text-center min-w-[90px]">
                    <p className="font-display font-semibold text-[24px] tracking-tight text-foreground">{s.v}</p>
                    <p className="text-[#86868B] text-[11px] mt-0.5">{s.l}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          FAQ
      ═══════════════════════════════════════════════════ */}
      <section className="py-24 px-6 bg-[#F5F5F7] dark:bg-[#0A0A0A]">
        <div className="mx-auto max-w-3xl">
          <div className="text-center mb-14">
            <p className="text-[#86868B] text-[12px] font-semibold uppercase tracking-[0.15em] mb-4">FAQ</p>
            <h2 className="font-display font-semibold text-[40px] tracking-[-0.03em] text-foreground">
              Pertanyaan yang sering ditanya.
            </h2>
          </div>
          <div className="faq-list space-y-3">
            {FAQS.map((f, i) => (
              <FaqItem key={i} q={f.q} a={f.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          FINAL CTA
      ═══════════════════════════════════════════════════ */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-[#0071E3]/5 to-background pointer-events-none" />
        <div className="final-cta relative mx-auto max-w-2xl text-center">
          <p className="text-[#86868B] text-[12px] font-semibold uppercase tracking-[0.15em] mb-6">Mulai hari ini</p>
          <h2 className="font-display font-semibold text-[44px] sm:text-[58px] tracking-[-0.04em] text-foreground mb-5 leading-[1.05]">
            Satu commit pertama<br />untuk masa depan.
          </h2>
          <p className="text-[#86868B] text-[18px] mb-10">
            Gratis. Tanpa kartu kredit. Tanpa install.<br />
            Mulai belajar Go dalam 30 detik.
          </p>
          <Link href="/register"
            className="group inline-flex items-center gap-2 bg-[#0071E3] text-white text-[17px] font-medium px-9 py-4 rounded-full hover:bg-[#0077ED] transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-[#0071E3]/30">
            Buat Akun Gratis
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <div className="flex items-center justify-center gap-6 mt-8 text-[13px] text-[#86868B]">
            {["Gratis selamanya", "76 lessons", "Bilingual ID/EN", "Tanpa setup"].map((t) => (
              <div key={t} className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-[#34C759]" /> {t}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-[#D2D2D7]/40 py-12 px-6">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8 mb-8">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#0071E3] flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <span className="font-display font-semibold text-[15px] text-foreground">GoLearn</span>
            </div>
            <div className="flex flex-wrap gap-x-8 gap-y-2 text-[13px] text-[#86868B]">
              <Link href="/modules" className="hover:text-foreground transition-colors">Kursus</Link>
              <Link href="/playground" className="hover:text-foreground transition-colors">Playground</Link>
              <Link href="/leaderboard" className="hover:text-foreground transition-colors">Leaderboard</Link>
              <Link href="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link>
              <Link href="/login" className="hover:text-foreground transition-colors">Masuk</Link>
              <Link href="/register" className="hover:text-foreground transition-colors">Daftar</Link>
            </div>
          </div>
          <div className="border-t border-[#D2D2D7]/40 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-[#86868B] text-[13px]">© 2026 GoLearn. Dibuat untuk Go learners Indonesia.</p>
            <p className="text-[#86868B] text-[13px]">
              <Link href="https://github.com/Kahfi10/go-learning" className="hover:text-foreground transition-colors">GitHub</Link>
            </p>
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
    <div className="bg-[#1C1C1E] rounded-[20px] overflow-hidden ring-1 ring-white/10 shadow-2xl">
      {/* Tab bar */}
      <div className="flex items-center gap-1 px-4 pt-4 border-b border-white/8">
        <div className="flex gap-1.5 mr-4">
          <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
          <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
          <div className="w-3 h-3 rounded-full bg-[#28C840]" />
        </div>
        {tabs.map((t, i) => (
          <button key={t.label} onClick={() => setActive(i)}
            className={`px-4 py-2 text-[13px] font-mono rounded-t-lg transition-colors ${
              active === i ? "bg-[#2C2C2E] text-white" : "text-white/40 hover:text-white/70"
            }`}>
            {t.label}.go
          </button>
        ))}
      </div>
      {/* Code */}
      <pre className="px-6 py-5 text-[13px] font-mono text-[#E5E5EA] leading-[1.7] overflow-x-auto min-h-[280px]">
        {tabs[active].code}
      </pre>
      {/* Output */}
      <div className="border-t border-white/8 px-6 py-3 flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-[#30D158]" />
          <span className="text-[#30D158] text-[11px] font-mono font-medium">Output</span>
        </div>
        <span className="text-white/50 text-[12px] font-mono">{tabs[active].output}</span>
      </div>
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="faq-item bg-background dark:bg-[#1C1C1E] rounded-[16px] overflow-hidden border border-[#D2D2D7]/40 dark:border-white/8">
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-[#F5F5F7] dark:hover:bg-[#242424] transition-colors">
        <span className="font-medium text-[15px] text-foreground pr-4">{q}</span>
        <ChevronDown className={`w-4 h-4 text-[#86868B] flex-shrink-0 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="px-6 pb-5 text-[#86868B] text-[14px] leading-relaxed border-t border-[#D2D2D7]/30 dark:border-white/5 pt-4">
          {a}
        </div>
      )}
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
