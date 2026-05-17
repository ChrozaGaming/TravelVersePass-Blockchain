"use client";

import AuthGuard from "@/components/AuthGuard";
import { api } from "@/lib/api";
import type { Timeline } from "@/lib/types";
import Link from "next/link";
import { useEffect, useState } from "react";

type TimelineResponse = { timeline: Timeline };

function TimelineInner() {
  const [timeline, setTimeline] = useState<Timeline>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<TimelineResponse>("/api/me/timeline", { auth: true })
      .then((res) => setTimeline(res.timeline))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="container-page">
        <p className="text-slate-500">Memuat timeline...</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="container-page">
        <div className="alert-error" role="alert">
          Error: {error}
        </div>
      </div>
    );
  }

  const years = Object.keys(timeline).sort((a, b) => b.localeCompare(a));

  if (years.length === 0) {
    return (
      <div className="container-page max-w-md">
        <div className="card text-center">
          <div className="text-5xl mb-3">📅</div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Journey Timeline
          </h1>
          <p className="text-slate-600 mb-6">Belum ada perjalanan tercatat.</p>
          <Link href="/destinations" className="btn-primary">
            Mulai Eksplorasi →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page max-w-4xl">
      <h1 className="section-title">📅 Journey Timeline</h1>
      <p className="section-subtitle">
        Riwayat semua kunjungan kamu, dari yang terbaru.
      </p>

      <div className="space-y-8">
        {years.map((year) => (
          <section key={year}>
            <h2 className="text-xl font-bold text-slate-900 mb-3 sticky top-16 bg-slate-50 py-2 border-b border-slate-200 z-10">
              {year}
            </h2>
            <ol className="relative border-l-2 border-blue-200 ml-2 list-none space-y-6">
              {timeline[year].map((visit) => (
                <li key={visit.id} className="ml-6 relative">
                  <span className="absolute -left-[34px] top-1 w-4 h-4 bg-blue-600 rounded-full border-4 border-slate-50" />
                  <article className="card">
                    <div className="flex flex-col sm:flex-row gap-4">
                      {visit.destination?.image_url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={visit.destination.image_url}
                          alt={visit.destination.name}
                          className="w-full sm:w-32 h-32 object-cover rounded-md bg-slate-100"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 mb-1">
                          {visit.destination?.name ?? "Unknown"}
                        </h3>
                        <p className="text-sm text-slate-600 mb-2">
                          📅{" "}
                          {new Date(visit.visitedAt).toLocaleDateString(
                            "id-ID",
                            {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            }
                          )}
                        </p>
                        <p className="text-sm text-slate-600 mb-2">
                          🏅 Badge Token: #{visit.badgeTokenId}
                        </p>
                        {visit.levelAfter && (
                          <p className="inline-block bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-800 text-xs font-semibold px-2 py-1 rounded mb-2">
                            🌟 Level up: {visit.levelAfter}
                          </p>
                        )}
                        {visit.txHash &&
                          (process.env.NEXT_PUBLIC_BLOCK_EXPLORER ? (
                            <p className="text-xs">
                              <a
                                href={`${process.env.NEXT_PUBLIC_BLOCK_EXPLORER}/tx/${visit.txHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                Lihat di Block Explorer →
                              </a>
                            </p>
                          ) : (
                            <p
                              className="text-xs font-mono text-slate-500 break-all"
                              title="Block explorer tidak tersedia di Hardhat Local"
                            >
                              Tx: {visit.txHash.slice(0, 12)}…{visit.txHash.slice(-8)}
                            </p>
                          ))}
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
