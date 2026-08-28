"use client";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { Play, RotateCcw, Copy, Check, Loader2 } from "lucide-react";
import { loader } from "@monaco-editor/react";
import { api, type ExecuteResult } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

loader.config({
  paths: {
    vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/vs",
  },
});

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-[#1C1C1E] flex items-center justify-center">
      <Loader2 className="w-5 h-5 text-white/40 animate-spin" />
    </div>
  ),
});

interface Props {
  defaultCode: string;
  onCodeChange?: (code: string) => void;
  height?: string;
  onRun?: (result: ExecuteResult) => void;
}

export default function CodeEditor({ defaultCode, onCodeChange, height = "320px", onRun }: Props) {
  const [code, setCode] = useState(defaultCode);
  const [result, setResult] = useState<ExecuteResult | null>(null);
  const [running, setRunning] = useState(false);
  const [copied, setCopied] = useState(false);
  const lastDefaultRef = useRef(defaultCode);

  useEffect(() => {
    if (defaultCode !== lastDefaultRef.current && code === lastDefaultRef.current) {
      setCode(defaultCode);
    }
    lastDefaultRef.current = defaultCode;
  }, [code, defaultCode]);

  function handleChange(val: string | undefined) {
    const v = val ?? "";
    setCode(v);
    onCodeChange?.(v);
  }

  async function runCode() {
    setRunning(true);
    setResult(null);
    try {
      const r = await api.execute(code);
      setResult(r);
      onRun?.(r);
    } catch (e: any) {
      toast.error(e.message ?? "Gagal menjalankan kode");
    } finally {
      setRunning(false);
    }
  }

  function reset() { setCode(defaultCode); setResult(null); onCodeChange?.(defaultCode); }

  async function copyCode() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="rounded-[18px] overflow-hidden border border-[#D2D2D7]/30 dark:border-white/10 shadow-md">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#1C1C1E] border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
          <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
          <div className="w-3 h-3 rounded-full bg-[#28C840]" />
          <span className="ml-2 text-white/40 text-[12px] font-mono">main.go</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={reset} className="p-1.5 rounded-md text-white/40 hover:text-white/80 hover:bg-white/10 transition-colors" title="Reset">
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button onClick={copyCode} className="p-1.5 rounded-md text-white/40 hover:text-white/80 hover:bg-white/10 transition-colors" title="Copy">
            {copied ? <Check className="w-3.5 h-3.5 text-[#30D158]" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={runCode}
            disabled={running}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors",
              running ? "bg-white/10 text-white/40" : "bg-[#0071E3] text-white hover:bg-[#0077ED]"
            )}
          >
            {running ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
            {running ? "Running..." : "Run"}
          </button>
        </div>
      </div>

      {/* Monaco */}
      <MonacoEditor
        height={height}
        language="go"
        value={code}
        onChange={handleChange}
        theme="vs-dark"
        options={{
          fontSize: 14,
          fontFamily: "'JetBrains Mono', monospace",
          lineHeight: 22,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          padding: { top: 16, bottom: 16 },
          renderLineHighlight: "line",
          suggest: { showKeywords: true },
          tabSize: 4,
        }}
        onMount={(editor, monaco) => {
          editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, runCode);
        }}
      />

      {/* Output */}
      {result !== null && (
        <div className="bg-[#161618] border-t border-white/10 p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className={cn("text-[11px] font-medium font-mono", result.timedOut ? "text-[#FF9500]" : result.stderr ? "text-[#FF453A]" : "text-[#30D158]")}>
              {result.timedOut ? "⏱ TIMEOUT" : result.stderr && !result.stdout ? "✗ ERROR" : "✓ OUTPUT"}
            </span>
            <span className="text-[11px] text-white/30 font-mono">{result.executionTimeMs}ms</span>
          </div>
          <pre className="text-[13px] font-mono text-[#E5E5EA] whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
            {result.stdout || result.stderr || "(no output)"}
          </pre>
          {result.stderr && result.stdout && (
            <pre className="text-[13px] font-mono text-[#FF453A] whitespace-pre-wrap mt-2">{result.stderr}</pre>
          )}
        </div>
      )}
    </div>
  );
}
