"use client";
import { useEffect, useRef } from "react";

let gsapInstance: typeof import("gsap").gsap | null = null;
let initialized = false;

export async function initGSAP() {
  if (initialized) return gsapInstance!;
  const { gsap } = await import("gsap");
  const { ScrollTrigger } = await import("gsap/ScrollTrigger");
  const { TextPlugin } = await import("gsap/TextPlugin");
  gsap.registerPlugin(ScrollTrigger, TextPlugin);
  gsapInstance = gsap;
  initialized = true;
  return gsap;
}

/** Simple hook: fade-up elements when they enter viewport. */
export function useScrollReveal(selector: string, stagger = 0.08) {
  const containerRef = useRef<HTMLElement>(null);
  useEffect(() => {
    let ctx: ReturnType<typeof import("gsap").gsap.context> | null = null;
    initGSAP().then((gsap) => {
      const { ScrollTrigger } = require("gsap/ScrollTrigger");
      ctx = gsap.context(() => {
        gsap.fromTo(
          selector,
          { opacity: 0, y: 32 },
          {
            opacity: 1, y: 0, duration: 0.6, ease: "expo.out",
            stagger, scrollTrigger: { trigger: selector, start: "top 85%", once: true },
          }
        );
      }, containerRef);
    });
    return () => ctx?.revert();
  }, [selector, stagger]);
  return containerRef;
}

/** Count-up animation. */
export function useCounter(target: number, duration = 1.5) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    initGSAP().then((gsap) => {
      const obj = { val: 0 };
      gsap.to(obj, {
        val: target, duration, ease: "power2.out",
        snap: { val: 1 },
        onUpdate() { el.textContent = Math.round(obj.val).toLocaleString(); },
      });
    });
  }, [target, duration]);
  return ref;
}
