import { cn } from "@/lib/utils";
import { type VariantProps, cva } from "class-variance-authority";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 select-none focus:outline-none disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        primary:   "bg-[#0071E3] text-white hover:bg-[#0077ED] active:scale-[0.98] shadow-lg shadow-[#0071E3]/20",
        secondary: "bg-[#F5F5F7] text-foreground hover:bg-[#EBEBED] dark:bg-[#1C1C1E] dark:hover:bg-[#2C2C2E]",
        ghost:     "text-foreground hover:bg-[#F5F5F7] dark:hover:bg-white/8",
        danger:    "bg-[#FF453A]/10 text-[#FF453A] hover:bg-[#FF453A]/20",
        link:      "text-[#0071E3] hover:text-[#0077ED] underline-offset-4 hover:underline p-0 h-auto",
      },
      size: {
        sm:   "text-[12px] px-3 py-1.5 rounded-full",
        md:   "text-[14px] px-5 py-2 rounded-full",
        lg:   "text-[15px] px-6 py-2.5 rounded-full",
        icon: "w-8 h-8 rounded-full",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

export function Button({ className, variant, size, loading, children, ...props }: ButtonProps) {
  return (
    <button className={cn(buttonVariants({ variant, size }), className)} disabled={loading || props.disabled} {...props}>
      {loading && (
        <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
}
