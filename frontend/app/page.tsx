"use client";

import Link from "next/link";
import WalletConnect from "@/components/WalletConnect";
import { useAuth } from "@/contexts/AuthContext";

export default function HomePage() {
  const { isLoggedIn } = useAuth();
  return (
    <div className="container-page">
      {/* Hero */}
      <section className="text-center py-12 sm:py-16">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-sm font-medium px-3 py-1 rounded-full mb-6">
          <span>🌍</span>
          <span>NFT Tourist Pass Platform</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 tracking-tight mb-4">
          TravelVerse Pass
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-8">
          Setiap perjalanan jadi koleksi digital yang terverifikasi, gamifikatif,
          dan bernilai di blockchain.
        </p>

        <div className="max-w-md mx-auto">
          <WalletConnect />
          {isLoggedIn ? (
            <Link href="/dashboard" className="btn-primary mt-4 w-full">
              Buka Dashboard →
            </Link>
          ) : (
            <Link href="/login" className="btn-primary mt-4 w-full">
              Login dengan Wallet →
            </Link>
          )}
        </div>
      </section>

      {/* Value props */}
      <section className="grid sm:grid-cols-3 gap-4 mb-12">
        <div className="card text-center">
          <div className="text-4xl mb-2">🪙</div>
          <h3 className="font-semibold text-slate-900 mb-1">Collectible</h3>
          <p className="text-sm text-slate-600">
            Setiap kunjungan jadi NFT badge unik
          </p>
        </div>
        <div className="card text-center">
          <div className="text-4xl mb-2">✅</div>
          <h3 className="font-semibold text-slate-900 mb-1">Verified</h3>
          <p className="text-sm text-slate-600">
            Tidak bisa dipalsukan berkat blockchain
          </p>
        </div>
        <div className="card text-center">
          <div className="text-4xl mb-2">🎮</div>
          <h3 className="font-semibold text-slate-900 mb-1">Gamified</h3>
          <p className="text-sm text-slate-600">
            Level traveler dari Beginner ke Legendary
          </p>
        </div>
      </section>

      {/* CTA cards */}
      <section className="grid sm:grid-cols-2 gap-4">
        <Link
          href="/destinations"
          className="card hover:border-blue-400 hover:shadow-md transition-all group"
        >
          <h3 className="font-semibold text-slate-900 mb-1 group-hover:text-blue-600">
            🗺️ Lihat Destinasi
          </h3>
          <p className="text-sm text-slate-600">
            Eksplorasi destinasi wisata yang tersedia
          </p>
        </Link>
        <Link
          href="/scan"
          className="card hover:border-blue-400 hover:shadow-md transition-all group"
        >
          <h3 className="font-semibold text-slate-900 mb-1 group-hover:text-blue-600">
            📷 Scan QR
          </h3>
          <p className="text-sm text-slate-600">
            Scan QR di lokasi untuk klaim badge NFT
          </p>
        </Link>
      </section>
    </div>
  );
}
