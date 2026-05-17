"use client";

import { api } from "@/lib/api";
import type { Destination } from "@/lib/types";
import Link from "next/link";
import { useEffect, useState } from "react";

type DestinationsResponse = { destinations: Destination[] };

export default function DestinationsPage() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<DestinationsResponse>("/api/destinations")
      .then((res) => setDestinations(res.destinations))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

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

  return (
    <div className="container-page">
      <h1 className="section-title">🗺️ Destinasi Wisata</h1>
      <p className="section-subtitle">
        Pilih destinasi untuk lihat detail & QR check-in.
      </p>

      {destinations.length === 0 ? (
        <div className="card text-center">
          <p className="text-slate-500">Belum ada destinasi tersedia.</p>
        </div>
      ) : (
        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 list-none">
          {destinations.map((d) => (
            <li key={d.id}>
              <Link
                href={`/destinations/${d.id}`}
                className="card block hover:shadow-md hover:border-blue-400 transition-all group h-full"
              >
                {d.image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={d.image_url}
                    alt={d.name}
                    className="w-full h-40 object-cover rounded-md mb-3 bg-slate-100"
                  />
                )}
                <h2 className="font-semibold text-slate-900 group-hover:text-blue-600 mb-1">
                  {d.name}
                </h2>
                <p className="text-sm text-slate-600 line-clamp-2 mb-2">
                  {d.description}
                </p>
                <p className="text-xs text-slate-400">
                  📍 {d.location_lat}, {d.location_lng}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
