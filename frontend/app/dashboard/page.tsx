"use client";

import AuthGuard from "@/components/AuthGuard";
import LevelProgress from "@/components/LevelProgress";
import { api } from "@/lib/api";
import { shortAddress } from "@/lib/wallet";
import type { PassData } from "@/lib/types";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import gsap from "gsap";
import {
  LayoutDashboard,
  IdCard,
  Wallet,
  Calendar,
  Coins,
  ScanLine,
  Map,
  Award,
  Clock,
  Compass,
  AlertCircle,
  ArrowRight,
  ShieldAlert,
  Terminal,
} from "lucide-react";

type MeResponse = {
  wallet: string;
  pass: PassData | null;
  balance: string;
};

function DashboardInner() {
  const [data, setData] = useState<MeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api<MeResponse>("/api/me", { auth: true })
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!loading && data && containerRef.current) {
      const ctx = gsap.context(() => {
        gsap.to(".gsap-reveal", {
          y: 0,
          opacity: 1,
          duration: 1,
          stagger: 0.1,
          ease: "power4.out",
        });
      }, containerRef);
      return () => ctx.revert();
    }
  }, [loading, data]);

  if (loading) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center gap-4 relative z-10">
        <div className="relative w-16 h-16 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-t-2 border-amber-500 animate-spin" />
          <Compass className="w-6 h-6 text-amber-500/40" />
        </div>
        <p className="text-slate-400 font-mono text-sm tracking-widest uppercase animate-pulse">
          Mengakses Data Blockchain...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-2xl mx-auto mt-20 relative z-10 px-4 sm:px-6">
        <div className="bg-rose-500/10 border border-rose-500/20 backdrop-blur-xl rounded-[2rem] p-8 flex flex-col items-center text-center">
          <AlertCircle className="w-12 h-12 text-rose-400 mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Sync Error</h2>
          <p className="text-slate-400 font-mono text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="w-full max-w-2xl mx-auto mt-20 relative z-10 px-4 sm:px-6">
        <div className="bg-[#0a0b18]/50 backdrop-blur-xl border border-white/[0.05] rounded-[2rem] p-12 text-center">
          <p className="text-slate-400 font-mono">
            Tidak ada data ditemukan di ledger.
          </p>
        </div>
      </div>
    );
  }

  if (!data.pass) {
    return (
      <div
        ref={containerRef}
        className="w-full max-w-lg mx-auto px-4 sm:px-6 pt-16 pb-32 relative z-10 font-sans"
      >
        <div className="gsap-reveal opacity-0 translate-y-8 bg-[#0a0b18]/80 backdrop-blur-3xl border border-white/[0.08] rounded-[2.5rem] p-10 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[80px] pointer-events-none" />

          <div className="w-20 h-20 mx-auto bg-amber-500/10 rounded-2xl flex items-center justify-center border border-amber-500/20 mb-6 relative z-10">
            <ShieldAlert className="w-10 h-10 text-amber-500" />
          </div>

          <h1 className="text-3xl font-black text-white mb-2 tracking-tight relative z-10">
            Akses Terbatas
          </h1>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs font-mono text-slate-400 mb-6 relative z-10 break-all">
            <Wallet className="w-3.5 h-3.5 text-amber-500/70 shrink-0" />
            {data.wallet}
          </div>

          <p className="text-slate-400 text-sm leading-relaxed mb-8 relative z-10">
            Wallet Anda terdeteksi, namun Anda belum memiliki{" "}
            <span className="text-white font-bold">NFT Tourist Pass</span>. Mint
            pass Anda sekarang untuk membuka akses ke ekosistem TravelVerse.
          </p>

          <Link
            href="/mint-pass"
            className="group flex items-center justify-center gap-2 w-full py-4 px-6 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black rounded-xl transition-all duration-300 active:scale-[0.98] shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:shadow-[0_0_40px_rgba(245,158,11,0.4)] tracking-wide relative z-10"
          >
            Mint Tourist Pass
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-32 relative z-10 font-sans"
    >
      {/* Ambient background glow */}
      <div className="absolute top-[10%] right-[10%] w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] left-[5%] w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <div className="gsap-reveal opacity-0 translate-y-4 mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono font-bold tracking-wide mb-4">
            <Terminal className="w-3.5 h-3.5" />
            TRAVELER COMMAND CENTER
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-2">
            Dashboard
          </h1>
          <p className="text-slate-400 text-lg">
            Welcome back,{" "}
            <strong className="text-white font-bold">
              {data.pass.username}
            </strong>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Profile Card */}
        <div className="gsap-reveal opacity-0 translate-y-8 lg:col-span-1 bg-[#0a0b18]/80 backdrop-blur-2xl border border-white/[0.08] rounded-[2rem] p-8 shadow-2xl relative overflow-hidden flex flex-col">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center">
              <IdCard className="w-5 h-5 text-amber-400" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-wide">
              ID Profile
            </h2>
          </div>

          <dl className="space-y-6 flex-1">
            <div className="bg-black/30 p-4 rounded-2xl border border-white/[0.03]">
              <dt className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                Traveler Name
              </dt>
              <dd className="font-bold text-lg text-white">
                {data.pass.username}
              </dd>
            </div>
            <div className="bg-black/30 p-4 rounded-2xl border border-white/[0.03]">
              <dt className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                Linked Wallet
              </dt>
              <dd
                className="font-mono text-sm text-amber-400/90"
                title={data.wallet}
              >
                {shortAddress(data.wallet)}
              </dd>
            </div>
            <div className="bg-black/30 p-4 rounded-2xl border border-white/[0.03]">
              <dt className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> Mint Date
              </dt>
              <dd className="font-medium text-slate-300">
                {new Date(data.pass.mintedAt).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </dd>
            </div>
          </dl>
        </div>

        {/* Level Progress */}
        <div className="gsap-reveal opacity-0 translate-y-8 lg:col-span-2 bg-[#0a0b18]/80 backdrop-blur-2xl border border-white/[0.08] rounded-[2rem] p-8 shadow-2xl overflow-hidden flex items-center">
          <div className="w-full">
            {/* Menggunakan komponen LevelProgress bawaan, dibungkus agar aman */}
            <LevelProgress pass={data.pass} />
          </div>
        </div>

        {/* Token Balance */}
        <div className="gsap-reveal opacity-0 translate-y-8 lg:col-span-1 bg-gradient-to-br from-[#061811] to-[#0a0b18] backdrop-blur-2xl border border-emerald-500/20 rounded-[2rem] p-8 shadow-[0_0_30px_rgba(16,185,129,0.05)] relative overflow-hidden flex flex-col justify-between group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-emerald-500/20 transition-all duration-500" />

          <div className="flex items-center gap-3 mb-6 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Coins className="w-5 h-5 text-emerald-400" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-wide">
              TVT Balance
            </h2>
          </div>

          <div className="relative z-10 mt-auto">
            <div className="flex items-baseline gap-2 mb-1">
              <p className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">
                {data.balance}
              </p>
              <span className="text-lg font-bold text-emerald-500/60">TVT</span>
            </div>
            <p className="text-xs font-mono text-emerald-500/40 uppercase tracking-widest">
              TravelVerse Token
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="gsap-reveal opacity-0 translate-y-8 lg:col-span-2 bg-[#0a0b18]/80 backdrop-blur-2xl border border-white/[0.08] rounded-[2rem] p-8 shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center">
              <LayoutDashboard className="w-5 h-5 text-amber-400" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-wide">
              Aksi Cepat
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Link
              href="/scan"
              className="group block p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:border-amber-500/30 hover:bg-amber-500/5 transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <ScanLine className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white mb-1 group-hover:text-amber-400 transition-colors">
                    Scan QR
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Klaim NFT badge di lokasi destinasi
                  </p>
                </div>
              </div>
            </Link>

            <Link
              href="/destinations"
              className="group block p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:border-blue-500/30 hover:bg-blue-500/5 transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Map className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">
                    Destinasi
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Jelajahi tempat wisata di ekosistem
                  </p>
                </div>
              </div>
            </Link>

            <Link
              href="/badges"
              className="group block p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:border-violet-500/30 hover:bg-violet-500/5 transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform relative">
                  <Award className="w-5 h-5 text-violet-400" />
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-violet-500 border-2 border-[#0a0b18] text-[9px] font-bold text-white flex items-center justify-center">
                    {data.pass.visitedCount}
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-white mb-1 group-hover:text-violet-400 transition-colors">
                    My Badges
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Lihat koleksi NFT eksklusif Anda
                  </p>
                </div>
              </div>
            </Link>

            <Link
              href="/timeline"
              className="group block p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Clock className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white mb-1 group-hover:text-emerald-400 transition-colors">
                    Timeline
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Riwayat perjalanan dan aktivitas
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardInner />
    </AuthGuard>
  );
}
