"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const AVATAR_BG = ["#0071E3", "#34C759", "#FF9500", "#AF52DE", "#FF453A", "#5AC8FA", "#30D158", "#FFD60A"];
const AVATAR_LABEL = ["G", "O", "P", "H", "E", "R", ">", "_"];

export default function CommunityClosingSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    let ctx = gsap.context(() => {
      gsap.to(ringRef.current, {
          rotation: 45,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        });

        gsap.fromTo(
          ".reveal-ln",
          { y: "100%" },
          {
            y: "0%", duration: 1, stagger: 0.1, ease: "power4.out",
            scrollTrigger: { trigger: sectionRef.current, start: "top 75%", once: true },
          }
        );

        gsap.fromTo(
          ".gsap-reveal-stat",
          { y: 30, opacity: 0 },
          {
            y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: "power3.out",
            scrollTrigger: { trigger: ".stats-grid", start: "top 85%", once: true },
          }
        );
      }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative w-full bg-[#050505] text-white py-24 sm:py-32 xl:py-40 overflow-hidden border-t border-white/5">
      <div className="mx-auto w-full max-w-[1130px] px-6 sm:px-8 relative z-10 flex flex-col items-center">
        
        {/* Header Block */}
        <div className="w-full relative mb-[80px] sm:mb-[120px]">
          <p className="absolute left-0 top-1.5 text-[14px] text-[#86868B] tracking-[-0.02em] font-sans">
            Komunitas & Proses
          </p>
          <h2 className="font-display text-[40px] sm:text-[60px] xl:text-[80px] font-semibold tracking-[-0.03em] leading-[1.1] text-center max-w-[990px] mx-auto sm:indent-[125px]">
            <span className="block overflow-hidden pb-3 -mb-3"><span className="block reveal-ln">Belajar Go dibentuk</span></span>
            <span className="block overflow-hidden pb-3 -mb-3"><span className="block reveal-ln">oleh praktik, ritme, dan</span></span>
            <span className="block overflow-hidden pb-3"><span className="block reveal-ln">komunitas open-source.</span></span>
          </h2>
        </div>

        {/* Orbit Block */}
        <div className="relative w-[345px] sm:w-[500px] h-[345px] sm:h-[500px] flex items-center justify-center mb-[80px] sm:mb-[120px]">
          <div ref={ringRef} className="absolute inset-0 rounded-full border border-white/10" style={{ width: '100%', height: '100%' }}>
            {Array.from({ length: 8 }).map((_, i) => {
              const angle = (i * (360 / 8));
              const radius = 50; 
              const x = Number((50 + radius * Math.cos(angle * (Math.PI / 180))).toFixed(5));
              const y = Number((50 + radius * Math.sin(angle * (Math.PI / 180))).toFixed(5));
              
              return (
                <div 
                  key={i}
                  className="absolute w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-[3px] border-[#050505] bg-[#1C1C1E]"
                  style={{ top: `${y}%`, left: `${x}%`, transform: 'translate(-50%, -50%)' }}
                >
                  <div
                    className="w-full h-full flex items-center justify-center"
                    style={{ backgroundColor: AVATAR_BG[i % AVATAR_BG.length] }}
                  >
                    <span className="text-white text-[18px] font-mono font-bold select-none">
                      {AVATAR_LABEL[i % AVATAR_LABEL.length]}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="text-center z-10">
            <p className="font-display text-[32px] sm:text-[40px] font-bold">2026</p>
            <p className="text-[13px] text-[#86868B] tracking-wider uppercase mt-1">Built for Practice</p>
          </div>
        </div>

        {/* Descriptions */}
        <div className="flex flex-col md:flex-row gap-8 sm:gap-20 text-center mb-[80px] sm:mb-[150px]">
          <p className="text-[16px] sm:text-[18px] text-[#86868B] max-w-[356px] leading-[1.6]">
            <span className="block overflow-hidden pb-2 -mb-2"><span className="block reveal-ln">Pendekatan desain pembelajaran yang</span></span>
            <span className="block overflow-hidden pb-2 -mb-2"><span className="block reveal-ln">berpusat pada eksekusi kode nyata dan</span></span>
            <span className="block overflow-hidden pb-2"><span className="block reveal-ln">pemecahan masalah langsung di browser.</span></span>
          </p>
          <p className="text-[16px] sm:text-[18px] text-[#86868B] max-w-[356px] leading-[1.6]">
            <span className="block overflow-hidden pb-2 -mb-2"><span className="block reveal-ln">Kurikulum terstruktur untuk pemula </span></span>
            <span className="block overflow-hidden pb-2 -mb-2"><span className="block reveal-ln">hingga pola desain siap produksi untuk</span></span>
            <span className="block overflow-hidden pb-2"><span className="block reveal-ln">kebutuhan backend modern.</span></span>
          </p>
        </div>

        {/* Stats */}
        <div className="stats-grid grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-0 w-full max-w-[857px]">
          {[
            { v: "15+", l: "Topik" },
            { v: "76+", l: "Lesson" },
            { v: "300+", l: "Quiz" },
            { v: "10", l: "Level" }
          ].map((s, i) => (
            <div key={i} className="gsap-reveal-stat flex flex-col gap-2 sm:gap-4 md:border-r md:border-white/10 last:border-r-0 md:px-8 first:pl-0 last:pr-0">
              <p className="font-display text-[48px] sm:text-[72px] font-bold leading-[0.8]">{s.v}</p>
              <p className="text-[#86868B] text-[15px] sm:indent-[20px]">{s.l}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}