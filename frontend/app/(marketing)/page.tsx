"use client";
import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Code2, Trophy, Users, Zap, CheckCircle } from "lucide-react";
import Navbar from "@/components/navigation/Navbar";

const TOPICS = [
  { n: "01", title: "Getting Started", color: "#0071E3", level: "Beginner" },
  { n: "02", title: "Variables & Types", color: "#34C759", level: "Beginner" },
  { n: "03", title: "Functions", color: "#FF9500", level: "Beginner" },
  { n: "04", title: "Control Structures", color: "#FF3B30", level: "Beginner" },
  { n: "05", title: "Collections", color: "#5AC8FA", level: "Beginner" },
  { n: "06", title: "Structs & Methods", color: "#AF52DE", level: "Beginner" },
  { n: "07", title: "Interfaces", color: "#64D2FF", level: "Beginner" },
  { n: "08", title: "Pointers", color: "#30D158", level: "Intermediate" },
  { n: "09", title: "Error Handling", color: "#FF453A", level: "Intermediate" },
  { n: "10", title: "Goroutines & Channels", color: "#0A84FF", level: "Intermediate" },
  { n: "11", title: "Packages & Modules", color: "#BF5AF2", level: "Intermediate" },
  { n: "12", title: "File I/O & OS", color: "#FFD60A", level: "Intermediate" },
  { n: "13", title: "Testing in Go", color: "#32D74B", level: "Advanced" },
  { n: "14", title: "HTTP & Web", color: "#FF9F0A", level: "Advanced" },
  { n: "15", title: "Go Patterns", color: "#FF2D55", level: "Advanced" },
];

const FEATURES = [
  { icon: Code2, title: "Code di Browser", title_en: "Code in Browser", desc: "Editor Monaco langsung di browser. Jalankan Go tanpa install apapun.", color: "#0071E3" },
  { icon: BookOpen, title: "76 Lessons Bilingual", title_en: "76 Bilingual Lessons", desc: "Konten lengkap bahasa Indonesia & Inggris, dari dasar hingga production patterns.", color: "#34C759" },
  { icon: Trophy, title: "Gamifikasi XP", title_en: "XP Gamification", desc: "Kumpulkan XP, naik level, raih badges, dan bersaing di leaderboard.", color: "#FF9500" },
  { icon: Users, title: "Diskusi Komunitas", title_en: "Community Discussion", desc: "Tanya jawab dan diskusi di setiap lesson bersama sesama Go learners.", color: "#AF52DE" },
];

