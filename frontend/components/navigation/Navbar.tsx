"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";
import {
  BookOpen, Moon, Sun, Menu, X, Search,
  LogOut, LayoutDashboard,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/modules",     label_id: "Kursus",      label_en: "Courses"     },
  { href: "/playground",  label_id: "Playground",  label_en: "Playground"  },
  { href: "/leaderboard", label_id: "Leaderboard", label_en: "Leaderboard" },
];

function openSearch() {
  window.dispatchEvent(
    new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true })
  );
}

export default function Navbar({ lang = "id" }: { lang?: "id" | "en" }) {
  const pathname             = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  const { state, logout }    = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled]     = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const lbl = (l: { label_id: string; label_en: string }) =>
    lang === "id" ? l.label_id : l.label_en;

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-300",
        scrolled
          ? "navbar-glass border-b border-[#D2D2D7]/40 dark:border-white/8"
          : "bg-transparent"
      )}
    >
      <nav className="mx-auto max-w-7xl px-5 h-[52px] flex items-center justify-between gap-4">

        {/* ── Logo ──────────────────────── */}
        <Link href="/" className="flex items-center gap-2 shrink-0 group">
          <div className="w-7 h-7 rounded-[8px] bg-[#0071E3] flex items-center justify-center group-hover:bg-[#0077ED] transition-colors">
            <BookOpen className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-display font-semibold text-[15px] text-foreground tracking-tight">
            GoLearn
          </span>
        </Link>

        {/* ── Desktop nav links ──────────── */}
        <div className="hidden md:flex items-center gap-7">
          {NAV_LINKS.map((l) => (
            <Link key={l.href} href={l.href}
              className={cn(
                "text-[13px] font-medium transition-colors",
                pathname.startsWith(l.href)
                  ? "text-foreground"
                  : "text-[#86868B] hover:text-foreground"
              )}>
              {lbl(l)}
            </Link>
          ))}
        </div>

        {/* ── Right actions ─────────────── */}
        <div className="hidden md:flex items-center gap-1">

          {/* Search — icon only */}
          <button
            onClick={openSearch}
            title="Cari (⌘K)"
            className="w-8 h-8 flex items-center justify-center rounded-full text-[#86868B] hover:text-foreground hover:bg-[#F5F5F7] dark:hover:bg-white/8 transition-colors"
          >
            <Search className="w-[15px] h-[15px]" />
          </button>

          {/* Theme toggle — icon only */}
          <button
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            title="Toggle theme"
            className="w-8 h-8 flex items-center justify-center rounded-full text-[#86868B] hover:text-foreground hover:bg-[#F5F5F7] dark:hover:bg-white/8 transition-colors"
          >
            {resolvedTheme === "dark"
              ? <Sun  className="w-[15px] h-[15px]" />
              : <Moon className="w-[15px] h-[15px]" />}
          </button>

          {/* Thin divider */}
          <div className="w-px h-4 bg-[#D2D2D7] dark:bg-white/15 mx-1" />

          {/* Auth */}
          {state.loading ? (
            <div className="w-7 h-7 rounded-full bg-[#F5F5F7] dark:bg-white/10 animate-pulse" />
          ) : state.user ? (
            /* Logged-in: avatar → dropdown or link */
            <Link href="/dashboard" title={state.user.name}
              className="w-7 h-7 rounded-full bg-[#0071E3] flex items-center justify-center text-white text-[12px] font-semibold hover:bg-[#0077ED] transition-colors shrink-0">
              {state.user.name.charAt(0).toUpperCase()}
            </Link>
          ) : (
            /* Guest */
            <div className="flex items-center gap-2">
              <Link href="/login"
                className="text-[13px] font-medium text-[#86868B] hover:text-foreground transition-colors px-1">
                {lang === "id" ? "Masuk" : "Sign In"}
              </Link>
              <Link href="/register"
                className="text-[13px] font-medium bg-[#0071E3] text-white px-3.5 py-1.5 rounded-full hover:bg-[#0077ED] transition-colors">
                {lang === "id" ? "Daftar" : "Get Started"}
              </Link>
            </div>
          )}
        </div>

        {/* ── Mobile hamburger ──────────── */}
        <button
          className="md:hidden w-8 h-8 flex items-center justify-center text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      {/* ── Mobile drawer ─────────────────────────── */}
      {mobileOpen && (
        <div className="md:hidden navbar-glass border-t border-[#D2D2D7]/40 dark:border-white/8 px-5 py-4 flex flex-col gap-1">
          {NAV_LINKS.map((l) => (
            <Link key={l.href} href={l.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "py-2.5 text-[15px] font-medium rounded-lg px-2 transition-colors",
                pathname.startsWith(l.href)
                  ? "text-foreground"
                  : "text-[#86868B] hover:text-foreground"
              )}>
              {lbl(l)}
            </Link>
          ))}

          <div className="mt-2 pt-3 border-t border-[#D2D2D7]/40 dark:border-white/8 flex items-center justify-between">
            {/* Search + theme on mobile */}
            <div className="flex items-center gap-1">
              <button onClick={openSearch}
                className="w-8 h-8 flex items-center justify-center rounded-full text-[#86868B] hover:bg-[#F5F5F7] dark:hover:bg-white/8 transition-colors">
                <Search className="w-4 h-4" />
              </button>
              <button onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                className="w-8 h-8 flex items-center justify-center rounded-full text-[#86868B] hover:bg-[#F5F5F7] dark:hover:bg-white/8 transition-colors">
                {resolvedTheme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>

            {/* Auth mobile */}
            {state.user ? (
              <div className="flex items-center gap-3">
                <Link href="/dashboard" className="text-[14px] text-foreground flex items-center gap-1.5" onClick={() => setMobileOpen(false)}>
                  <LayoutDashboard className="w-4 h-4" /> Dashboard
                </Link>
                <button onClick={() => { logout(); setMobileOpen(false); }}
                  className="text-[14px] text-[#FF453A] flex items-center gap-1.5">
                  <LogOut className="w-4 h-4" /> Keluar
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" className="text-[14px] text-[#86868B] hover:text-foreground" onClick={() => setMobileOpen(false)}>
                  {lang === "id" ? "Masuk" : "Sign In"}
                </Link>
                <Link href="/register"
                  className="text-[14px] font-medium bg-[#0071E3] text-white px-4 py-1.5 rounded-full"
                  onClick={() => setMobileOpen(false)}>
                  {lang === "id" ? "Daftar" : "Get Started"}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
