"use client";
import { useEffect, useState } from "react";
import { Trophy, Medal, Crown } from "lucide-react";
import Navbar from "@/components/navigation/Navbar";
import { api, type LeaderboardEntry } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { cn, xpToLevel, LEVEL_NAMES, formatXP } from "@/lib/utils";

const PERIODS = [
  { key: "alltime", label: "Semua Waktu" },
  { key: "month",   label: "Bulan Ini" },
  { key: "week",    label: "Minggu Ini" },
] as const;

export default function LeaderboardPage() {
  const { state } = useAuth();
  const [period, setPeriod] = useState<"alltime" | "month" | "week">("alltime");
  const [data, setData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.leaderboard(period).then((d) => { setData(d ?? []); setLoading(false); }).catch(() => setLoading(false));
  }, [period]);

  useEffect(() => {
    if (!data.length) return;
    import("gsap").then(({ gsap }) => {
      gsap.from(".lb-row", { opacity: 0, x: -20, duration: 0.4, ease: "expo.out", stagger: 0.04 });
    });
  }, [data, period]);

  const RANK_ICONS = [
    <Crown key="1" className="w-4 h-4 text-[#FFD700]" />,
    <Medal key="2" className="w-4 h-4 text-[#C0C0C0]" />,
    <Medal key="3" className="w-4 h-4 text-[#CD7F32]" />,
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-20 px-6 mx-auto max-w-3xl">
        <div className="mb-8">
          <p className="text-[#86868B] text-[13px] uppercase tracking-widest mb-2">Kompetisi</p>
          <h1 className="font-display font-semibold text-[36px] tracking-tight text-foreground">Leaderboard</h1>
          <p className="text-[#86868B] mt-1">Top 50 Go learners berdasarkan XP</p>
        </div>

        {/* Period tabs */}
        <div className="flex items-center gap-2 mb-6">
          {PERIODS.map((p) => (
            <button key={p.key} onClick={() => setPeriod(p.key)}
              className={cn("px-4 py-1.5 rounded-full text-[13px] font-medium transition-colors",
                period === p.key ? "bg-[#0071E3] text-white" : "bg-[#F5F5F7] dark:bg-[#1C1C1E] text-[#86868B] hover:text-foreground")}>
              {p.label}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-[#F5F5F7] dark:bg-[#1C1C1E] rounded-[18px] overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-[40px_1fr_80px_80px] gap-3 px-5 py-3 border-b border-[#D2D2D7]/50 text-[11px] font-semibold text-[#86868B] uppercase tracking-widest">
            <span>#</span><span>Pengguna</span><span className="text-right">XP</span><span className="text-right">Lesson</span>
          </div>

          {loading && (
            <div className="py-12 text-center text-[#86868B] text-[14px]">Memuat...</div>
          )}

          {!loading && data.length === 0 && (
            <div className="py-12 text-center text-[#86868B]">
              <Trophy className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-[14px]">Belum ada data untuk periode ini</p>
            </div>
          )}

          {data.map((entry) => {
            const isMe = state.user?.id === entry.id;
            return (
              <div key={entry.id}
                className={cn(
                  "lb-row grid grid-cols-[40px_1fr_80px_80px] gap-3 px-5 py-3.5 items-center border-b border-[#D2D2D7]/30 last:border-0 transition-colors",
                  isMe ? "bg-[#0071E3]/8 dark:bg-[#0071E3]/10" : "hover:bg-white/50 dark:hover:bg-white/5"
                )}>
                {/* Rank */}
                <div className="flex items-center justify-center">
                  {entry.rank <= 3
                    ? RANK_ICONS[entry.rank - 1]
                    : <span className="text-[13px] font-semibold text-[#86868B]">{entry.rank}</span>
                  }
                </div>

                {/* User */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-[#0071E3] flex items-center justify-center text-white text-[12px] font-semibold flex-shrink-0">
                    {entry.avatar_url
                      ? <img src={entry.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                      : entry.name.charAt(0).toUpperCase()
                    }
                  </div>
                  <div className="min-w-0">
                    <p className={cn("text-[14px] font-medium truncate", isMe ? "text-[#0071E3]" : "text-foreground")}>
                      {entry.name} {isMe && <span className="text-[11px]">(Kamu)</span>}
                    </p>
                    <p className="text-[11px] text-[#86868B]">Level {entry.level} · {LEVEL_NAMES[entry.level]}</p>
                  </div>
                </div>

                {/* XP */}
                <p className={cn("text-[14px] font-semibold text-right", entry.rank === 1 ? "text-[#FFD700]" : "text-foreground")}>
                  {formatXP(entry.xp)}
                </p>

                {/* Lessons */}
                <p className="text-[13px] text-[#86868B] text-right">{entry.lessons_done}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
