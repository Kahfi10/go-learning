"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Globe, Lock, Moon, Sun, User } from "lucide-react";
import Navbar from "@/components/navigation/Navbar";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const router = useRouter();
  const { state, logout, refresh } = useAuth();
  const { resolvedTheme, setTheme, theme } = useTheme();
  const [name, setName] = useState("");
  const [lang, setLang] = useState<"id" | "en">("id");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!state.loading && !state.user) {
      router.replace("/login?next=/settings");
    }

    if (state.user) {
      setName(state.user.name);
      setLang(state.user.lang_pref ?? "id");
    }
  }, [router, state.loading, state.user]);

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

  const currentTheme = theme ?? resolvedTheme ?? "system";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 sm:px-6 pb-24 pt-24">
        <section className="relative overflow-hidden rounded-[32px] border border-black/[0.06] bg-[#FBFBFD] p-8 shadow-[0_28px_80px_rgba(15,23,42,0.08)] dark:border-white/[0.08] dark:bg-[#0F0F11] dark:shadow-[0_28px_80px_rgba(0,0,0,0.32)] sm:p-10">
          <div className="pointer-events-none absolute -left-10 top-0 h-48 w-48 rounded-full bg-[#0071E3]/14 blur-3xl" />
          <div className="pointer-events-none absolute right-0 top-8 h-40 w-40 rounded-full bg-[#34C759]/10 blur-3xl" />

          <div className="relative grid gap-8 xl:grid-cols-[minmax(0,1.16fr)_320px] xl:items-start">
            <div className="max-w-2xl">
              <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[#86868B]">
                Pengaturan
              </p>
              <h1 className="mt-4 max-w-3xl font-display text-[30px] font-semibold tracking-tight text-foreground sm:text-[38px] xl:text-[46px] leading-[1.06]">
                Kelola profil, tampilan, dan preferensi akun dengan lebih rapi.
              </h1>
              <p className="mt-3 max-w-xl text-[16px] leading-7 text-[#86868B] sm:text-[17px]">
                Semua kontrol utama dikelompokkan ke panel yang lebih jelas supaya perubahan terasa cepat dan aman.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <div className="rounded-full border border-black/[0.06] bg-white/80 px-4 py-2 text-[13px] font-medium text-foreground shadow-[0_10px_30px_rgba(15,23,42,0.05)] dark:border-white/[0.08] dark:bg-white/[0.04] dark:shadow-none">
                  {state.user?.email ?? "Akun GoLearn"}
                </div>
                <div className="rounded-full border border-black/[0.06] bg-white/80 px-4 py-2 text-[13px] font-medium text-foreground shadow-[0_10px_30px_rgba(15,23,42,0.05)] dark:border-white/[0.08] dark:bg-white/[0.04] dark:shadow-none">
                  Bahasa {lang.toUpperCase()}
                </div>
                <div className="rounded-full border border-black/[0.06] bg-white/80 px-4 py-2 text-[13px] font-medium text-foreground shadow-[0_10px_30px_rgba(15,23,42,0.05)] dark:border-white/[0.08] dark:bg-white/[0.04] dark:shadow-none">
                  Tema {currentTheme}
                </div>
              </div>
            </div>

            <aside className="rounded-[28px] border border-black/[0.06] bg-white/80 p-6 shadow-[0_20px_50px_rgba(15,23,42,0.06)] backdrop-blur-sm dark:border-white/[0.08] dark:bg-white/[0.04] dark:shadow-[0_20px_50px_rgba(0,0,0,0.24)]">
              <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#86868B]">
                Quick Summary
              </p>
              <h2 className="mt-3 font-display text-[28px] font-semibold tracking-tight text-foreground">
                Akun aktif
              </h2>
              <p className="mt-2 text-[14px] leading-6 text-[#86868B]">
                Simpan perubahan profil, ganti bahasa antarmuka, dan atur tema dari satu tempat.
              </p>

              <div className="mt-6 grid gap-3">
                <div className="rounded-[20px] bg-black/[0.03] p-4 dark:bg-white/[0.05]">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-[#86868B]">Nama profil</p>
                  <p className="mt-2 font-display text-[22px] font-semibold tracking-tight text-foreground">
                    {name || "-"}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-[20px] bg-black/[0.03] p-4 dark:bg-white/[0.05]">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-[#86868B]">Bahasa</p>
                    <p className="mt-2 font-display text-[20px] font-semibold tracking-tight text-foreground">
                      {lang.toUpperCase()}
                    </p>
                  </div>
                  <div className="rounded-[20px] bg-black/[0.03] p-4 dark:bg-white/[0.05]">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-[#86868B]">Tema</p>
                    <p className="mt-2 font-display text-[20px] font-semibold tracking-tight capitalize text-foreground">
                      {currentTheme}
                    </p>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <div className="space-y-6">
            <article className="rounded-[30px] border border-black/[0.06] bg-[#FBFBFD] p-6 shadow-[0_24px_60px_rgba(15,23,42,0.07)] dark:border-white/[0.08] dark:bg-[#101012] dark:shadow-[0_24px_60px_rgba(0,0,0,0.28)] sm:p-7">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0071E3]/10 text-[#0071E3]">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#86868B]">
                    Profil
                  </p>
                  <h2 className="mt-1 font-display text-[26px] font-semibold tracking-tight text-foreground">
                    Informasi akun
                  </h2>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="rounded-[24px] border border-black/[0.06] bg-white/80 p-4 dark:border-white/[0.08] dark:bg-white/[0.04]">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[14px] font-medium text-foreground">Nama</p>
                      <p className="mt-1 text-[12px] text-[#86868B]">Nama yang tampil di seluruh pengalaman belajar.</p>
                    </div>
                    <User className="h-4 w-4 text-[#86868B]" />
                  </div>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-4 h-12 w-full rounded-[16px] border border-black/[0.08] bg-background px-4 text-[14px] text-foreground outline-none transition focus:border-[#0071E3] focus:ring-4 focus:ring-[#0071E3]/10 dark:border-white/[0.08]"
                  />
                </div>

                <div className="rounded-[24px] border border-black/[0.06] bg-white/80 p-4 dark:border-white/[0.08] dark:bg-white/[0.04]">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[14px] font-medium text-foreground">Bahasa</p>
                      <p className="mt-1 text-[12px] text-[#86868B]">Pilih bahasa utama untuk antarmuka.</p>
                    </div>
                    <Globe className="h-4 w-4 text-[#86868B]" />
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {([
                      { value: "id", label: "Bahasa Indonesia", short: "ID" },
                      { value: "en", label: "English", short: "EN" },
                    ] as const).map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setLang(option.value)}
                        className={cn(
                          "flex items-center justify-between rounded-[18px] border px-4 py-3 text-left transition-all",
                          lang === option.value
                            ? "border-[#0071E3]/20 bg-[#0071E3]/8 shadow-[0_14px_34px_rgba(0,113,227,0.12)]"
                            : "border-black/[0.06] bg-background hover:border-black/[0.1] dark:border-white/[0.08] dark:hover:border-white/[0.12]",
                        )}
                      >
                        <div>
                          <span className="block text-[14px] font-medium text-foreground">{option.label}</span>
                          <span className="mt-1 block text-[12px] text-[#86868B]">{option.short}</span>
                        </div>
                        <div
                          className={cn(
                            "h-5 w-9 rounded-full p-0.5 transition-colors",
                            lang === option.value ? "bg-[#0071E3]" : "bg-black/[0.08] dark:bg-white/[0.12]",
                          )}
                        >
                          <div
                            className={cn(
                              "h-4 w-4 rounded-full bg-white transition-transform",
                              lang === option.value ? "translate-x-4" : "translate-x-0",
                            )}
                          />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={saveProfile}
                disabled={saving}
                className="mt-5 w-full rounded-full bg-[#0071E3] px-5 py-3 text-[14px] font-medium text-white shadow-[0_18px_40px_rgba(0,113,227,0.24)] transition-colors hover:bg-[#0077ED] disabled:opacity-60"
              >
                {saving ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </article>
          </div>

          <div className="space-y-6">
            <article className="rounded-[30px] border border-black/[0.06] bg-[#FBFBFD] p-6 shadow-[0_24px_60px_rgba(15,23,42,0.07)] dark:border-white/[0.08] dark:bg-[#101012] dark:shadow-[0_24px_60px_rgba(0,0,0,0.28)] sm:p-7">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#AF52DE]/10 text-[#AF52DE]">
                  {resolvedTheme === "dark" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                </div>
                <div>
                  <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#86868B]">
                    Tampilan
                  </p>
                  <h2 className="mt-1 font-display text-[26px] font-semibold tracking-tight text-foreground">
                    Tema aplikasi
                  </h2>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {([
                  { value: "light", label: "Light", note: "Tampilan terang dan bersih." },
                  { value: "dark", label: "Dark", note: "Kontras lebih lembut untuk malam hari." },
                  { value: "system", label: "System", note: "Ikuti pengaturan perangkat otomatis." },
                ] as const).map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setTheme(option.value)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-[22px] border px-4 py-4 text-left transition-all",
                      currentTheme === option.value
                        ? "border-[#0071E3]/20 bg-[#0071E3]/8 shadow-[0_14px_34px_rgba(0,113,227,0.12)]"
                        : "border-black/[0.06] bg-white/80 hover:border-black/[0.1] dark:border-white/[0.08] dark:bg-white/[0.04] dark:hover:border-white/[0.12]",
                    )}
                  >
                    <div>
                      <span className="block text-[14px] font-medium text-foreground">{option.label}</span>
                      <span className="mt-1 block text-[12px] text-[#86868B]">{option.note}</span>
                    </div>
                    <div
                      className={cn(
                        "h-5 w-9 rounded-full p-0.5 transition-colors",
                        currentTheme === option.value ? "bg-[#0071E3]" : "bg-black/[0.08] dark:bg-white/[0.12]",
                      )}
                    >
                      <div
                        className={cn(
                          "h-4 w-4 rounded-full bg-white transition-transform",
                          currentTheme === option.value ? "translate-x-4" : "translate-x-0",
                        )}
                      />
                    </div>
                  </button>
                ))}
              </div>
            </article>

            <article className="rounded-[30px] border border-black/[0.06] bg-[#FBFBFD] p-6 shadow-[0_24px_60px_rgba(15,23,42,0.07)] dark:border-white/[0.08] dark:bg-[#101012] dark:shadow-[0_24px_60px_rgba(0,0,0,0.28)] sm:p-7">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FF453A]/10 text-[#FF453A]">
                  <Lock className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#86868B]">
                    Akun
                  </p>
                  <h2 className="mt-1 font-display text-[26px] font-semibold tracking-tight text-foreground">
                    Sesi login
                  </h2>
                </div>
              </div>

              <p className="mt-4 text-[14px] leading-6 text-[#86868B]">
                Keluar dari sesi saat ini jika kamu ingin mengakhiri akses pada perangkat ini.
              </p>

              <button
                onClick={handleLogout}
                className="mt-6 flex w-full items-center justify-between rounded-[22px] border border-[#FF453A]/15 bg-[#FF453A]/6 px-4 py-4 text-left transition-colors hover:bg-[#FF453A]/10"
              >
                <div>
                  <span className="block text-[14px] font-medium text-[#FF453A]">Keluar</span>
                  <span className="mt-1 block text-[12px] text-[#86868B]">Kembali ke halaman utama setelah logout.</span>
                </div>
                <div className="h-5 w-9 rounded-full bg-[#FF453A] p-0.5">
                  <div className="h-4 w-4 translate-x-4 rounded-full bg-white" />
                </div>
              </button>
            </article>
          </div>
        </section>
      </main>
    </div>
  );
}
