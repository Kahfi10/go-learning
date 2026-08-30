"use client";

import Link from "next/link";
import { BookOpen } from "lucide-react";

export default function EditorialFooter() {
  return (
    <footer className="w-full bg-[#050505] text-white pt-[100px] sm:pt-[160px] pb-[40px] px-6 sm:px-12 border-t border-white/5">
      <div className="mx-auto w-full max-w-screen-2xl">
        
        {/* 15-Column Grid Layout (Approximated with Tailwind Grid) */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-12 gap-10 sm:gap-6 mb-[120px] sm:mb-[200px]">
          
          {/* Logo Stack (Spans 3 cols) */}
          <div className="col-span-2 md:col-span-4 lg:col-span-3 lg:col-start-1 mb-8 lg:mb-0">
            <Link href="/" className="inline-block group">
              <h1 className="font-sans text-[18px] leading-[1.2] font-semibold tracking-[-0.02em]">
                <span className="block text-[#0071E3] group-hover:text-white transition-colors">GoLearn</span>
                <span className="block">Interactive</span>
                <span className="block font-display">Platform</span>
              </h1>
            </Link>
          </div>

          {/* Nav Col 1 (Spans 2 cols) */}
          <div className="col-span-1 lg:col-span-2 lg:col-start-5">
            <p className="font-display font-medium text-[#86868B] mb-4">Navigasi</p>
            <ul className="flex flex-col gap-3 text-[14px]">
              <li><Link href="/" className="hover:text-[#0071E3] transition-colors">Beranda</Link></li>
              <li><Link href="/modules" className="hover:text-[#0071E3] transition-colors">Katalog Modul</Link></li>
              <li><Link href="/playground" className="hover:text-[#0071E3] transition-colors">Playground</Link></li>
              <li><Link href="/leaderboard" className="hover:text-[#0071E3] transition-colors">Leaderboard</Link></li>
              <li className="pt-3"><Link href="/dashboard" className="hover:text-[#0071E3] transition-colors">Dashboard User</Link></li>
            </ul>
          </div>

          {/* Nav Col 2 (Spans 2 cols) */}
          <div className="col-span-1 lg:col-span-2 lg:col-start-8">
            <p className="font-display font-medium text-[#86868B] mb-4">Akun & Auth</p>
            <ul className="flex flex-col gap-3 text-[14px]">
              <li><Link href="/login" className="hover:text-[#0071E3] transition-colors">Masuk (Login)</Link></li>
              <li><Link href="/register" className="hover:text-[#0071E3] transition-colors">Daftar Akun Baru</Link></li>
              <li><Link href="/settings" className="hover:text-[#0071E3] transition-colors">Pengaturan</Link></li>
            </ul>
          </div>

          {/* Resources & Open Source (Spans 3 cols) */}
          <div className="col-span-2 lg:col-span-3 lg:col-start-10">
            <p className="font-display font-medium text-[#86868B] mb-4">Resources</p>
            <ul className="flex flex-col gap-3 text-[14px]">
              <li><a href="https://go.dev/" target="_blank" rel="noopener noreferrer" className="hover:text-[#0071E3] transition-colors">Official Go Docs ↗</a></li>
              <li><a href="https://github.com/Kahfi10/go-learning" target="_blank" rel="noopener noreferrer" className="hover:text-[#0071E3] transition-colors">GitHub Repository ↗</a></li>
            </ul>
            
            <p className="font-display font-medium text-[#86868B] mb-4 mt-8">Status</p>
            <div className="flex items-center gap-2 text-[14px]">
              <span className="w-2 h-2 rounded-full bg-[#34C759]" />
              Semua sistem berjalan
            </div>
          </div>
        </div>

        {/* Giant Wordmark */}
        <div className="w-full border-b border-white/10 pb-8 sm:pb-12 mb-8">
          <h2 className="font-display font-bold text-center text-[15vw] leading-[0.75] tracking-tight text-white/5 uppercase select-none">
            GOLEARN
          </h2>
        </div>

        {/* Bottom Credits Row */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-6 text-[13px] text-[#86868B]">
          <p>© 2026 GoLearn. All rights reserved.</p>
          <div className="flex items-center gap-8">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <p>Dibangun untuk Indonesia</p>
          </div>
        </div>

      </div>
    </footer>
  );
}