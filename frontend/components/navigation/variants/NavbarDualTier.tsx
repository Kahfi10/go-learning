"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { BookOpen, Moon, Sun, Search, Bell, Globe } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/modules",     label: "Courses"     },
  { href: "/playground",  label: "Playground"  },
  { href: "/leaderboard", label: "Leaderboard" },
];

export default function NavbarDualTier() {
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  const { state } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setMounted(true), []);

  return (
    <header className="fixed top-0 inset-x-0 z-50 flex flex-col transition-all duration-300">
      
      {/* Tier 1: System Bar (Collapses on scroll) */}
      <div className={cn(
        "bg-[#111214] text-white overflow-hidden transition-all duration-300",
        scrolled ? "h-0 opacity-0" : "h-[32px] opacity-100"
      )}>
        <div className="mx-auto w-full max-w-screen-2xl px-6 h-full flex items-center justify-between text-[11px] font-medium tracking-wide">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5"><Bell className="w-3 h-3 text-[#34C759]" /> System All Systems Operational</span>
            <span className="opacity-40">|</span>
            <span className="text-white/60 hover:text-white cursor-pointer transition-colors">v1.2 Release Notes</span>
          </div>
          <div className="flex items-center gap-4 text-white/60">
            <button className="hover:text-white transition-colors flex items-center gap-1"><Globe className="w-3 h-3" /> ID</button>
            <button onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")} className="hover:text-white transition-colors flex items-center gap-1">
              {mounted && resolvedTheme === "dark" ? <Sun className="w-3 h-3" /> : <Moon className="w-3 h-3" />} Theme
            </button>
          </div>
        </div>
      </div>

      {/* Tier 2: Main Navigation */}
      <div className={cn(
        "bg-white/95 dark:bg-[#0A0A0C]/95 backdrop-blur-md transition-all duration-300",
        scrolled ? "border-b border-black/10 dark:border-white/10 shadow-sm" : "border-b border-black/5 dark:border-white/5"
      )}>
        <nav className="mx-auto w-full max-w-screen-2xl px-6 h-[64px] flex items-center justify-between">
          <div className="flex items-center gap-10">
            <Link href="/" className="flex items-center gap-2.5">
              <img 
                src="/golearn-mark.svg" 
                alt="GoLearn Logo" 
                className="h-8 w-auto object-contain" 
              />
              <span className="font-display font-semibold text-[17px] tracking-tight">GoLearn Enterprise</span>
            </Link>

            <div className="hidden md:flex items-center gap-6">
              {NAV_LINKS.map((l) => (
                <Link key={l.href} href={l.href}
                  className={cn(
                    "text-[14px] font-medium transition-colors py-2 border-b-2",
                    pathname.startsWith(l.href)
                      ? "text-foreground border-[#0071E3]"
                      : "text-[#86868B] hover:text-foreground border-transparent"
                  )}>
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868B]" />
              <input type="text" placeholder="Search resources..." className="w-64 h-[36px] bg-[#F5F5F7] dark:bg-[#1C1C1E] rounded-full pl-9 pr-4 text-[13px] outline-none focus:ring-2 focus:ring-[#0071E3]/30 transition-all" />
            </div>

            {state.user ? (
              <Link href="/dashboard" className="flex items-center gap-3 ml-2 pl-4 border-l border-black/10 dark:border-white/10 hover:opacity-80 transition-opacity">
                <div className="text-right hidden sm:block">
                  <p className="text-[13px] font-semibold leading-tight">{state.user.name}</p>
                  <p className="text-[11px] text-[#86868B]">{state.user.email}</p>
                </div>
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#0071E3] to-[#34C759] text-white flex items-center justify-center font-bold text-[14px] shadow-sm">
                  {state.user.name.charAt(0)}
                </div>
              </Link>
            ) : (
              <Link href="/login" className="text-[14px] font-medium bg-foreground text-background px-5 py-2 rounded-lg hover:opacity-90 transition-opacity">
                Sign In Portal
              </Link>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}