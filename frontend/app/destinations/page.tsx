"use client";

import { api } from "@/lib/api";
import type { Destination } from "@/lib/types";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import gsap from "gsap";
import {
  MapPin,
  Compass,
  AlertCircle,
  Loader2,
  ArrowRight,
  Map,
} from "lucide-react";

type DestinationsResponse = { destinations: Destination[] };

export default function DestinationsPage() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api<DestinationsResponse>("/api/destinations")
      .then((res) => setDestinations(res.destinations))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!loading && destinations.length > 0 && containerRef.current) {
      const ctx = gsap.context(() => {
        gsap.to(".page-header", {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: "expo.out",
        });

        gsap.to(".destination-card", {
          y: 0,
          opacity: 1,
          duration: 1,
          stagger: 0.1,
          ease: "expo.out",
          delay: 0.2,
        });
      }, containerRef);
      return () => ctx.revert();
    }
  }, [loading, destinations]);

  if (loading) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center gap-4 relative z-10">
        <div className="relative w-16 h-16 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-t-2 border-amber-500 animate-spin" />
          <Compass className="w-6 h-6 text-amber-500/50" />
        </div>
        <p className="text-slate-400 font-medium tracking-wide animate-pulse">
          Sinkronisasi data blockchain...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-3xl mx-auto mt-20 relative z-10 px-4 sm:px-6">
        <div className="bg-rose-500/10 border border-rose-500/20 backdrop-blur-xl rounded-[2rem] p-8 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-rose-500/20 rounded-full flex items-center justify-center mb-6">
            <AlertCircle className="w-8 h-8 text-rose-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Gagal Memuat Data
          </h2>
          <p className="text-slate-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-24 relative z-10"
    >
      <div className="page-header opacity-0 translate-y-8 flex flex-col items-center text-center mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-bold tracking-wide mb-6">
          <Compass className="w-4 h-4" />
          <span>Eksplorasi Dunia</span>
        </div>
        <h1 className="text-5xl md:text-6xl font-black text-white tracking-tight mb-4">
          Destinasi{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
            Wisata
          </span>
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl font-light leading-relaxed">
          Pilih destinasi untuk melihat detail, klaim koleksi NFT eksklusif, dan
          lakukan QR check-in langsung di lokasi.
        </p>
      </div>

      {destinations.length === 0 ? (
        <div className="bg-[#0a0b18]/50 backdrop-blur-xl border border-white/[0.05] rounded-[2rem] p-16 flex flex-col items-center text-center">
          <Map className="w-16 h-16 text-white/10 mb-6" />
          <h3 className="text-2xl font-bold text-white mb-2">
            Belum Ada Destinasi
          </h3>
          <p className="text-slate-400">
            Data destinasi wisata belum tersedia di jaringan saat ini.
          </p>
        </div>
      ) : (
        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 list-none p-0">
          {destinations.map((d) => (
            <li key={d.id} className="destination-card opacity-0 translate-y-8">
              <Link
                href={`/destinations/${d.id}`}
                className="block h-full relative group rounded-[2rem] bg-[#0a0b18]/80 backdrop-blur-xl border border-white/[0.08] hover:border-amber-500/40 overflow-hidden transition-all duration-500 shadow-2xl flex flex-col"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-amber-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                <div className="relative h-56 overflow-hidden bg-white/[0.02]">
                  {d.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={d.image_url}
                      alt={d.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Map className="w-12 h-12 text-white/10" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0b18] via-[#0a0b18]/50 to-transparent opacity-90" />

                  <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                      <MapPin className="w-3.5 h-3.5 text-amber-500" />
                      {Number(d.location_lat).toFixed(3)},{" "}
                      {Number(d.location_lng).toFixed(3)}
                    </div>
                  </div>
                </div>

                <div className="p-6 md:p-8 flex-1 flex flex-col relative z-10">
                  <h2 className="text-2xl font-bold text-white mb-3 group-hover:text-amber-400 transition-colors">
                    {d.name}
                  </h2>
                  <p className="text-slate-400 text-sm line-clamp-3 mb-8 leading-relaxed flex-1">
                    {d.description}
                  </p>

                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/[0.05]">
                    <span className="text-sm font-semibold text-slate-500 group-hover:text-amber-500/80 transition-colors">
                      Lihat Detail
                    </span>
                    <div className="w-10 h-10 rounded-full bg-white/[0.03] flex items-center justify-center group-hover:bg-amber-500 group-hover:text-slate-950 text-slate-400 transition-all duration-300 border border-white/[0.05] group-hover:border-transparent">
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
