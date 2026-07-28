"use client";
import { useEffect, useState } from "react";
import { Share2, Check, ChevronDown } from "lucide-react";
import Navbar from "@/components/navigation/Navbar";
import CodeEditor from "@/components/editor/CodeEditor";
import { api, type Template } from "@/lib/api";
import { toast } from "sonner";

export default function PlaygroundPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [code, setCode] = useState(`package main\n\nimport "fmt"\n\nfunc main() {\n\tfmt.Println("Hello, GoLearn Playground!")\n}`);
  const [copied, setCopied] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);

  useEffect(() => {
    api.playground.templates().then(setTemplates).catch(() => {});
    // Load from URL ?code=
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const encoded = params.get("code");
      if (encoded) { try { setCode(atob(encoded)); } catch {} }
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
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1 pt-[52px] flex flex-col">
        {/* Toolbar */}
        <div className="border-b border-[#D2D2D7]/50 bg-background px-6 py-3 flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-display font-semibold text-[17px] text-foreground">Playground</span>
            <span className="text-[#86868B] text-[13px]">— Jalankan Go tanpa setup</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {/* Templates */}
            <div className="relative">
              <button onClick={() => setShowTemplates(!showTemplates)}
                className="flex items-center gap-1.5 text-[13px] font-medium text-foreground bg-[#F5F5F7] dark:bg-[#1C1C1E] border border-[#D2D2D7]/50 px-3 py-1.5 rounded-[10px] hover:bg-[#EBEBED] transition-colors">
                Template <ChevronDown className="w-3.5 h-3.5" />
              </button>
              {showTemplates && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-background border border-[#D2D2D7] rounded-[12px] shadow-lg z-10 overflow-hidden">
                  {templates.map((t) => (
                    <button key={t.slug} onClick={() => loadTemplate(t)}
                      className="w-full text-left px-4 py-2.5 text-[13px] text-foreground hover:bg-[#F5F5F7] dark:hover:bg-[#1C1C1E] transition-colors border-b border-[#D2D2D7]/30 last:border-0">
                      {t.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Share */}
            <button onClick={shareCode}
              className="flex items-center gap-1.5 text-[13px] font-medium text-white bg-[#0071E3] px-3 py-1.5 rounded-[10px] hover:bg-[#0077ED] transition-colors">
              {copied ? <><Check className="w-3.5 h-3.5" /> Disalin!</> : <><Share2 className="w-3.5 h-3.5" /> Bagikan</>}
            </button>
          </div>
        </div>

        {/* Editor full height */}
        <div className="flex-1 p-6">
          <CodeEditor
            defaultCode={code}
            onCodeChange={setCode}
            height="calc(100vh - 180px)"
          />
        </div>
      </div>
    </div>
  );
}
