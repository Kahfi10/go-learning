"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, BookOpen, Hash } from "lucide-react";
import { api, type SearchResult } from "@/lib/api";
import { cn } from "@/lib/utils";

export default function CommandSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selected, setSelected] = useState(0);
  const [loading, setLoading] = useState(false);

  // Open with Ctrl/Cmd+K
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setOpen(o => !o); }
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Search debounce
  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    setLoading(true);
    const t = setTimeout(() => {
      api.search(query).then((r) => { setResults(r ?? []); setSelected(0); }).catch(() => {}).finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  function navigate(r: SearchResult) {
    const topicSlug = r.topic_slug ?? r.topic.replace(/^topic-\d+-/, "");
    router.push(`/modules/${topicSlug}/${r.id}`);
    setOpen(false);
    setQuery("");
  }

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowDown") { e.preventDefault(); setSelected(s => Math.min(s + 1, results.length - 1)); }
      if (e.key === "ArrowUp") { e.preventDefault(); setSelected(s => Math.max(s - 1, 0)); }
      if (e.key === "Enter" && results[selected]) navigate(results[selected]);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, results, selected]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] px-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setOpen(false)} />

      {/* Dialog */}
      <div className="relative w-full max-w-lg bg-background border border-[#D2D2D7] dark:border-white/10 rounded-[18px] shadow-2xl overflow-hidden">
        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#D2D2D7]/50">
          <Search className="w-4 h-4 text-[#86868B] flex-shrink-0" />
          <input
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Cari lesson, topik..."
            className="flex-1 bg-transparent text-[15px] text-foreground placeholder:text-[#86868B] outline-none"
          />
          <kbd className="text-[11px] text-[#86868B] bg-[#F5F5F7] dark:bg-[#2C2C2E] px-2 py-0.5 rounded border border-[#D2D2D7] dark:border-white/10">ESC</kbd>
        </div>

        {/* Results */}
        <div className="max-h-72 overflow-y-auto py-2">
          {loading && (
            <p className="px-4 py-3 text-[13px] text-[#86868B]">Mencari...</p>
          )}
          {!loading && query && results.length === 0 && (
            <p className="px-4 py-3 text-[13px] text-[#86868B]">Tidak ditemukan untuk "{query}"</p>
          )}
          {!loading && !query && (
            <p className="px-4 py-3 text-[13px] text-[#86868B]">Ketik untuk mencari lesson atau topik...</p>
          )}
          {results.map((r, i) => (
            <button key={`${r.topic}-${r.id}`} onClick={() => navigate(r)}
              className={cn(
                "w-full text-left flex items-center gap-3 px-4 py-2.5 transition-colors",
                i === selected ? "bg-[#0071E3]/10 text-[#0071E3]" : "hover:bg-[#F5F5F7] dark:hover:bg-[#1C1C1E] text-foreground"
              )}>
              <BookOpen className="w-4 h-4 flex-shrink-0 text-[#86868B]" />
              <div className="min-w-0">
                <p className="text-[13px] font-medium truncate">{r.title_id}</p>
                <p className="text-[11px] text-[#86868B] truncate">{r.topic_title_id ?? r.topic.replace(/^topic-\d+-/, "")}</p>
              </div>
              <Hash className="w-3.5 h-3.5 text-[#86868B] ml-auto flex-shrink-0" />
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t border-[#D2D2D7]/30 px-4 py-2 flex items-center gap-3 text-[11px] text-[#86868B]">
          <span>↑↓ navigasi</span><span>↵ buka</span><span>ESC tutup</span>
        </div>
      </div>
    </div>
  );
}
