"use client";

import { useEffect, useState } from "react";
import { Share2, Check, ChevronDown } from "lucide-react";
import Navbar from "@/components/navigation/Navbar";
import CodeEditor from "@/components/editor/CodeEditor";
import { api, type Template } from "@/lib/api";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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

  useEffect(() => {
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
  }, []);

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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 pb-10 pt-24 sm:px-6 lg:px-8">
        <section className="relative rounded-[32px] border border-black/[0.06] bg-[#FBFBFD] p-6 shadow-[0_28px_80px_rgba(15,23,42,0.08)] dark:border-white/[0.08] dark:bg-[#0F0F11] dark:shadow-[0_28px_80px_rgba(0,0,0,0.32)] sm:p-8 lg:p-10">
          <div className="pointer-events-none absolute -left-10 top-0 h-44 w-44 rounded-full bg-[#0071E3]/14 blur-3xl" />
          <div className="pointer-events-none absolute right-0 top-8 h-40 w-40 rounded-full bg-[#34C759]/10 blur-3xl" />

          <div className="relative grid gap-8 xl:grid-cols-[minmax(0,1.16fr)_320px] xl:items-start">
            <div className="max-w-2xl">
              <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[#86868B]">
                Playground
              </p>
              <h1 className="mt-4 max-w-3xl font-display text-[30px] font-semibold tracking-tight text-foreground sm:text-[38px] xl:text-[46px] leading-[1.06]">
                Jalankan, ubah, dan bagikan snippet Go tanpa setup lokal.
              </h1>
              <p className="mt-3 max-w-xl text-[16px] leading-7 text-[#86868B] sm:text-[17px]">
                Pakai template, coba ide baru, lalu salin tautan dengan satu klik.
                Semua tetap rapi di browser.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                {QUICK_FACTS.map((fact) => (
                  <div
                    key={fact}
                    className="rounded-full border border-black/[0.06] bg-white/80 px-4 py-2 text-[13px] font-medium text-foreground shadow-[0_10px_30px_rgba(15,23,42,0.05)] dark:border-white/[0.08] dark:bg-white/[0.04] dark:shadow-none"
                  >
                    {fact}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-black/[0.06] bg-white/80 p-5 shadow-[0_20px_50px_rgba(15,23,42,0.06)] backdrop-blur-sm dark:border-white/[0.08] dark:bg-white/[0.04] dark:shadow-[0_20px_50px_rgba(0,0,0,0.24)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#86868B]">
                    Workspace
                  </p>
                  <h2 className="mt-3 font-display text-[24px] font-semibold tracking-tight text-foreground">
                    Kontrol cepat
                  </h2>
                  <p className="mt-2 text-[14px] leading-6 text-[#86868B]">
                    Buka starter code, lanjutkan eksperimen, lalu bagikan hasilnya.
                  </p>
                </div>

                <div className="rounded-full bg-[#0071E3]/10 px-3 py-1 text-[12px] font-medium text-[#0071E3]">
                  {templates.length || 0} template
                </div>
              </div>

              <div className="mt-6 rounded-[24px] bg-black/[0.03] p-3 dark:bg-white/[0.05]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#86868B]">
                  Template
                </p>
                <button
                  onClick={() => setShowTemplates(!showTemplates)}
                  className="mt-2 flex w-full items-center justify-between rounded-[18px] border border-black/[0.06] bg-white/85 px-4 py-3 text-left shadow-sm transition-colors hover:bg-white dark:border-white/[0.08] dark:bg-white/[0.04] dark:hover:bg-white/[0.07]"
                >
                  <div>
                    <span className="block text-[14px] font-medium text-foreground">
                      Pilih starter code
                    </span>
                    <span className="mt-1 block text-[12px] text-[#86868B]">
                      {showTemplates
                        ? "Tutup daftar template"
                        : "Buka contoh snippet populer"}
                    </span>
                  </div>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 text-[#86868B] transition-transform",
                      showTemplates && "rotate-180",
                    )}
                  />
                </button>

                {showTemplates && (
                  <div className="mt-3 overflow-hidden rounded-[18px] border border-black/[0.06] bg-white/85 dark:border-white/[0.08] dark:bg-white/[0.04]">
                    <div className="max-h-72 overflow-y-auto">
                      {templates.length > 0 ? (
                        templates.map((t) => (
                          <button
                            key={t.slug}
                            onClick={() => loadTemplate(t)}
                            className="flex w-full items-center justify-between gap-4 border-b border-black/[0.05] px-4 py-3 text-left transition-colors hover:bg-black/[0.03] last:border-0 dark:border-white/[0.06] dark:hover:bg-white/[0.05]"
                          >
                            <div>
                              <span className="block text-[13px] font-medium text-foreground">
                                {t.name}
                              </span>
                              <span className="mt-1 block text-[11px] uppercase tracking-[0.14em] text-[#86868B]">
                                {t.slug}
                              </span>
                            </div>
                            <span className="text-[12px] text-[#86868B]">Gunakan</span>
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-4 text-[13px] text-[#86868B]">
                          Template belum tersedia.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={shareCode}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-[#0071E3] px-5 py-3 text-[14px] font-medium text-white shadow-[0_18px_40px_rgba(0,113,227,0.24)] transition-colors hover:bg-[#0077ED]"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4" />
                    Link tersalin
                  </>
                ) : (
                  <>
                    <Share2 className="h-4 w-4" />
                    Bagikan kode
                  </>
                )}
              </button>

              <p className="mt-3 text-[12px] leading-6 text-[#86868B]">
                Tautan yang disalin akan membuka kode saat ini langsung di playground.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-[32px] border border-black/[0.06] bg-[#FBFBFD] p-4 shadow-[0_24px_60px_rgba(15,23,42,0.07)] dark:border-white/[0.08] dark:bg-[#101012] dark:shadow-[0_24px_60px_rgba(0,0,0,0.28)] sm:p-6">
          <div className="flex flex-col gap-3 border-b border-black/[0.06] pb-4 dark:border-white/[0.08] sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#86868B]">
                Editor
              </p>
              <h2 className="mt-2 font-display text-[24px] font-semibold tracking-tight text-foreground">
                Go sandbox
              </h2>
            </div>

            <div className="flex flex-wrap gap-2 text-[12px] text-[#86868B]">
              <span className="rounded-full bg-black/[0.03] px-3 py-1.5 dark:bg-white/[0.05]">
                Ctrl/Cmd + Enter untuk Run
              </span>
              <span className="rounded-full bg-black/[0.03] px-3 py-1.5 dark:bg-white/[0.05]">
                Reset dan copy ada di toolbar editor
              </span>
            </div>
          </div>

          <div className="mt-5 rounded-[26px] ring-1 ring-black/[0.04] dark:ring-white/[0.06]">
            <CodeEditor
              defaultCode={code}
              onCodeChange={setCode}
              height="clamp(420px, calc(100vh - 360px), 760px)"
            />
          </div>
        </section>
      </main>
    </div>
  );
}
