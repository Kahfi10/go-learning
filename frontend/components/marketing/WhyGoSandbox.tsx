"use client";

import { useEffect, useState } from "react";
import { Terminal, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const CODE_EXAMPLES = [
  {
    id: "concurrency",
    label: "01. Concurrency",
    title: "1M+ Requests, No Problem",
    desc: "Menjalankan fungsi secara paralel (goroutine) semudah menambahkan kata 'go' di depannya.",
    code: `package main

import (
    "fmt"
    "time"
)

func processTask(id int) {
    fmt.Printf("Task %d is running\\n", id)
}

func main() {
    // Menjalankan 100,000 task secara bersamaan
    for i := 1; i <= 100000; i++ {
        go processTask(i) 
    }

    time.Sleep(1 * time.Second)
    fmt.Println("All tasks processed lightning fast!")
}`,
  },
  {
    id: "simplicity",
    label: "02. Simplicity",
    title: "Web Server 5 Baris",
    desc: "Tidak butuh framework raksasa atau konfigurasi rumit. Standard library Go sudah siap produksi.",
    code: `package main

import (
    "net/http"
)

func main() {
    // Web server super cepat bawaan Go
    http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
        w.Write([]byte("Hello, World!"))
    })
    
    // Siap melayani jutaan request di port 8080
    http.ListenAndServe(":8080", nil)
}`,
  },
  {
    id: "performance",
    label: "03. Performance",
    title: "Kecepatan setara C++",
    desc: "Go dikompilasi langsung ke bahasa mesin (machine code), mengeksekusi algoritma tanpa overhead interpreter.",
    code: `package main

import "fmt"

func fibonacci(n int) int {
    if n <= 1 {
        return n
    }
    return fibonacci(n-1) + fibonacci(n-2)
}

func main() {
    // Dikompilasi jadi single binary executable
    // Berjalan secepat aplikasi native C/C++
    result := fibonacci(40)
    fmt.Println("Result:", result)
}`,
  },
];

export default function WhyGoSandbox() {
  const [activeId, setActiveId] = useState(CODE_EXAMPLES[0].id);
  const [typedCode, setTypedCode] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const [copied, setCopied] = useState(false);

  const activeExample = CODE_EXAMPLES.find((ex) => ex.id === activeId) ?? CODE_EXAMPLES[0];

  useEffect(() => {
    setTypedCode("");
    setIsTyping(true);
    let i = 0;
    
    // Very fast typing effect to not annoy users
    const interval = setInterval(() => {
      setTypedCode(activeExample.code.substring(0, i));
      i += 3; // type 3 chars at a time
      if (i > activeExample.code.length) {
        setTypedCode(activeExample.code);
        setIsTyping(false);
        clearInterval(interval);
      }
    }, 10);

    return () => clearInterval(interval);
  }, [activeId]);

  const handleCopy = () => {
    navigator.clipboard.writeText(activeExample.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="py-24 sm:py-32 px-4 sm:px-6 bg-[#FBFBFD] dark:bg-[#0A0A0A] min-h-screen flex flex-col justify-center overflow-hidden">
      <div className="mx-auto w-full max-w-screen-xl relative z-10">
        
        <div className="why-header text-center mb-16 max-w-3xl mx-auto">
          <p className="text-[#0071E3] text-[12px] sm:text-[14px] font-semibold uppercase tracking-[0.2em] mb-4 sm:mb-5">
            Mengapa Go?
          </p>
          <h2 className="font-display font-semibold tracking-[-0.03em] text-foreground leading-[1.1] text-balance mb-5" style={{ fontSize: "clamp(36px, 5vw, 56px)" }}>
            Talk is cheap. <br/> Show me the code.
          </h2>
          <p className="text-[17px] text-[#86868B] max-w-2xl mx-auto">
            Sintaks yang elegan, standard library yang luar biasa kuat, dan performa tingkat dewa. Inilah mengapa developer jatuh cinta pada Go.
          </p>
        </div>

        <div className="grid lg:grid-cols-[320px_1fr] xl:grid-cols-[360px_1fr] gap-8 lg:gap-10 xl:gap-14 items-start w-full">
          
          {/* Left: Interactive Tabs */}
          <div className="flex flex-row lg:flex-col overflow-x-auto no-scrollbar gap-2 pb-4 lg:pb-0 lg:sticky lg:top-32">
            {CODE_EXAMPLES.map((ex) => {
              const isActive = activeId === ex.id;
              return (
                <button
                  key={ex.id}
                  onClick={() => setActiveId(ex.id)}
                  className={cn(
                    "text-left px-5 py-4 rounded-[16px] transition-all duration-300 min-w-[240px] lg:min-w-0 flex-shrink-0 border",
                    isActive
                      ? "bg-white dark:bg-[#1C1C1E] border-[#D2D2D7]/80 dark:border-white/10"
                      : "bg-transparent border-transparent hover:bg-black/[0.03] dark:hover:bg-white/[0.03] opacity-50 hover:opacity-80"
                  )}
                >
                  <p className={cn("text-[11px] font-semibold tracking-widest uppercase mb-1.5", isActive ? "text-[#0071E3]" : "text-[#86868B]")}>
                    {ex.label}
                  </p>
                  <h3 className="font-display font-semibold text-[19px] text-foreground mb-1.5 leading-tight">
                    {ex.title}
                  </h3>
                  {isActive && (
                    <p className="text-[13px] text-[#86868B] leading-relaxed hidden lg:block mt-2">
                      {ex.desc}
                    </p>
                  )}
                </button>
              );
            })}
          </div>

          {/* Right: macOS Style Code Editor — full width of column */}
          <div className="relative rounded-[24px] border border-black/10 dark:border-white/10 bg-[#1C1C1E] shadow-[0_30px_80px_rgba(0,0,0,0.35)] overflow-hidden w-full">
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent pointer-events-none" />
            
            {/* Toolbar */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-white/[0.02]">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
                <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
              </div>
              <div className="flex items-center gap-2 text-white/50 text-[12px] font-mono">
                <Terminal className="w-4 h-4" /> main.go
              </div>
              <button 
                onClick={handleCopy}
                className="text-white/50 hover:text-white transition-colors"
                title="Copy code"
              >
                {copied ? <Check className="w-4 h-4 text-[#34C759]" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            {/* Editor Area */}
            <div className="p-8 sm:p-10 min-h-[520px] overflow-x-auto relative">
              <pre className="font-mono text-[14px] sm:text-[15px] leading-loose text-[#E5E5EA] whitespace-pre">
                <code>
                  {typedCode}
                  {isTyping && <span className="inline-block w-2 h-[1em] bg-white/70 animate-pulse ml-0.5 align-middle" />}
                </code>
              </pre>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
