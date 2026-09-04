"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";

// Define the orbit rings
const ORBITS = [
  {
    radius: 350,
    direction: 1, // 1 for clockwise, -1 for counter-clockwise
    items: [
      { name: "Gin", color: "#00ADD8" },
      { name: "Fiber", color: "#F0E130" },
      { name: "Echo", color: "#E0E0E0" }
    ]
  },
  {
    radius: 550,
    direction: -1,
    items: [
      { name: "PostgreSQL", color: "#336791" },
      { name: "Redis", color: "#DC382D" },
      { name: "MongoDB", color: "#47A248" },
      { name: "RabbitMQ", color: "#FF6600" }
    ]
  },
  {
    radius: 750,
    direction: 1,
    items: [
      { name: "Docker", color: "#2496ED" },
      { name: "Kubernetes", color: "#326CE5" },
      { name: "Prometheus", color: "#E6522C" },
      { name: "gRPC", color: "#244C5A" },
      { name: "Terraform", color: "#7B42BC" }
    ]
  }
];

export default function EcosystemOrbitSection() {
  const sectionRef = useRef<HTMLElement>(null);
  
  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    
    let ctx = gsap.context(() => {
      
      // 1. Reveal Animation (Scale up rings, fade in text)
      const enterTl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 75%",
          toggleActions: "play none none reverse",
        }
      });

      enterTl.fromTo(".reveal-eco-ln",
        { y: "150%" },
        { y: "0%", duration: 1.2, stagger: 0.15, ease: "expo.out" }
      )
      .fromTo(".eco-ring", 
        { scale: 0.5, opacity: 0 },
        { scale: 1, opacity: 1, duration: 1.5, stagger: 0.2, ease: "back.out(1.5)" },
        "-=1"
      );

      // 2. Ferris Wheel Scrub Animation
      // We rotate the rings based on scroll, and counter-rotate the items so they stay upright
      ORBITS.forEach((orbit, index) => {
        const ringClass = `.ring-${index}`;
        const itemClass = `.item-${index}`;
        const rotAmount = 180 * orbit.direction; // Total rotation amount during the scroll

        gsap.to(ringClass, {
          rotation: rotAmount,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 1, // Smooth scrubbing
          }
        });

        // Counter rotate items
        gsap.to(itemClass, {
          rotation: -rotAmount,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          }
        });
      });

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative w-full bg-[#050505] text-white pt-[160px] sm:pt-[220px] pb-[220px] sm:pb-[280px] overflow-hidden flex justify-center items-center min-h-screen">
      
      {/* Heavy Ambient Core Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#0071E3]/15 rounded-full blur-[150px] pointer-events-none" />

      {/* Orbits Container */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0 h-0 pointer-events-none">
        
        {ORBITS.map((orbit, index) => (
          <div 
            key={index}
            className={cn(
              `eco-ring ring-${index}`,
              "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10 border-dashed"
            )}
            style={{ width: orbit.radius, height: orbit.radius }}
          >
            {orbit.items.map((item, i) => {
              const angle = (i * (360 / orbit.items.length));
              // Calculate x,y position on the circle boundary
              // Since the ring container is already width/height of radius, center is 50%, 50%
              const radiusPercent = 50; 
              const x = (50 + radiusPercent * Math.cos(angle * (Math.PI / 180))).toFixed(3);
              const y = (50 + radiusPercent * Math.sin(angle * (Math.PI / 180))).toFixed(3);
              
              return (
                <div 
                  key={i}
                  className="absolute"
                  style={{ top: `${y}%`, left: `${x}%`, transform: 'translate(-50%, -50%)' }}
                >
                  <div className={cn(
                    `item-${index}`,
                    "px-4 py-2 rounded-full border border-white/15 bg-black/60 backdrop-blur-md text-[14px] font-mono whitespace-nowrap flex items-center gap-2 shadow-[0_0_20px_rgba(0,0,0,0.5)]"
                  )}>
                    <span 
                      className="w-2 h-2 rounded-full" 
                      style={{ backgroundColor: item.color, boxShadow: `0 0 10px ${item.color}` }}
                    />
                    {item.name}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
        
      </div>

      {/* Center Text (Sits on top of the orbits) */}
      <div className="relative z-10 w-full max-w-[1107px] px-6 text-center pointer-events-auto">
        <h2 className="font-display text-[48px] sm:text-[60px] xl:text-[80px] font-semibold tracking-[-0.03em] leading-[1.15] max-w-4xl mx-auto">
          <span className="block overflow-hidden pb-3 -mb-3"><span className="block reveal-eco-ln">Tooling modern yang</span></span>
          <span className="block overflow-hidden pb-3 -mb-3"><span className="block reveal-eco-ln">membentuk developer Go</span></span>
          <span className="block overflow-hidden pb-3"><span className="block reveal-eco-ln text-[#A1A1A6]">hari ini.</span></span>
        </h2>
      </div>

    </section>
  );
}