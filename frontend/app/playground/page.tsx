"use client";

import { useEffect, useState, useRef } from "react";
import { Share2, Check, ChevronDown, Terminal, Loader2 } from "lucide-react";
import Navbar from "@/components/navigation/Navbar";
import CodeEditor from "@/components/editor/CodeEditor";
import { api, type Template } from "@/lib/api";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { gsap } from "gsap";

const QUICK_FACTS = [
  "Eksekusi instan",
  "Template siap pakai",
  "Tautan sekali klik",
];

export default function PlaygroundPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [code, setCode] = useState(`package main\n\nimport "fmt"\n\nfunc main() {\n\tfmt.Println("Hello, GoLearn Playground!")\n}`);
  const [copied, setCopied] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [isBooting, setIsBooting] = useState(true);
  const editorContainerRef = useRef<HTMLElement>(null);
  const leftColRef = useRef<HTMLDivElement>(null);
  const rightColRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Artificial 1-second delay for booting effect
    const timer = setTimeout(() => {
      setIsBooting(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isBooting) return;

    // Initial load animations after boot
    const ctx = gsap.context(() => {
      gsap.fromTo(leftColRef.current,
        { opacity: 0, x: -30 },
        { opacity: 1, x: 0, duration: 0.8, ease: "power3.out", delay: 0.1 }
      );
      
      gsap.fromTo(rightColRef.current,
        { opacity: 0, x: 30 },
        { opacity: 1, x: 0, duration: 0.8, ease: "power3.out", delay: 0.2 }
      );

      gsap.fromTo(editorContainerRef.current,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", delay: 0.3 }
      );
    });

    api.playground.templates().then(setTemplates).catch(() => {});

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const encoded = params.get("code");

      if (encoded) {
        try {
          setCode(atob(encoded));
        } catch {}
      }
    }

    return () => ctx.revert(); // Cleanup GSAP
  }, [isBooting]);

  function loadTemplate(t: Template) {
    setCode(t.code);
    setShowTemplates(false);
    toast.success(`Template "${t.name}" dimuat`);
  }

  async function shareCode() {
    const encoded = btoa(code);
    const url = `${window.location.origin}/playground?code=${encoded}`;

    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Link berhasil disalin!");
  }

  if (isBooting) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center pb-20">
          <div className="w-16 h-16 bg-[#0071E3]/10 rounded-[20px] flex items-center justify-center mb-6 animate-pulse">
            <Terminal className="w-8 h-8 text-[#0071E3]" />
          </div>
          <div className="flex items-center gap-3">
            <Loader2 className="w-4 h-4 text-[#86868B] animate-spin" />
            <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#86868B]">
              Booting Workspace...
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto w-full max-w-screen-2xl px-4 sm:px-6 md:px-8 pb-10 pt-32 overflow-x-hidden">
        <section className="relative w-full mb-12 sm:mb-16">
          <div className="grid xl:grid-cols-[minmax(0,1fr)_320px] gap-8 xl:gap-12 2xl:grid-cols-[1fr_auto] 2xl:gap-16 items-end">
            <div ref={leftColRef} className="max-w-2xl opacity-0">
              <p className="text-[#0071E3] text-[13px] font-semibold uppercase tracking-[0.2em] mb-3">
                Playground
              </p>
              <h1 className="font-display text-[40px] sm:text-[48px] xl:text-[56px] font-semibold tracking-[-0.04em] text-foreground leading-[1.05] mb-5">
                Jalankan snippet Go, di mana saja.
              </h1>
              <p className="text-[17px] sm:text-[19px] leading-relaxed text-[#86868B] max-w-xl text-balance">
                Tanpa perlu instalasi. Coba ide-idemu secara instan, gunakan template yang tersedia, dan bagikan kodemu dengan satu klik.
              </p>

              <div className="mt-8 flex flex-wrap gap-2">
                {QUICK_FACTS.map((fact) => (
                  <div
                    key={fact}
                    className="inline-flex items-center gap-1.5 rounded-full border border-transparent bg-[#F5F5F7] dark:bg-[#1C1C1E] px-4 py-2 text-[13px] font-medium text-[#86868B]"
                  >
                    <Check className="w-3.5 h-3.5" />
                    {fact}
                  </div>
                ))}
              </div>
            </div>

            <div ref={rightColRef} className="w-full xl:w-[320px] 2xl:w-[340px] bg-white dark:bg-[#111214] rounded-[24px] p-6 sm:p-7 border border-[#D2D2D7]/60 dark:border-white/10 shadow-sm opacity-0">
              <div className="flex items-start justify-between gap-4 mb-5">
                <div>
                  <p className="text-[12px] font-semibold uppercase tracking-[0.15em] text-[#86868B]">
                    Workspace
                  </p>
                  <h2 className="mt-2 font-display text-[24px] font-semibold tracking-tight text-foreground leading-snug">
                    Kontrol Cepat
                  </h2>
                </div>
                <div className="rounded-full bg-[#0071E3]/10 px-3 py-1 text-[12px] font-medium text-[#0071E3]">
                  {templates.length || 0} template
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={() => setShowTemplates(!showTemplates)}
                  className="flex w-full items-center justify-between rounded-[16px] border border-[#D2D2D7]/60 dark:border-white/10 bg-[#F5F5F7]/50 dark:bg-[#1C1C1E]/50 px-4 py-3 text-left transition-colors hover:bg-white dark:hover:bg-[#2C2C2E]"
                >
                  <span className="block text-[14px] font-medium text-foreground">
                    Pilih starter code
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 text-[#86868B] transition-transform",
                      showTemplates && "rotate-180",
                    )}
                  />
                </button>

                {showTemplates && (
                  <div className="mt-2 overflow-hidden rounded-[16px] border border-[#D2D2D7]/60 dark:border-white/10 bg-white dark:bg-[#111214] shadow-md">
                    <div className="max-h-56 overflow-y-auto">
                      {templates.length > 0 ? (
                        templates.map((t) => (
                          <button
                            key={t.slug}
                            onClick={() => loadTemplate(t)}
                            className="flex w-full items-center justify-between gap-4 border-b border-[#D2D2D7]/40 dark:border-white/5 px-4 py-3 text-left transition-colors hover:bg-[#F5F5F7] dark:hover:bg-[#1C1C1E] last:border-0"
                          >
                            <span className="block text-[13px] font-medium text-foreground">
                              {t.name}
                            </span>
                            <span className="text-[11px] text-[#0071E3] font-medium uppercase tracking-wider">Pilih</span>
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-4 text-[13px] text-[#86868B] text-center">
                          Belum ada template.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={shareCode}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#0071E3] px-5 py-3 text-[14px] font-medium text-white shadow-sm transition-colors hover:bg-[#0077ED]"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4" /> Link tersalin
                  </>
                ) : (
                  <>
                    <Share2 className="h-4 w-4" /> Bagikan kode
                  </>
                )}
              </button>
            </div>
          </div>
        </section>

        <section ref={editorContainerRef} className="rounded-[28px] border border-[#D2D2D7]/60 dark:border-white/10 bg-white dark:bg-[#111214] p-5 sm:p-6 shadow-sm opacity-0">
          <div className="flex flex-col gap-3 border-b border-[#D2D2D7]/40 dark:border-white/5 pb-4 sm:flex-row sm:items-end sm:justify-between mb-5">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#86868B]">
                Editor
              </p>
              <h2 className="mt-1 font-display text-[20px] font-semibold tracking-tight text-foreground">
                Go sandbox
              </h2>
            </div>

            <div className="flex flex-wrap gap-2 text-[12px] text-[#86868B]">
              <span className="rounded-full bg-[#F5F5F7] dark:bg-[#1C1C1E] px-3 py-1.5 font-mono">
                ⌘ + Enter to Run
              </span>
              <span className="rounded-full bg-[#F5F5F7] dark:bg-[#1C1C1E] px-3 py-1.5 font-mono">
                Auto-format
              </span>
            </div>
          </div>

          <div className="overflow-hidden rounded-[20px] ring-1 ring-[#D2D2D7]/50 dark:ring-white/10">
            <CodeEditor
              defaultCode={code}
              onCodeChange={setCode}
              height="min(62vh, 760px)"
            />
          </div>
        </section>
      </main>
    </div>
  );
}
