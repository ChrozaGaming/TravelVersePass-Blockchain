"use client";

import AuthGuard from "@/components/AuthGuard";
import NFTBadgeCard from "@/components/NFTBadgeCard";
import { api } from "@/lib/api";
import type { Badge } from "@/lib/types";
import Link from "next/link";
import { useEffect, useState } from "react";

type BadgesResponse = { badges: Badge[] };

function BadgesInner() {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<BadgesResponse>("/api/me/badges", { auth: true })
      .then((res) => setBadges(res.badges))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="container-page">
        <p className="text-slate-500">Memuat badges...</p>
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

  if (badges.length === 0) {
    return (
      <div className="container-page max-w-md">
        <div className="card text-center">
          <div className="text-5xl mb-3">🏅</div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">My Badges</h1>
          <p className="text-slate-600 mb-6">
            Belum ada badge. Yuk mulai jalan-jalan!
          </p>
          <Link href="/destinations" className="btn-primary">
            Lihat Destinasi →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page">
      <h1 className="section-title">🏅 My Badges</h1>
      <p className="section-subtitle">
        {badges.length} koleksi NFT dari destinasi yang sudah dikunjungi.
      </p>

      <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 list-none">
        {badges.map((badge) => (
          <li key={badge.tokenId}>
            <NFTBadgeCard badge={badge} />
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
