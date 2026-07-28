"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, Eye, EyeOff, Github } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Selamat datang kembali!");
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(err.message ?? "Login gagal");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-9 h-9 rounded-xl bg-[#0071E3] flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
          </Link>
          <h1 className="font-display font-semibold text-[28px] tracking-tight text-foreground">Masuk ke GoLearn</h1>
          <p className="text-[#86868B] text-[15px] mt-2">Lanjutkan perjalanan belajar Go kamu</p>
        </div>

        {/* OAuth */}
        <div className="space-y-3 mb-6">
          <a href={`${process.env.NEXT_PUBLIC_API_URL}/api/auth/google`}
            className="flex items-center justify-center gap-3 w-full border border-[#D2D2D7] rounded-[12px] py-2.5 text-[14px] font-medium text-foreground hover:bg-[#F5F5F7] transition-colors">
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Lanjutkan dengan Google
          </a>
          <a href={`${process.env.NEXT_PUBLIC_API_URL}/api/auth/github`}
            className="flex items-center justify-center gap-3 w-full border border-[#D2D2D7] rounded-[12px] py-2.5 text-[14px] font-medium text-foreground hover:bg-[#F5F5F7] transition-colors">
            <Github className="w-4 h-4" />
            Lanjutkan dengan GitHub
          </a>
        </div>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#D2D2D7]" /></div>
          <div className="relative flex justify-center"><span className="bg-background px-3 text-[13px] text-[#86868B]">atau</span></div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[13px] font-medium text-foreground mb-1.5">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              placeholder="nama@email.com"
              className="w-full bg-[#F5F5F7] dark:bg-[#1C1C1E] rounded-[12px] px-4 py-2.5 text-[14px] text-foreground outline-none focus:ring-2 focus:ring-[#0071E3]/40 transition-all" />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-foreground mb-1.5">Password</label>
            <div className="relative">
              <input type={showPw ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required
                placeholder="••••••••"
                className="w-full bg-[#F5F5F7] dark:bg-[#1C1C1E] rounded-[12px] px-4 py-2.5 pr-10 text-[14px] text-foreground outline-none focus:ring-2 focus:ring-[#0071E3]/40 transition-all" />
              <button type="button" onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#86868B] hover:text-foreground">
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-[#0071E3] text-white text-[15px] font-medium py-2.5 rounded-full hover:bg-[#0077ED] transition-colors disabled:opacity-60">
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>

        <p className="text-center text-[13px] text-[#86868B] mt-6">
          Belum punya akun?{" "}
          <Link href="/register" className="text-[#0071E3] font-medium hover:underline">Daftar gratis</Link>
        </p>
      </div>
    </div>
  );
}
