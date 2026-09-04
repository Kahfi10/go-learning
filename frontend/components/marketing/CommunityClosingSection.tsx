"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { 
  Flame, 
  Terminal, 
  Play, 
  Github, 
  Sparkles, 
  Activity, 
  Zap,
  CheckCircle2
} from "lucide-react";

// Realist avatars for Celestial Community Orbit
const COMMUNITY_MEMBERS = [
  { name: "Budi Santoso", initials: "BS", role: "Senior Go Engineer", flag: "🇮🇩", gradient: "from-[#0071E3] to-[#00ADD8]" },
  { name: "Alex Rivera", initials: "AR", role: "Infrastructure Lead", flag: "🇺🇸", gradient: "from-[#34C759] to-[#30D158]" },
  { name: "Sarah Chen", initials: "SC", role: "Distributed Systems SRE", flag: "🇸🇬", gradient: "from-[#FF9500] to-[#FFD60A]" },
  { name: "Rizky Pratama", initials: "RP", role: "Backend Architect", flag: "🇮🇩", gradient: "from-[#AF52DE] to-[#5856D6]" },
  { name: "Elena Rostova", initials: "ER", role: "Kubernetes Maintainer", flag: "🇩🇪", gradient: "from-[#FF453A] to-[#FF9500]" },
  { name: "Kenji Sato", initials: "KS", role: "gRPC & Network Lead", flag: "🇯🇵", gradient: "from-[#5AC8FA] to-[#0071E3]" },
  { name: "Fajar Nugraha", initials: "FN", role: "Open Source Contributor", flag: "🇮🇩", gradient: "from-[#30D158] to-[#34C759]" },
  { name: "David Miller", initials: "DM", role: "Go Core Contributor", flag: "🇬🇧", gradient: "from-[#FFD60A] to-[#FF9500]" },
];

// Deterministic floating particles for Gravity Field effect
const ORBIT_PARTICLES = [
  { x: 18, y: 12, size: 2, ci: 0, delay: 0, dur: 7 },
  { x: 78, y: 22, size: 1.5, ci: 1, delay: 1.2, dur: 8 },
  { x: 88, y: 62, size: 2, ci: 2, delay: 0.5, dur: 6.5 },
  { x: 25, y: 78, size: 1.5, ci: 0, delay: 2, dur: 9 },
  { x: 62, y: 8, size: 2, ci: 1, delay: 1.5, dur: 7.5 },
  { x: 8, y: 48, size: 1.5, ci: 2, delay: 0.8, dur: 8.5 },
  { x: 55, y: 88, size: 2, ci: 0, delay: 2.5, dur: 6 },
  { x: 92, y: 38, size: 1.5, ci: 1, delay: 0.3, dur: 9.5 },
  { x: 42, y: 35, size: 1.5, ci: 2, delay: 3, dur: 7 },
  { x: 70, y: 75, size: 2, ci: 0, delay: 1.8, dur: 8 },
];
const PARTICLE_COLORS = ['#00ADD8', '#34C759', '#AF52DE'];

// Activity Heatmap Days (18 weeks x 7 days)
const HEATMAP_WEEKS = 18;
const HEATMAP_DAYS = 7;
const SAMPLE_ACTIVITY = Array.from({ length: HEATMAP_WEEKS * HEATMAP_DAYS }, (_, i) => {
  const mod = (i * 17) % 23;
  if (mod > 16) return 3; // high
  if (mod > 10) return 2; // medium
  if (mod > 4) return 1;  // low
  return 0;               // none
});

