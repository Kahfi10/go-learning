"use client";
import { cn } from "@/lib/utils";
import type { Badge } from "@/lib/api";

const ICON_MAP: Record<string, string> = {
  star: "⭐", book: "📚", trophy: "🏆", zap: "⚡", flame: "🔥",
  fire: "🔥🔥", "graduation-cap": "🎓", award: "🥇", crown: "👑",
  cpu: "💻", play: "▶️", chart: "📈", message: "💬", "thumbs-up": "👍",
  shield: "🛡️",
};

interface Props {
  badge: Badge;
  lang?: "id" | "en";
  size?: "sm" | "md";
}

export default function BadgeCard({ badge: b, lang = "id", size = "md" }: Props) {
  const name = lang === "id" ? b.name_id : b.name_en;
  const desc = lang === "id" ? b.description_id : b.description_en;
  const icon = ICON_MAP[b.icon] ?? "🏅";

  return (
    <div className={cn(
      "rounded-[14px] p-4 text-center transition-all",
      b.earned
        ? "bg-[#F5F5F7] dark:bg-[#1C1C1E]"
        : "bg-[#F5F5F7]/40 dark:bg-[#1C1C1E]/40 opacity-40 grayscale",
      size === "sm" ? "p-3" : "p-4"
    )}>
      <div className={cn("mx-auto mb-2", size === "sm" ? "text-[20px]" : "text-[28px]")}>{icon}</div>
      <p className={cn("font-medium text-foreground leading-tight", size === "sm" ? "text-[11px]" : "text-[12px]")}>{name}</p>
      {size === "md" && <p className="text-[10px] text-[#86868B] mt-1 leading-tight">{desc}</p>}
      {b.earned && b.earned_at && (
        <p className="text-[10px] text-[#34C759] mt-1">{new Date(b.earned_at).toLocaleDateString("id-ID")}</p>
      )}
    </div>
  );
}
