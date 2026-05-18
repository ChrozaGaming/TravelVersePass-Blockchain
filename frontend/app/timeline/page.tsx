"use client";

import AuthGuard from "@/components/AuthGuard";
import { api } from "@/lib/api";
import type { Timeline } from "@/lib/types";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import gsap from "gsap";
import {
  Compass,
  AlertCircle,
  Calendar,
  MapPin,
  Award,
  Sparkles,
  Terminal,
  ExternalLink,
  ArrowRight,
  Clock,
} from "lucide-react";

type TimelineResponse = { timeline: Timeline };

function TimelineInner() {
  const [timeline, setTimeline] = useState<Timeline>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api<TimelineResponse>("/api/me/timeline", { auth: true })
      .then((res) => setTimeline(res.timeline))
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
  }, [loading, timeline]);

  if (loading) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center gap-4 relative z-10">
        <div className="relative w-16 h-16 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-t-2 border-emerald-500 animate-spin" />
          <Clock className="w-6 h-6 text-emerald-500/40" />
        </div>
        <p className="text-slate-400 font-mono text-sm tracking-widest uppercase animate-pulse">
          Syncing Ledger...
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

  const years = Object.keys(timeline).sort((a, b) => b.localeCompare(a));

  if (years.length === 0) {
    return (
      <div
        ref={containerRef}
        className="w-full max-w-lg mx-auto px-4 sm:px-6 pt-16 pb-32 relative z-10 font-sans"
      >
        <div className="gsap-reveal opacity-0 translate-y-8 bg-[#0a0b18]/80 backdrop-blur-3xl border border-white/[0.08] rounded-[2.5rem] p-10 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />

          <div className="gsap-float w-24 h-24 mx-auto bg-emerald-500/10 rounded-3xl flex items-center justify-center border border-emerald-500/20 mb-8 relative z-10 shadow-[0_0_30px_rgba(16,185,129,0.15)]">
            <Calendar className="w-10 h-10 text-emerald-400" />
          </div>

          <h1 className="text-3xl font-black text-white mb-3 tracking-tight relative z-10">
            Ledger Kosong
          </h1>

          <p className="text-slate-400 text-sm leading-relaxed mb-8 relative z-10 max-w-[280px] mx-auto">
            Catatan perjalanan Anda masih kosong. Mulai eksplorasi dan jadikan
            setiap momen tercatat abadi di blockchain.
          </p>

          <Link
            href="/destinations"
            className="group flex items-center justify-center gap-3 w-full py-4 px-6 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-xl transition-all duration-300 active:scale-[0.98] shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_40px_rgba(16,185,129,0.5)] tracking-wide relative z-10"
          >
            Mulai Eksplorasi
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-32 relative z-10 font-sans"
    >
      <div className="absolute top-[10%] right-[10%] w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] left-[5%] w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="gsap-reveal opacity-0 translate-y-4 mb-14">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-bold tracking-wide mb-4">
          <Terminal className="w-3.5 h-3.5" />
          ON-CHAIN LEDGER
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-3">
          Journey Timeline
        </h1>
        <p className="text-slate-400 text-lg max-w-xl leading-relaxed">
          Riwayat kronologis semua destinasi yang telah Anda kunjungi.
        </p>
      </div>

      <div className="space-y-12">
        {years.map((year) => (
          <section key={year} className="relative">
            <div className="gsap-reveal opacity-0 translate-y-4 sticky top-24 z-20 inline-flex items-center justify-center bg-[#0a0b18]/90 backdrop-blur-xl border border-white/10 rounded-2xl px-6 py-3 mb-8 shadow-lg">
              <span className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 tracking-widest">
                {year}
              </span>
            </div>

            <div className="absolute left-6 md:left-[39px] top-20 bottom-0 w-px bg-gradient-to-b from-emerald-500/50 via-emerald-500/20 to-transparent" />

            <ol className="relative ml-6 md:ml-10 list-none space-y-8">
              {timeline[year].map((visit, index) => (
                <li
                  key={visit.id}
                  className="gsap-reveal opacity-0 translate-y-8 ml-8 md:ml-12 relative group"
                >
                  <div className="absolute -left-[39.5px] md:-left-[55.5px] top-8 w-4 h-4 bg-emerald-400 rounded-full border-4 border-[#030308] shadow-[0_0_15px_rgba(52,211,153,0.8)] group-hover:scale-125 transition-transform duration-300 z-10" />

                  <article className="bg-[#0a0b18]/60 backdrop-blur-2xl border border-white/[0.05] hover:border-emerald-500/30 rounded-[2rem] p-5 transition-all duration-500 shadow-xl overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <div className="flex flex-col sm:flex-row gap-5 relative z-10">
                      <div className="shrink-0 w-full sm:w-40 h-40 rounded-2xl overflow-hidden bg-[#030308] border border-white/[0.02]">
                        {visit.destination?.image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={visit.destination.image_url}
                            alt={visit.destination.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#0a0b18] to-[#05050e]">
                            <Compass className="w-10 h-10 text-white/10" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 flex flex-col py-1">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                          <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                          {new Date(visit.visitedAt).toLocaleDateString(
                            "id-ID",
                            {
                              day: "numeric",
                              month: "long",
                            },
                          )}
                        </div>

                        <h3 className="text-2xl font-bold text-white mb-4 tracking-tight group-hover:text-emerald-400 transition-colors">
                          {visit.destination?.name ?? "Unknown Sector"}
                        </h3>

                        <div className="flex flex-wrap items-center gap-3 mb-5">
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-mono font-bold">
                            <Award className="w-3.5 h-3.5" />
                            ID: #{visit.badgeTokenId}
                          </div>

                          {visit.levelAfter && (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wide">
                              <Sparkles className="w-3.5 h-3.5" />
                              Level Up: {visit.levelAfter}
                            </div>
                          )}
                        </div>

                        {visit.txHash && (
                          <div className="mt-auto pt-4 border-t border-white/[0.05]">
                            {process.env.NEXT_PUBLIC_BLOCK_EXPLORER ? (
                              <a
                                href={`${process.env.NEXT_PUBLIC_BLOCK_EXPLORER}/tx/${visit.txHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between gap-3 bg-[#030308] border border-white/[0.05] hover:border-emerald-500/30 p-3 rounded-xl transition-all group/tx"
                              >
                                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                  <Terminal className="w-3.5 h-3.5" /> Tx Hash
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-xs text-blue-400 group-hover/tx:text-emerald-400 transition-colors">
                                    {visit.txHash.slice(0, 10)}…
                                    {visit.txHash.slice(-8)}
                                  </span>
                                  <ExternalLink className="w-3.5 h-3.5 text-slate-600 group-hover/tx:text-emerald-400 transition-colors" />
                                </div>
                              </a>
                            ) : (
                              <div className="flex items-center justify-between gap-3 bg-[#030308] border border-white/[0.02] p-3 rounded-xl">
                                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                  <Terminal className="w-3.5 h-3.5" /> Tx Hash
                                </div>
                                <span
                                  className="font-mono text-xs text-slate-500 truncate"
                                  title="Block explorer tidak tersedia di Hardhat Local"
                                >
                                  {visit.txHash.slice(0, 10)}…
                                  {visit.txHash.slice(-8)}
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>
    </div>
  );
}

export default function TimelinePage() {
  return (
    <AuthGuard>
      <TimelineInner />
    </AuthGuard>
  );
}
