"use client";

import { Zap, Cpu, Terminal, Globe, Server, Code2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function WhyGoAsymmetrical() {
  return (
    <section className="py-24 sm:py-32 px-4 sm:px-6 bg-white dark:bg-[#050505] min-h-screen flex flex-col justify-center">
      <div className="mx-auto w-full max-w-screen-xl">
        
        <div className="text-center mb-16 sm:mb-20 max-w-3xl mx-auto">
          <p className="text-[#AF52DE] text-[12px] sm:text-[14px] font-semibold uppercase tracking-[0.2em] mb-4 sm:mb-5">
            Konsep 3: Asymmetrical Premium Bento
          </p>
          <h2 className="font-display font-semibold tracking-[-0.03em] text-foreground leading-[1.1] text-balance" style={{ fontSize: "clamp(40px, 5.5vw, 64px)" }}>
            Infrastruktur internet modern dibangun dengan Go.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 auto-rows-[minmax(180px,auto)]">
          
          {/* Big Box: Concurrency (Spans 2 cols, 2 rows) */}
          <div className="group relative overflow-hidden rounded-[32px] border border-[#D2D2D7]/60 dark:border-white/10 bg-[#FBFBFD] dark:bg-[#111214] p-8 sm:p-10 md:col-span-2 md:row-span-2 flex flex-col justify-between shadow-sm hover:shadow-lg transition-all duration-500">
            <div className="absolute top-0 right-0 w-80 h-80 rounded-full blur-[100px] opacity-20 group-hover:opacity-40 transition-opacity duration-700 pointer-events-none bg-[#34C759]" />
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-[18px] bg-[#34C759]/10 flex items-center justify-center mb-6">
                <Cpu className="w-7 h-7 text-[#34C759]" />
              </div>
              <h3 className="font-display text-[28px] sm:text-[36px] font-semibold tracking-tight text-foreground mb-3 leading-[1.1]">
                1 Juta+ Goroutines
              </h3>
              <p className="text-[#86868B] text-[15px] sm:text-[17px] leading-relaxed max-w-md">
                Arsitektur concurrency bawaan Go (Goroutines & Channels) memungkinkan server Anda menangani trafik masif serentak tanpa perlu RAM raksasa. Ringan, aman, dan sangat cepat.
              </p>
            </div>
            
            {/* Fake UI Graph Micro-interaction */}
            <div className="mt-10 relative z-10 p-5 rounded-[20px] bg-white dark:bg-[#1C1C1E] border border-black/5 dark:border-white/5 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <span className="text-[12px] font-medium text-[#86868B] w-16">Node.js</span>
                <div className="h-2 flex-1 rounded-full bg-black/5 dark:bg-white/5 overflow-hidden">
                  <div className="h-full bg-[#FF3B30] w-[85%] rounded-full group-hover:w-[90%] transition-all duration-1000 ease-out" />
                </div>
                <span className="text-[12px] font-mono text-[#FF3B30]">High RAM</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[12px] font-medium text-[#86868B] w-16">Go</span>
                <div className="h-2 flex-1 rounded-full bg-black/5 dark:bg-white/5 overflow-hidden">
                  <div className="h-full bg-[#34C759] w-[5%] group-hover:w-[15%] transition-all duration-1000 ease-out" />
                </div>
                <span className="text-[12px] font-mono text-[#34C759]">Low RAM</span>
              </div>
            </div>
          </div>

          {/* Marquee Ecosystem (Spans 1 or 2 cols, 2 rows) */}
          <div className="group relative overflow-hidden rounded-[32px] border border-[#D2D2D7]/60 dark:border-white/10 bg-[#FBFBFD] dark:bg-[#111214] p-8 sm:p-10 md:col-span-1 lg:col-span-2 md:row-span-2 flex flex-col justify-center items-center text-center shadow-sm hover:shadow-lg transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-[#AF52DE]/5 to-transparent pointer-events-none" />
            <Globe className="w-12 h-12 text-[#AF52DE] mb-6 opacity-80" />
            <h3 className="font-display text-[24px] sm:text-[28px] font-semibold tracking-tight text-foreground mb-3 leading-[1.1]">
              Ekosistem Skala Global
            </h3>
            <p className="text-[#86868B] text-[15px] sm:text-[16px] leading-relaxed">
              Teknologi yang mendasari cloud modern ditulis menggunakan Go.
            </p>
            
            {/* Subtle floating text effect */}
            <div className="mt-10 flex flex-wrap justify-center gap-3 opacity-60 group-hover:opacity-100 transition-opacity duration-500">
              {["Docker", "Kubernetes", "Terraform", "Prometheus", "Cloudflare"].map((tech, i) => (
                <span key={tech} className="px-4 py-2 rounded-full border border-black/10 dark:border-white/10 bg-white/50 dark:bg-white/5 text-[14px] font-semibold font-display tracking-tight" style={{ animationDelay: `${i * 100}ms` }}>
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Stat 1 */}
          <div className="group relative overflow-hidden rounded-[32px] border border-[#D2D2D7]/60 dark:border-white/10 bg-[#0071E3] p-8 flex flex-col justify-between shadow-sm hover:shadow-lg transition-all duration-500 md:col-span-1 lg:col-span-2 min-h-[220px]">
            <div className="relative z-10">
              <Zap className="w-8 h-8 text-white/80 mb-4" />
              <p className="font-display text-[48px] font-bold text-white leading-none tracking-tight mb-2 group-hover:scale-105 origin-left transition-transform duration-500">10x</p>
              <p className="text-white/80 text-[16px] font-medium">Lebih cepat dari Python/Node</p>
            </div>
            <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-colors" />
          </div>

          {/* Stat 2 */}
          <div className="group relative overflow-hidden rounded-[32px] border border-[#D2D2D7]/60 dark:border-white/10 bg-[#FBFBFD] dark:bg-[#111214] p-8 flex flex-col justify-between shadow-sm hover:shadow-lg transition-all duration-500 md:col-span-2 lg:col-span-2 min-h-[220px]">
            <div className="relative z-10">
              <Terminal className="w-8 h-8 text-[#FF9500] mb-4" />
              <div className="flex items-baseline gap-2 mb-2 group-hover:translate-x-2 transition-transform duration-500">
                <p className="font-display text-[48px] font-bold text-foreground leading-none tracking-tight">&lt;10</p>
                <span className="font-display text-[24px] font-semibold text-[#86868B]">detik</span>
              </div>
              <p className="text-[#86868B] text-[16px] font-medium">Build time super ngebut (Compiler ajaib)</p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
