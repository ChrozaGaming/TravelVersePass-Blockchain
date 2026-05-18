"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import gsap from "gsap";
import {
  Wallet,
  ShieldCheck,
  AlertCircle,
  Loader2,
  ChevronRight,
  Info,
  ExternalLink,
  Network,
} from "lucide-react";

export default function LoginPage() {
  const { wallet, isLoggedIn, isLoading, login } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [signing, setSigning] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isLoading && isLoggedIn) {
      router.replace("/dashboard");
    }
  }, [isLoading, isLoggedIn, router]);

  useEffect(() => {
    if (containerRef.current) {
      const ctx = gsap.context(() => {
        gsap.to(".gsap-reveal", {
          y: 0,
          opacity: 1,
          duration: 1.2,
          stagger: 0.1,
          ease: "power4.out",
        });

        gsap.to(".gsap-float", {
          y: -10,
          duration: 3.5,
          yoyo: true,
          repeat: -1,
          ease: "sine.inOut",
        });
      }, containerRef);
      return () => ctx.revert();
    }
  }, []);

  async function handleLogin() {
    setError(null);
    setSigning(true);
    try {
      await login();
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setSigning(false);
    }
  }

  return (
    <div
      ref={containerRef}
      className="w-full max-w-md mx-auto px-4 sm:px-6 pt-16 pb-32 relative z-10 font-sans"
    >
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-amber-500/5 blur-[120px] pointer-events-none rounded-full" />

      <div className="gsap-reveal opacity-0 translate-y-8 bg-[#05050e]/90 backdrop-blur-3xl border border-white/[0.08] rounded-[3rem] p-8 md:p-12 shadow-2xl relative overflow-hidden mb-6">
        <div className="absolute inset-0 bg-gradient-to-b from-amber-500/[0.02] to-transparent pointer-events-none" />

        <div className="relative z-10 mb-10 text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-bold tracking-wide mb-8">
            <ShieldCheck className="w-3.5 h-3.5" />
            SECURE AUTHENTICATION
          </div>

          <div className="gsap-float w-24 h-24 bg-gradient-to-br from-[#0a0b18] to-[#05050e] rounded-3xl flex items-center justify-center border border-amber-500/30 mb-8 shadow-[0_0_30px_rgba(245,158,11,0.15)] relative">
            <div className="absolute inset-0 bg-amber-500/5 rounded-3xl blur-md" />
            <Wallet className="w-10 h-10 text-amber-400 relative z-10" />
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-black border border-white/10 rounded-lg flex items-center justify-center">
              <Network className="w-4 h-4 text-amber-500" />
            </div>
          </div>

          <h1 className="text-3xl font-black text-white mb-3 tracking-tight">
            Login Portal
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed max-w-[280px] mx-auto">
            Hubungkan wallet MetaMask Anda. Verifikasi dilakukan via{" "}
            <span className="text-amber-400 font-semibold">Sign Message</span>{" "}
            (Gratis, tanpa gas fee).
          </p>
        </div>

        <div className="relative z-10 space-y-5">
          <button
            type="button"
            onClick={handleLogin}
            disabled={signing}
            className="group flex items-center justify-center gap-3 w-full py-4 px-6 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:shadow-[0_0_40px_rgba(245,158,11,0.4)] tracking-wider uppercase text-sm"
          >
            {signing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Menunggu Signature...
              </>
            ) : (
              "Login dengan Wallet"
            )}
          </button>

          {error && (
            <div className="flex items-start gap-3 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm animate-in fade-in slide-in-from-top-2 duration-300 backdrop-blur-md">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p className="leading-relaxed font-mono">
                <strong className="font-bold">Error:</strong> {error}
              </p>
            </div>
          )}

          {wallet && (
            <div className="p-4 bg-black/40 border border-white/[0.05] rounded-xl flex items-center gap-3 shadow-inner">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <div className="flex flex-col overflow-hidden">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                  Detected Wallet
                </span>
                <span className="font-mono text-xs text-amber-400/80 truncate w-full">
                  {wallet}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Help / Guide Section */}
      <details className="gsap-reveal opacity-0 translate-y-8 bg-[#05050e]/60 backdrop-blur-md border border-white/[0.05] rounded-2xl text-sm group overflow-hidden transition-all duration-300 open:border-amber-500/20">
        <summary className="cursor-pointer font-mono text-xs text-slate-500 hover:text-slate-300 transition-colors p-5 flex items-center justify-between select-none bg-white/[0.01]">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-500/70" />
            <span className="font-bold tracking-widest">BUTUH BANTUAN?</span>
          </div>
          <ChevronRight className="w-4 h-4 transition-transform duration-300 group-open:rotate-90" />
        </summary>

        <div className="border-t border-white/[0.04] p-6 bg-black/20">
          <ol className="list-decimal list-outside ml-4 space-y-4 text-xs font-mono text-slate-400 marker:text-amber-500">
            <li className="pl-2">
              <span className="block mb-1 text-slate-300 font-semibold">
                Install MetaMask
              </span>
              Unduh dan pasang ekstensi melalui{" "}
              <a
                href="https://metamask.io"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-500 hover:text-amber-400 underline decoration-amber-500/30 hover:decoration-amber-400 transition-colors inline-flex items-center gap-1"
              >
                metamask.io
                <ExternalLink className="w-3 h-3" />
              </a>
            </li>
            <li className="pl-2">
              <span className="block mb-1 text-slate-300 font-semibold">
                Konfigurasi Jaringan
              </span>
              Pastikan wallet terhubung ke{" "}
              <span className="text-amber-400/80 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                Polygon Amoy (80002)
              </span>{" "}
              atau{" "}
              <span className="text-amber-400/80 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                Hardhat Localhost (31337)
              </span>
              .
            </li>
            <li className="pl-2">
              <span className="block mb-1 text-slate-300 font-semibold">
                Akun Pengujian
              </span>
              Jika berada di jaringan lokal (Hardhat), silakan *import* akun tes
              menggunakan *private key* dari terminal developer.
            </li>
          </ol>
        </div>
      </details>
    </div>
  );
}
