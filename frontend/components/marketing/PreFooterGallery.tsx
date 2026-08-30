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

  useEffect(() => {
    const ctx = gsap.context(() => {
      
      // Rotate the giant ring slowly based on scroll
      gsap.to(ringRef.current, {
        rotation: 30,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 1.5,
        }
      });

      // Text reveal animation
      gsap.fromTo(".reveal-line", 
        { y: "100%" },
        { 
          y: "0%", duration: 1, stagger: 0.1, ease: "power4.out",
          scrollTrigger: { trigger: ".header-content", start: "top 80%", once: true }
        }
      );

      // Stats stagger
      gsap.fromTo(".stat-item", 
        { y: 40, opacity: 0 },
        { 
          y: 0, opacity: 1, duration: 1, stagger: 0.1, ease: "power3.out", delay: 0.3,
          scrollTrigger: { trigger: ".stats-container", start: "top 85%", once: true }
        }
      );

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative w-full overflow-hidden bg-background pt-24 sm:pt-32 pb-64 sm:pb-80">
      
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[#0071E3]/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Content */}
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 relative z-10 flex flex-col items-center text-center">
        
        {/* Header Text */}
        <div className="header-content max-w-4xl mb-16 sm:mb-24">
          <h2 className="font-display text-[44px] sm:text-[64px] xl:text-[80px] font-semibold tracking-[-0.04em] leading-[1.05] mb-8">
            <span className="block overflow-hidden pb-1"><span className="reveal-line block">Dibangun untuk komunitas,</span></span>
            <span className="block overflow-hidden pb-1"><span className="reveal-line block text-[#0071E3]">diperkuat oleh developer.</span></span>
          </h2>
          <div className="max-w-2xl mx-auto flex flex-col gap-2">
            <span className="block overflow-hidden"><span className="reveal-line block text-[#86868B] text-[17px] sm:text-[20px] leading-relaxed">Platform belajar Go interaktif yang dibentuk oleh kejelasan kurikulum,</span></span>
            <span className="block overflow-hidden"><span className="reveal-line block text-[#86868B] text-[17px] sm:text-[20px] leading-relaxed">kemudahan akses, dan pencarian tanpa henti menuju</span></span>
            <span className="block overflow-hidden"><span className="reveal-line block text-[#86868B] text-[17px] sm:text-[20px] leading-relaxed">kode yang bersih dan idiomatik.</span></span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="stats-container grid grid-cols-2 lg:grid-cols-4 gap-12 sm:gap-16 w-full max-w-5xl relative z-20">
          {STATS.map((stat, i) => (
            <div key={i} className="stat-item flex flex-col items-center">
              <p className="font-display text-[56px] sm:text-[72px] font-bold tracking-tight text-foreground leading-none mb-3">
                {stat.value}
              </p>
              <p className="text-[14px] sm:text-[16px] text-[#86868B] font-medium tracking-wide">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

      </div>

      {/* The Giant Orbital Ring */}
      <div className="absolute left-1/2 bottom-0 w-[1200px] sm:w-[2400px] h-[600px] sm:h-[1200px] -translate-x-1/2 pointer-events-none z-0">
        
        {/* Ring Border */}
        <div ref={ringRef} className="absolute left-0 top-0 rounded-full border-[1px] border-black/10 dark:border-white/10" style={{ width: '100%', height: '200%' }}>
          
          {/* Avatars spread along the top arc */}
          {Array.from({ length: 14 }).map((_, i) => {
            // Spread avatars over a specific angle range
            const startAngle = 200;
            const endAngle = 340;
            const step = (endAngle - startAngle) / 14;
            const angle = startAngle + (i * step);
            
            const radius = 50; 
            const x = Number((50 + radius * Math.cos(angle * (Math.PI / 180))).toFixed(5));
            const y = Number((50 + radius * Math.sin(angle * (Math.PI / 180))).toFixed(5));
            
            return (
              <div 
                key={i}
                className="absolute w-14 h-14 sm:w-20 sm:h-20 rounded-full overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.1)] border-4 border-background bg-white dark:bg-[#111214]"
                style={{
                  top: `${y}%`,
                  left: `${x}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <img 
                  src={`https://i.pravatar.cc/150?img=${i + 15}`} 
                  alt="Learner" 
                  className="w-full h-full object-cover grayscale opacity-90"
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Center Label inside the visible arc */}
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 text-center z-20">
        <p className="text-[12px] sm:text-[14px] font-semibold text-[#0071E3] uppercase tracking-[0.2em] mb-2">
          Komunitas
        </p>
        <p className="font-display text-[32px] sm:text-[40px] font-bold text-foreground leading-none">
          1000+ Gophers
        </p>
      </div>

    </section>
  );
}