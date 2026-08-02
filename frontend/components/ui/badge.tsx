import { cn } from "@/lib/utils";
import { type VariantProps, cva } from "class-variance-authority";

const badgeVariants = cva(
  "inline-flex items-center gap-1 font-medium text-[11px] px-2.5 py-0.5 rounded-full",
  {
    variants: {
      variant: {
        beginner:     "bg-[#34C759]/15 text-[#34C759]",
        intermediate: "bg-[#0071E3]/15 text-[#0071E3]",
        advanced:     "bg-[#FF453A]/15 text-[#FF453A]",
        success:      "bg-[#34C759]/15 text-[#34C759]",
        info:         "bg-[#0071E3]/15 text-[#0071E3]",
        warning:      "bg-[#FF9500]/15 text-[#FF9500]",
        error:        "bg-[#FF453A]/15 text-[#FF453A]",
        muted:        "bg-[#F5F5F7] text-[#86868B] dark:bg-white/8",
      },
    },
    defaultVariants: { variant: "muted" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export function LevelBadge({ level }: { level: string }) {
  const variant =
    level === "Beginner"     ? "beginner" :
    level === "Intermediate" ? "intermediate" : "advanced";
  return <Badge variant={variant as any}>{level}</Badge>;
}
