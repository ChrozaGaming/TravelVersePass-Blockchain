"use client";

import AuthGuard from "@/components/AuthGuard";
import NFTBadgeCard from "@/components/NFTBadgeCard";
import { api } from "@/lib/api";
import type { Badge } from "@/lib/types";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import gsap from "gsap";
import {
  Award,
  AlertCircle,
  Compass,
  ArrowRight,
  Terminal,
  Map,
} from "lucide-react";

type BadgesResponse = { badges: Badge[] };

function BadgesInner() {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api<BadgesResponse>("/api/me/badges", { auth: true })
      .then((res) => setBadges(res.badges))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!loading && containerRef.current) {
      const ctx = gsap.context(() => {
        gsap.to(".gsap-reveal", {
          y: 0,
          opacity: 1,
          duration: 1,
          stagger: 0.1,
          ease: "power4.out",
        });

        gsap.to(".gsap-float", {
          y: -10,
          duration: 3,
          yoyo: true,
          repeat: -1,
          ease: "sine.inOut",
        });
      }, containerRef);
      return () => ctx.revert();
    }
  }, [loading, badges]);

  if (loading) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center gap-4 relative z-10">
        <div className="relative w-16 h-16 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-t-2 border-violet-500 animate-spin" />
          <Compass className="w-6 h-6 text-violet-500/40" />
        </div>
        <p className="text-slate-400 font-mono text-sm tracking-widest uppercase animate-pulse">
          Mengambil Data Vault...
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

  if (badges.length === 0) {
    return (
      <div
        ref={containerRef}
        className="w-full max-w-lg mx-auto px-4 sm:px-6 pt-16 pb-32 relative z-10 font-sans"
      >
        <div className="gsap-reveal opacity-0 translate-y-8 bg-[#0a0b18]/80 backdrop-blur-3xl border border-white/[0.08] rounded-[2.5rem] p-10 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 rounded-full blur-[80px] pointer-events-none" />

          <div className="gsap-float w-24 h-24 mx-auto bg-violet-500/10 rounded-3xl flex items-center justify-center border border-violet-500/20 mb-8 relative z-10 shadow-[0_0_30px_rgba(139,92,246,0.15)]">
            <Award className="w-10 h-10 text-violet-400" />
          </div>

          <h1 className="text-3xl font-black text-white mb-3 tracking-tight relative z-10">
            Vault Kosong
          </h1>

          <p className="text-slate-400 text-sm leading-relaxed mb-8 relative z-10 max-w-[280px] mx-auto">
            Anda belum memiliki koleksi NFT Badge. Mulai penjelajahan Anda
            sekarang dan klaim badge pertama di destinasi!
          </p>

          <Link
            href="/destinations"
            className="group flex items-center justify-center gap-3 w-full py-4 px-6 bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-400 hover:to-fuchsia-400 text-white font-black rounded-xl transition-all duration-300 active:scale-[0.98] shadow-[0_0_20px_rgba(139,92,246,0.2)] hover:shadow-[0_0_40px_rgba(139,92,246,0.4)] tracking-wide relative z-10"
          >
            <Map className="w-5 h-5" />
            Jelajahi Destinasi
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-32 relative z-10 font-sans"
    >
      <div className="absolute top-[10%] right-[5%] w-[400px] h-[400px] bg-violet-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] left-[10%] w-[300px] h-[300px] bg-fuchsia-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="gsap-reveal opacity-0 translate-y-4 mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-mono font-bold tracking-wide mb-4">
            <Terminal className="w-3.5 h-3.5" />
            DIGITAL ASSET VAULT
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-2">
            My Badges
          </h1>
          <p className="text-slate-400 text-lg">
            Koleksi NFT terverifikasi dari perjalanan Anda.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-[#0a0b18]/60 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/[0.05]">
          <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
            <Award className="w-6 h-6 text-violet-400" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-0.5">
              Total Assets
            </div>
            <div className="text-2xl font-black text-white">
              {badges.length}{" "}
              <span className="text-sm font-bold text-violet-400">NFTs</span>
            </div>
          </div>
        </div>
      </div>

      <ul className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 list-none p-0 relative z-10">
        {badges.map((badge) => (
          <li
            key={badge.tokenId}
            className="gsap-reveal opacity-0 translate-y-8"
          >
            <div className="transition-transform duration-500 hover:-translate-y-2 h-full">
              <NFTBadgeCard badge={badge} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function BadgesPage() {
  return (
    <AuthGuard>
      <BadgesInner />
    </AuthGuard>
  );
}
