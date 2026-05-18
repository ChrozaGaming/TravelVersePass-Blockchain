"use client";

import AuthGuard from "@/components/AuthGuard";
import QRScanner from "@/components/QRScanner";
import { api } from "@/lib/api";
import type { CheckinResult } from "@/lib/types";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import {
  ScanLine,
  CheckCircle2,
  Award,
  Coins,
  Sparkles,
  AlertCircle,
  Loader2,
  ExternalLink,
  Terminal,
  ChevronRight,
  Camera,
  RefreshCw,
  LayoutDashboard,
} from "lucide-react";

const EXPLORER = process.env.NEXT_PUBLIC_BLOCK_EXPLORER;

function TxRow({ label, hash }: Readonly<{ label: string; hash: string }>) {
  const short = `${hash.slice(0, 14)}…${hash.slice(-6)}`;
  return (
    <li className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-[#030308] rounded-xl border border-white/[0.03]">
      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
        {label}
      </span>
      {EXPLORER ? (
        <a
          href={`${EXPLORER}/tx/${hash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 font-mono text-xs text-emerald-400/90 hover:text-emerald-300 transition-colors group"
        >
          <span className="truncate">{short}</span>
          <ExternalLink className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 transition-opacity shrink-0" />
        </a>
      ) : (
        <span
          className="font-mono text-xs text-slate-500 truncate"
          title="Block explorer tidak tersedia di Hardhat Local"
        >
          {short}
        </span>
      )}
    </li>
  );
}

function ScanInner() {
  const [result, setResult] = useState<CheckinResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      const ctx = gsap.context(() => {
        gsap.to(".gsap-reveal", {
          y: 0,
          opacity: 1,
          duration: 1,
          stagger: 0.1,
          ease: "power4.out",
        });

        gsap.to(".gsap-float", {
          y: -8,
          duration: 3,
          yoyo: true,
          repeat: -1,
          ease: "sine.inOut",
        });
      }, containerRef);
      return () => ctx.revert();
    }
  }, [result, error, processing]);

  async function handleScan(qrToken: string) {
    if (processing) return;
    setProcessing(true);
    setError(null);

    try {
      const res = await api<CheckinResult>("/api/checkin", {
        method: "POST",
        body: JSON.stringify({ qrToken }),
        auth: true,
      });
      setResult(res);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Check-in failed";
      const code = (err as Error & { code?: string }).code;
      if (code === "NO_PASS") {
        setError(
          "Kamu belum punya Tourist Pass. Mint dulu di halaman /mint-pass.",
        );
      } else if (code === "ALREADY_CLAIMED") {
        setError(
          "Kamu sudah claim badge di destinasi ini hari ini. Coba lagi besok.",
        );
      } else if (code === "invalid_qr") {
        setError(
          "QR tidak valid atau sudah expired. Scan QR terbaru di lokasi.",
        );
      } else {
        setError(msg);
      }
    } finally {
      setProcessing(false);
    }
  }

  function handleReset() {
    setResult(null);
    setError(null);
  }

  if (result) {
    return (
      <div
        ref={containerRef}
        className="w-full max-w-3xl mx-auto px-4 sm:px-6 pt-8 pb-32 relative z-10 font-sans"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-emerald-500/10 blur-[120px] pointer-events-none rounded-full" />

        <div className="gsap-reveal opacity-0 translate-y-8 bg-[#0a0b18]/90 backdrop-blur-3xl border border-emerald-500/30 rounded-[2.5rem] p-8 md:p-12 shadow-[0_0_50px_rgba(16,185,129,0.15)] relative overflow-hidden text-center flex flex-col">
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/[0.05] to-transparent pointer-events-none" />

          <div className="gsap-float relative w-24 h-24 mx-auto mb-8">
            <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl" />
            <div className="relative w-full h-full bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-3xl flex items-center justify-center shadow-[inset_0_0_20px_rgba(255,255,255,0.5)] border border-white/20 rotate-12">
              <CheckCircle2 className="w-12 h-12 text-white -rotate-12" />
              <Sparkles className="absolute -top-4 -right-4 w-8 h-8 text-emerald-200 animate-pulse" />
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-white mb-2 tracking-tight">
            Check-in Berhasil!
          </h1>
          <p className="text-emerald-400/80 font-mono text-sm tracking-widest uppercase mb-10">
            {result.destination.name}
          </p>

          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            {/* Badge Card */}
            <div className="bg-black/40 border border-white/[0.05] rounded-2xl p-6 text-left relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-violet-500/10 rounded-full blur-2xl group-hover:bg-violet-500/20 transition-colors" />
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 relative z-10">
                <Award className="w-4 h-4 text-violet-400" /> NFT Badge
              </div>
              <div className="text-3xl font-black text-white relative z-10 drop-shadow-[0_0_10px_rgba(139,92,246,0.3)]">
                #{result.badge.tokenId}
              </div>
            </div>

            {/* Reward Card */}
            <div className="bg-black/40 border border-white/[0.05] rounded-2xl p-6 text-left relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-colors" />
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 relative z-10">
                <Coins className="w-4 h-4 text-emerald-400" /> Reward Earned
              </div>
              <div className="flex items-baseline gap-2 relative z-10">
                <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">
                  +{result.reward.checkin}
                </div>
                <span className="font-bold text-emerald-500/50">TVT</span>
              </div>
              {result.reward.levelUpBonus && (
                <div className="mt-2 text-xs font-bold text-amber-400 bg-amber-500/10 inline-flex items-center gap-1.5 px-2 py-1 rounded-md border border-amber-500/20 relative z-10">
                  <Sparkles className="w-3 h-3" /> +{result.reward.levelUpBonus}{" "}
                  bonus
                </div>
              )}
            </div>
          </div>

          {result.levelUp && (
            <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mb-6">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0 border border-amber-500/30">
                <Sparkles className="w-6 h-6 text-amber-400" />
              </div>
              <div className="text-center sm:text-left">
                <div className="font-black text-amber-400 text-xl tracking-wide uppercase mb-1">
                  Level Up Achieved!
                </div>
                <div className="flex items-center justify-center sm:justify-start gap-3 text-lg font-bold">
                  <span className="text-slate-500 line-through decoration-rose-500/50">
                    Lv. {result.levelUp.oldLevel}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-600" />
                  <span className="text-white drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]">
                    Lv. {result.levelUp.newLevel}
                  </span>
                </div>
              </div>
            </div>
          )}

          <details className="bg-black/40 border border-white/[0.05] rounded-2xl text-left group overflow-hidden transition-all duration-300 open:border-emerald-500/30 mb-8">
            <summary className="cursor-pointer font-mono text-xs text-slate-400 hover:text-white transition-colors p-5 flex items-center justify-between select-none bg-white/[0.02]">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-500/70" />
                <span className="font-bold tracking-widest">
                  TRANSACTION HASHES
                </span>
              </div>
              <ChevronRight className="w-4 h-4 transition-transform duration-300 group-open:rotate-90" />
            </summary>
            <div className="border-t border-white/[0.05] p-5 bg-black/20">
              <ul className="space-y-2 m-0 p-0 list-none">
                <TxRow label="Badge Mint" hash={result.txHashes.badge} />
                <TxRow label="Visit Ledger" hash={result.txHashes.visit} />
                <TxRow label="Reward Drop" hash={result.txHashes.reward} />
                {result.txHashes.levelUpBonus && (
                  <TxRow
                    label="Level Up Bonus"
                    hash={result.txHashes.levelUpBonus}
                  />
                )}
              </ul>
            </div>
          </details>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="flex-1 flex items-center justify-center gap-2 py-4 px-6 bg-white/[0.03] hover:bg-white/[0.08] text-white font-bold rounded-xl transition-all duration-300 border border-white/[0.1] active:scale-[0.98]"
            >
              <RefreshCw className="w-4 h-4" /> Scan Lagi
            </button>
            <Link
              href="/dashboard"
              className="flex-1 flex items-center justify-center gap-2 py-4 px-6 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] active:scale-[0.98]"
            >
              <LayoutDashboard className="w-4 h-4" /> Dashboard
            </Link>
            <Link
              href="/badges"
              className="flex-1 flex items-center justify-center gap-2 py-4 px-6 bg-white/[0.03] hover:bg-white/[0.08] text-white font-bold rounded-xl transition-all duration-300 border border-white/[0.1] active:scale-[0.98]"
            >
              <Award className="w-4 h-4" /> My Badges
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="w-full max-w-2xl mx-auto px-4 sm:px-6 pt-12 pb-32 relative z-10 font-sans"
    >
      <div className="gsap-reveal opacity-0 translate-y-4 mb-10 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono font-bold tracking-wide mb-4">
          <ScanLine className="w-3.5 h-3.5" />
          ON-CHAIN VISION
        </div>
        <h1 className="text-4xl font-black text-white tracking-tight mb-3">
          QR Check-in
        </h1>
        <p className="text-slate-400 text-sm max-w-md leading-relaxed">
          Pindai QR code yang ditampilkan di terminal operator lokasi wisata
          untuk memvalidasi kunjungan dan mengklaim NFT.
        </p>
      </div>

      <div className="gsap-reveal opacity-0 translate-y-8 bg-[#0a0b18]/80 backdrop-blur-3xl border border-white/[0.08] rounded-[2.5rem] p-4 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Decorative background for scanner */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-amber-500/10 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative z-10 bg-black rounded-[2rem] p-2 border border-white/[0.05] shadow-inner mb-6 group overflow-hidden">
          {/* High-tech scanner frame */}
          <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-amber-500 rounded-tl-xl z-20" />
          <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-amber-500 rounded-tr-xl z-20" />
          <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-amber-500 rounded-bl-xl z-20" />
          <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-amber-500 rounded-br-xl z-20" />

          <div className="rounded-[1.5rem] overflow-hidden relative aspect-square bg-[#030308] flex items-center justify-center">
            {processing && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-30 flex flex-col items-center justify-center">
                <Loader2 className="w-10 h-10 text-amber-500 animate-spin mb-4" />
                <p className="text-amber-400 font-mono text-xs uppercase tracking-widest text-center px-4">
                  Validating Payload...
                </p>
              </div>
            )}
            <QRScanner onScan={handleScan} paused={processing} />

          </div>
        </div>

        {processing && (
          <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400 text-sm animate-in fade-in slide-in-from-top-2 duration-300">
            <Loader2 className="w-5 h-5 shrink-0 mt-0.5 animate-spin" />
            <div className="font-mono">
              <p className="font-bold mb-1 uppercase tracking-widest text-xs">
                Processing Transaction
              </p>
              <p className="text-amber-400/80 leading-relaxed text-xs">
                Memproses validasi on-chain... (15-30 dtk di testnet, 1-2 dtk di
                local)
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-3 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm animate-in fade-in slide-in-from-top-2 duration-300 backdrop-blur-md">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="leading-relaxed font-mono text-xs sm:text-sm">
              {error}
            </p>
          </div>
        )}

        {!processing && !error && (
          <div className="flex items-center justify-center gap-2 text-xs font-mono text-slate-500">
            <Camera className="w-4 h-4" /> Arahkan kamera ke layar portal
          </div>
        )}
      </div>
    </div>
  );
}

export default function ScanPage() {
  return (
    <AuthGuard>
      <ScanInner />
    </AuthGuard>
  );
}
