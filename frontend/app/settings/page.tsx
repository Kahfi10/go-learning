"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/navigation/Navbar";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { User, Lock, Mail, Save, Loader2, BookOpen } from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
  const { state, refresh } = useAuth();
  const router = useRouter();
  const isLocalAccount = (state.user?.provider ?? "local") === "local";

  const [activeTab, setActiveTab] = useState<"profile" | "security">("profile");

  // Profile Form State
  const [name, setName] = useState("");
  const [langPref, setLangPref] = useState("id");
  const [profileLoading, setProfileLoading] = useState(false);

  // Security Form State
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [securityLoading, setSecurityLoading] = useState(false);

  useEffect(() => {
    if (!state.loading && !state.user) {
      router.replace("/login?next=/settings");
    } else if (state.user) {
      setName(state.user.name || "");
      setLangPref(state.user.lang_pref || "id");
    }
  }, [state.loading, state.user, router]);

  async function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return toast.error("Nama tidak boleh kosong");

    setProfileLoading(true);
    try {
      await api.auth.updateMe({ name: name.trim(), lang_pref: langPref });
      await refresh();
      toast.success("Profil berhasil diperbarui");
    } catch (err: any) {
      toast.error(err.message ?? "Gagal memperbarui profil");
    } finally {
      setProfileLoading(false);
    }
  }

  async function handleSecuritySubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      return toast.error("Semua kolom password wajib diisi");
    }
    if (newPassword.length < 8) {
      return toast.error("Password baru minimal 8 karakter");
    }
    if (newPassword !== confirmPassword) {
      return toast.error("Konfirmasi password tidak cocok");
    }

    setSecurityLoading(true);
    try {
      await api.auth.changePassword({ old_password: oldPassword, new_password: newPassword });
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password berhasil diubah");
    } catch (err: any) {
      toast.error(err.message ?? "Gagal mengubah password");
    } finally {
      setSecurityLoading(false);
    }
  }

  if (state.loading || !state.user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-4xl px-4 sm:px-6 pt-32 pb-24">
        
        {/* Header */}
        <div className="mb-10">
          <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#0071E3] mb-2">
            Pengaturan
          </p>
          <h1 className="font-display text-[32px] sm:text-[40px] font-semibold tracking-tight text-foreground">
            Akun & Keamanan
          </h1>
        </div>

        <div className="grid xl:grid-cols-[240px_1fr] gap-8 xl:gap-12">
          
          {/* Sidebar Tabs */}
          <aside className="space-y-1">
            <button
              onClick={() => setActiveTab("profile")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-[14px] font-medium transition-colors ${
                activeTab === "profile" 
                  ? "bg-[#F5F5F7] dark:bg-white/10 text-foreground" 
                  : "text-[#86868B] hover:bg-[#F5F5F7]/50 dark:hover:bg-white/5 hover:text-foreground"
              }`}
            >
              <User className="w-4 h-4" />
              Profil Umum
            </button>
            <button
              onClick={() => setActiveTab("security")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-[14px] font-medium transition-colors ${
                activeTab === "security" 
                  ? "bg-[#F5F5F7] dark:bg-white/10 text-foreground" 
                  : "text-[#86868B] hover:bg-[#F5F5F7]/50 dark:hover:bg-white/5 hover:text-foreground"
              }`}
            >
              <Lock className="w-4 h-4" />
              Keamanan
            </button>
            
            <Link
              href={`/profile/${state.user.name}`}
              className="mt-6 w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-[14px] font-medium text-[#0071E3] hover:bg-[#0071E3]/10 transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              Lihat Profil Publik
            </Link>
          </aside>

          {/* Main Content Area */}
          <div className="bg-white dark:bg-[#111214] rounded-[32px] p-6 sm:p-10 border border-[#D2D2D7]/60 dark:border-white/10 shadow-[0_24px_60px_rgba(15,23,42,0.04)] dark:shadow-[0_24px_60px_rgba(0,0,0,0.2)]">
            
            {activeTab === "profile" && (
              <div className="animate-in fade-in duration-300">
                <h2 className="text-[20px] font-semibold text-foreground mb-6">Informasi Dasar</h2>
                
                <form onSubmit={handleProfileSubmit} className="space-y-6">
                  <div>
                    <label className="block text-[13px] font-medium text-[#1D1D1F] dark:text-[#F5F5F7] mb-2">Alamat Email</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868B]" />
                      <input
                        type="email"
                        value={state.user.email}
                        disabled
                        className="w-full rounded-2xl border border-transparent bg-black/[0.03] dark:bg-white/[0.04] px-11 py-3.5 text-[15px] text-[#86868B] cursor-not-allowed outline-none"
                      />
                    </div>
                    <p className="mt-2 text-[12px] text-[#86868B]">Email terikat pada akun dan tidak dapat diubah.</p>
                  </div>

                  <div>
                    <label className="block text-[13px] font-medium text-[#1D1D1F] dark:text-[#F5F5F7] mb-2">Nama Lengkap</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868B]" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="w-full rounded-2xl border border-transparent bg-[#F5F5F7] dark:bg-white/[0.06] px-11 py-3.5 text-[15px] text-foreground outline-none transition-all placeholder:text-[#8E8E93] focus:border-[#0071E3]/20 focus:bg-white focus:ring-4 focus:ring-[#0071E3]/10 dark:focus:bg-white/[0.08]"
                        placeholder="Masukkan nama kamu"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[13px] font-medium text-[#1D1D1F] dark:text-[#F5F5F7] mb-2">Bahasa Utama Lesson</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setLangPref("id")}
                        className={`py-3 px-4 rounded-xl border text-[14px] font-medium transition-all ${
                          langPref === "id" 
                            ? "border-[#0071E3] bg-[#0071E3]/5 text-[#0071E3]" 
                            : "border-[#D2D2D7]/60 dark:border-white/10 bg-transparent text-[#86868B] hover:border-[#86868B]"
                        }`}
                      >
                        Bahasa Indonesia
                      </button>
                      <button
                        type="button"
                        onClick={() => setLangPref("en")}
                        className={`py-3 px-4 rounded-xl border text-[14px] font-medium transition-all ${
                          langPref === "en" 
                            ? "border-[#0071E3] bg-[#0071E3]/5 text-[#0071E3]" 
                            : "border-[#D2D2D7]/60 dark:border-white/10 bg-transparent text-[#86868B] hover:border-[#86868B]"
                        }`}
                      >
                        English
                      </button>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-[#D2D2D7]/40 dark:border-white/10 flex justify-end">
                    <button
                      type="submit"
                      disabled={profileLoading}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0071E3] px-8 py-3 text-[14px] font-medium text-white shadow-sm transition-all hover:bg-[#0077ED] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {profileLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Simpan Perubahan
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === "security" && (
              <div className="animate-in fade-in duration-300">
                <h2 className="text-[20px] font-semibold text-foreground mb-6">Ubah Password</h2>
                {!isLocalAccount ? (
                  <div className="rounded-[20px] border border-[#D2D2D7]/50 dark:border-white/10 bg-[#F7F7F8] dark:bg-[#17181A] p-5">
                    <p className="text-[14px] font-medium text-foreground">Akun ini masuk lewat provider eksternal.</p>
                    <p className="mt-2 text-[13px] leading-6 text-[#86868B]">
                      Password tidak dikelola di GoLearn untuk akun Google atau GitHub. Untuk mengubah akses akun, silakan kelola langsung dari provider login yang kamu gunakan.
                    </p>
                  </div>
                ) : (
                <form onSubmit={handleSecuritySubmit} className="space-y-6">
                  <div>
                    <label className="block text-[13px] font-medium text-[#1D1D1F] dark:text-[#F5F5F7] mb-2">Password Saat Ini</label>
                    <input
                      type="password"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      required
                      className="w-full rounded-2xl border border-transparent bg-[#F5F5F7] dark:bg-white/[0.06] px-4 py-3.5 text-[15px] text-foreground outline-none transition-all placeholder:text-[#8E8E93] focus:border-[#0071E3]/20 focus:bg-white focus:ring-4 focus:ring-[#0071E3]/10 dark:focus:bg-white/[0.08]"
                      placeholder="••••••••"
                    />
                  </div>

                  <div className="pt-2">
                    <label className="block text-[13px] font-medium text-[#1D1D1F] dark:text-[#F5F5F7] mb-2">Password Baru</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      className="w-full rounded-2xl border border-transparent bg-[#F5F5F7] dark:bg-white/[0.06] px-4 py-3.5 text-[15px] text-foreground outline-none transition-all placeholder:text-[#8E8E93] focus:border-[#0071E3]/20 focus:bg-white focus:ring-4 focus:ring-[#0071E3]/10 dark:focus:bg-white/[0.08]"
                      placeholder="Min. 8 karakter"
                    />
                  </div>

                  <div>
                    <label className="block text-[13px] font-medium text-[#1D1D1F] dark:text-[#F5F5F7] mb-2">Konfirmasi Password Baru</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="w-full rounded-2xl border border-transparent bg-[#F5F5F7] dark:bg-white/[0.06] px-4 py-3.5 text-[15px] text-foreground outline-none transition-all placeholder:text-[#8E8E93] focus:border-[#0071E3]/20 focus:bg-white focus:ring-4 focus:ring-[#0071E3]/10 dark:focus:bg-white/[0.08]"
                      placeholder="Ulangi password baru"
                    />
                  </div>

                  <div className="pt-6 border-t border-[#D2D2D7]/40 dark:border-white/10 flex justify-end">
                    <button
                      type="submit"
                      disabled={securityLoading}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0071E3] px-8 py-3 text-[14px] font-medium text-white shadow-sm transition-all hover:bg-[#0077ED] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {securityLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Update Password
                    </button>
                  </div>
                </form>
                )}
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}
