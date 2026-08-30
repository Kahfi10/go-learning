"use client";

import { useEffect, useRef, useState } from "react";
import { Zap, Cpu, Terminal, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

const FEATURES = [
  {
    icon: Zap,
    title: "10x Lebih Cepat",
    desc: "Sebagai bahasa kompilasi (compiled language), Go mengeksekusi kode langsung di tingkat mesin tanpa interpreter. Rasakan performa setara C++ dengan sintaks semudah Python.",
    color: "#0071E3",
  },
  {
    icon: Cpu,
    title: "1 Juta+ Goroutines",
    desc: "Lupakan thread OS yang berat. Goroutine sangat ringan (hanya 2KB) memungkinkan Anda menangani jutaan request serentak di satu server web tanpa takut kehabisan memori.",
    color: "#34C759",
  },
  {
    icon: Terminal,
    title: "<10s Build Time",
    desc: "Waktu Anda berharga. Compiler Go dirancang sangat cepat. Proyek sebesar Kubernetes dengan jutaan baris kode bisa dikompilasi dalam hitungan detik, bukan menit.",
    color: "#FF9500",
  },
  {
    icon: Globe,
    title: "Ekosistem Modern",
    desc: "Docker, Kubernetes, Prometheus, Terraform, Cloudflare—semua berjalan di atas Go. Menguasai Go berarti Anda siap membangun infrastruktur internet skala global.",
    color: "#AF52DE",
  },
];

export default function WhyGoSticky() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const { top, height } = containerRef.current.getBoundingClientRect();
      const scrollProgress = -top / (height - window.innerHeight);
      
      let index = Math.floor(scrollProgress * FEATURES.length);
      index = Math.max(0, Math.min(index, FEATURES.length - 1));
      
      setActiveIndex(index);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section ref={containerRef} className="relative bg-[#F5F5F7] dark:bg-[#0A0A0A]" style={{ height: "400vh" }}>
      <div className="sticky top-0 h-screen w-full flex items-center overflow-hidden">
        <div className="mx-auto w-full max-w-screen-2xl px-4 sm:px-6 md:px-8 flex flex-col md:flex-row items-center gap-12 lg:gap-20 relative z-10">
          
          {/* Left: Sticky Text */}
          <div className="flex-1 text-center md:text-left">
            <p className="text-[#86868B] text-[12px] sm:text-[14px] font-semibold uppercase tracking-[0.2em] mb-4 sm:mb-5">
              Konsep 1: Storytelling
            </p>
            <h2 className="font-display font-semibold tracking-[-0.03em] text-foreground leading-[1.1] text-balance mb-6" style={{ fontSize: "clamp(40px, 5vw, 64px)" }}>
              Bahasa yang dibangun <br className="hidden md:block"/> untuk masa depan.
            </h2>
            <p className="text-[16px] sm:text-[18px] text-[#86868B] leading-relaxed max-w-md mx-auto md:mx-0 transition-opacity duration-300">
              {FEATURES[activeIndex].desc}
            </p>
          </div>

          {/* Right: Changing Visuals */}
          <div className="flex-1 w-full flex justify-center md:justify-end relative">
            <div className="w-full max-w-[500px] aspect-square relative flex items-center justify-center">
              {FEATURES.map((feat, idx) => {
                const isActive = activeIndex === idx;
                const Icon = feat.icon;
                return (
                  <div
                    key={idx}
                    className={cn(
                      "absolute inset-0 flex flex-col items-center justify-center transition-all duration-700 ease-out p-8 rounded-[40px] border bg-white/50 dark:bg-[#111214]/50 backdrop-blur-xl",
                      isActive ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-12 scale-95 pointer-events-none",
                      isActive ? "border-black/[0.08] dark:border-white/10" : "border-transparent"
                    )}
                    style={{
                      boxShadow: isActive ? `0 30px 60px ${feat.color}20` : "none",
                    }}
                  >
                    <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-[80px] opacity-30 pointer-events-none" style={{ backgroundColor: feat.color }} />
                    <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl flex items-center justify-center shrink-0 mb-8 relative z-10" style={{ backgroundColor: feat.color + "15" }}>
                      <Icon className="w-12 h-12 sm:w-16 sm:h-16" style={{ color: feat.color }} />
                    </div>
                    <h3 className="font-display font-bold text-[32px] sm:text-[40px] text-foreground text-center leading-tight tracking-tight relative z-10">
                      {feat.title}
                    </h3>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
