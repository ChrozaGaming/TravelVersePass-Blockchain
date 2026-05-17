"use client";

import { api } from "@/lib/api";
import type { Destination } from "@/lib/types";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type DestinationResponse = { destination: Destination };

export default function DestinationDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [destination, setDestination] = useState<Destination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    api<DestinationResponse>(`/api/destinations/${id}`)
      .then((res) => setDestination(res.destination))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="container-page">
        <p className="text-slate-500">Memuat destinasi...</p>
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
  if (!destination) {
    return (
      <div className="container-page">
        <p>Destinasi tidak ditemukan.</p>
      </div>
    );
  }

  return (
    <div className="container-page max-w-4xl">
      <Link href="/destinations" className="text-sm text-blue-600 hover:underline mb-4 inline-block">
        ← Kembali ke daftar destinasi
      </Link>

      <article className="card">
        {destination.image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={destination.image_url}
            alt={destination.name}
            className="w-full h-64 sm:h-80 object-cover rounded-md mb-6 bg-slate-100"
          />
        )}

        <h1 className="text-3xl font-bold text-slate-900 mb-3">
          {destination.name}
        </h1>

        <section className="mb-6">
          <h2 className="font-semibold text-slate-900 mb-2">📖 Deskripsi</h2>
          <p className="text-slate-700 leading-relaxed">
            {destination.description}
          </p>
        </section>

        <section className="mb-6">
          <h2 className="font-semibold text-slate-900 mb-2">📍 Lokasi</h2>
          <p className="text-sm text-slate-700 mb-2">
            Lat: <span className="font-mono">{destination.location_lat}</span>,{" "}
            Lng: <span className="font-mono">{destination.location_lng}</span>
          </p>
          <a
            href={`https://www.google.com/maps?q=${destination.location_lat},${destination.location_lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary text-sm"
          >
            🗺️ Buka di Google Maps
          </a>
        </section>

        <section className="border-t border-slate-200 pt-6">
          <h2 className="font-semibold text-slate-900 mb-3">⚡ Aksi</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <Link
              href={`/destinations/${destination.id}/qr`}
              className="block p-4 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50 transition-colors"
            >
              <div className="font-medium text-slate-900">
                📱 Tampilkan QR
              </div>
              <div className="text-sm text-slate-600">
                Untuk operator/tablet di lokasi
              </div>
            </Link>
            <Link
              href="/scan"
              className="block p-4 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50 transition-colors"
            >
              <div className="font-medium text-slate-900">📷 Scan QR</div>
              <div className="text-sm text-slate-600">
                Sebagai turis (klaim badge)
              </div>
            </Link>
          </div>
        </section>
      </article>
    </div>
  );
}
