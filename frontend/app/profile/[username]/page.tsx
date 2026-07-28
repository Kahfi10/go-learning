"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Calendar, Flame, Zap, BookOpen } from "lucide-react";
import Navbar from "@/components/navigation/Navbar";
import { useAuth } from "@/context/AuthContext";
import { api, type Badge } from "@/lib/api";
import { xpToLevel, LEVEL_NAMES, formatXP } from "@/lib/utils";

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const { state } = useAuth();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [stats, setStats] = useState<any>(null);
  const isMe = state.user?.name === username || username === "me";

  useEffect(() => {
    if (state.user && isMe) {
      api.progress.stats().then(setStats).catch(() => {});
      api.progress.badges().then(setBadges).catch(() => {});
    }
  }, [state.user, isMe]);

  const user = state.user;
  const level = stats ? xpToLevel(stats.xp) : 1;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-20 px-6 mx-auto max-w-3xl">
        {/* Avatar & name */}
        <div className="flex items-center gap-5 mb-10">
          <div className="w-16 h-16 rounded-full bg-[#0071E3] flex items-center justify-center text-white text-[24px] font-semibold">
            {user?.name?.charAt(0).toUpperCase() ?? "G"}
          </div>
          <div>
            <h1 className="font-display font-semibold text-[28px] tracking-tight text-foreground">{user?.name ?? username}</h1>
            <p className="text-[#86868B] text-[15px]">Level {level} · {LEVEL_NAMES[level]}</p>
            {user?.email && <p className="text-[#86868B] text-[13px]">{user.email}</p>}
          </div>
        </div>

        {/* Stats row */}
        {stats && (
          <div className="grid grid-cols-3 gap-4 mb-10">
            {[
              { icon: Zap, label: "Total XP", value: formatXP(stats.xp), color: "#0071E3" },
              { icon: Flame, label: "Streak", value: `${stats.streak_days}d`, color: "#FF9500" },
              { icon: BookOpen, label: "Lessons", value: `${stats.lessons_completed}`, color: "#34C759" },
            ].map((s) => (
              <div key={s.label} className="bg-[#F5F5F7] dark:bg-[#1C1C1E] rounded-[14px] p-4 text-center">
                <s.icon className="w-5 h-5 mx-auto mb-2" style={{ color: s.color }} />
                <p className="font-semibold text-[22px] text-foreground">{s.value}</p>
                <p className="text-[#86868B] text-[12px]">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Badges */}
        <div>
          <p className="text-[12px] font-semibold text-[#86868B] uppercase tracking-widest mb-4">Badges</p>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
            {badges.map((b) => (
              <div key={b.slug} className={`rounded-[14px] p-4 text-center transition-all ${b.earned ? "bg-[#F5F5F7] dark:bg-[#1C1C1E]" : "bg-[#F5F5F7]/50 dark:bg-[#1C1C1E]/40 opacity-40"}`}>
                <div className="text-[24px] mb-2">🏅</div>
                <p className="text-[11px] font-medium text-foreground leading-tight">{b.name_id}</p>
                {b.earned_at && <p className="text-[10px] text-[#86868B] mt-1">{new Date(b.earned_at).toLocaleDateString("id-ID")}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
