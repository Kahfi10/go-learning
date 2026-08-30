"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";
import { BookOpen, Moon, Sun, Menu, X, Search, LogOut, LayoutDashboard, User, Settings } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/modules",     label_id: "Kursus",      label_en: "Courses"     },
  { href: "/playground",  label_id: "Playground",  label_en: "Playground"  },
  { href: "/leaderboard", label_id: "Leaderboard", label_en: "Leaderboard" },
];

function openSearch() {
  window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true }));
}

export default function NavbarPill({ lang = "id" }: { lang?: "id" | "en" }) {
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  const { state, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) window.addEventListener("click", onClickOutside);
    return () => window.removeEventListener("click", onClickOutside);
  }, [dropdownOpen]);

  useEffect(() => setMounted(true), []);
  const lbl = (l: { label_id: string; label_en: string }) => lang === "id" ? l.label_id : l.label_en;

  return (
    <div className="fixed top-4 md:top-6 inset-x-0 z-50 flex justify-center px-4 pointer-events-none transition-transform duration-300">
      <header
        className={cn(
          "pointer-events-auto w-full md:max-w-[720px] rounded-full transition-all duration-500",
          scrolled
            ? "bg-white/80 dark:bg-[#111214]/80 backdrop-blur-xl border border-black/10 dark:border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)]"
            : "bg-white/50 dark:bg-[#111214]/50 backdrop-blur-md border border-black/5 dark:border-white/5 shadow-sm"
        )}
      >
        <nav className="px-5 h-[56px] flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0 group">
            <div className="w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center transition-transform group-hover:scale-105">
              <BookOpen className="w-4 h-4" />
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1.5 bg-black/5 dark:bg-white/5 rounded-full px-1.5 py-1.5">
            {NAV_LINKS.map((l) => (
              <Link key={l.href} href={l.href}
                className={cn(
                  "text-[13px] font-medium px-4 py-1.5 rounded-full transition-all duration-300",
                  pathname.startsWith(l.href)
                    ? "bg-white dark:bg-[#2C2C2E] text-foreground shadow-sm"
                    : "text-[#86868B] hover:text-foreground"
                )}>
                {lbl(l)}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-1">
              <button onClick={openSearch} className="w-8 h-8 flex items-center justify-center rounded-full text-[#86868B] hover:text-foreground transition-colors"><Search className="w-4 h-4" /></button>
              <button onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")} className="w-8 h-8 flex items-center justify-center rounded-full text-[#86868B] hover:text-foreground transition-colors">
                {mounted && resolvedTheme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>

            {state.loading ? (
              <div className="w-8 h-8 rounded-full bg-black/10 dark:bg-white/10 animate-pulse" />
            ) : state.user ? (
              <div className="relative" ref={dropdownRef}>
                <button onClick={() => setDropdownOpen(!dropdownOpen)} className="w-8 h-8 rounded-full bg-[#0071E3] flex items-center justify-center text-white text-[13px] font-bold hover:scale-105 transition-transform shadow-md">
                  {state.user.name.charAt(0).toUpperCase()}
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-4 w-56 rounded-2xl bg-white dark:bg-[#1C1C1E] border border-black/5 dark:border-white/10 shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                     <div className="px-4 py-3 border-b border-black/5 dark:border-white/5">
                        <p className="text-[14px] font-medium text-foreground truncate">{state.user.name}</p>
                        <p className="text-[12px] text-[#86868B] truncate">{state.user.email}</p>
                      </div>
                      <div className="p-1">
                        <Link href="/dashboard" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2.5 px-3 py-2 text-[13px] font-medium text-foreground hover:bg-[#F5F5F7] dark:hover:bg-white/5 rounded-xl transition-colors"><LayoutDashboard className="w-4 h-4 text-[#86868B]" /> Dashboard</Link>
                        <Link href={`/profile/${state.user.name}`} onClick={() => setDropdownOpen(false)} className="flex items-center gap-2.5 px-3 py-2 text-[13px] font-medium text-foreground hover:bg-[#F5F5F7] dark:hover:bg-white/5 rounded-xl transition-colors"><User className="w-4 h-4 text-[#86868B]" /> Profil</Link>
                        <Link href="/settings" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2.5 px-3 py-2 text-[13px] font-medium text-foreground hover:bg-[#F5F5F7] dark:hover:bg-white/5 rounded-xl transition-colors"><Settings className="w-4 h-4 text-[#86868B]" /> Pengaturan</Link>
                      </div>
                      <div className="p-1 border-t border-black/5 dark:border-white/5">
                        <button onClick={() => { logout(); setDropdownOpen(false); }} className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] font-medium text-[#FF453A] hover:bg-[#FF453A]/10 rounded-xl transition-colors"><LogOut className="w-4 h-4" /> Keluar</button>
                      </div>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login" className="text-[13px] font-semibold bg-foreground text-background px-4 py-2 rounded-full hover:scale-105 transition-transform shadow-md">
                {lang === "id" ? "Masuk" : "Login"}
              </Link>
            )}
          </div>

          <button className="md:hidden w-8 h-8 flex items-center justify-center text-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </nav>
      </header>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="pointer-events-auto absolute top-20 left-4 right-4 bg-white/95 dark:bg-[#111214]/95 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-[24px] p-5 shadow-2xl animate-in fade-in slide-in-from-top-4 md:hidden">
          <div className="flex flex-col gap-2">
            {NAV_LINKS.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setMobileOpen(false)} className="py-3 text-[16px] font-medium rounded-xl px-4 transition-colors hover:bg-black/5 dark:hover:bg-white/5">
                {lbl(l)}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}