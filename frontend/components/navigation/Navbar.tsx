"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";
import { BookOpen, Moon, Sun, Menu, X, Search, LogOut, User, LayoutDashboard, Trophy } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/modules", label_id: "Kursus", label_en: "Courses" },
  { href: "/playground", label_id: "Playground", label_en: "Playground" },
  { href: "/leaderboard", label_id: "Leaderboard", label_en: "Leaderboard" },
];

export default function Navbar({ lang = "id" }: { lang?: "id" | "en" }) {
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  const { state, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const label = (l: { label_id: string; label_en: string }) =>
    lang === "id" ? l.label_id : l.label_en;

  return (
    <header
      ref={navRef}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled ? "navbar-glass shadow-sm" : "bg-transparent"
      )}
    >
      <nav className="mx-auto max-w-7xl px-6 h-[52px] flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-[#0071E3] flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-semibold text-[15px] text-foreground tracking-tight">
            GoLearn
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "text-[13px] font-medium transition-colors",
                pathname.startsWith(l.href)
                  ? "text-[#0071E3]"
                  : "text-[#86868B] hover:text-foreground"
              )}
            >
              {label(l)}
            </Link>
          ))}
        </div>

        {/* Right actions */}
        <div className="hidden md:flex items-center gap-3">
          {/* Search shortcut */}
          <button
            onClick={() => document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }))}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted text-muted-foreground text-[13px] hover:bg-muted/80 transition-colors"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Cari</span>
            <kbd className="hidden lg:inline text-[11px] bg-background px-1 rounded border border-border">⌘K</kbd>
          </button>

          {/* Theme toggle */}
          <button
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            {resolvedTheme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Auth */}
          {state.loading ? null : state.user ? (
            <div className="flex items-center gap-2">
              <Link href="/dashboard" className="w-8 h-8 rounded-full bg-[#0071E3] flex items-center justify-center text-white text-[13px] font-semibold hover:bg-[#0077ED] transition-colors">
                {state.user.name.charAt(0).toUpperCase()}
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login" className="text-[13px] font-medium text-[#0071E3] hover:text-[#0077ED] transition-colors">
                {lang === "id" ? "Masuk" : "Sign In"}
              </Link>
              <Link href="/register" className="text-[13px] font-medium bg-[#0071E3] text-white px-3.5 py-1.5 rounded-full hover:bg-[#0077ED] transition-colors">
                {lang === "id" ? "Daftar" : "Get Started"}
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden w-8 h-8 flex items-center justify-center text-foreground"
          onClick={() => setOpen(!open)}
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden navbar-glass border-t border-border px-6 py-4 flex flex-col gap-4">
          {NAV_LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="text-[15px] font-medium text-foreground" onClick={() => setOpen(false)}>
              {label(l)}
            </Link>
          ))}
          <div className="pt-2 border-t border-border flex items-center gap-3">
            {state.user ? (
              <>
                <Link href="/dashboard" className="text-[15px] text-foreground flex items-center gap-2" onClick={() => setOpen(false)}>
                  <LayoutDashboard className="w-4 h-4" /> Dashboard
                </Link>
                <button onClick={() => { logout(); setOpen(false); }} className="text-[15px] text-error flex items-center gap-2">
                  <LogOut className="w-4 h-4" /> Keluar
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-[15px] text-[#0071E3]" onClick={() => setOpen(false)}>{lang === "id" ? "Masuk" : "Sign In"}</Link>
                <Link href="/register" className="text-[15px] bg-[#0071E3] text-white px-4 py-2 rounded-full" onClick={() => setOpen(false)}>{lang === "id" ? "Daftar" : "Get Started"}</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
