"use client";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;        // 0-100
  className?: string;
  color?: string;
  animated?: boolean;
  label?: string;
}

export function ProgressBar({ value, className, color = "#0071E3", animated = true, label }: ProgressBarProps) {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!animated || !barRef.current) return;
    import("gsap").then(({ gsap }) => {
      gsap.to(barRef.current!, { width: `${value}%`, duration: 0.8, ease: "expo.out" });
    });
  }, [value, animated]);

  return (
    <div className={cn("space-y-1", className)}>
      {label && (
        <div className="flex items-center justify-between text-[12px]">
          <span className="text-[#86868B]">{label}</span>
          <span className="font-medium text-foreground">{value}%</span>
        </div>
      )}
      <div className="h-1.5 bg-[#D2D2D7]/50 dark:bg-white/10 rounded-full overflow-hidden">
        <div
          ref={barRef}
          className="h-full rounded-full transition-all"
          style={{ width: animated ? "0%" : `${value}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