export default function CommunityClosingSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const card1Ref = useRef<HTMLDivElement>(null);
  const card1DimRef = useRef<HTMLDivElement>(null);
  const card2Ref = useRef<HTMLDivElement>(null);
  const card2DimRef = useRef<HTMLDivElement>(null);
  const card3Ref = useRef<HTMLDivElement>(null);
  const orbitInnerRef = useRef<HTMLDivElement>(null);
  const orbitMidRef = useRef<HTMLDivElement>(null);
  const orbitOuterRef = useRef<HTMLDivElement>(null);

  const [activeAvatar, setActiveAvatar] = useState<typeof COMMUNITY_MEMBERS[0] | null>(null);
  const [isRunningCode, setIsRunningCode] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    "✓ Runtime siap. Klik tombol di bawah untuk simulasi konkurensi.",
  ]);

  // Run Code Simulation
  const handleRunCode = () => {
    if (isRunningCode) return;
    setIsRunningCode(true);
    setTerminalLogs([
      "⚡ Menginisialisasi Go runtime v1.24...", 
      "Membuat worker pool konkurensi (3 workers, 10 payload jobs)..."
    ]);

    setTimeout(() => {
      setTerminalLogs(prev => [
        ...prev,
        "[Worker 1] memproses job #101 via buffered channel — 0.001s",
        "[Worker 2] memproses job #102 via buffered channel — 0.002s",
      ]);
    }, 350);

    setTimeout(() => {
      setTerminalLogs(prev => [
        ...prev,
        "[Worker 3] memproses job #103 (sync.WaitGroup done) — 0.001s",
        "✓ Berhasil: 10 goroutine selesai paralel tanpa race condition!",
        "⚡ Waktu eksekusi: 0.003s (0 alokasi memori bocor)",
      ]);
      setIsRunningCode(false);
    }, 900);
  };

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // 1. Multi-Ring Orbit Rotations (different speeds & directions)
      // Inner ring: fastest, clockwise (28s)
      gsap.to(orbitInnerRef.current, { rotation: 360, duration: 28, repeat: -1, ease: "none" });
      gsap.to(".orbit-inner-avatar", { rotation: -360, duration: 28, repeat: -1, ease: "none" });

      // Mid ring: medium, counter-clockwise (42s)
      gsap.to(orbitMidRef.current, { rotation: -360, duration: 42, repeat: -1, ease: "none" });
      gsap.to(".orbit-mid-avatar", { rotation: 360, duration: 42, repeat: -1, ease: "none" });

      // Outer ring: slowest, clockwise (58s)
      gsap.to(orbitOuterRef.current, { rotation: 360, duration: 58, repeat: -1, ease: "none" });
      gsap.to(".orbit-outer-avatar", { rotation: -360, duration: 58, repeat: -1, ease: "none" });

      // Central pulse ripples (contained scale)
      gsap.fromTo(
        ".orbit-pulse-ring",
        { scale: 0.8, opacity: 0.25 },
        { scale: 1.8, opacity: 0, duration: 3, repeat: -1, stagger: 1, ease: "power1.out" }
      );

      // 2. Subtle Card Stacking Depth without shrinking scale
      const mm = gsap.matchMedia();
      mm.add("(min-width: 768px)", () => {
        if (card2Ref.current && card1Ref.current && card1DimRef.current) {
          ScrollTrigger.create({
            trigger: card2Ref.current,
            start: "top 70%",
            end: "top 25%",
            scrub: true,
            animation: gsap.timeline()
              .to(card1DimRef.current, { opacity: 0.45, ease: "none" }, 0),
          });
        }

        if (card3Ref.current && card2Ref.current && card2DimRef.current) {
          ScrollTrigger.create({
            trigger: card3Ref.current,
            start: "top 70%",
            end: "top 25%",
            scrub: true,
            animation: gsap.timeline()
              .to(card2DimRef.current, { opacity: 0.45, ease: "none" }, 0)
              .to(card1DimRef.current, { opacity: 0.7, ease: "none" }, 0),
          });
        }
      });

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative w-full bg-[#050505] text-white py-20 lg:py-28 border-t border-white/[0.08]">
      
      {/* Top Header Badge */}
      <div className="text-center mb-12 sm:mb-16 px-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.05] border border-white/[0.1] text-xs font-mono tracking-widest text-[#86868B] uppercase mb-4 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-[#00ADD8]" />
          <span>Komunitas & Proses • 3 Pilar</span>
        </div>
        <h2 className="font-display text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
          Belajar Go dibentuk oleh <span className="text-[#00ADD8]">praktik</span>, <span className="text-[#34C759]">ritme</span>, dan <span className="text-white">komunitas</span>.
        </h2>
      </div>

      {/* Stacked Cards Deck */}
      <div className="relative w-full max-w-[1340px] mx-auto px-6 sm:px-10 space-y-12 sm:space-y-16">
        
        {/* ══════════════════════════════════════════════════════════════════
            CARD 1: KOMUNITAS — Celestial Orbit & Gopher Network
        ══════════════════════════════════════════════════════════════════ */}
        <div 
          ref={card1Ref}
          className="sticky top-20 sm:top-24 z-10 w-full min-h-[500px] sm:min-h-[560px] rounded-3xl bg-gradient-to-br from-[#0e1219] via-[#080b11] to-[#040609] border border-white/[0.12] p-8 sm:p-12 lg:p-14 shadow-[0_25px_80px_rgba(0,0,0,0.9)] flex flex-col lg:flex-row items-center justify-between gap-8 sm:gap-12 overflow-hidden will-change-transform"
        >
            {/* Dark dimming overlay for stacked depth */}
            <div ref={card1DimRef} className="absolute inset-0 bg-black pointer-events-none rounded-3xl opacity-0 z-40" />

            {/* Ambient Corner Glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#00ADD8]/10 rounded-full blur-3xl pointer-events-none" />

            {/* Left Column: Narrative */}
            <div className="flex-1 flex flex-col justify-between h-full z-10 max-w-xl text-left">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00ADD8]/10 border border-[#00ADD8]/30 text-xs font-mono font-medium text-[#00ADD8] mb-3">
                  <span>01 / 03</span>
                  <span className="w-1 h-1 rounded-full bg-[#00ADD8]" />
                  <span>KOMUNITAS GLOBAL</span>
                </div>
                
                <h3 className="font-display text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2.5 tracking-tight">
                  Ekosistem Gopher yang Aktif & Terbuka
                </h3>
                
                <p className="text-xs sm:text-sm text-[#86868B] leading-relaxed mb-5">
                  Dari pemula hingga maintainer open-source kelas dunia, belajar bersama dalam ruang diskusi Discord, review kode nyata, dan forum kolaborasi.
                </p>
              </div>

              {/* Badges / Metrics */}
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/[0.08]">
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                    </span>
                    <span className="text-xs text-[#86868B]">Discord Active</span>
                  </div>
                  <p className="font-mono font-bold text-base sm:text-lg text-white">2,400+ Gophers</p>
                </div>

                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <div className="flex items-center gap-2 mb-1">
                    <Github className="w-3.5 h-3.5 text-white/70" />
                    <span className="text-xs text-[#86868B]">Open Source</span>
                  </div>
                  <p className="font-mono font-bold text-base sm:text-lg text-white">480+ Diskusi</p>
                </div>
              </div>
            </div>

            {/* Right Column: Multi-Ring Gravity Orbit */}
            <div className="flex-1 relative w-full min-h-[340px] sm:min-h-[400px] lg:min-h-[460px] flex items-center justify-center overflow-hidden rounded-2xl">

              {/* Deep ambient background glow */}
              <div className="absolute w-[360px] h-[360px] bg-[#00ADD8]/[0.06] rounded-full blur-[140px] pointer-events-none" />

              {/* Floating ambient particles (Gravity Field effect) */}
              {ORBIT_PARTICLES.map((p, i) => (
                <div
                  key={`p-${i}`}
                  className="absolute rounded-full pointer-events-none"
                  style={{
                    width: p.size,
                    height: p.size,
                    left: `${p.x}%`,
                    top: `${p.y}%`,
                    background: PARTICLE_COLORS[p.ci],
                    opacity: 0.25,
                    animation: `orbitFloat ${p.dur}s ease-in-out ${p.delay}s infinite alternate`,
                  }}
                />
              ))}

              {/* Central Pulse Ripple Rings */}
              <div className="orbit-pulse-ring absolute w-20 h-20 rounded-full border border-[#00ADD8]/25 pointer-events-none" />
              <div className="orbit-pulse-ring absolute w-20 h-20 rounded-full border border-[#00ADD8]/20 pointer-events-none" />
              <div className="orbit-pulse-ring absolute w-20 h-20 rounded-full border border-[#00ADD8]/15 pointer-events-none" />

              {/* ─── OUTER RING (3 avatars, slowest, clockwise 58s) ─── */}
              <div
                ref={orbitOuterRef}
                className="absolute w-[280px] sm:w-[340px] lg:w-[400px] h-[280px] sm:h-[340px] lg:h-[400px] rounded-full"
              >
                {/* Subtle ring path */}
                <div className="absolute inset-0 rounded-full border border-white/[0.06]" />
                {/* Gradient arc highlight */}
                <div className="absolute inset-0 rounded-full pointer-events-none" style={{ background: 'conic-gradient(from 0deg, transparent 0%, rgba(0,173,216,0.08) 12%, transparent 25%, transparent 100%)' }} />

                {[COMMUNITY_MEMBERS[2], COMMUNITY_MEMBERS[6], COMMUNITY_MEMBERS[7]].map((member, i) => {
                  const angle = i * 120 + 30;
                  const x = 50 + 47 * Math.cos((angle * Math.PI) / 180);
                  const y = 50 + 47 * Math.sin((angle * Math.PI) / 180);
                  return (
                    <div
                      key={member.name}
                      className="absolute orbit-outer-avatar"
                      style={{ top: `${y}%`, left: `${x}%`, transform: 'translate(-50%, -50%)' }}
                    >
                      {/* Ambient glow halo */}
                      <div className={`absolute -inset-3 rounded-full bg-gradient-to-tr ${member.gradient} opacity-[0.22] blur-lg pointer-events-none`} />
                      <div
                        onMouseEnter={() => setActiveAvatar(member)}
                        onMouseLeave={() => setActiveAvatar(null)}
                        className="relative w-11 h-11 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-full overflow-hidden border-2 border-white/[0.12] shadow-xl transition-all duration-300 hover:scale-[1.25] hover:border-[#00ADD8]/80 cursor-pointer"
                      >
                        <div className={`w-full h-full bg-gradient-to-tr ${member.gradient} flex items-center justify-center font-mono font-bold text-xs sm:text-sm text-white`}>
                          {member.initials}
                        </div>
                        <span className="absolute bottom-0 right-0 text-[8px] sm:text-[9px] bg-black/90 rounded-full px-1">{member.flag}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ─── MID RING (3 avatars, medium, counter-clockwise 42s) ─── */}
              <div
                ref={orbitMidRef}
                className="absolute w-[190px] sm:w-[230px] lg:w-[270px] h-[190px] sm:h-[230px] lg:h-[270px] rounded-full"
              >
                <div className="absolute inset-0 rounded-full border border-[#00ADD8]/[0.1]" />
                <div className="absolute inset-0 rounded-full pointer-events-none" style={{ background: 'conic-gradient(from 200deg, transparent 0%, rgba(0,173,216,0.1) 15%, transparent 30%, transparent 100%)' }} />

                {[COMMUNITY_MEMBERS[1], COMMUNITY_MEMBERS[3], COMMUNITY_MEMBERS[5]].map((member, i) => {
                  const angle = i * 120;
                  const x = 50 + 46 * Math.cos((angle * Math.PI) / 180);
                  const y = 50 + 46 * Math.sin((angle * Math.PI) / 180);
                  return (
                    <div
                      key={member.name}
                      className="absolute orbit-mid-avatar"
                      style={{ top: `${y}%`, left: `${x}%`, transform: 'translate(-50%, -50%)' }}
                    >
                      <div className={`absolute -inset-3 rounded-full bg-gradient-to-tr ${member.gradient} opacity-[0.25] blur-md pointer-events-none`} />
                      <div
                        onMouseEnter={() => setActiveAvatar(member)}
                        onMouseLeave={() => setActiveAvatar(null)}
                        className="relative w-11 h-11 sm:w-12 sm:h-12 lg:w-13 lg:h-13 rounded-full overflow-hidden border-2 border-white/[0.12] shadow-xl transition-all duration-300 hover:scale-[1.25] hover:border-[#00ADD8]/80 cursor-pointer"
                      >
                        <div className={`w-full h-full bg-gradient-to-tr ${member.gradient} flex items-center justify-center font-mono font-bold text-xs sm:text-sm text-white`}>
                          {member.initials}
                        </div>
                        <span className="absolute bottom-0 right-0 text-[8px] sm:text-[9px] bg-black/90 rounded-full px-1">{member.flag}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ─── INNER RING (2 avatars, fastest, clockwise 28s) ─── */}
              <div
                ref={orbitInnerRef}
                className="absolute w-[110px] sm:w-[130px] lg:w-[150px] h-[110px] sm:h-[130px] lg:h-[150px] rounded-full"
              >
                <div className="absolute inset-0 rounded-full border border-[#00ADD8]/[0.15]" />

                {[COMMUNITY_MEMBERS[0], COMMUNITY_MEMBERS[4]].map((member, i) => {
                  const angle = i * 180;
                  const x = 50 + 46 * Math.cos((angle * Math.PI) / 180);
                  const y = 50 + 46 * Math.sin((angle * Math.PI) / 180);
                  return (
                    <div
                      key={member.name}
                      className="absolute orbit-inner-avatar"
                      style={{ top: `${y}%`, left: `${x}%`, transform: 'translate(-50%, -50%)' }}
                    >
                      <div className={`absolute -inset-2.5 rounded-full bg-gradient-to-tr ${member.gradient} opacity-[0.3] blur-md pointer-events-none`} />
                      <div
                        onMouseEnter={() => setActiveAvatar(member)}
                        onMouseLeave={() => setActiveAvatar(null)}
                        className="relative w-12 h-12 sm:w-13 sm:h-13 lg:w-14 lg:h-14 rounded-full overflow-hidden border-2 border-white/[0.15] shadow-xl transition-all duration-300 hover:scale-[1.25] hover:border-[#00ADD8]/80 cursor-pointer"
                      >
                        <div className={`w-full h-full bg-gradient-to-tr ${member.gradient} flex items-center justify-center font-mono font-bold text-xs sm:text-sm text-white`}>
                          {member.initials}
                        </div>
                        <span className="absolute bottom-0 right-0 text-[9px] bg-black/90 rounded-full px-1">{member.flag}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Central Glowing Core */}
              <div className="relative z-10 flex flex-col items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-[#0a1a20] to-[#050d10] border border-[#00ADD8]/30 shadow-[0_0_60px_rgba(0,173,216,0.3)]">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#00ADD8] text-black flex items-center justify-center font-bold text-sm sm:text-base shadow-[0_0_25px_#00ADD8]">
                  Go
                </div>
                <span className="text-[8px] sm:text-[9px] font-mono text-white/80 mt-1 tracking-wider uppercase">Hub</span>
              </div>

              {/* Hover Tooltip Card */}
              {activeAvatar && (
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-30 px-3.5 py-1.5 rounded-xl bg-black/95 border border-[#00ADD8]/50 shadow-2xl flex items-center gap-2.5 pointer-events-none" style={{ animation: 'orbitFadeIn 0.2s ease-out' }}>
                  <div className={`w-6 h-6 rounded-full bg-gradient-to-tr ${activeAvatar.gradient} flex items-center justify-center text-[10px] font-bold text-white`}>
                    {activeAvatar.initials}
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-semibold text-white leading-none flex items-center gap-1.5">
                      {activeAvatar.name} <span>{activeAvatar.flag}</span>
                    </p>
                    <p className="text-[10px] text-[#86868B] mt-0.5">{activeAvatar.role}</p>
                  </div>
                </div>
              )}

              {/* Orbit Animation Keyframes */}
              <style jsx global>{`
                @keyframes orbitFloat {
                  0%, 100% { transform: translateY(0px) scale(1); opacity: 0.15; }
                  50% { transform: translateY(-16px) scale(1.4); opacity: 0.45; }
                }
                @keyframes orbitFadeIn {
                  from { opacity: 0; transform: translate(-50%, 6px); }
                  to { opacity: 1; transform: translate(-50%, 0); }
                }
              `}</style>

            </div>
          </div>


          {/* ══════════════════════════════════════════════════════════════════
              CARD 2: RITME — Daily Practice Heatmap & Streak Tracking
          ══════════════════════════════════════════════════════════════════ */}
          <div 
            ref={card2Ref}
            className="sticky top-24 sm:top-28 z-20 w-full min-h-[500px] sm:min-h-[560px] rounded-3xl bg-gradient-to-br from-[#091512] via-[#060e0c] to-[#030605] border border-white/[0.12] p-8 sm:p-12 lg:p-14 shadow-[0_25px_80px_rgba(0,0,0,0.9)] flex flex-col lg:flex-row items-center justify-between gap-8 sm:gap-12 overflow-hidden will-change-transform"
          >
            {/* Dark dimming overlay for stacked depth */}
            <div ref={card2DimRef} className="absolute inset-0 bg-black pointer-events-none rounded-3xl opacity-0 z-40" />

            {/* Ambient Corner Glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#34C759]/10 rounded-full blur-3xl pointer-events-none" />

            {/* Left Column: Narrative */}
            <div className="flex-1 flex flex-col justify-between h-full z-10 max-w-xl text-left">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#34C759]/10 border border-[#34C759]/30 text-xs font-mono font-medium text-[#34C759] mb-3">
                  <span>02 / 03</span>
                  <span className="w-1 h-1 rounded-full bg-[#34C759]" />
                  <span>RITME BELAJAR</span>
                </div>
                
                <h3 className="font-display text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2.5 tracking-tight">
                  Konsistensi Nyata, Bukan Teori Semata
                </h3>
                
                <p className="text-xs sm:text-sm text-[#86868B] leading-relaxed mb-5">
                  Bangun kebiasaan coding harian dengan modul mikro, tantangan kuis terstruktur, dan pelacakan ritme belajar yang jelas.
                </p>
              </div>

              {/* Streak Highlight Pill */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#34C759]/10 to-transparent border border-[#34C759]/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#34C759]/20 text-[#34C759] flex items-center justify-center font-bold">
                    <Flame className="w-5 h-5 fill-[#34C759]" />
                  </div>
                  <div>
                    <p className="text-xs text-[#86868B]">Current Habit Streak</p>
                    <p className="font-mono font-bold text-base sm:text-lg text-white">24 Hari Berturut-turut</p>
                  </div>
                </div>
                <div className="text-right font-mono text-xs text-[#34C759] font-medium">
                  +350 XP / Pekan
                </div>
              </div>
            </div>

            {/* Right Column: GitHub Style Practice Heatmap */}
            <div className="flex-1 w-full min-h-[340px] sm:min-h-[400px] lg:min-h-[460px] flex flex-col justify-center items-center z-10 bg-[#080d0b] border border-white/[0.08] rounded-2xl p-6 sm:p-8 lg:p-10 shadow-2xl">
              
              <div className="w-full flex items-center justify-between mb-4 text-xs sm:text-sm">
                <span className="font-mono text-white/90 font-semibold flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#34C759]" />
                  Activity Practice Grid
                </span>
                <span className="text-[#86868B] font-mono text-xs">126 Sesi Selesai</span>
              </div>

              {/* Heatmap Grid */}
              <div className="w-full overflow-x-auto pb-3 flex justify-center">
                <div className="grid grid-flow-col grid-rows-7 gap-1.5 sm:gap-2 w-max mx-auto">
                  {SAMPLE_ACTIVITY.map((level, idx) => {
                    let bg = "bg-white/[0.05]";
                    if (level === 1) bg = "bg-[#00ADD8]/30 border border-[#00ADD8]/40";
                    if (level === 2) bg = "bg-[#34C759]/60 shadow-[0_0_8px_rgba(52,199,89,0.3)]";
                    if (level === 3) bg = "bg-[#34C759] shadow-[0_0_12px_rgba(52,199,89,0.6)]";

                    return (
                      <div
                        key={idx}
                        title={`Day ${idx + 1}: ${level > 0 ? `${level * 2} kuis diselesaikan` : 'Istirahat'}`}
                        className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-sm ${bg} transition-transform hover:scale-125 hover:z-20 cursor-pointer`}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Legend & Stats */}
              <div className="w-full flex items-center justify-between text-xs text-[#86868B] mt-4 pt-3.5 border-t border-white/[0.06]">
                <span>Kurang</span>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-white/[0.05]" />
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#00ADD8]/30" />
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#34C759]/60" />
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#34C759]" />
                </div>
                <span>Sangat Aktif</span>
              </div>

            </div>
          </div>


          {/* ══════════════════════════════════════════════════════════════════
              CARD 3: PRAKTIK — Live Concurrency IDE & Production Runner
          ══════════════════════════════════════════════════════════════════ */}
          <div 
            ref={card3Ref}
            className="sticky top-28 sm:top-32 z-30 w-full min-h-[500px] sm:min-h-[560px] rounded-3xl bg-gradient-to-br from-[#120e17] via-[#0b0811] to-[#050308] border border-white/[0.12] p-8 sm:p-12 lg:p-14 shadow-[0_25px_80px_rgba(0,0,0,0.9)] flex flex-col lg:flex-row items-center justify-between gap-8 sm:gap-12 overflow-hidden will-change-transform"
          >
            {/* Ambient Corner Glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#AF52DE]/10 rounded-full blur-3xl pointer-events-none" />

            {/* Left Column: Narrative */}
            <div className="flex-1 flex flex-col justify-between h-full z-10 max-w-xl text-left">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#AF52DE]/10 border border-[#AF52DE]/30 text-xs font-mono font-medium text-[#AF52DE] mb-3">
                  <span>03 / 03</span>
                  <span className="w-1 h-1 rounded-full bg-[#AF52DE]" />
                  <span>PRAKTIK PRODUKSI</span>
                </div>
                
                <h3 className="font-display text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2.5 tracking-tight">
                  Eksekusi Kode Konkurensi Nyata di Browser
                </h3>
                
                <p className="text-xs sm:text-sm text-[#86868B] leading-relaxed mb-5">
                  Tulis, jalankan, dan rasakan kekuatan Goroutines serta Buffered Channels langsung di browser tanpa konfigurasi lingkungan lokal.
                </p>
              </div>

              {/* Interactive Run Button */}
              <div className="flex flex-col gap-2.5">
                <button
                  onClick={handleRunCode}
                  disabled={isRunningCode}
                  className="w-full py-2.5 px-4 rounded-xl bg-white text-black font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 hover:bg-white/90 active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] disabled:opacity-50 cursor-pointer"
                >
                  <Play className={`w-3.5 h-3.5 fill-black ${isRunningCode ? 'animate-spin' : ''}`} />
                  {isRunningCode ? "Menjalankan Goroutines..." : "Jalankan Kode Konkurensi"}
                </button>
                <div className="flex items-center justify-between text-[11px] text-[#86868B] px-1 font-mono">
                  <span className="flex items-center gap-1">
                    <Zap className="w-3 h-3 text-[#00ADD8]" />
                    Zero Allocations
                  </span>
                  <span>Isolation: Docker Sandbox</span>
                </div>
              </div>
            </div>

            {/* Right Column: Mini macOS Terminal & IDE */}
            <div className="flex-1 w-full min-h-[340px] sm:min-h-[400px] lg:min-h-[460px] bg-[#0A0A0C] border border-white/10 rounded-2xl overflow-hidden flex flex-col z-10 shadow-2xl">
              
              {/* Window Titlebar */}
              <div className="px-4 py-2 bg-[#141418] border-b border-white/[0.08] flex items-center justify-between select-none">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#28C840]/80" />
                </div>
                <span className="font-mono text-[11px] text-[#86868B]">concurrency_pool.go</span>
                <span className="text-[9px] font-mono text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded border border-green-500/20">
                  Go 1.24
                </span>
              </div>

              {/* Code Snippet View */}
              <div className="p-3 bg-[#0D0D11] border-b border-white/[0.06] font-mono text-[10.5px] sm:text-[11px] text-[#D1D1D6] leading-relaxed text-left">
                <p><span className="text-[#00ADD8]">package</span> main</p>
                <p><span className="text-[#AF52DE]">func</span> <span className="text-[#34C759]">worker</span>(id <span className="text-[#FF9500]">int</span>, ch &lt;-<span className="text-[#AF52DE]">chan</span> <span className="text-[#FF9500]">Job</span>, wg *<span className="text-[#FF9500]">sync.WaitGroup</span>) &#123;</p>
                <p className="pl-3.5 text-[#86868B]">&#47;&#47; Eksekusi paralel 100% thread-safe</p>
                <p className="pl-3.5"><span className="text-[#AF52DE]">for</span> job := <span className="text-[#AF52DE]">range</span> ch &#123; job.Execute() &#125;</p>
                <p>&#125;</p>
              </div>

              {/* Live Terminal Output Console */}
              <div className="flex-1 p-3 bg-[#050507] overflow-y-auto font-mono text-[10px] sm:text-[10.5px] text-left flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-[11px] text-[#86868B] mb-0.5">
                  <Terminal className="w-3 h-3 text-[#00ADD8]" />
                  <span>Terminal stdout:</span>
                </div>
                {terminalLogs.map((log, i) => (
                  <p 
                    key={i} 
                    className={`${
                      log.startsWith("✓") 
                        ? "text-green-400 font-semibold" 
                        : log.startsWith("⚡") 
                        ? "text-[#00ADD8]" 
                        : "text-[#A1A1A6]"
                    }`}
                  >
                    {log}
                  </p>
                ))}
              </div>

            </div>

          </div>

      </div>

    </section>
  );
}