"use client";
import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { BookOpen, CheckCircle2, Eye, EyeOff, Github, Sparkles } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { api, type AuthProviders } from "@/lib/api";
import { toast } from "sonner";

const benefits = [
  "Mulai belajar Go dengan jalur materi yang jelas dan progresif.",
  "Simpan kemajuan, lanjutkan sesi, dan tetap fokus dari satu akun.",
  "Daftar dalam hitungan detik lewat Google, GitHub, atau email.",
];

function RegisterPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register, state } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [providers, setProviders] = useState<AuthProviders>({ local: true, google: false, github: false });
  const nextPath = useMemo(() => {
    const raw = searchParams.get("next");
    return raw && raw.startsWith("/") && !raw.startsWith("//") ? raw : "/modules";
  }, [searchParams]);
  const authError = searchParams.get("auth_error");

  useEffect(() => {
    api.auth.providers().then(setProviders).catch(() => {});
  }, []);

  useEffect(() => {
    if (!authError) return;
    const message = authError === "oauth_account_conflict"
      ? "Email ini sudah terhubung ke akun lain atau metode login lain. Gunakan login yang sesuai."
      : authError === "oauth_email_not_verified"
        ? "Registrasi OAuth ditolak karena email akun belum terverifikasi oleh provider."
        : authError === "oauth_state_mismatch" || authError === "invalid_oauth_state"
          ? "Sesi OAuth tidak valid atau sudah kedaluwarsa. Silakan coba lagi."
          : "Registrasi OAuth gagal. Silakan coba lagi.";
    toast.error(message);
  }, [authError]);

  useEffect(() => {
    if (!state.loading && state.user) {
      router.replace(nextPath);
    }
  }, [nextPath, router, state.loading, state.user]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedName || !normalizedEmail || !password) {
      toast.error("Nama, email, dan password wajib diisi");
      return;
    }
    if (password.length < 8) {
      toast.error("Password minimal 8 karakter");
      return;
    }
    setLoading(true);
    try {
      await register(normalizedName, normalizedEmail, password);
      toast.success("Akun berhasil dibuat!");
      router.replace(nextPath);
    } catch (err: any) {
      toast.error(err.message ?? "Registrasi gagal");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#F5F5F7] text-foreground dark:bg-[#0A0A0B]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute right-[10%] top-[10%] h-64 w-64 rounded-full bg-[#0071E3]/16 blur-3xl" />
        <div className="absolute bottom-[8%] left-[8%] h-72 w-72 rounded-full bg-white/60 blur-3xl dark:bg-[#1D1D20]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.9),transparent_38%),radial-gradient(circle_at_bottom_left,rgba(0,113,227,0.08),transparent_32%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.06),transparent_26%),radial-gradient(circle_at_bottom_left,rgba(0,113,227,0.12),transparent_30%)]" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl items-center px-5 py-8 sm:px-8 lg:px-10">
        <div className="grid w-full gap-6 xl:grid-cols-[1.08fr_0.92fr] xl:gap-10">
          <section className="relative overflow-hidden rounded-[32px] border border-white/70 bg-white/72 p-7 shadow-[0_32px_100px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/5 dark:shadow-[0_32px_100px_rgba(0,0,0,0.3)] sm:p-10 lg:min-h-[720px] lg:p-12">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#0071E3]/45 to-transparent" />
            <div className="absolute -right-16 top-24 h-48 w-48 rounded-full bg-[#0071E3]/10 blur-3xl" />
            <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-white/60 blur-3xl dark:bg-white/5" />

            <div className="relative flex h-full flex-col">
              <div>
                <Link href="/" className="inline-flex items-center gap-3 rounded-full border border-black/5 bg-white/80 px-4 py-2 shadow-sm backdrop-blur-md transition-colors hover:bg-white dark:border-white/10 dark:bg-white/10 dark:hover:bg-white/15">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#0071E3] shadow-[0_12px_30px_rgba(0,113,227,0.35)]">
                    <BookOpen className="h-5 w-5 text-white" />
                  </span>
                  <span>
                    <span className="block text-[11px] font-medium uppercase tracking-[0.22em] text-[#86868B]">GoLearn</span>
                    <span className="block font-display text-[15px] font-semibold tracking-tight text-foreground">Mulai cepat, belajar dalam</span>
                  </span>
                </Link>
              </div>

              <div className="mt-10 max-w-xl sm:mt-14">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#0071E3]/15 bg-[#0071E3]/8 px-3 py-1.5 text-[12px] font-medium text-[#0071E3] dark:border-[#4AA3FF]/20 dark:bg-[#0071E3]/10 dark:text-[#75B8FF]">
                  <Sparkles className="h-3.5 w-3.5" />
                  Pengalaman onboarding yang lebih bersih dan fokus
                </div>
                <h1 className="mt-5 max-w-xl font-display text-[30px] font-semibold leading-[1.06] tracking-[-0.04em] text-[#1D1D1F] dark:text-white sm:text-[40px] xl:text-[46px]">
                  Buat akun dan mulai jalur belajar Go yang terasa rapi.
                </h1>
                <p className="mt-5 max-w-lg text-[15px] leading-7 text-[#6E6E73] dark:text-[#A1A1AA] sm:text-[17px]">
                  GoLearn membantu kamu memulai dengan struktur yang jelas, tampilan yang tenang, dan akses cepat ke materi sejak hari pertama.
                </p>
              </div>

              <ul className="mt-10 space-y-6 sm:mt-12">
                {benefits.map((benefit) => (
                  <li
                    key={benefit}
                    className="flex items-start gap-4"
                  >
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#0071E3]/10 text-[#0071E3] dark:bg-[#0071E3]/15 dark:text-[#75B8FF]">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    </span>
                    <span className="text-[15px] leading-relaxed text-[#3A3A3C] dark:text-[#D1D1D6]">{benefit}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-auto hidden pt-10 lg:block">
                <div className="rounded-[28px] border border-black/5 bg-white/70 p-5 shadow-sm backdrop-blur-md dark:border-white/8 dark:bg-white/[0.04]">
                  <p className="text-[13px] font-medium text-[#1D1D1F] dark:text-white">Satu akun untuk semua progres belajar.</p>
                  <p className="mt-2 text-[14px] leading-6 text-[#6E6E73] dark:text-[#A1A1AA]">
                    Setelah daftar, kamu langsung bisa mulai modul dan menyimpan semua perkembangan belajar tanpa setup tambahan.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="flex items-center justify-center lg:justify-end">
            <div className="w-full max-w-xl rounded-[32px] border border-white/70 bg-white/88 p-6 shadow-[0_28px_90px_rgba(15,23,42,0.12)] backdrop-blur-2xl dark:border-white/10 dark:bg-[#111214]/88 dark:shadow-[0_28px_90px_rgba(0,0,0,0.38)] sm:p-8 lg:p-10">
              <div className="mb-8">
                <div className="inline-flex items-center rounded-full border border-black/5 bg-black/[0.03] px-3 py-1 text-[12px] font-medium text-[#6E6E73] dark:border-white/10 dark:bg-white/[0.04] dark:text-[#A1A1AA]">
                  Buat akun baru
                </div>
                <h2 className="mt-4 font-display text-[30px] font-semibold tracking-[-0.03em] text-[#1D1D1F] dark:text-white sm:text-[34px]">
                  Mulai gratis hari ini
                </h2>
                <p className="mt-2 text-[15px] leading-7 text-[#6E6E73] dark:text-[#A1A1AA]">
                  Daftar untuk mengakses modul, menyimpan progres, dan melanjutkan belajar kapan pun.
                </p>
              </div>

              <div className="space-y-3">
                <a
                  href={providers.google ? `${process.env.NEXT_PUBLIC_API_URL}/api/auth/google?next=${encodeURIComponent(nextPath)}` : undefined}
                  aria-disabled={!providers.google}
                  onClick={(e) => {
                    if (providers.google) return;
                    e.preventDefault();
                    toast.error("Registrasi Google belum dikonfigurasi");
                  }}
                  className={`group flex w-full items-center justify-center gap-3 rounded-2xl border border-[#D2D2D7] bg-white px-4 py-3 text-[14px] font-medium text-foreground shadow-sm transition-all dark:border-white/10 dark:bg-white/[0.04] ${providers.google ? "hover:-translate-y-0.5 hover:border-[#C7C7CC] hover:bg-[#FAFAFB] dark:hover:bg-white/[0.06]" : "opacity-55 cursor-not-allowed"}`}
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Daftar dengan Google
                </a>
                <a
                  href={providers.github ? `${process.env.NEXT_PUBLIC_API_URL}/api/auth/github?next=${encodeURIComponent(nextPath)}` : undefined}
                  aria-disabled={!providers.github}
                  onClick={(e) => {
                    if (providers.github) return;
                    e.preventDefault();
                    toast.error("Registrasi GitHub belum dikonfigurasi");
                  }}
                  className={`group flex w-full items-center justify-center gap-3 rounded-2xl border border-[#D2D2D7] bg-white px-4 py-3 text-[14px] font-medium text-foreground shadow-sm transition-all dark:border-white/10 dark:bg-white/[0.04] ${providers.github ? "hover:-translate-y-0.5 hover:border-[#C7C7CC] hover:bg-[#FAFAFB] dark:hover:bg-white/[0.06]" : "opacity-55 cursor-not-allowed"}`}
                >
                  <Github className="h-4 w-4" />
                  Daftar dengan GitHub
                </a>
              </div>

              <div className="relative my-7">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#D2D2D7] dark:border-white/10" />
                </div>
                <div className="relative flex justify-center">
                  <span className="rounded-full bg-white px-3 text-[12px] font-medium uppercase tracking-[0.18em] text-[#86868B] dark:bg-[#111214] dark:text-[#7D7D85]">
                    atau
                  </span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="mb-2 block text-[13px] font-medium text-[#1D1D1F] dark:text-[#F5F5F7]">Nama lengkap</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    autoComplete="name"
                    placeholder="Nama kamu"
                    className="w-full rounded-2xl border border-transparent bg-[#F5F5F7] px-4 py-3 text-[15px] text-foreground outline-none transition-all placeholder:text-[#8E8E93] focus:border-[#0071E3]/20 focus:bg-white focus:ring-4 focus:ring-[#0071E3]/10 dark:bg-white/[0.06] dark:focus:bg-white/[0.08]"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-[13px] font-medium text-[#1D1D1F] dark:text-[#F5F5F7]">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    placeholder="nama@email.com"
                    className="w-full rounded-2xl border border-transparent bg-[#F5F5F7] px-4 py-3 text-[15px] text-foreground outline-none transition-all placeholder:text-[#8E8E93] focus:border-[#0071E3]/20 focus:bg-white focus:ring-4 focus:ring-[#0071E3]/10 dark:bg-white/[0.06] dark:focus:bg-white/[0.08]"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-[13px] font-medium text-[#1D1D1F] dark:text-[#F5F5F7]">Password</label>
                  <div className="relative">
                    <input
                      type={showPw ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="new-password"
                      placeholder="Min. 8 karakter"
                      className="w-full rounded-2xl border border-transparent bg-[#F5F5F7] px-4 py-3 pr-11 text-[15px] text-foreground outline-none transition-all placeholder:text-[#8E8E93] focus:border-[#0071E3]/20 focus:bg-white focus:ring-4 focus:ring-[#0071E3]/10 dark:bg-white/[0.06] dark:focus:bg-white/[0.08]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      aria-label={showPw ? "Sembunyikan password" : "Tampilkan password"}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-[#86868B] transition-colors hover:text-foreground"
                    >
                      {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-full bg-[#0071E3] px-5 py-3 text-[15px] font-medium text-white shadow-[0_18px_40px_rgba(0,113,227,0.28)] transition-all hover:bg-[#0077ED] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Membuat akun..." : "Buat Akun Gratis"}
                </button>
              </form>

              <p className="mt-7 text-center text-[13px] text-[#86868B]">
                Sudah punya akun?{" "}
                <Link href={`/login${nextPath !== "/modules" ? `?next=${encodeURIComponent(nextPath)}` : ""}`} className="font-medium text-[#0071E3] transition-colors hover:text-[#0077ED]">
                  Masuk
                </Link>
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterPageInner />
    </Suspense>
  );
}
