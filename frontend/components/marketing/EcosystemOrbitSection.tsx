"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

const ORBIT_ITEMS = [
  { name: "Docker", icon: "docker" },
  { name: "Kubernetes", icon: "k8s" },
  { name: "PostgreSQL", icon: "pg" },
  { name: "Redis", icon: "redis" },
  { name: "gRPC", icon: "grpc" },
  { name: "Prometheus", icon: "prom" },
  { name: "Gin", icon: "gin" },
  { name: "Fiber", icon: "fiber" },
];

export default function EcosystemOrbitSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Rotating orbit
      gsap.to(ringRef.current, {
        rotation: -45,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 1.5,
        }
      });

      gsap.fromTo(".reveal-eco-ln", 
        { y: "100%" },
        { 
          y: "0%", duration: 1, stagger: 0.1, ease: "power4.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 75%", once: true }
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative w-full bg-[#050505] text-white py-[100px] sm:py-[180px] overflow-hidden flex justify-center items-center min-h-[80vh]">
      
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#0071E3]/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Orbit Container */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] sm:w-[900px] h-[500px] sm:h-[900px] opacity-30 sm:opacity-50">
        <div ref={ringRef} className="w-full h-full rounded-full border-[2px] border-[#D2D2D7]/20 border-dashed relative">
          {ORBIT_ITEMS.map((item, i) => {
            const angle = (i * (360 / ORBIT_ITEMS.length));
            const radius = 50; 
            const x = Number((50 + radius * Math.cos(angle * (Math.PI / 180))).toFixed(5));
            const y = Number((50 + radius * Math.sin(angle * (Math.PI / 180))).toFixed(5));
            
            return (
              <div 
                key={i}
                className="absolute px-4 py-2 rounded-full border border-white/20 bg-[#1C1C1E] text-[13px] font-mono whitespace-nowrap"
                style={{ top: `${y}%`, left: `${x}%`, transform: 'translate(-50%, -50%)' }}
              >
                {item.name}
              </div>
            );
          })}
        </div>
      </div>

      {/* Center Text */}
      <div className="relative z-10 w-full max-w-[1107px] px-6 text-center">
        <h2 className="font-display text-[48px] sm:text-[60px] xl:text-[80px] font-semibold tracking-[-0.03em] leading-[1.0] max-w-4xl mx-auto e-lh">
          <span className="ln-mask"><span className="ln reveal-eco-ln">Tooling modern yang</span></span>
          <span className="ln-mask"><span className="ln reveal-eco-ln">membentuk developer Go</span></span>
          <span className="ln-mask"><span className="ln reveal-eco-ln">hari ini.</span></span>
        </h2>
      </div>

    </section>
  );
}