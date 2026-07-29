"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, Globe, Lock, Trash2, ChevronRight, Moon, Sun } from "lucide-react";
import Navbar from "@/components/navigation/Navbar";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const router = useRouter();
  const { state, logout, refresh } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();
  const [name, setName] = useState("");
  const [lang, setLang] = useState<"id" | "en">("id");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!state.loading && !state.user) router.push("/login");
    if (state.user) {
      setName(state.user.name);
      setLang(state.user.lang_pref ?? "id");
    }
  }, [state]);

  async function saveProfile() {
    setSaving(true);
    try {
      await api.auth.updateMe({ name, lang_pref: lang });
      await refresh();
      toast.success("Profil berhasil disimpan");
    } catch (e: any) {
      toast.error(e.message ?? "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    await logout();
    router.push("/");
    toast.success("Berhasil keluar");
  }

  const SECTION_CLS = "bg-[#F5F5F7] dark:bg-[#1C1C1E] rounded-[18px] overflow-hidden";
  const ROW_CLS = "flex items-center justify-between px-5 py-4 border-b border-[#D2D2D7]/40 last:border-0";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-20 px-6 mx-auto max-w-lg">
        <div className="mb-8">
          <p className="text-[#86868B] text-[13px] uppercase tracking-widest mb-2">Pengaturan</p>
          <h1 className="font-display font-semibold text-[32px] tracking-tight text-foreground">Settings</h1>
        </div>

        {/* Profile */}
        <div className="mb-5">
          <p className="text-[11px] font-semibold text-[#86868B] uppercase tracking-widest px-1 mb-2">Profil</p>
          <div className={SECTION_CLS}>
            <div className={ROW_CLS}>
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-[#86868B]" />
                <span className="text-[14px] text-foreground">Nama</span>
              </div>
              <input value={name} onChange={e => setName(e.target.value)}
                className="bg-transparent text-[14px] text-right text-[#0071E3] outline-none max-w-[160px]" />
            </div>
            <div className={ROW_CLS}>
              <div className="flex items-center gap-3">
                <Globe className="w-4 h-4 text-[#86868B]" />
                <span className="text-[14px] text-foreground">Bahasa</span>
              </div>
              <div className="flex gap-2">
                {(["id", "en"] as const).map(l => (
                  <button key={l} onClick={() => setLang(l)}
                    className={cn("text-[12px] font-medium px-3 py-1 rounded-full transition-colors",
                      lang === l ? "bg-[#0071E3] text-white" : "bg-background border border-[#D2D2D7] text-[#86868B]")}>
                    {l.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <button onClick={saveProfile} disabled={saving}
            className="mt-3 w-full bg-[#0071E3] text-white text-[14px] font-medium py-2.5 rounded-full hover:bg-[#0077ED] transition-colors disabled:opacity-60">
            {saving ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>

        {/* Appearance */}
        <div className="mb-5">
          <p className="text-[11px] font-semibold text-[#86868B] uppercase tracking-widest px-1 mb-2">Tampilan</p>
          <div className={SECTION_CLS}>
            <div className={ROW_CLS}>
              <div className="flex items-center gap-3">
                {resolvedTheme === "dark" ? <Moon className="w-4 h-4 text-[#86868B]" /> : <Sun className="w-4 h-4 text-[#86868B]" />}
                <span className="text-[14px] text-foreground">Tema</span>
              </div>
              <div className="flex gap-2">
                {["light", "dark", "system"].map(t => (
                  <button key={t} onClick={() => setTheme(t)}
                    className={cn("text-[12px] font-medium px-3 py-1 rounded-full capitalize transition-colors",
                      resolvedTheme === t || (t === "system" && !["light", "dark"].includes(resolvedTheme ?? ""))
                        ? "bg-[#0071E3] text-white" : "bg-background border border-[#D2D2D7] text-[#86868B]")}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Account */}
        <div className="mb-5">
          <p className="text-[11px] font-semibold text-[#86868B] uppercase tracking-widest px-1 mb-2">Akun</p>
          <div className={SECTION_CLS}>
            <button onClick={handleLogout} className={cn(ROW_CLS, "w-full text-left hover:bg-[#FF453A]/5 transition-colors")}>
              <div className="flex items-center gap-3">
                <Lock className="w-4 h-4 text-[#FF453A]" />
                <span className="text-[14px] text-[#FF453A]">Keluar</span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#FF453A]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
