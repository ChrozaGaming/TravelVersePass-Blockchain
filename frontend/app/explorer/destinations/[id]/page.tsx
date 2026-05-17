"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
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

export default function ExplorerDestinationDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ? Number.parseInt(params.id, 10) : NaN;

  const [destination, setDestination] = useState<ExplorerDestination | null>(
    null
  );
  const [checkins, setCheckins] = useState<CheckinEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      <div className="container-page">
        <p className="text-slate-500">Memuat destinasi...</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="container-page max-w-2xl">
        <div className="alert-error" role="alert">
          {error}
        </div>
        <Link
          href="/explorer/destinations"
          className="text-blue-600 hover:underline mt-4 inline-block"
        >
          ← Back to Destinations
        </Link>
      </div>
    );
  }
  if (!destination) {
    return (
      <div className="container-page max-w-2xl">
        <div className="alert-error" role="alert">
          Destinasi tidak ditemukan.
        </div>
        <Link
          href="/explorer/destinations"
          className="text-blue-600 hover:underline mt-4 inline-block"
        >
          ← Back to Destinations
        </Link>
      </div>
    );
  }

  return (
    <div className="container-page max-w-5xl">
      <div className="mb-4">
        <Link
          href="/explorer/destinations"
          className="text-sm text-blue-600 hover:underline"
        >
          ← Back to Destinations
        </Link>
      </div>

      {/* Hero */}
      <div className="card mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {destination.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={destination.image_url}
              alt={destination.name}
              className="w-full md:w-64 h-48 object-cover rounded-md bg-slate-100"
            />
          ) : (
            <div className="w-full md:w-64 h-48 bg-gradient-to-br from-blue-100 to-emerald-100 rounded-md flex items-center justify-center text-6xl">
              📍
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-start gap-2 mb-2">
              <h1 className="text-2xl font-bold text-slate-900">
                {destination.name}
              </h1>
              <span className="badge-tag bg-blue-100 text-blue-700 shrink-0">
                ID #{destination.id}
              </span>
            </div>
            <p className="text-slate-600 mb-3">{destination.description}</p>
            <p className="text-xs text-slate-500 mb-1">
              📍 {destination.location_lat}, {destination.location_lng}
            </p>
            <a
              href={`https://www.google.com/maps?q=${destination.location_lat},${destination.location_lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:underline"
            >
              View on Google Maps →
            </a>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="card border-emerald-200 bg-emerald-50">
          <p className="text-xs text-emerald-700 uppercase tracking-wide">
            Total Check-ins
          </p>
          <p className="text-2xl font-bold text-emerald-900 mt-1">
            {stats.totalCheckins}
          </p>
        </div>
        <div className="card">
          <p className="text-xs text-slate-500 uppercase tracking-wide">
            Unique Visitors
          </p>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            {stats.uniqueVisitors}
          </p>
        </div>
        <div className="card">
          <p className="text-xs text-slate-500 uppercase tracking-wide">
            First Visit
          </p>
          <p className="text-sm font-semibold text-slate-900 mt-1">
            {stats.firstCheckin > 0
              ? relativeTime(stats.firstCheckin)
              : "—"}
          </p>
        </div>
        <div className="card">
          <p className="text-xs text-slate-500 uppercase tracking-wide">
            Last Visit
          </p>
          <p className="text-sm font-semibold text-slate-900 mt-1">
            {stats.lastCheckin > 0 ? relativeTime(stats.lastCheckin) : "—"}
          </p>
        </div>
      </div>

      {/* Top Visitors (Leaderboard) */}
      {leaderboard.length > 0 && (
        <section className="mb-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-3">
            🏆 Top Visitors
          </h2>
          <div className="card p-0 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="text-left p-3 font-medium">Rank</th>
                  <th className="text-left p-3 font-medium">Address</th>
                  <th className="text-right p-3 font-medium">Check-ins</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((item, idx) => {
                  let medal = "";
                  if (idx === 0) medal = "🥇";
                  else if (idx === 1) medal = "🥈";
                  else if (idx === 2) medal = "🥉";
                  return (
                    <tr
                      key={item.address}
                      className="border-t border-slate-200 hover:bg-slate-50"
                    >
                      <td className="p-3 font-semibold">
                        {medal || `#${idx + 1}`}
                      </td>
                      <td className="p-3 font-mono">
                        <Link
                          href={`/explorer/address/${item.address}`}
                          className="text-blue-600 hover:underline"
                          title={item.address}
                        >
                          {addressLabel(item.address) ?? shortAddr(item.address)}
                        </Link>
                      </td>
                      <td className="p-3 text-right font-semibold text-emerald-700">
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

      {/* All Check-ins */}
      <section>
        <h2 className="text-lg font-semibold text-slate-900 mb-3">
          📋 All Check-ins ({checkins.length})
        </h2>

        {checkins.length === 0 ? (
          <div className="card text-center">
            <p className="text-slate-500">
              Belum ada yang check-in di destinasi ini.
            </p>
          </div>
        ) : (
          <div className="card p-0 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="text-left p-3 font-medium">Visitor</th>
                  <th className="text-left p-3 font-medium">Badge Token</th>
                  <th className="text-left p-3 font-medium">Block</th>
                  <th className="text-left p-3 font-medium">When</th>
                  <th className="text-left p-3 font-medium">Tx</th>
                </tr>
              </thead>
              <tbody>
                {checkins.map((c) => (
                  <tr
                    key={`${c.txHash}-${c.logIndex}`}
                    className="border-t border-slate-200 hover:bg-slate-50"
                  >
                    <td className="p-3 font-mono">
                      <Link
                        href={`/explorer/address/${c.user}`}
                        className="text-blue-600 hover:underline"
                        title={c.user}
                      >
                        {addressLabel(c.user) ?? shortAddr(c.user)}
                      </Link>
                    </td>
                    <td className="p-3">
                      <span className="badge-tag bg-purple-100 text-purple-700">
                        #{c.tokenId}
                      </span>
                    </td>
                    <td className="p-3">
                      <Link
                        href={`/explorer/block/${c.blockNumber}`}
                        className="text-blue-600 hover:underline"
                      >
                        #{c.blockNumber}
                      </Link>
                    </td>
                    <td className="p-3 text-slate-600 whitespace-nowrap">
                      {c.timestamp ? (
                        <>
                          <div>{relativeTime(c.timestamp)}</div>
                          <div className="text-xs text-slate-400">
                            {formatTimestamp(c.timestamp)}
                          </div>
                        </>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="p-3 font-mono">
                      <Link
                        href={`/explorer/tx/${c.txHash}`}
                        className="text-blue-600 hover:underline"
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

      <p className="text-xs text-slate-400 text-center mt-6">
        Auto-refresh tiap 15 detik · Public on-chain data
      </p>
    </div>
  );
}
