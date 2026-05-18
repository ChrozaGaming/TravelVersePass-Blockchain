"use client";

import { api } from "@/lib/api";
import type { Destination } from "@/lib/types";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import gsap from "gsap";
import {
  ArrowLeft,
  MapPin,
  Compass,
  AlertCircle,
  Map,
  QrCode,
  ScanLine,
  ExternalLink,
  Info,
} from "lucide-react";

type DestinationResponse = { destination: Destination };

export default function DestinationDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [destination, setDestination] = useState<Destination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) return;
    api<DestinationResponse>(`/api/destinations/${id}`)
      .then((res) => setDestination(res.destination))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!loading && destination && containerRef.current) {
      const ctx = gsap.context(() => {
        gsap.to(".gsap-reveal", {
          y: 0,
          opacity: 1,
          duration: 1.2,
          stagger: 0.1,
          ease: "expo.out",
        });
      }, containerRef);
      return () => ctx.revert();
    }
  }, [loading, destination]);

  if (loading) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center gap-4 relative z-10">
        <div className="relative w-16 h-16 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-t-2 border-amber-500 animate-spin" />
          <Compass className="w-6 h-6 text-amber-500/50" />
        </div>
        <p className="text-slate-400 font-medium tracking-wide animate-pulse">
          Memuat data destinasi...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-3xl mx-auto mt-20 relative z-10 px-4 sm:px-6">
        <div className="bg-rose-500/10 border border-rose-500/20 backdrop-blur-xl rounded-[2rem] p-8 flex flex-col items-center text-center">
          <AlertCircle className="w-12 h-12 text-rose-400 mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">
            Terjadi Kesalahan
          </h2>
          <p className="text-slate-400 mb-6">{error}</p>
          <Link
            href="/destinations"
            className="px-6 py-3 bg-white/[0.05] hover:bg-white/[0.1] text-white rounded-xl border border-white/[0.1] transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar
          </Link>
        </div>
      </div>
    );
  }

  if (!destination) {
    return (
      <div className="w-full max-w-3xl mx-auto mt-20 relative z-10 px-4 sm:px-6">
        <div className="bg-[#0a0b18]/50 backdrop-blur-xl border border-white/[0.05] rounded-[2rem] p-16 flex flex-col items-center text-center">
          <Map className="w-16 h-16 text-white/10 mb-6" />
          <h3 className="text-2xl font-bold text-white mb-2">
            Destinasi Tidak Ditemukan
          </h3>
          <p className="text-slate-400 mb-8">
            Data destinasi yang Anda cari tidak tersedia di jaringan.
          </p>
          <Link
            href="/destinations"
            className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition-all"
          >
            Lihat Destinasi Lainnya
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-32 relative z-10"
    >
      <div className="gsap-reveal opacity-0 translate-y-4 mb-8">
        <Link
          href="/destinations"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-amber-400 transition-colors bg-white/[0.02] hover:bg-amber-500/10 px-4 py-2 rounded-full border border-white/[0.05] hover:border-amber-500/30"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke daftar destinasi
        </Link>
      </div>

      <article className="gsap-reveal opacity-0 translate-y-8 bg-[#0a0b18]/80 backdrop-blur-2xl border border-white/[0.08] rounded-[2.5rem] overflow-hidden shadow-2xl relative">
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />

        <div className="relative h-[300px] sm:h-[450px] w-full bg-[#05050e] overflow-hidden group">
          {destination.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={destination.image_url}
              alt={destination.name}
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Map className="w-20 h-20 text-white/10" />
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0b18] via-[#0a0b18]/40 to-transparent" />

          <div className="absolute bottom-0 left-0 w-full p-8 md:p-12">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/30 backdrop-blur-md text-amber-400 text-sm font-bold tracking-wide">
                <MapPin className="w-4 h-4" />
                Verified Location
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-tight">
              {destination.name}
            </h1>
          </div>
        </div>

        <div className="p-8 md:p-12 grid grid-cols-1 lg:grid-cols-3 gap-12 relative z-10">
          <div className="lg:col-span-2 space-y-12">
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-white/[0.05] flex items-center justify-center border border-white/[0.05]">
                  <Info className="w-5 h-5 text-amber-400" />
                </div>
                <h2 className="text-2xl font-bold text-white">Deskripsi</h2>
              </div>
              <p className="text-slate-400 text-lg leading-relaxed font-light">
                {destination.description}
              </p>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-white/[0.05] flex items-center justify-center border border-white/[0.05]">
                  <MapPin className="w-5 h-5 text-amber-400" />
                </div>
                <h2 className="text-2xl font-bold text-white">
                  Koordinat Lokasi
                </h2>
              </div>

              <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-6">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <span className="block text-sm text-slate-500 mb-1">
                      Latitude
                    </span>
                    <span className="font-mono text-lg text-slate-200">
                      {destination.location_lat}
                    </span>
                  </div>
                  <div>
                    <span className="block text-sm text-slate-500 mb-1">
                      Longitude
                    </span>
                    <span className="font-mono text-lg text-slate-200">
                      {destination.location_lng}
                    </span>
                  </div>
                </div>

                <a
                  href={`https://www.google.com/maps?q=${destination.location_lat},${destination.location_lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3.5 px-4 bg-white/[0.05] hover:bg-white/[0.1] text-white font-medium rounded-xl border border-white/[0.1] transition-all"
                >
                  <Map className="w-5 h-5 text-slate-400" />
                  Buka di Google Maps
                  <ExternalLink className="w-4 h-4 text-slate-500 ml-1" />
                </a>
              </div>
            </section>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-32 space-y-4">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">
                Interaksi Smart Contract
              </h3>

              <Link
                href={`/destinations/${destination.id}/qr`}
                className="group block p-6 rounded-[1.5rem] bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20 hover:border-amber-500/50 transition-all duration-300 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 group-hover:bg-amber-500/20 transition-all" />
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center mb-4 border border-amber-500/30 text-amber-400 group-hover:scale-110 transition-transform">
                    <QrCode className="w-6 h-6" />
                  </div>
                  <h4 className="text-xl font-bold text-white mb-1 group-hover:text-amber-400 transition-colors">
                    Tampilkan QR
                  </h4>
                  <p className="text-sm text-amber-400/60 font-medium">
                    Portal Operator Destinasi
                  </p>
                </div>
              </Link>

              <Link
                href="/scan"
                className="group block p-6 rounded-[1.5rem] bg-gradient-to-br from-violet-500/10 to-transparent border border-violet-500/20 hover:border-violet-500/50 transition-all duration-300 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 group-hover:bg-violet-500/20 transition-all" />
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-violet-500/20 rounded-xl flex items-center justify-center mb-4 border border-violet-500/30 text-violet-400 group-hover:scale-110 transition-transform">
                    <ScanLine className="w-6 h-6" />
                  </div>
                  <h4 className="text-xl font-bold text-white mb-1 group-hover:text-violet-400 transition-colors">
                    Scan QR Lokasi
                  </h4>
                  <p className="text-sm text-violet-400/60 font-medium">
                    Klaim Badge NFT Turis
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
