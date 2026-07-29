"use client";
import { useEffect, useRef } from "react";
import { LEVEL_NAMES, xpToLevel } from "@/lib/utils";

interface Props {
  xp: number;
  prevLevel: number;
  onClose: () => void;
}

export default function LevelUpModal({ xp, prevLevel, onClose }: Props) {
  const modalRef = useRef<HTMLDivElement>(null);
  const newLevel = xpToLevel(xp);

  useEffect(() => {
    import("gsap").then(({ gsap }) => {
      const tl = gsap.timeline();
      tl.from(modalRef.current, { scale: 0.7, opacity: 0, duration: 0.5, ease: "back.out(2)" });
      tl.from(".levelup-star", { scale: 0, opacity: 0, duration: 0.3, ease: "back.out(2)", stagger: 0.08 }, "-=0.2");
      tl.from(".levelup-text", { y: 20, opacity: 0, duration: 0.4, ease: "expo.out" }, "-=0.2");
    });
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div ref={modalRef} className="relative bg-background rounded-[24px] p-8 text-center max-w-sm w-full shadow-2xl border border-[#D2D2D7]/20">
        <div className="flex justify-center gap-2 mb-4">
          {[...Array(5)].map((_, i) => (
            <span key={i} className="levelup-star text-[24px]">⭐</span>
          ))}
        </div>
        <div className="levelup-text">
          <p className="text-[#86868B] text-[13px] uppercase tracking-widest mb-2">Level Up!</p>
          <p className="font-display font-semibold text-[48px] tracking-tight text-[#0071E3] mb-1">{newLevel}</p>
          <p className="font-semibold text-[20px] text-foreground mb-2">{LEVEL_NAMES[newLevel]}</p>
          <p className="text-[#86868B] text-[14px] mb-6">Selamat! Kamu naik dari Level {prevLevel} ke Level {newLevel} 🎉</p>
          <button onClick={onClose}
            className="bg-[#0071E3] text-white text-[15px] font-medium px-8 py-3 rounded-full hover:bg-[#0077ED] transition-colors">
            Lanjutkan Belajar
          </button>
        </div>
      </div>
    </div>
  );
}
