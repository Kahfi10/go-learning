"use client";

import { useLayoutEffect, useRef } from "react";
import Link from "next/link";
import { Github, Twitter, MessageSquare, ArrowRight, Zap } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function EditorialFooter() {
  const footerRef = useRef<HTMLElement>(null);
  
  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    
    let ctx = gsap.context(() => {
      // Create an entrance timeline for the footer content
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: footerRef.current,
          start: "top 60%", // Triggers when the top of footer hits 60% of screen
          toggleActions: "play none none reverse",
        }
      });

      // 1. Reveal Brand Icon and Title
      tl.fromTo(".brand-reveal", 
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "power3.out" }
      )
      
      // 2. Reveal Links Columns
      .fromTo(".footer-col",
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, stagger: 0.1, ease: "back.out(1.1)" },
        "-=0.4"
      )

      // 3. Scale up the giant wordmark
      .fromTo(".wordmark-reveal",
        { scale: 0.8, opacity: 0, y: 50 },
        { scale: 1, opacity: 1, y: 0, duration: 1, ease: "expo.out" },
        "-=0.5"
      )
      
      // 4. Fade in bottom credits
      .fromTo(".credits-reveal",
        { opacity: 0 },
        { opacity: 1, duration: 0.8 },
        "-=0.5"
      );

    }, footerRef);

    return () => ctx.revert();
  }, []);

  return (
    <footer ref={footerRef} className="relative w-full h-full flex flex-col justify-between pt-20 pb-8 overflow-hidden bg-transparent">
      
      <div className="relative z-10 mx-auto w-full max-w-screen-2xl px-6 sm:px-12 lg:px-20 flex-1 flex flex-col justify-center">
        
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-y-16 md:gap-x-12 lg:gap-x-20 mb-auto mt-10">
          
          {/* Brand Column */}
          <div className="md:col-span-12 lg:col-span-5 flex flex-col items-start">
            <Link href="/" className="inline-flex items-center gap-3 mb-6 group brand-reveal">
              <div className="w-10 h-10 rounded-xl bg-white text-black flex items-center justify-center font-bold text-xl group-hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                <Zap className="w-5 h-5" />
              </div>
              <span className="font-display font-semibold text-2xl tracking-tight text-white">GoLearn</span>
            </Link>
            <p className="brand-reveal text-[#A1A1A6] text-base leading-relaxed max-w-sm mb-8">
              Platform pembelajaran bahasa pemrograman Go yang dirancang khusus untuk mencetak developer infrastruktur masa depan.
            </p>
            <div className="flex items-center gap-4 brand-reveal">
              <SocialBtn icon={Github} href="https://github.com" />
              <SocialBtn icon={Twitter} href="https://twitter.com" />
              <SocialBtn icon={MessageSquare} href="https://discord.com" />
            </div>
          </div>

          {/* Links Grid */}
          <div className="md:col-span-12 lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-y-12 gap-x-8">
            
            {/* Navigasi */}
            <div className="footer-col">
              <h3 className="font-semibold text-white mb-6 text-sm tracking-wide">Produk</h3>
              <ul className="flex flex-col gap-4 text-sm text-[#A1A1A6]">
                <FooterLink href="/">Beranda</FooterLink>
                <FooterLink href="/modules">Katalog Topik</FooterLink>
                <FooterLink href="/playground">Live Editor</FooterLink>
                <FooterLink href="/leaderboard">Leaderboard</FooterLink>
              </ul>
            </div>

            {/* Akun */}
            <div className="footer-col">
              <h3 className="font-semibold text-white mb-6 text-sm tracking-wide">Platform</h3>
              <ul className="flex flex-col gap-4 text-sm text-[#A1A1A6]">
                <FooterLink href="/login">Masuk</FooterLink>
                <FooterLink href="/register">Buat Akun</FooterLink>
                <FooterLink href="/dashboard">Dashboard</FooterLink>
                <FooterLink href="/settings">Pengaturan</FooterLink>
              </ul>
            </div>

            {/* Resources */}
            <div className="footer-col col-span-2 sm:col-span-1">
              <h3 className="font-semibold text-white mb-6 text-sm tracking-wide">Ekosistem</h3>
              <ul className="flex flex-col gap-4 text-sm text-[#A1A1A6]">
                <FooterLink href="https://go.dev/">Go Official Docs</FooterLink>
                <FooterLink href="https://github.com/Kahfi10/go-learning">Open Source</FooterLink>
                <FooterLink href="/community">Komunitas Discord</FooterLink>
              </ul>
              
              <div className="mt-8 flex items-center gap-2.5">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                </span>
                <span className="text-sm font-medium text-white">Sistem Berjalan</span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Edge-to-Edge Wordmark */}
      <div className="w-full relative z-10 border-b border-white/10 pb-4 mb-6 overflow-hidden flex justify-center items-end wordmark-reveal mt-12">
        <h2 className="font-display font-bold text-[15vw] md:text-[16vw] leading-[0.75] tracking-[-0.04em] text-white/5 uppercase select-none origin-bottom whitespace-nowrap">
          GOLEARN
        </h2>
      </div>

      {/* Bottom Credits */}
      <div className="relative z-10 mx-auto w-full max-w-screen-2xl px-6 sm:px-12 lg:px-20 credits-reveal flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-[#A1A1A6]">
        <p>© 2026 GoLearn Interactive. Seluruh hak cipta dilindungi.</p>
        <div className="flex items-center gap-6">
          <Link href="/privacy" className="hover:text-white transition-colors">Privasi</Link>
          <Link href="/terms" className="hover:text-white transition-colors">Ketentuan</Link>
          <span className="w-1 h-1 rounded-full bg-[#A1A1A6]/30 hidden sm:block" />
          <p className="text-white hidden sm:block">Dibuat di Indonesia</p>
        </div>
      </div>

    </footer>
  );
}

// Helper components
function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="group inline-flex items-center gap-2 hover:text-white transition-colors">
        {children}
        <ArrowRight className="w-3.5 h-3.5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-white" />
      </Link>
    </li>
  );
}

function SocialBtn({ icon: Icon, href }: { icon: any; href: string }) {
  return (
    <a 
      href={href} 
      target="_blank" 
      rel="noopener noreferrer"
      className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all hover:scale-105"
    >
      <Icon className="w-4 h-4" />
    </a>
  );
}