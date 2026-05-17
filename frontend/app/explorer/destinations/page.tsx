"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  type DestinationStats,
  type ExplorerDestination,
  formatTimestamp,
  getAllDestinations,
  getDestinationStats,
  relativeTime,
} from "@/lib/explorer";

export default function ExplorerDestinationsPage() {
  const [destinations, setDestinations] = useState<ExplorerDestination[]>([]);
  const [stats, setStats] = useState<DestinationStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // Merge destinations with stats
  const statsMap = new Map(stats.map((s) => [s.destinationId, s]));
  const totalCheckins = stats.reduce((sum, s) => sum + s.checkinCount, 0);
  const totalUnique = new Set(stats.flatMap(() => [])).size; // placeholder
  // Better: get unique across all
  const uniqueVisitors = new Set<string>();
  stats.forEach(() => { /* already aggregated */ });
  // For now just show sum of unique per destination (might over-count user visits to multiple dest)

  return (
    <div className="container-page max-w-6xl">
      <div className="mb-4">
        <Link href="/explorer" className="text-sm text-blue-600 hover:underline">
          ← Back to Explorer
        </Link>
      </div>

      <h1 className="section-title">🗺️ Destinations Activity</h1>
      <p className="section-subtitle">
        Statistik check-in publik dari semua user di setiap destinasi wisata.
      </p>

      {/* Stats overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <div className="card">
          <p className="text-xs text-slate-500 uppercase tracking-wide">
            Destinasi Aktif
          </p>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            {destinations.length}
          </p>
        </div>
        <div className="card border-emerald-200 bg-emerald-50">
          <p className="text-xs text-emerald-700 uppercase tracking-wide">
            Total Check-ins
          </p>
          <p className="text-2xl font-bold text-emerald-900 mt-1">
            {totalCheckins}
          </p>
        </div>
        <div className="card">
          <p className="text-xs text-slate-500 uppercase tracking-wide">
            Destinasi Terpopuler
          </p>
          <p className="text-lg font-bold text-slate-900 mt-1 truncate">
            {stats[0]
              ? destinations.find((d) => d.id === stats[0].destinationId)?.name ?? "—"
              : "—"}
          </p>
        </div>
      </div>

      {/* Destinations grid */}
      {(() => {
        if (error) {
          return (
            <div className="alert-error" role="alert">
              Error: {error}
            </div>
          );
        }
        if (loading && destinations.length === 0) {
          return <p className="text-slate-500">Memuat destinasi...</p>;
        }
        if (destinations.length === 0) {
          return (
            <div className="card text-center">
              <p className="text-slate-500">Belum ada destinasi.</p>
            </div>
          );
        }
        return (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 list-none">
            {destinations.map((d) => {
              const stat = statsMap.get(d.id);
              return (
                <li key={d.id}>
                  <Link
                    href={`/explorer/destinations/${d.id}`}
                    className="card block hover:shadow-md hover:border-blue-400 transition-all group h-full"
                  >
                    {d.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={d.image_url}
                        alt={d.name}
                        className="w-full h-32 object-cover rounded-md mb-3 bg-slate-100"
                      />
                    ) : (
                      <div className="w-full h-32 bg-gradient-to-br from-blue-100 to-emerald-100 rounded-md mb-3 flex items-center justify-center text-4xl">
                        📍
                      </div>
                    )}
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h2 className="font-semibold text-slate-900 group-hover:text-blue-600">
                        {d.name}
                      </h2>
                      <span className="badge-tag bg-blue-100 text-blue-700 shrink-0">
                        #{d.id}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2 mb-3">
                      {d.description}
                    </p>

                    <div className="border-t border-slate-200 pt-3 mt-auto">
                      {stat ? (
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <p className="text-slate-400">Check-ins</p>
                            <p className="font-bold text-emerald-700">
                              {stat.checkinCount}
                            </p>
                          </div>
                          <div>
                            <p className="text-slate-400">Unique Visitors</p>
                            <p className="font-bold text-slate-900">
                              {stat.uniqueVisitors}
                            </p>
                          </div>
                          {stat.lastCheckinAt > 0 && (
                            <div className="col-span-2">
                              <p className="text-slate-400">Last activity</p>
                              <p className="text-slate-700">
                                {relativeTime(stat.lastCheckinAt)}
                              </p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic">
                          Belum ada check-in
                        </p>
                      )}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        );
      })()}

      <p className="text-xs text-slate-400 text-center mt-6">
        Auto-refresh tiap 15 detik · Data langsung dari BadgeMinted events
      </p>
    </div>
  );
}
