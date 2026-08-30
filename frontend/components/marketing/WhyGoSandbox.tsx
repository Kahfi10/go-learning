"use client";

import { useEffect, useState, useRef } from "react";
import { Terminal, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const CODE_EXAMPLES = [
  {
    id: "concurrency",
    label: "01. Concurrency",
    title: "1M+ Requests, No Problem",
    desc: "Menjalankan fungsi secara paralel (goroutine) semudah menambahkan kata 'go' di depannya.",
    code: `package main

import (
    "fmt"
    "sync"
)

func main() {
    var wg sync.WaitGroup

    for i := 1; i <= 1_000_000; i++ {
        wg.Add(1)
        go func(id int) {
            defer wg.Done()
            fmt.Printf("task %d done\\n", id)
        }(i)
    }

    wg.Wait()
    fmt.Println("all done!")
}`,
  },
  {
    id: "simplicity",
    label: "02. Simplicity",
    title: "Web Server 5 Baris",
    desc: "Tidak butuh framework raksasa. Standard library Go sudah siap produksi.",
    code: `package main

import (
    "fmt"
    "net/http"
)

func handler(
    w http.ResponseWriter,
    r *http.Request,
) {
    fmt.Fprintln(w, "Hello, World!")
}

func main() {
    http.HandleFunc("/", handler)
    http.ListenAndServe(":8080", nil)
}`,
  },
  {
    id: "performance",
    label: "03. Performance",
    title: "Kecepatan setara C++",
    desc: "Go dikompilasi langsung ke bahasa mesin, tanpa overhead interpreter.",
    code: `package main

import "fmt"

func fib(n int) int {
    if n <= 1 {
        return n
    }
    return fib(n-1) + fib(n-2)
}

func main() {
    // Compiled to native machine code
    // As fast as C / C++
    result := fib(40)
    fmt.Println("result:", result)
}`,
  },
];

export default function WhyGoSandbox() {
  const [activeId, setActiveId] = useState(CODE_EXAMPLES[0].id);
  const [typedCode, setTypedCode] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const [copied, setCopied] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  const activeExample = CODE_EXAMPLES.find((ex) => ex.id === activeId) ?? CODE_EXAMPLES[0];

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Header animation
      gsap.fromTo(headerRef.current,
        { y: 30, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.8, ease: "power3.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 80%", once: true }
        }
      );

      // Tabs stagger animation
      if (tabsRef.current) {
        const tabs = tabsRef.current.children;
        gsap.fromTo(tabs,
          { x: -30, opacity: 0 },
          {
            x: 0, opacity: 1, duration: 0.6, ease: "power3.out", stagger: 0.1,
            scrollTrigger: { trigger: sectionRef.current, start: "top 75%", once: true }
          }
        );
      }

      // Editor slide up animation
      gsap.fromTo(editorRef.current,
        { y: 50, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.8, ease: "power3.out", delay: 0.3,
          scrollTrigger: { trigger: sectionRef.current, start: "top 75%", once: true }
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

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
    <section ref={sectionRef} className="py-24 sm:py-32 px-4 sm:px-6 bg-[#FBFBFD] dark:bg-[#0A0A0A] min-h-screen flex flex-col justify-center overflow-hidden">
      <div className="mx-auto w-full max-w-screen-xl relative z-10">
        
        <div ref={headerRef} className="text-center mb-16 max-w-3xl mx-auto opacity-0">
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

        <div className="grid lg:grid-cols-[280px_1fr] xl:grid-cols-[300px_1fr] gap-6 lg:gap-10 xl:gap-12 items-start w-full">
          
          {/* Left: Interactive Tabs */}
          <div ref={tabsRef} className="flex flex-row lg:flex-col overflow-x-auto no-scrollbar gap-2 pb-4 lg:pb-0 lg:sticky lg:top-32">
            {CODE_EXAMPLES.map((ex) => {
              const isActive = activeId === ex.id;
              return (
                <button
                  key={ex.id}
                  onClick={() => setActiveId(ex.id)}
                  className={cn(
                    "text-left px-5 py-4 rounded-[16px] transition-all duration-300 min-w-[220px] lg:min-w-0 flex-shrink-0 border",
                    isActive
                      ? "bg-white dark:bg-[#1C1C1E] border-[#D2D2D7]/80 dark:border-white/10"
                      : "bg-transparent border-transparent hover:bg-black/[0.03] dark:hover:bg-white/[0.03] opacity-50 hover:opacity-80"
                  )}
                >
                  <p className={cn("text-[11px] font-semibold tracking-widest uppercase mb-1.5", isActive ? "text-[#0071E3]" : "text-[#86868B]")}>
                    {ex.label}
                  </p>
                  <h3 className="font-display font-semibold text-[18px] text-foreground mb-1.5 leading-tight">
                    {ex.title}
                  </h3>
                  {isActive && (
                    <p className="text-[12px] text-[#86868B] leading-relaxed hidden lg:block mt-2">
                      {ex.desc}
                    </p>
                  )}
                </button>
              );
            })}
          </div>

          {/* Right: macOS Style Code Editor — full width of column */}
          <div ref={editorRef} className="relative rounded-[24px] border border-black/10 dark:border-white/10 bg-[#1C1C1E] shadow-[0_30px_80px_rgba(0,0,0,0.35)] w-full opacity-0" style={{ minWidth: 0 }}>
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
            <div className="p-8 sm:p-10 min-h-[520px] relative overflow-x-auto rounded-b-[24px]">
              <pre className="font-mono text-[14px] sm:text-[15px] leading-loose text-[#E5E5EA] whitespace-pre min-w-max">
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
