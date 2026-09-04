"use client";

import { useLayoutEffect, useRef } from "react";
import Link from "next/link";
import { Github, Twitter, MessageSquare, ArrowRight, Zap, ExternalLink } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function EditorialFooter() {
  const footerRef = useRef<HTMLElement>(null);
  
  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".footer-col-reveal",
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.08,
          ease: "power2.out",
          scrollTrigger: {
            trigger: footerRef.current,
            start: "top 85%",
            once: true,
          },
        }
      );
    }, footerRef);

    return () => ctx.revert();
  }, []);

  return (
    <footer 
      ref={footerRef} 
      className="relative w-full bg-[#050505] text-white pt-20 pb-10 sm:pb-12 overflow-hidden border-t border-white/[0.08]"
    >
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[#0071E3]/[0.04] rounded-full blur-[140px]" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 sm:px-8 lg:px-12">
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-y-12 md:gap-x-10 lg:gap-x-16 mb-16 sm:mb-20">
          
          {/* Brand Column */}
          <div className="footer-col-reveal md:col-span-12 lg:col-span-5 flex flex-col items-start">
            <Link href="/" className="inline-flex items-center gap-3 mb-5 group">
              <div className="w-10 h-10 rounded-xl bg-white text-black flex items-center justify-center font-bold text-xl group-hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                <Zap className="w-5 h-5 fill-black" />
              </div>
              <div className="flex flex-col">
                <span className="font-display font-bold text-xl tracking-tight text-white leading-none">
                  GoLearn
                </span>
                <span className="text-[11px] font-medium tracking-wider uppercase text-[#86868B] mt-1">
                  Interactive Platform
                </span>
              </div>
            </Link>
            <p className="text-[#86868B] text-sm sm:text-base leading-relaxed max-w-sm mb-6">
              Platform pembelajaran bahasa pemrograman Go interaktif untuk mencetak developer backend dan infrastruktur modern.
            </p>
            <div className="flex items-center gap-3">
              <SocialBtn icon={Github} href="https://github.com/Kahfi10/go-learning" label="GitHub" />
              <SocialBtn icon={Twitter} href="https://twitter.com" label="Twitter" />
              <SocialBtn icon={MessageSquare} href="/community" label="Discord Community" />
            </div>
          </div>

          {/* Links Grid */}
          <div className="md:col-span-12 lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-y-10 gap-x-8">
            
            {/* Navigasi / Produk */}
            <div className="footer-col-reveal flex flex-col">
              <h3 className="font-semibold text-white mb-5 text-sm tracking-wide">Navigasi</h3>
              <ul className="flex flex-col gap-3.5 text-sm text-[#86868B]">
                <FooterLink href="/">Beranda</FooterLink>
                <FooterLink href="/modules">Katalog Topik</FooterLink>
                <FooterLink href="/playground">Live Playground</FooterLink>
                <FooterLink href="/leaderboard">Leaderboard</FooterLink>
              </ul>
            </div>

            {/* Platform / Akun */}
            <div className="footer-col-reveal flex flex-col">
              <h3 className="font-semibold text-white mb-5 text-sm tracking-wide">Akun & Auth</h3>
              <ul className="flex flex-col gap-3.5 text-sm text-[#86868B]">
                <FooterLink href="/login">Masuk</FooterLink>
                <FooterLink href="/register">Buat Akun Baru</FooterLink>
                <FooterLink href="/dashboard">Dashboard</FooterLink>
                <FooterLink href="/settings">Pengaturan</FooterLink>
              </ul>
            </div>

            {/* Ekosistem / Resources */}
            <div className="footer-col-reveal flex flex-col col-span-2 sm:col-span-1">
              <h3 className="font-semibold text-white mb-5 text-sm tracking-wide">Resources</h3>
              <ul className="flex flex-col gap-3.5 text-sm text-[#86868B]">
                <FooterLink href="https://go.dev/" isExternal>Go Official Docs</FooterLink>
                <FooterLink href="https://github.com/Kahfi10/go-learning" isExternal>GitHub Repo</FooterLink>
                <FooterLink href="/community">Komunitas Discord</FooterLink>
              </ul>
              
              {/* System status pill */}
              <div className="mt-7 inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] w-fit">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-xs font-medium text-white/80">Semua sistem normal</span>
              </div>
            </div>

          </div>
        </div>

        {/* Edge-to-Edge Marquee Wordmark — scrolls R→L infinitely */}
        <div 
          className="footer-marquee-wrap w-full relative z-10 my-8 sm:my-12 overflow-hidden select-none pointer-events-none"
          style={{
            maskImage: 'linear-gradient(to right, transparent 0%, black 4%, black 96%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 4%, black 96%, transparent 100%)',
          }}
        >
          <div 
            className="footer-marquee-track flex whitespace-nowrap"
            style={{
              animation: 'footerMarquee 18s linear infinite',
            }}
          >
            {[...Array(4)].map((_, i) => (
              <span
                key={i}
                className="font-display font-black text-[14vw] sm:text-[12vw] leading-none tracking-tight text-white/[0.06] uppercase mx-[3vw] inline-block"
                style={{
                  WebkitTextStroke: '1px rgba(255,255,255,0.06)',
                }}
              >
                GOLEARN
              </span>
            ))}
          </div>
        </div>

        <style jsx>{`
          @keyframes footerMarquee {
            0% {
              transform: translateX(0%);
            }
            100% {
              transform: translateX(-50%);
            }
          }
        `}</style>

        {/* Bottom Credits Bar */}
        <div className="relative z-10 pt-8 border-t border-white/[0.08] flex flex-col sm:flex-row justify-between items-center gap-4 text-xs sm:text-sm text-[#86868B]">
          <p>© 2026 GoLearn Interactive. Seluruh hak cipta dilindungi.</p>
          <div className="flex items-center gap-5 sm:gap-6">
            <Link href="/privacy" className="hover:text-white transition-colors">Kebijakan Privasi</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Ketentuan Layanan</Link>
            <span className="w-1 h-1 rounded-full bg-white/20 hidden sm:block" />
            <p className="text-white/70 hidden sm:block">Dibuat di Indonesia 🇮🇩</p>
          </div>
        </div>

      </div>
    </footer>
  );
}

function FooterLink({ href, children, isExternal }: { href: string; children: React.ReactNode; isExternal?: boolean }) {
  if (isExternal) {
    return (
      <li>
        <a 
          href={href} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="group inline-flex items-center gap-1.5 hover:text-white transition-colors"
        >
          <span>{children}</span>
          <ExternalLink className="w-3 h-3 opacity-60 group-hover:opacity-100 transition-opacity" />
        </a>
      </li>
    );
  }

  return (
    <li>
      <Link href={href} className="group inline-flex items-center gap-1.5 hover:text-white transition-colors">
        <span>{children}</span>
        <ArrowRight className="w-3 h-3 opacity-0 -translate-x-1.5 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-white/80" />
      </Link>
    </li>
  );
}

function SocialBtn({ icon: Icon, href, label }: { icon: any; href: string; label: string }) {
  return (
    <a 
      href={href} 
      target="_blank" 
      rel="noopener noreferrer"
      aria-label={label}
      className="w-9 h-9 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-white/70 hover:text-white hover:bg-white/15 hover:border-white/20 transition-all hover:scale-105"
    >
      <Icon className="w-4 h-4" />
    </a>
  );
}