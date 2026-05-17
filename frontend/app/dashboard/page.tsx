"use client";

import AuthGuard from "@/components/AuthGuard";
import LevelProgress from "@/components/LevelProgress";
import { api } from "@/lib/api";
import { shortAddress } from "@/lib/wallet";
import type { PassData } from "@/lib/types";
import Link from "next/link";
import { useEffect, useState } from "react";

type MeResponse = {
  wallet: string;
  pass: PassData | null;
  balance: string;
};

function DashboardInner() {
  const [data, setData] = useState<MeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<MeResponse>("/api/me", { auth: true })
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="container-page">
        <p className="text-slate-500">Memuat dashboard...</p>
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
  if (!data) {
    return (
      <div className="container-page">
        <p>Tidak ada data.</p>
      </div>
    );
  }

  if (!data.pass) {
    return (
      <div className="container-page max-w-md">
        <div className="card text-center">
          <div className="text-5xl mb-3">🪪</div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Dashboard</h1>
          <p className="text-sm text-slate-600 mb-4 break-all">
            Wallet: {data.wallet}
          </p>
          <p className="text-slate-700 mb-6">
            Kamu belum punya Tourist Pass. Mint dulu untuk mulai koleksi.
          </p>
          <Link href="/mint-pass" className="btn-primary w-full">
            Mint Tourist Pass →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page">
      <h1 className="section-title">Dashboard</h1>
      <p className="section-subtitle">
        Welcome, <strong>{data.pass.username}</strong>!
      </p>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile card */}
        <div className="card lg:col-span-1">
          <h2 className="font-semibold text-slate-900 mb-3">👤 Profil</h2>
          <dl className="space-y-2 text-sm">
            <div>
              <dt className="text-slate-500">Username</dt>
              <dd className="font-medium text-slate-900">
                {data.pass.username}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Wallet</dt>
              <dd
                className="font-mono text-slate-900"
                title={data.wallet}
              >
                {shortAddress(data.wallet)}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Member sejak</dt>
              <dd className="text-slate-900">
                {new Date(data.pass.mintedAt).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </dd>
            </div>
          </dl>
        </div>

        {/* Level progress */}
        <div className="card lg:col-span-2">
          <LevelProgress pass={data.pass} />
        </div>

        {/* Token balance */}
        <div className="card lg:col-span-1 bg-gradient-to-br from-emerald-50 to-blue-50 border-emerald-200">
          <h2 className="font-semibold text-slate-900 mb-2">🪙 Reward Token</h2>
          <p className="text-4xl font-bold text-emerald-700">{data.balance}</p>
          <p className="text-sm text-slate-600">TVT</p>
        </div>

        {/* Quick actions */}
        <div className="card lg:col-span-2">
          <h2 className="font-semibold text-slate-900 mb-3">⚡ Aksi Cepat</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <Link
              href="/scan"
              className="block p-4 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50 transition-colors"
            >
              <div className="font-medium text-slate-900">📷 Scan QR</div>
              <div className="text-sm text-slate-600">Klaim badge baru</div>
            </Link>
            <Link
              href="/destinations"
              className="block p-4 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50 transition-colors"
            >
              <div className="font-medium text-slate-900">🗺️ Destinasi</div>
              <div className="text-sm text-slate-600">Lihat tempat wisata</div>
            </Link>
            <Link
              href="/badges"
              className="block p-4 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50 transition-colors"
            >
              <div className="font-medium text-slate-900">
                🏅 My Badges ({data.pass.visitedCount})
              </div>
              <div className="text-sm text-slate-600">NFT collection</div>
            </Link>
            <Link
              href="/timeline"
              className="block p-4 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50 transition-colors"
            >
              <div className="font-medium text-slate-900">📅 Timeline</div>
              <div className="text-sm text-slate-600">Riwayat perjalanan</div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardInner />
    </AuthGuard>
  );
}
