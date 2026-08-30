"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";
import { BookOpen, Moon, Sun, Menu, Search, User, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/modules",     label_id: "KURSUS",      label_en: "COURSES"     },
  { href: "/playground",  label_id: "PLAYGROUND",  label_en: "PLAYGROUND"  },
  { href: "/leaderboard", label_id: "LEADERBOARD", label_en: "LEADERBOARD" },
];

export default function NavbarMonospace({ lang = "id" }: { lang?: "id" | "en" }) {
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  const { state, logout } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  const lbl = (l: { label_id: string; label_en: string }) => lang === "id" ? l.label_id : l.label_en;

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-background border-b border-foreground/10 font-mono transition-colors">
      <nav className="w-full px-6 md:px-12 h-[60px] flex items-center justify-between">
        
        {/* Left: Logo & Links */}
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center gap-3 group">
            <BookOpen className="w-5 h-5 text-foreground group-hover:text-[#0071E3] transition-colors" />
            <span className="font-bold text-[14px] tracking-widest uppercase">G0_LEARN</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((l) => {
              const active = pathname.startsWith(l.href);
              return (
                <Link key={l.href} href={l.href}
                  className={cn(
                    "text-[12px] font-semibold tracking-[0.15em] transition-colors relative group",
                    active ? "text-foreground" : "text-[#86868B] hover:text-foreground"
                  )}>
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity absolute -left-3 text-[#0071E3]">[</span>
                  {lbl(l)}
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity absolute -right-3 text-[#0071E3]">]</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4 text-[#86868B]">
            <button className="hover:text-foreground transition-colors"><Search className="w-4 h-4" /></button>
            <button onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")} className="hover:text-foreground transition-colors">
              {mounted && resolvedTheme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>

          <div className="w-px h-4 bg-foreground/15" />

          {state.loading ? (
            <div className="w-20 h-4 bg-foreground/10 animate-pulse" />
          ) : state.user ? (
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-[12px] font-semibold tracking-widest uppercase text-foreground hover:text-[#0071E3] transition-colors">
                {state.user.name.split(" ")[0]}
              </Link>
              <button onClick={logout} className="text-[#FF453A] hover:text-[#FF453A]/70 transition-colors"><LogOut className="w-4 h-4" /></button>
            </div>
          ) : (
            <Link href="/login" className="text-[12px] font-semibold tracking-widest uppercase text-foreground hover:text-[#0071E3] transition-colors">
              ~/.LOGIN
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}