"use client";

import AuthGuard from "@/components/AuthGuard";
import { mintPass } from "@/lib/contracts";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import {
  IdCard,
  Fingerprint,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Terminal,
  ShieldCheck,
  Cpu,
} from "lucide-react";

function MintPassInner() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{
    tokenId: number;
    txHash: string;
  } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

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
  }, [success]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const result = await mintPass(username);
      setSuccess(result);
      setTimeout(() => router.replace("/dashboard"), 3000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Mint failed";
      if (msg.includes("already minted")) {
        setError("Kamu sudah punya Tourist Pass. Buka dashboard.");
      } else if (msg.includes("user rejected") || msg.includes("user denied")) {
        setError("Kamu batal sign transaction.");
      } else {
        setError(msg);
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div
        ref={containerRef}
        className="w-full max-w-xl mx-auto px-4 sm:px-6 pt-12 pb-32 relative z-10 font-sans"
      >
        <div className="gsap-reveal opacity-0 translate-y-8 bg-[#05050e]/90 backdrop-blur-3xl border border-emerald-500/20 rounded-[3rem] p-8 md:p-14 shadow-[0_0_50px_rgba(16,185,129,0.1)] relative overflow-hidden text-center">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-bold tracking-wide mb-8">
            <ShieldCheck className="w-4 h-4" />
            MINTING SUCCESSFUL
          </div>

          <div className="gsap-float relative w-32 h-32 mx-auto mb-8">
            <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-2xl" />
            {/* Cyberpunk Frame */}
            <div className="absolute inset-0 border-2 border-emerald-500/30 rounded-3xl rotate-45" />
            <div className="absolute inset-0 border-2 border-emerald-500/30 rounded-3xl -rotate-45" />

            <div className="relative w-full h-full bg-gradient-to-br from-[#0a0b18] to-[#05050e] border border-emerald-500/50 rounded-2xl flex items-center justify-center shadow-[inset_0_0_20px_rgba(16,185,129,0.2)]">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.8)]" />
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-white mb-2 tracking-tight">
            Tourist Pass Minted!
          </h1>
          <p className="text-slate-400 mb-10 text-sm">
            Passport digital Anda berhasil direkam ke dalam blockchain.
          </p>

          <div className="relative p-6 bg-black/40 border border-white/[0.05] rounded-2xl mb-8 text-left shadow-inner">
            {/* Corner Brackets */}
            <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-emerald-500/40 rounded-tl" />
            <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-emerald-500/40 rounded-tr" />
            <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-emerald-500/40 rounded-bl" />
            <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-emerald-500/40 rounded-br" />

            <div className="flex items-center justify-between border-b border-white/[0.05] pb-5 mb-5 relative z-10">
              <div className="flex items-center gap-3 text-slate-400">
                <Cpu className="w-5 h-5 text-emerald-500" />
                <span className="text-sm font-medium uppercase tracking-widest">
                  Token ID
                </span>
              </div>
              <span className="text-2xl font-black text-white drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]">
                #{success.tokenId}
              </span>
            </div>

            <div className="flex flex-col gap-2 relative z-10">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Transaction Hash
              </span>
              <div className="font-mono text-xs sm:text-sm bg-[#030308] py-3 px-4 rounded-xl border border-emerald-500/20 text-emerald-400/90 shadow-inner group transition-colors hover:border-emerald-500/40">
                {process.env.NEXT_PUBLIC_BLOCK_EXPLORER ? (
                  <a
                    href={`${process.env.NEXT_PUBLIC_BLOCK_EXPLORER}/tx/${success.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between gap-2 w-full"
                  >
                    <span className="truncate">{success.txHash}</span>
                    <ExternalLink className="w-4 h-4 shrink-0 text-emerald-500/50 group-hover:text-emerald-400 transition-colors" />
                  </a>
                ) : (
                  <span
                    className="block truncate w-full text-center"
                    title="No block explorer for Hardhat Local"
                  >
                    {success.txHash}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="inline-flex items-center justify-center gap-3 px-6 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-400 font-medium">
            <Loader2 className="w-4 h-4 animate-spin" />
            Routing to Dashboard...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="w-full max-w-xl mx-auto px-4 sm:px-6 pt-12 pb-32 relative z-10 font-sans"
    >
      <div className="gsap-reveal opacity-0 translate-y-8 bg-[#05050e]/90 backdrop-blur-3xl border border-white/[0.08] rounded-[3rem] p-8 md:p-14 shadow-2xl relative overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-orange-600/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 mb-10 text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono font-bold tracking-wide mb-8">
            <Terminal className="w-3.5 h-3.5" />
            MINTING PORTAL ACTIVE
          </div>

          <div className="gsap-float w-24 h-24 bg-gradient-to-br from-[#0a0b18] to-[#05050e] rounded-3xl flex items-center justify-center border border-amber-500/30 mb-8 shadow-[0_0_30px_rgba(245,158,11,0.15)] relative">
            <div className="absolute inset-0 bg-amber-500/5 rounded-3xl blur-md" />
            <IdCard className="w-10 h-10 text-amber-400 relative z-10" />
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-black border border-white/10 rounded-lg flex items-center justify-center">
              <Fingerprint className="w-4 h-4 text-amber-500" />
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-white mb-4 tracking-tight leading-tight">
            Deploy{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
              Tourist Pass
            </span>
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed max-w-[320px] mx-auto">
            Inisialisasi NFT Passport Anda (Maks. 1 per wallet). Membutuhkan
            sedikit ETH/MATIC untuk biaya gas jaringan.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div className="relative p-6 bg-black/40 border border-white/[0.05] rounded-2xl shadow-inner">
            {/* Corner Brackets */}
            <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-amber-500/30 rounded-tl" />
            <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-amber-500/30 rounded-tr" />
            <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-amber-500/30 rounded-bl" />
            <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-amber-500/30 rounded-br" />

            <div className="space-y-3 relative z-10">
              <label
                htmlFor="username"
                className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest"
              >
                <Cpu className="w-4 h-4 text-amber-500" />
                Traveler Identity Name
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                maxLength={32}
                required
                placeholder="Enter your name..."
                className="w-full bg-[#030308] border border-white/[0.1] rounded-xl px-5 py-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all shadow-inner font-mono text-sm"
              />
              <p className="text-[11px] text-slate-500 font-medium">
                * Maks 32 karakter. Akan diukir permanen ke dalam Smart
                Contract.
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="group flex items-center justify-center gap-3 w-full py-4 px-6 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:shadow-[0_0_40px_rgba(245,158,11,0.4)] tracking-wider uppercase text-sm"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Executing Transaction...
              </>
            ) : (
              "Mint Smart Passport"
            )}
          </button>

          {error && (
            <div className="flex items-start gap-3 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm animate-in fade-in slide-in-from-top-2 duration-300 backdrop-blur-md">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p className="leading-relaxed font-mono">{error}</p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default function MintPassPage() {
  return (
    <AuthGuard>
      <MintPassInner />
    </AuthGuard>
  );
}
