"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState, useRef } from "react";
import gsap from "gsap";
import {
  type CheckinEvent,
  type ExplorerDestination,
  addressLabel,
  formatTimestamp,
  getDestinationById,
  getRecentCheckins,
  relativeTime,
  shortAddr,
  shortHash,
} from "@/lib/explorer";
import {
  ArrowLeft,
  MapPin,
  ExternalLink,
  Activity,
  Users,
  Clock,
  Trophy,
  Terminal,
  Database,
  AlertCircle,
  Hash,
  Map as MapIcon,
  Award,
} from "lucide-react";

export default function ExplorerDestinationDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ? Number.parseInt(params.id as string, 10) : NaN;

  const [destination, setDestination] = useState<ExplorerDestination | null>(
    null,
  );
  const [checkins, setCheckins] = useState<CheckinEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (Number.isNaN(id) || id <= 0) {
      setError("Invalid destination ID");
      setLoading(false);
      return;
    }
    let cancelled = false;
    async function load() {
      try {
        const [d, c] = await Promise.all([
          getDestinationById(id),
          getRecentCheckins(200, id),
        ]);
        if (!cancelled) {
          setDestination(d);
          setCheckins(c);
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
  }, [id]);

  useEffect(() => {
    if (!loading && destination && containerRef.current) {
      const ctx = gsap.context(() => {
        gsap.to(".gsap-reveal", {
          y: 0,
          opacity: 1,
          duration: 1,
          stagger: 0.1,
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
  }, [loading, destination]);

  const stats = useMemo(() => {
    const visitors = new Set<string>();
    let lastTs = 0;
    let firstTs = Number.MAX_SAFE_INTEGER;
    for (const c of checkins) {
      visitors.add(c.user.toLowerCase());
      if (c.timestamp > lastTs) lastTs = c.timestamp;
      if (c.timestamp > 0 && c.timestamp < firstTs) firstTs = c.timestamp;
    }
    return {
      totalCheckins: checkins.length,
      uniqueVisitors: visitors.size,
      lastCheckin: lastTs,
      firstCheckin: firstTs === Number.MAX_SAFE_INTEGER ? 0 : firstTs,
    };
  }, [checkins]);

  // Leaderboard: top users by check-in count at this destination
  const leaderboard = useMemo(() => {
    const counts = new Map<string, number>();
    for (const c of checkins) {
      const key = c.user.toLowerCase();
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .map(([addr, count]) => ({ address: addr, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [checkins]);

  if (loading && !destination) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center gap-4 relative z-10">
        <div className="relative w-16 h-16 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-t-2 border-cyan-500 animate-spin" />
          <Database className="w-6 h-6 text-cyan-500/40" />
        </div>
        <p className="text-slate-400 font-mono text-sm tracking-widest uppercase animate-pulse">
          Indexing Node Data...
        </p>
      </div>
    );
  }

  if (error || !destination) {
    return (
      <div className="w-full max-w-3xl mx-auto mt-20 relative z-10 px-4 sm:px-6">
        <div className="bg-rose-500/10 border border-rose-500/20 backdrop-blur-xl rounded-[2rem] p-8 flex flex-col items-center text-center">
          <AlertCircle className="w-12 h-12 text-rose-400 mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Query Failed</h2>
          <p className="text-slate-400 font-mono text-sm mb-6">
            {error || "Destinasi tidak ditemukan di ledger."}
          </p>
          <Link
            href="/explorer/destinations"
            className="px-6 py-3 bg-white/[0.05] hover:bg-white/[0.1] text-white rounded-xl border border-white/[0.1] transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Destinations
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-32 relative z-10 font-sans"
    >
      {/* Background Orbs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[20%] left-0 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Nav */}
      <div className="gsap-reveal opacity-0 translate-y-4 mb-8">
        <Link
          href="/explorer/destinations"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-cyan-400 transition-colors bg-white/[0.02] hover:bg-cyan-500/10 px-4 py-2 rounded-full border border-white/[0.05] hover:border-cyan-500/30"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Destinations
        </Link>
      </div>

      {/* Hero Section */}
      <div className="gsap-reveal opacity-0 translate-y-8 bg-[#0a0b18]/80 backdrop-blur-xl border border-white/[0.08] rounded-[2.5rem] p-6 sm:p-8 mb-8 shadow-xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-cyan-500/5 rounded-full blur-[80px] pointer-events-none group-hover:bg-cyan-500/10 transition-colors" />

        <div className="flex flex-col md:flex-row gap-6 lg:gap-8 relative z-10">
          <div className="w-full md:w-72 h-56 shrink-0 rounded-[1.5rem] overflow-hidden bg-[#030308] border border-white/[0.05] relative">
            {destination.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={destination.image_url}
                alt={destination.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#0a0b18] to-[#05050e]">
                <MapIcon className="w-16 h-16 text-white/10" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0b18] via-[#0a0b18]/10 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-cyan-400 text-xs font-mono font-bold shadow-lg">
                <Hash className="w-3.5 h-3.5" /> NODE ID: {destination.id}
              </span>
            </div>
          </div>

          <div className="flex-1 flex flex-col py-2">
            <h1 className="text-3xl lg:text-4xl font-black text-white mb-3 tracking-tight">
              {destination.name}
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed mb-6 line-clamp-3">
              {destination.description}
            </p>

            <div className="mt-auto space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-500 bg-[#030308] border border-white/[0.05] w-max px-3 py-2 rounded-xl">
                <MapPin className="w-4 h-4 text-cyan-500" />
                Lat:{" "}
                <span className="text-slate-300">
                  {destination.location_lat}
                </span>
                , Lng:{" "}
                <span className="text-slate-300">
                  {destination.location_lng}
                </span>
              </div>
              <a
                href={`https://www.google.com/maps?q=${destination.location_lat},${destination.location_lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors uppercase tracking-widest bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 px-4 py-2 rounded-xl w-max"
              >
                <MapIcon className="w-3.5 h-3.5" /> View on Google Maps{" "}
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="gsap-reveal opacity-0 translate-y-8 bg-gradient-to-br from-[#061811] to-[#0a0b18] backdrop-blur-xl border border-emerald-500/20 rounded-2xl p-5 shadow-[0_0_20px_rgba(16,185,129,0.05)] relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-emerald-500/10 rounded-full blur-xl group-hover:bg-emerald-500/20 transition-all" />
          <p className="text-[10px] text-emerald-500/80 uppercase tracking-widest mb-1.5 flex items-center gap-1.5 relative z-10">
            <Activity className="w-3.5 h-3.5 text-emerald-400" /> Total
            Check-ins
          </p>
          <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200 font-mono relative z-10">
            {stats.totalCheckins}
          </p>
        </div>

        <div className="gsap-reveal opacity-0 translate-y-8 bg-[#0a0b18]/80 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-5 shadow-xl relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-cyan-500/10 rounded-full blur-xl group-hover:bg-cyan-500/20 transition-all" />
          <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5 relative z-10">
            <Users className="w-3.5 h-3.5 text-cyan-400" /> Unique Visitors
          </p>
          <p className="text-3xl font-black text-white font-mono relative z-10">
            {stats.uniqueVisitors}
          </p>
        </div>

        <div className="gsap-reveal opacity-0 translate-y-8 bg-[#0a0b18]/80 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-5 shadow-xl relative overflow-hidden">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-violet-400" /> First Visit
          </p>
          <p className="text-sm font-bold text-white font-mono">
            {stats.firstCheckin > 0 ? relativeTime(stats.firstCheckin) : "—"}
          </p>
          {stats.firstCheckin > 0 && (
            <p className="text-[10px] text-slate-500 mt-1 font-mono">
              {formatTimestamp(stats.firstCheckin)}
            </p>
          )}
        </div>

        <div className="gsap-reveal opacity-0 translate-y-8 bg-[#0a0b18]/80 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-5 shadow-xl relative overflow-hidden">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-400" /> Last Visit
          </p>
          <p className="text-sm font-bold text-white font-mono">
            {stats.lastCheckin > 0 ? relativeTime(stats.lastCheckin) : "—"}
          </p>
          {stats.lastCheckin > 0 && (
            <p className="text-[10px] text-slate-500 mt-1 font-mono">
              {formatTimestamp(stats.lastCheckin)}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Leaderboard Section */}
        {leaderboard.length > 0 && (
          <section className="gsap-reveal opacity-0 translate-y-8 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-bold text-white">Top Visitors</h2>
            </div>
            <div className="bg-[#0a0b18]/80 backdrop-blur-xl border border-white/[0.08] rounded-2xl overflow-hidden shadow-xl">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-[#030308] text-slate-500 font-mono">
                  <tr>
                    <th className="p-4 font-bold tracking-widest uppercase text-[10px]">
                      Rank
                    </th>
                    <th className="p-4 font-bold tracking-widest uppercase text-[10px]">
                      Address
                    </th>
                    <th className="p-4 font-bold tracking-widest uppercase text-[10px] text-right">
                      Visits
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.05]">
                  {leaderboard.map((item, idx) => {
                    let medalClass = "text-slate-400";
                    let bgClass = "bg-white/[0.02]";
                    if (idx === 0) {
                      medalClass = "text-amber-400";
                      bgClass = "bg-amber-500/10 border-amber-500/20";
                    } else if (idx === 1) {
                      medalClass = "text-slate-300";
                      bgClass = "bg-slate-300/10 border-slate-300/20";
                    } else if (idx === 2) {
                      medalClass = "text-orange-400";
                      bgClass = "bg-orange-500/10 border-orange-500/20";
                    }

                    return (
                      <tr
                        key={item.address}
                        className="hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="p-4">
                          <div
                            className={`inline-flex items-center justify-center w-6 h-6 rounded-md border font-bold font-mono text-xs ${bgClass} ${medalClass}`}
                          >
                            {idx + 1}
                          </div>
                        </td>
                        <td className="p-4 font-mono text-xs">
                          <Link
                            href={`/explorer/address/${item.address}`}
                            className="text-cyan-400 hover:text-cyan-300 hover:underline"
                            title={item.address}
                          >
                            {addressLabel(item.address) ??
                              shortAddr(item.address)}
                          </Link>
                        </td>
                        <td className="p-4 text-right font-mono font-bold text-emerald-400">
                          {item.count}x
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* All Check-ins Section */}
        <section
          className={`gsap-reveal opacity-0 translate-y-8 ${
            leaderboard.length > 0 ? "lg:col-span-2" : "lg:col-span-3"
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Terminal className="w-5 h-5 text-violet-400" />
              <h2 className="text-lg font-bold text-white">
                All Check-ins Log
              </h2>
            </div>
            <span className="text-[10px] font-mono text-violet-400 bg-violet-500/10 border border-violet-500/20 px-3 py-1 rounded-full uppercase tracking-widest">
              {checkins.length} Records
            </span>
          </div>

          {checkins.length === 0 ? (
            <div className="bg-[#030308] border border-white/[0.05] rounded-2xl p-8 text-center">
              <p className="text-sm font-mono text-slate-500">
                Belum ada aktivitas check-in di destinasi ini.
              </p>
            </div>
          ) : (
            <div className="bg-[#0a0b18]/80 backdrop-blur-xl border border-white/[0.08] rounded-2xl overflow-hidden shadow-xl overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-[#030308] text-slate-500 font-mono">
                  <tr>
                    <th className="p-4 font-bold tracking-widest uppercase text-[10px]">
                      Visitor Identity
                    </th>
                    <th className="p-4 font-bold tracking-widest uppercase text-[10px]">
                      Badge
                    </th>
                    <th className="p-4 font-bold tracking-widest uppercase text-[10px]">
                      Block / Time
                    </th>
                    <th className="p-4 font-bold tracking-widest uppercase text-[10px]">
                      Tx Hash
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.05]">
                  {checkins.map((c) => (
                    <tr
                      key={`${c.txHash}-${c.logIndex}`}
                      className="hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="p-4 font-mono text-xs">
                        <Link
                          href={`/explorer/address/${c.user}`}
                          className="text-cyan-400 hover:text-cyan-300 hover:underline"
                          title={c.user}
                        >
                          {addressLabel(c.user) ?? shortAddr(c.user)}
                        </Link>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1 bg-violet-500/10 border border-violet-500/20 text-violet-400 text-[10px] font-mono font-bold px-2 py-1 rounded-md">
                          <Award className="w-3 h-3" /> #{c.tokenId}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1">
                          <Link
                            href={`/explorer/block/${c.blockNumber}`}
                            className="text-cyan-400 hover:underline font-mono text-xs"
                          >
                            #{c.blockNumber}
                          </Link>
                          {c.timestamp ? (
                            <span className="text-[10px] text-slate-500 font-mono">
                              {relativeTime(c.timestamp)}
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-600">
                              —
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 font-mono">
                        <Link
                          href={`/explorer/tx/${c.txHash}`}
                          className="text-cyan-400 hover:text-cyan-300 hover:underline text-xs"
                          title={c.txHash}
                        >
                          {shortHash(c.txHash)}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      <div className="gsap-reveal opacity-0 translate-y-4 mt-8 flex items-center justify-center gap-3">
        <div className="flex items-center gap-2 px-4 py-2 bg-white/[0.02] border border-white/[0.05] rounded-full text-xs font-mono text-slate-500">
          <Terminal className="w-3.5 h-3.5 text-cyan-500/70" />
          <span className="gsap-pulse-slow">Auto-refresh active (15s)</span>
          <span className="w-1 h-1 bg-slate-600 rounded-full mx-1" />
          <span>Public on-chain data</span>
        </div>
      </div>
    </div>
  );
}
