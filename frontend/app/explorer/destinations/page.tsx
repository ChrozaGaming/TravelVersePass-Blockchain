"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import gsap from "gsap";
import {
  type DestinationStats,
  type ExplorerDestination,
  getAllDestinations,
  getDestinationStats,
  relativeTime,
} from "@/lib/explorer";
import {
  ArrowLeft,
  Map as MapIcon, // Di-alias agar tidak bentrok dengan new Map()
  Activity,
  Users,
  TrendingUp,
  Database,
  Terminal,
  Clock,
  AlertCircle,
  Globe2,
  CheckCircle2,
  MapPin,
} from "lucide-react";

export default function ExplorerDestinationsPage() {
  const [destinations, setDestinations] = useState<ExplorerDestination[]>([]);
  const [stats, setStats] = useState<DestinationStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [d, s] = await Promise.all([
          getAllDestinations(),
          getDestinationStats(),
        ]);
        if (!cancelled) {
          setDestinations(d);
          setStats(s);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    const interval = setInterval(load, 15_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (!loading && containerRef.current) {
      const ctx = gsap.context(() => {
        gsap.to(".gsap-reveal", {
          y: 0,
          opacity: 1,
          duration: 1,
          stagger: 0.05,
          ease: "power4.out",
        });

        gsap.to(".gsap-pulse-slow", {
          opacity: 0.5,
          duration: 2,
          yoyo: true,
          repeat: -1,
          ease: "sine.inOut",
        });
      }, containerRef);
      return () => ctx.revert();
    }
  }, [loading, destinations]);

  // Merge destinations with stats
  const statsMap = new Map(stats.map((s) => [s.destinationId, s]));
  const totalCheckins = stats.reduce((sum, s) => sum + s.checkinCount, 0);
  const totalUnique = new Set(stats.flatMap(() => [])).size;
  const uniqueVisitors = new Set<string>();
  stats.forEach(() => {});

  if (loading && destinations.length === 0) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center gap-4 relative z-10">
        <div className="relative w-16 h-16 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-t-2 border-cyan-500 animate-spin" />
          <Database className="w-6 h-6 text-cyan-500/40" />
        </div>
        <p className="text-slate-400 font-mono text-sm tracking-widest uppercase animate-pulse">
          Fetching Network Data...
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-32 relative z-10 font-sans"
    >
      <div className="absolute top-[5%] left-[5%] w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[20%] right-[10%] w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="gsap-reveal opacity-0 translate-y-4 mb-8">
        <Link
          href="/explorer"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-cyan-400 transition-colors bg-white/[0.02] hover:bg-cyan-500/10 px-4 py-2 rounded-full border border-white/[0.05] hover:border-cyan-500/30"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Explorer
        </Link>
      </div>

      <div className="gsap-reveal opacity-0 translate-y-4 mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono font-bold tracking-wide mb-4">
          <Globe2 className="w-3.5 h-3.5" />
          GLOBAL NETWORK MONITOR
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-3">
          Destinations Activity
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl leading-relaxed">
          Statistik check-in publik secara real-time dari seluruh jaringan
          TravelVerse.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
        <div className="gsap-reveal opacity-0 translate-y-8 bg-[#0a0b18]/80 backdrop-blur-xl border border-white/[0.05] rounded-[2rem] p-6 shadow-lg relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-all" />
          <div className="flex items-center gap-3 mb-4 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
              <MapIcon className="w-5 h-5 text-cyan-400" />
            </div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Active Nodes
            </p>
          </div>
          <p className="text-4xl font-black text-white relative z-10">
            {destinations.length}
          </p>
        </div>

        <div className="gsap-reveal opacity-0 translate-y-8 bg-gradient-to-br from-[#061811] to-[#0a0b18] backdrop-blur-xl border border-emerald-500/20 rounded-[2rem] p-6 shadow-[0_0_30px_rgba(16,185,129,0.05)] relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all" />
          <div className="flex items-center gap-3 mb-4 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
            <p className="text-[10px] font-bold text-emerald-500/80 uppercase tracking-widest">
              Total Check-ins
            </p>
          </div>
          <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200 relative z-10">
            {totalCheckins}
          </p>
        </div>

        <div className="gsap-reveal opacity-0 translate-y-8 bg-[#0a0b18]/80 backdrop-blur-xl border border-white/[0.05] rounded-[2rem] p-6 shadow-lg relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-violet-500/10 rounded-full blur-2xl group-hover:bg-violet-500/20 transition-all" />
          <div className="flex items-center gap-3 mb-4 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-violet-400" />
            </div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Top Trending
            </p>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-white relative z-10 truncate">
            {stats[0]
              ? destinations.find((d) => d.id === stats[0].destinationId)
                  ?.name ?? "—"
              : "—"}
          </p>
        </div>
      </div>

      {(() => {
        if (error) {
          return (
            <div className="bg-rose-500/10 border border-rose-500/20 backdrop-blur-xl rounded-[2rem] p-8 flex items-center gap-4">
              <AlertCircle className="w-8 h-8 text-rose-400 shrink-0" />
              <p className="font-mono text-sm text-rose-400">
                Error retrieving network states: {error}
              </p>
            </div>
          );
        }

        if (destinations.length === 0) {
          return (
            <div className="bg-[#0a0b18]/50 backdrop-blur-xl border border-white/[0.05] rounded-[2rem] p-16 text-center">
              <Database className="w-12 h-12 text-white/10 mx-auto mb-4" />
              <p className="text-slate-400 font-mono">
                No active destinations found on the ledger.
              </p>
            </div>
          );
        }

        return (
          <ul className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 list-none p-0 relative z-10">
            {destinations.map((d) => {
              const stat = statsMap.get(d.id);
              return (
                <li key={d.id} className="gsap-reveal opacity-0 translate-y-8">
                  <Link
                    href={`/explorer/destinations/${d.id}`}
                    className="group flex flex-col h-full bg-[#0a0b18]/80 backdrop-blur-xl border border-white/[0.08] hover:border-cyan-500/40 rounded-[2rem] overflow-hidden transition-all duration-500 hover:shadow-[0_0_30px_rgba(6,182,212,0.15)]"
                  >
                    <div className="relative h-48 w-full bg-[#030308] overflow-hidden">
                      {d.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={d.image_url}
                          alt={d.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#0a0b18] to-[#05050e]">
                          <MapPin className="w-12 h-12 text-white/10" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0b18] via-[#0a0b18]/20 to-transparent" />

                      <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
                        <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">
                          ID:
                        </span>
                        <span className="text-xs font-mono font-bold text-white">
                          #{d.id}
                        </span>
                      </div>
                    </div>

                    <div className="flex-1 p-6 flex flex-col relative z-10">
                      <h2 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors tracking-wide">
                        {d.name}
                      </h2>
                      <p className="text-sm text-slate-400 line-clamp-2 mb-6 leading-relaxed">
                        {d.description}
                      </p>

                      <div className="mt-auto bg-[#030308] border border-white/[0.05] rounded-xl p-4">
                        {stat ? (
                          <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                            <div>
                              <div className="flex items-center gap-1.5 mb-1 text-slate-500">
                                <Activity className="w-3.5 h-3.5" />
                                <span className="text-[10px] uppercase font-bold tracking-widest">
                                  Check-ins
                                </span>
                              </div>
                              <p className="font-mono text-lg font-bold text-emerald-400">
                                {stat.checkinCount}
                              </p>
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5 mb-1 text-slate-500">
                                <Users className="w-3.5 h-3.5" />
                                <span className="text-[10px] uppercase font-bold tracking-widest">
                                  Unique
                                </span>
                              </div>
                              <p className="font-mono text-lg font-bold text-white">
                                {stat.uniqueVisitors}
                              </p>
                            </div>
                            {stat.lastCheckinAt > 0 && (
                              <div className="col-span-2 pt-3 border-t border-white/[0.05]">
                                <div className="flex items-center gap-1.5 mb-1 text-slate-500">
                                  <Clock className="w-3.5 h-3.5" />
                                  <span className="text-[10px] uppercase font-bold tracking-widest">
                                    Last Activity
                                  </span>
                                </div>
                                <p className="font-mono text-xs text-slate-300">
                                  {relativeTime(stat.lastCheckinAt)}
                                </p>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center justify-center h-full py-2">
                            <p className="text-xs font-mono text-slate-500 italic">
                              No activity recorded yet
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        );
      })()}

      <div className="gsap-reveal opacity-0 translate-y-4 mt-12 flex items-center justify-center gap-3">
        <div className="flex items-center gap-2 px-4 py-2 bg-white/[0.02] border border-white/[0.05] rounded-full text-xs font-mono text-slate-500">
          <Terminal className="w-3.5 h-3.5 text-cyan-500/70" />
          <span className="gsap-pulse-slow">Auto-refresh active (15s)</span>
          <span className="w-1 h-1 bg-slate-600 rounded-full mx-1" />
          <span>Synced with BadgeMinted events</span>
        </div>
      </div>
    </div>
  );
}
