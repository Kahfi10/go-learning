"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Zap, Cpu, Terminal, Globe, ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const FEATURES = [
  {
    id: "speed",
    title: "10x Lebih Cepat",
    desc: "Go adalah bahasa kompilasi. Kode dieksekusi langsung di tingkat mesin tanpa interpreter. Rasakan performa setara C++ namun dengan sintaks semudah Python.",
    icon: Zap,
  },
  {
    id: "concurrency",
    title: "1 Juta+ Goroutines",
    desc: "Goroutine sangat ringan (hanya ~2KB). Anda dapat menangani jutaan request serentak di satu server web tanpa takut kehabisan memori atau CPU throttling.",
    icon: Cpu,
  },
  {
    id: "build",
    title: "<10s Build Time",
    desc: "Compiler Go dirancang untuk kecepatan ekstrem. Proyek berskala enterprise dengan jutaan baris kode dapat dikompilasi dalam hitungan detik.",
    icon: Terminal,
  },
  {
    id: "ecosystem",
    title: "Infrastruktur Modern",
    desc: "Docker, Kubernetes, Terraform, dan Prometheus dibangun menggunakan Go. Menguasai Go berarti Anda siap membangun infrastruktur skala global.",
    icon: Globe,
  },
];

export default function WhyGoGsap() {
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    
    let ctx = gsap.context(() => {
      const items = gsap.utils.toArray<HTMLElement>(".feature-item");
      
      items.forEach((item) => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: item,
            start: "top 80%", 
            end: "bottom 20%", 
            scrub: true,
          }
        });

        // Initialize inline styles for robustness against FOUC
        gsap.set(item, { opacity: 0.2, scale: 1 });

        tl.to(item, { opacity: 1, scale: 1, duration: 0.2, ease: "power2.out" })
          .to(item, { opacity: 1, duration: 0.6 })
          .to(item, { opacity: 0.2, scale: 1, duration: 0.2, ease: "power2.in" });
      });

      // Refresh ScrollTrigger to ensure correct measurements in case images push layout down
      setTimeout(() => {
        ScrollTrigger.refresh();
      }, 300);
      
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="bg-white dark:bg-[#0A0A0A] border-t border-[#D2D2D7]/60 dark:border-white/10 relative">
      <div className="mx-auto w-full max-w-[1340px] px-6 sm:px-10">
        <div className="grid md:grid-cols-12 gap-8 md:gap-16 relative">
          
          {/* LEFT COLUMN (Sticky using CSS) */}
          <div className="md:col-span-5 relative">
            <div className="md:sticky md:top-32 h-auto flex flex-col justify-start pt-16 md:pt-10 pb-8 md:pb-0">
              <p className="font-mono text-[13px] font-semibold uppercase tracking-widest text-[#86868B] mb-6 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-foreground" />
                Mengapa Go?
              </p>
              <h2 className="font-display font-medium text-4xl sm:text-5xl lg:text-6xl tracking-tight text-foreground leading-[1.05] mb-8 max-w-[400px]">
                Performa skala besar.
              </h2>
              <p className="text-[#86868B] text-[16px] sm:text-[18px] leading-relaxed max-w-[420px] mb-10">
                Dibangun oleh Google untuk memecahkan masalah rekayasa perangkat lunak modern. Go menggabungkan performa bahasa kompilasi dengan kesederhanaan bahasa dinamis, memberikan Anda alat ukur terbaik.
              </p>
              <Link href="/modules" className="inline-flex items-center justify-center gap-2 font-medium text-[14px] text-white bg-foreground dark:bg-white dark:text-black px-6 py-3 rounded-full hover:opacity-80 transition-opacity w-fit shadow-sm">
                Lihat kurikulum <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* RIGHT COLUMN (Scrolling List) */}
          <div className="md:col-span-7 flex flex-col pt-0 md:pt-10 pb-20 md:pb-32 gap-6 md:gap-10">
            {FEATURES.map((feat) => (
              <div 
                key={feat.id} 
                className="feature-item flex flex-col justify-center py-8 md:py-16"
              >
                <div className="flex flex-col gap-5 max-w-[520px]">
                  <div className="w-14 h-14 rounded-[14px] bg-[#F5F5F7] dark:bg-[#111214] border border-[#D2D2D7]/60 dark:border-white/10 flex items-center justify-center shrink-0 shadow-sm mb-1">
                    <feat.icon className="w-6 h-6 text-foreground" />
                  </div>
                  <h3 className="font-display font-medium text-3xl sm:text-4xl tracking-tight text-foreground">
                    {feat.title}
                  </h3>
                  <p className="text-[#86868B] text-[16px] sm:text-[18px] leading-[1.6]">
                    {feat.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