const STATS = [
  { value: 15, label: "Topik", suffix: "" },
  { value: 76, label: "Lessons", suffix: "+" },
  { value: 300, label: "Soal Quiz", suffix: "+" },
  { value: 0, label: "Install required", suffix: "" },
];

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ctx: any;
    import("gsap").then(({ gsap }) => {
      import("gsap/ScrollTrigger").then(({ ScrollTrigger }) => {
        gsap.registerPlugin(ScrollTrigger);
        ctx = gsap.context(() => {
          // Hero entrance
          gsap.from(".hero-badge", { opacity: 0, y: 16, duration: 0.5, ease: "expo.out", delay: 0.1 });
          gsap.from(".hero-headline", { opacity: 0, y: 32, duration: 0.7, ease: "expo.out", delay: 0.2 });
          gsap.from(".hero-sub", { opacity: 0, y: 24, duration: 0.7, ease: "expo.out", delay: 0.35 });
          gsap.from(".hero-cta", { opacity: 0, y: 20, duration: 0.6, ease: "expo.out", delay: 0.5 });
          gsap.from(".hero-code", { opacity: 0, scale: 0.97, duration: 0.8, ease: "expo.out", delay: 0.6 });

          // Stats counter
          document.querySelectorAll(".stat-number").forEach((el) => {
            const target = parseInt(el.getAttribute("data-target") ?? "0", 10);
            const obj = { val: 0 };
            gsap.to(obj, {
              val: target, duration: 1.6, ease: "power2.out",
              snap: { val: 1 },
              scrollTrigger: { trigger: el, start: "top 85%", once: true },
              onUpdate() { el.textContent = Math.round(obj.val).toString(); },
            });
          });

          // Feature cards
          gsap.from(".feature-card", {
            opacity: 0, y: 40, duration: 0.6, ease: "expo.out", stagger: 0.1,
            scrollTrigger: { trigger: ".features-grid", start: "top 80%", once: true },
          });

          // Topic cards
          gsap.from(".topic-card", {
            opacity: 0, y: 32, duration: 0.5, ease: "expo.out", stagger: 0.05,
            scrollTrigger: { trigger: ".topics-grid", start: "top 80%", once: true },
          });
        });
      });
    });
    return () => ctx?.revert();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* ── Hero ───────────────────────────────────────────── */}
      <section ref={heroRef} className="pt-28 pb-20 px-6">
        <div className="mx-auto max-w-4xl text-center">
          <div className="hero-badge inline-flex items-center gap-2 bg-[#0071E3]/10 text-[#0071E3] text-[13px] font-medium px-4 py-1.5 rounded-full mb-6">
            <Zap className="w-3.5 h-3.5" />
            Platform Belajar Go #1 Bahasa Indonesia
          </div>

          <h1 className="hero-headline font-display font-semibold text-[52px] sm:text-[68px] leading-[1.05] tracking-[-0.03em] text-foreground mb-6">
            Learn Go.
            <br />
            <span className="text-[#0071E3]">The Elegant Way.</span>
          </h1>

          <p className="hero-sub text-xl text-[#86868B] max-w-2xl mx-auto mb-10 leading-relaxed">
            Platform interaktif untuk belajar Go dari dasar hingga production patterns.
            Tulis dan jalankan kode langsung di browser — tanpa install apapun.
          </p>

          <div className="hero-cta flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/modules"
              className="inline-flex items-center gap-2 bg-[#0071E3] text-white text-[15px] font-medium px-6 py-3 rounded-full hover:bg-[#0077ED] transition-colors"
            >
              Mulai Belajar <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/playground"
              className="inline-flex items-center gap-2 text-[#0071E3] text-[15px] font-medium px-6 py-3 rounded-full border border-[#0071E3]/30 hover:bg-[#0071E3]/5 transition-colors"
            >
              <Code2 className="w-4 h-4" /> Coba Playground
            </Link>
          </div>
        </div>

        {/* Hero code preview */}
        <div className="hero-code mx-auto max-w-2xl mt-14">
          <div className="bg-[#1C1C1E] rounded-[18px] overflow-hidden shadow-2xl">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
              <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
              <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
              <div className="w-3 h-3 rounded-full bg-[#28C840]" />
              <span className="ml-2 text-white/40 text-[12px] font-mono">main.go</span>
            </div>
            <pre className="p-6 text-[14px] font-mono text-[#E5E5EA] leading-relaxed overflow-x-auto">
{`package main

import "fmt"

func main() {
    messages := []string{
        "Selamat datang di GoLearn!",
        "Belajar Go itu menyenangkan.",
        "Mari mulai perjalananmu.",
    }
    for _, msg := range messages {
        fmt.Println(msg)
    }
}`}
            </pre>
            <div className="px-6 py-3 bg-black/30 border-t border-white/5 flex items-center gap-3">
              <span className="text-[#30D158] text-[12px] font-mono">▶ Output</span>
              <span className="text-white/60 text-[12px] font-mono">Selamat datang di GoLearn!</span>
            </div>
          </div>
        </div>
      </section>

      <div className="border-t border-[#D2D2D7]/50" />

      {/* ── Stats ──────────────────────────────────────────── */}
      <section ref={statsRef} className="py-16 px-6">
        <div className="mx-auto max-w-4xl grid grid-cols-2 sm:grid-cols-4 gap-8">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <div className="font-display font-semibold text-[42px] tracking-tight text-foreground">
                <span className="stat-number" data-target={s.value}>0</span>
                <span>{s.suffix}</span>
              </div>
              <div className="text-[#86868B] text-[15px] mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="border-t border-[#D2D2D7]/50" />

      {/* ── Features ───────────────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-14">
            <p className="text-[#86868B] text-[13px] font-medium uppercase tracking-widest mb-3">Fitur</p>
            <h2 className="font-display font-semibold text-[36px] tracking-tight text-foreground">
              Dirancang untuk belajar yang efektif
            </h2>
          </div>
          <div className="features-grid grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map((f) => (
              <div key={f.title} className="feature-card bg-[#F5F5F7] dark:bg-[#1C1C1E] rounded-[18px] p-6">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: f.color + "20" }}
                >
                  <f.icon className="w-5 h-5" style={{ color: f.color }} />
                </div>
                <h3 className="font-semibold text-[15px] text-foreground mb-2">{f.title}</h3>
                <p className="text-[#86868B] text-[13px] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="border-t border-[#D2D2D7]/50" />

      {/* ── Topics Grid ────────────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-14">
            <p className="text-[#86868B] text-[13px] font-medium uppercase tracking-widest mb-3">Kurikulum</p>
            <h2 className="font-display font-semibold text-[36px] tracking-tight text-foreground">
              15 Topik, 76 Lessons
            </h2>
            <p className="text-[#86868B] mt-3 text-[17px]">Dari Hello World hingga production-ready Go patterns</p>
          </div>

          <div className="topics-grid grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {TOPICS.map((t) => (
              <Link
                key={t.n}
                href={`/modules/${slugFromTitle(t.title)}`}
                className="topic-card group bg-[#F5F5F7] dark:bg-[#1C1C1E] rounded-[14px] p-4 hover:scale-[1.02] transition-transform duration-200 cursor-pointer"
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-[12px] font-bold mb-3"
                  style={{ backgroundColor: t.color }}
                >
                  {t.n}
                </div>
                <p className="text-[13px] font-medium text-foreground leading-tight">{t.title}</p>
                <span
                  className="inline-block mt-2 text-[11px] font-medium px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: t.color + "18", color: t.color }}
                >
                  {t.level}
                </span>
              </Link>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              href="/modules"
              className="inline-flex items-center gap-2 text-[#0071E3] text-[15px] font-medium hover:underline"
            >
              Lihat semua topik <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <div className="border-t border-[#D2D2D7]/50" />

      {/* ── CTA ────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display font-semibold text-[42px] tracking-tight text-foreground mb-4">
            Siap mulai belajar Go?
          </h2>
          <p className="text-[#86868B] text-[17px] mb-8">Gratis selamanya. Tidak perlu install apapun.</p>
          <Link
            href="/modules"
            className="inline-flex items-center gap-2 bg-[#0071E3] text-white text-[15px] font-medium px-8 py-3.5 rounded-full hover:bg-[#0077ED] transition-colors"
          >
            Mulai Gratis <ArrowRight className="w-4 h-4" />
          </Link>
          <div className="flex items-center justify-center gap-6 mt-8 text-[13px] text-[#86868B]">
            {["Gratis selamanya", "76 lessons", "Bilingual ID/EN"].map((t) => (
              <div key={t} className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-[#34C759]" /> {t}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="border-t border-[#D2D2D7]/50 py-10 px-6">
        <div className="mx-auto max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#0071E3] flex items-center justify-center">
              <BookOpen className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-display font-semibold text-[14px] text-foreground">GoLearn</span>
          </div>
          <p className="text-[#86868B] text-[13px]">© 2026 GoLearn. Dibuat dengan ❤️ untuk Go learners Indonesia.</p>
          <div className="flex items-center gap-4 text-[13px] text-[#86868B]">
            <Link href="/modules" className="hover:text-foreground transition-colors">Kursus</Link>
            <Link href="/playground" className="hover:text-foreground transition-colors">Playground</Link>
            <Link href="/leaderboard" className="hover:text-foreground transition-colors">Leaderboard</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function slugFromTitle(title: string): string {
  const map: Record<string, string> = {
    "Getting Started": "getting-started",
    "Variables & Types": "variables-types",
    "Functions": "functions",
    "Control Structures": "control-structures",
    "Collections": "collections",
    "Structs & Methods": "structs-methods",
    "Interfaces": "interfaces",
    "Pointers": "pointers",
    "Error Handling": "error-handling",
    "Goroutines & Channels": "goroutines-channels",
    "Packages & Modules": "packages-modules",
    "File I/O & OS": "file-io",
    "Testing in Go": "testing",
    "HTTP & Web": "http-web",
    "Go Patterns": "go-patterns",
  };
  return map[title] ?? title.toLowerCase().replace(/\s+/g, "-");
}
