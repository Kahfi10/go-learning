"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";

// Make sure GSAP is registered
gsap.registerPlugin(ScrollTrigger);

const STATS = [
  { value: "15+", label: "Topik Pembelajaran" },
  { value: "76+", label: "Lesson Tersedia" },
  { value: "50+", label: "XP per Lesson" },
  { value: "10K", label: "Baris Kode Ditulis" },
];

export default function PreFooterGallery() {
  const sectionRef = useRef<HTMLElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      
      // Rotate the entire ring slowly based on scroll
      gsap.to(ringRef.current, {
        rotation: 30, // slowly rotate when scrolling
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 1, // smooth scrubbing
        }
      });

      // Stagger fade-in for stats numbers
      gsap.fromTo(".stat-val", 
        { y: 30, opacity: 0 },
        { 
          y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: "back.out(1.7)",
          scrollTrigger: { trigger: ".stats-grid", start: "top 80%", once: true }
        }
      );
      
      gsap.fromTo(".stat-lbl", 
        { y: 15, opacity: 0 },
        { 
          y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: "power3.out", delay: 0.2,
          scrollTrigger: { trigger: ".stats-grid", start: "top 80%", once: true }
        }
      );

      // Text reveal animation (lines sliding up)
      gsap.fromTo(".reveal-line", 
        { y: "100%" },
        { 
          y: "0%", duration: 0.8, stagger: 0.15, ease: "power4.out",
          scrollTrigger: { trigger: textRef.current, start: "top 75%", once: true }
        }
      );

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative w-full overflow-hidden bg-[#FBFBFD] dark:bg-[#0A0A0A] py-24 sm:py-32 xl:py-40">
      
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#0071E3]/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Container */}
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 relative z-10">
        
        {/* Top Header Text */}
        <div ref={textRef} className="max-w-3xl mb-12 sm:mb-20">
          <h2 className="font-display text-[40px] sm:text-[56px] xl:text-[72px] font-semibold tracking-[-0.04em] leading-[1.05] mb-6">
            <span className="block overflow-hidden"><span className="reveal-line block">Dibangun untuk</span></span>
            <span className="block overflow-hidden"><span className="reveal-line block text-[#0071E3]">komunitas, diperkuat</span></span>
            <span className="block overflow-hidden"><span className="reveal-line block">oleh developer.</span></span>
          </h2>
          <div className="max-w-xl">
            <span className="block overflow-hidden"><span className="reveal-line block text-[#86868B] text-[16px] sm:text-[19px] leading-relaxed">Platform belajar Go interaktif yang dibentuk oleh kejelasan </span></span>
            <span className="block overflow-hidden"><span className="reveal-line block text-[#86868B] text-[16px] sm:text-[19px] leading-relaxed">kurikulum, kemudahan akses, dan pencarian tanpa henti </span></span>
            <span className="block overflow-hidden"><span className="reveal-line block text-[#86868B] text-[16px] sm:text-[19px] leading-relaxed">menuju kode yang clean dan idiomatik.</span></span>
          </div>
        </div>

        {/* The Orbital Gallery & Stats */}
        <div className="relative w-full flex flex-col md:flex-row items-center justify-between gap-16">
          
          {/* Circular Gallery (Left) */}
          <div className="relative w-full max-w-[400px] sm:max-w-[500px] aspect-square flex items-center justify-center shrink-0">
            
            {/* The Ring */}
            <div ref={ringRef} className="absolute inset-0 rounded-full border border-[#D2D2D7]/40 dark:border-white/10" style={{ width: '100%', height: '100%' }}>
              {/* Generate 12 avatars positioned around the ring */}
              {Array.from({ length: 12 }).map((_, i) => {
                const angle = (i * (360 / 12));
                const radius = 50; // 50% = edge of the circle
                // Calculate position using basic trigonometry
                const x = 50 + radius * Math.cos(angle * (Math.PI / 180));
                const y = 50 + radius * Math.sin(angle * (Math.PI / 180));
                
                return (
                  <div 
                    key={i}
                    className="absolute w-12 h-12 sm:w-16 sm:h-16 rounded-full overflow-hidden shadow-lg border-2 border-white dark:border-[#111214] bg-white dark:bg-[#111214]"
                    style={{
                      top: `${y}%`,
                      left: `${x}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                  >
                    <img 
                      src={`https://i.pravatar.cc/150?img=${i + 10}`} 
                      alt="Learner" 
                      className="w-full h-full object-cover grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
                    />
                  </div>
                );
              })}
            </div>

            {/* Center Text inside ring */}
            <div className="text-center z-10">
              <p className="font-display text-[24px] sm:text-[32px] font-bold text-foreground">1000+</p>
              <p className="text-[12px] sm:text-[14px] text-[#86868B] font-medium tracking-widest uppercase mt-1">Gophers</p>
            </div>
          </div>

          {/* Stats Grid (Right) */}
          <div className="stats-grid grid grid-cols-2 gap-x-8 gap-y-12 sm:gap-x-16 sm:gap-y-16 w-full md:w-auto">
            {STATS.map((stat, i) => (
              <div key={i} className="flex flex-col">
                <p className="stat-val font-display text-[48px] sm:text-[56px] font-bold tracking-tight text-foreground leading-none mb-2">
                  {stat.value}
                </p>
                <p className="stat-lbl text-[14px] sm:text-[15px] text-[#86868B] font-medium max-w-[120px]">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}