"use client";
import { useEffect, useRef } from "react";
import { Zap, Star } from "lucide-react";
import { cn, LEVEL_NAMES, xpToLevel } from "@/lib/utils";

interface Props {
  xp: number;
  prevXP?: number;
}

const XP_LEVELS = [0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 5000];

export default function XPCounter({ xp, prevXP = 0 }: Props) {
  const numRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!numRef.current) return;
    const el = numRef.current;
    import("gsap").then(({ gsap }) => {
      gsap.fromTo({ val: prevXP }, { val: xp },
        { duration: 1.4, ease: "power2.out", snap: { val: 1 },
          onUpdate() { el.textContent = Math.round((this as any).targets()[0].val).toLocaleString(); } }
      );
    });
  }, [xp]);

  const level = xpToLevel(xp);
  const currentLevelXP = XP_LEVELS[level - 1] ?? 0;
  const nextLevelXP = XP_LEVELS[level] ?? 5000;
  const pct = Math.round(((xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100);

  return (
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-full bg-[#0071E3]/10 flex items-center justify-center">
        <Zap className="w-4 h-4 text-[#0071E3]" />
      </div>
      <div>
        <div className="flex items-center gap-1.5">
          <span ref={numRef} className="font-display font-semibold text-[20px] text-foreground">{xp}</span>
          <span className="text-[13px] text-[#86868B]">XP · Lv.{level}</span>
        </div>
        <div className="w-28 h-1 bg-[#D2D2D7] rounded-full overflow-hidden mt-1">
          <div className="h-full bg-[#0071E3] rounded-full" style={{ width: `${pct}%` }} />
        </div>
      </div>
    </div>
  );
}
