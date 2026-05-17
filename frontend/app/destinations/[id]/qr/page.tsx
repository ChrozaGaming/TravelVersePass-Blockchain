"use client";

import { api } from "@/lib/api";
import type { QRPayload } from "@/lib/types";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

const POLL_INTERVAL_MS = 10 * 60 * 1000;

export default function QRDisplayPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [qr, setQr] = useState<QRPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (!id) return;

    async function fetchQR() {
      try {
        const data = await api<QRPayload>(`/api/destinations/${id}/qr`);
        setQr(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch QR");
      }
    }

    fetchQR();
    const interval = setInterval(fetchQR, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    if (!qr) return;
    function tick() {
      const remaining = qr!.expiresAt - Math.floor(Date.now() / 1000);
      setCountdown(Math.max(0, remaining));
    }
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [qr]);

  if (error) {
    return (
      <div className="container-page">
        <div className="alert-error" role="alert">
          Error: {error}
        </div>
      </div>
    );
  }
  if (!qr) {
    return (
      <div className="container-page">
        <p className="text-slate-500">Memuat QR...</p>
      </div>
    );
  }

  const mins = Math.floor(countdown / 60);
  const secs = countdown % 60;
  const isExpiringSoon = countdown < 60;

  return (
    <div className="container-page max-w-2xl">
      <div className="card text-center">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          {qr.destination.name}
        </h1>
        <p className="text-sm text-slate-500 mb-6">
          Scan QR code di bawah dengan aplikasi TravelVerse Pass
        </p>

        <div className="inline-block p-4 bg-white rounded-lg border-2 border-slate-200 mb-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qr.dataUrl}
            alt="QR Check-in Code"
            className="w-72 h-72 sm:w-96 sm:h-96"
          />
        </div>

        <div
          className={`text-lg font-mono mb-1 ${
            isExpiringSoon ? "text-red-600" : "text-slate-700"
          }`}
        >
          ⏱️ Refresh dalam {mins}:{secs.toString().padStart(2, "0")}
        </div>
        <p className="text-xs text-slate-500">
          QR rotating tiap 15 menit untuk keamanan
        </p>
      </div>

      <details className="card mt-4 text-sm">
        <summary className="cursor-pointer font-medium">
          Debug info (untuk developer)
        </summary>
        <dl className="mt-2 space-y-1 text-xs font-mono">
          <div>
            <dt className="text-slate-500 inline">Issued:</dt>{" "}
            <dd className="inline">
              {new Date(qr.issuedAt * 1000).toLocaleTimeString("id-ID")}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500 inline">Expires:</dt>{" "}
            <dd className="inline">
              {new Date(qr.expiresAt * 1000).toLocaleTimeString("id-ID")}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500 inline">TTL:</dt>{" "}
            <dd className="inline">{qr.ttlSeconds} detik</dd>
          </div>
          <div>
            <dt className="text-slate-500">Token:</dt>
            <dd className="break-all bg-slate-50 p-2 rounded mt-1">
              {qr.token}
            </dd>
          </div>
        </dl>
      </details>
    </div>
  );
}
