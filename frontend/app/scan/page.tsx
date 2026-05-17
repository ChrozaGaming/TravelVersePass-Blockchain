"use client";

import AuthGuard from "@/components/AuthGuard";
import QRScanner from "@/components/QRScanner";
import { api } from "@/lib/api";
import type { CheckinResult } from "@/lib/types";
import Link from "next/link";
import { useState } from "react";

const EXPLORER = process.env.NEXT_PUBLIC_BLOCK_EXPLORER;

function TxRow({ label, hash }: Readonly<{ label: string; hash: string }>) {
  const short = `${hash.slice(0, 14)}…${hash.slice(-6)}`;
  return (
    <li>
      {label}:{" "}
      {EXPLORER ? (
        <a
          href={`${EXPLORER}/tx/${hash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline break-all"
        >
          {short}
        </a>
      ) : (
        <span
          className="text-slate-500 break-all"
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
        setError("Kamu belum punya Tourist Pass. Mint dulu di halaman /mint-pass.");
      } else if (code === "ALREADY_CLAIMED") {
        setError("Kamu sudah claim badge di destinasi ini hari ini. Coba lagi besok.");
      } else if (code === "invalid_qr") {
        setError("QR tidak valid atau sudah expired. Scan QR terbaru di lokasi.");
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
      <div className="container-page max-w-2xl">
        <div className="card border-emerald-300 bg-emerald-50">
          <div className="text-center mb-6">
            <div className="text-6xl mb-3">🎉</div>
            <h1 className="text-2xl font-bold text-emerald-800 mb-1">
              Check-in Berhasil!
            </h1>
            <p className="text-slate-600">{result.destination.name}</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {/* Badge */}
            <div className="bg-white rounded-lg p-4 border border-emerald-200">
              <div className="text-sm text-slate-500">🏅 Badge NFT</div>
              <div className="text-2xl font-bold text-slate-900">
                #{result.badge.tokenId}
              </div>
            </div>

            {/* Reward */}
            <div className="bg-white rounded-lg p-4 border border-emerald-200">
              <div className="text-sm text-slate-500">🪙 Reward Earned</div>
              <div className="text-2xl font-bold text-emerald-700">
                +{result.reward.checkin} TVT
              </div>
              {result.reward.levelUpBonus && (
                <div className="text-sm text-emerald-700">
                  +{result.reward.levelUpBonus} bonus
                </div>
              )}
            </div>
          </div>

          {result.levelUp && (
            <div className="mt-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-orange-300 rounded-lg p-4 text-center">
              <div className="text-3xl mb-1">🌟</div>
              <div className="font-bold text-orange-800">LEVEL UP!</div>
              <div className="text-slate-700">
                <span className="line-through opacity-60">
                  {result.levelUp.oldLevel}
                </span>
                {" → "}
                <span className="font-bold text-orange-800">
                  {result.levelUp.newLevel}
                </span>
              </div>
            </div>
          )}

          <details className="mt-6">
            <summary className="text-sm cursor-pointer text-slate-600 hover:text-slate-900">
              Lihat transaction hashes
            </summary>
            <ul className="mt-2 space-y-1 text-xs font-mono text-slate-600">
              <TxRow label="Badge" hash={result.txHashes.badge} />
              <TxRow label="Visit" hash={result.txHashes.visit} />
              <TxRow label="Reward" hash={result.txHashes.reward} />
              {result.txHashes.levelUpBonus && (
                <TxRow
                  label="Level Up Bonus"
                  hash={result.txHashes.levelUpBonus}
                />
              )}
            </ul>
          </details>

          <div className="flex flex-wrap gap-2 mt-6">
            <button
              type="button"
              onClick={handleReset}
              className="btn-secondary flex-1"
            >
              Scan Lagi
            </button>
            <Link href="/dashboard" className="btn-primary flex-1">
              Dashboard
            </Link>
            <Link href="/badges" className="btn-ghost flex-1">
              Lihat Koleksi
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page max-w-2xl">
      <h1 className="section-title">📷 Scan QR Check-in</h1>
      <p className="section-subtitle">
        Scan QR yang ditampilkan di lokasi wisata untuk klaim badge NFT.
      </p>

      <div className="card">
        <QRScanner onScan={handleScan} paused={processing} />

        {processing && (
          <output className="alert-info mt-4 block">
            ⏳ Memproses transaksi on-chain... (15-30 detik di testnet, 1-2 detik
            di local)
          </output>
        )}

        {error && (
          <div className="alert-error mt-4" role="alert">
            {error}
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
