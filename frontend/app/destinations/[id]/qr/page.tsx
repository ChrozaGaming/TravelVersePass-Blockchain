"use client";

import { api } from "@/lib/api";
import type { QRPayload } from "@/lib/types";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import {
  ShieldCheck,
  QrCode,
  TimerReset,
  ScanLine,
  Sparkles,
  LockKeyhole,
  AlertCircle,
} from "lucide-react";

const POLL_INTERVAL_MS = 10 * 60 * 1000;

export default function QRDisplayPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [qr, setQr] = useState<QRPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const qrRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (!containerRef.current || !qr) return;

    const ctx = gsap.context(() => {
      gsap.to(".gsap-reveal", {
        opacity: 1,
        y: 0,
        duration: 1.2,
        stagger: 0.08,
        ease: "expo.out",
      });

      gsap.to(".gsap-float", {
        y: -10,
        duration: 2.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      gsap.fromTo(
        qrRef.current,
        {
          scale: 0.92,
          opacity: 0,
          rotateX: 8,
        },
        {
          scale: 1,
          opacity: 1,
          rotateX: 0,
          duration: 1.4,
          ease: "expo.out",
        },
      );
    }, containerRef);

    return () => ctx.revert();
  }, [qr]);

  if (error) {
    return (
      <div className="w-full max-w-3xl mx-auto mt-20 relative z-10 px-4 sm:px-6">
        <div className="bg-rose-500/10 border border-rose-500/20 backdrop-blur-xl rounded-[2rem] p-10 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-5">
            <AlertCircle className="w-8 h-8 text-rose-400" />
          </div>

          <h2 className="text-3xl font-black text-white mb-3">
            Failed to Load QR
          </h2>

          <p className="text-slate-400 max-w-md">{error}</p>
        </div>
      </div>
    );
  }

  if (!qr) {
    return (
      <div className="w-full min-h-[70vh] flex flex-col items-center justify-center gap-6 relative z-10">
        <div className="relative">
          <div className="absolute inset-0 rounded-full border border-amber-500/20 scale-150 animate-ping" />

          <div className="w-20 h-20 rounded-[1.5rem] border border-amber-500/20 bg-amber-500/10 flex items-center justify-center backdrop-blur-xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent" />

            <QrCode className="w-9 h-9 text-amber-400 animate-pulse relative z-10" />
          </div>
        </div>

        <div className="text-center">
          <h3 className="text-white font-bold text-xl mb-1">
            Generating Secure QR
          </h3>

          <p className="text-slate-500">
            Menghubungkan ke jaringan TravelVerse...
          </p>
        </div>
      </div>
    );
  }

  const mins = Math.floor(countdown / 60);
  const secs = countdown % 60;
  const isExpiringSoon = countdown < 60;

  const progress = (countdown / qr.ttlSeconds) * 100;

  return (
    <div
      ref={containerRef}
      className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-32 relative z-10"
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-amber-500/10 blur-[140px]" />

        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-violet-500/10 blur-[140px]" />
      </div>

      <section className="relative overflow-hidden rounded-[2.5rem] border border-white/[0.08] bg-[#0a0b18]/80 backdrop-blur-2xl shadow-[0_20px_120px_rgba(0,0,0,0.45)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_40%)]" />

        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(rgba(255,255,255,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.3)_1px,transparent_1px)] bg-[size:40px_40px]" />

        <div className="relative z-10 p-6 md:p-10 lg:p-14">
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center">
            <div>
              <div className="gsap-reveal opacity-0 translate-y-6 flex flex-wrap gap-3 mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-bold tracking-wide">
                  <ShieldCheck className="w-4 h-4" />
                  Encrypted Session
                </div>

                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm font-bold tracking-wide">
                  <ScanLine className="w-4 h-4" />
                  Live Rotating QR
                </div>
              </div>

              <div className="gsap-reveal opacity-0 translate-y-8">
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-[-0.04em] leading-[0.95] text-white mb-6">
                  Smart
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-500 to-orange-400">
                    Destination QR
                  </span>
                </h1>

                <p className="text-lg text-slate-400 leading-relaxed max-w-2xl">
                  QR terenkripsi untuk validasi check-in destinasi wisata dalam
                  ekosistem{" "}
                  <span className="text-white font-semibold">TravelVerse</span>.
                  QR akan otomatis berganti secara berkala demi menjaga keamanan
                  transaksi dan autentikasi pengunjung.
                </p>
              </div>

              <div className="gsap-reveal opacity-0 translate-y-8 mt-10">
                <div className="flex items-start gap-4 p-5 rounded-[1.75rem] border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                    <Sparkles className="w-6 h-6 text-amber-400" />
                  </div>

                  <div>
                    <h3 className="text-white font-bold text-lg mb-1">
                      {qr.destination.name}
                    </h3>

                    <p className="text-slate-400 text-sm leading-relaxed">
                      Scan QR menggunakan aplikasi TravelVerse Pass untuk
                      melakukan verifikasi check-in lokasi secara real-time.
                    </p>
                  </div>
                </div>
              </div>

              <div className="gsap-reveal opacity-0 translate-y-8 mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-[1.5rem] border border-white/[0.06] bg-white/[0.03] p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                        isExpiringSoon
                          ? "bg-rose-500/10 text-rose-400"
                          : "bg-amber-500/10 text-amber-400"
                      }`}
                    >
                      <TimerReset className="w-5 h-5" />
                    </div>

                    <div>
                      <p className="text-slate-500 text-sm">
                        Refresh Countdown
                      </p>

                      <h3
                        className={`text-3xl font-black tracking-tight font-mono ${
                          isExpiringSoon ? "text-rose-400" : "text-white"
                        }`}
                      >
                        {mins}:{secs.toString().padStart(2, "0")}
                      </h3>
                    </div>
                  </div>

                  <div className="w-full h-2 rounded-full bg-white/[0.04] overflow-hidden">
                    <div
                      className={`h-full transition-all duration-1000 ${
                        isExpiringSoon
                          ? "bg-rose-400"
                          : "bg-gradient-to-r from-amber-400 to-orange-400"
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <div className="rounded-[1.5rem] border border-white/[0.06] bg-white/[0.03] p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-violet-500/10 text-violet-400 flex items-center justify-center">
                      <LockKeyhole className="w-5 h-5" />
                    </div>

                    <div>
                      <p className="text-slate-500 text-sm">Security TTL</p>

                      <h3 className="text-3xl font-black tracking-tight text-white">
                        {qr.ttlSeconds}s
                      </h3>
                    </div>
                  </div>

                  <p className="text-sm text-slate-400 leading-relaxed">
                    Sistem rotasi QR otomatis untuk mencegah reuse token dan
                    manipulasi autentikasi.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center">
              <div ref={qrRef} className="relative gsap-float perspective-1000">
                <div className="absolute inset-0 rounded-[3rem] bg-gradient-to-br from-amber-500/30 to-violet-500/20 blur-3xl scale-90" />

                <div className="relative rounded-[3rem] border border-white/[0.08] bg-white/[0.04] backdrop-blur-2xl p-5 md:p-7 shadow-[0_10px_80px_rgba(245,158,11,0.15)]">
                  <div className="absolute inset-0 rounded-[3rem] bg-gradient-to-br from-white/[0.08] to-transparent pointer-events-none" />

                  <div className="relative rounded-[2rem] overflow-hidden bg-white p-5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={qr.dataUrl}
                      alt="QR Check-in Code"
                      className="w-full h-auto rounded-xl"
                    />
                  </div>

                  <div className="mt-5 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-slate-500 text-xs uppercase tracking-widest mb-1">
                        Destination Access
                      </p>

                      <h3 className="text-white font-bold text-lg line-clamp-1">
                        {qr.destination.name}
                      </h3>
                    </div>

                    <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                      <QrCode className="w-7 h-7 text-amber-400" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <details className="gsap-reveal opacity-0 translate-y-8 mt-10 overflow-hidden rounded-[2rem] border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl">
            <summary className="cursor-pointer list-none px-6 py-5 flex items-center justify-between">
              <div>
                <p className="text-white font-bold">
                  Developer Debug Information
                </p>

                <p className="text-slate-500 text-sm">
                  Metadata & authentication payload
                </p>
              </div>

              <div className="w-12 h-12 rounded-2xl border border-white/[0.06] bg-white/[0.03] flex items-center justify-center">
                <QrCode className="w-5 h-5 text-slate-400" />
              </div>
            </summary>

            <div className="px-6 pb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-white/[0.05] bg-black/20 p-5">
                  <p className="text-xs uppercase tracking-widest text-slate-500 mb-2">
                    Issued At
                  </p>

                  <p className="text-slate-200 font-mono">
                    {new Date(qr.issuedAt * 1000).toLocaleTimeString("id-ID")}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/[0.05] bg-black/20 p-5">
                  <p className="text-xs uppercase tracking-widest text-slate-500 mb-2">
                    Expires At
                  </p>

                  <p className="text-slate-200 font-mono">
                    {new Date(qr.expiresAt * 1000).toLocaleTimeString("id-ID")}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/[0.05] bg-black/20 p-5">
                  <p className="text-xs uppercase tracking-widest text-slate-500 mb-2">
                    TTL Seconds
                  </p>

                  <p className="text-slate-200 font-mono">
                    {qr.ttlSeconds} detik
                  </p>
                </div>

                <div className="sm:col-span-2 rounded-2xl border border-white/[0.05] bg-black/20 p-5 overflow-hidden">
                  <p className="text-xs uppercase tracking-widest text-slate-500 mb-2">
                    Token Payload
                  </p>

                  <div className="text-slate-300 font-mono text-xs break-all leading-relaxed">
                    {qr.token}
                  </div>
                </div>
              </div>
            </div>
          </details>
        </div>
      </section>
    </div>
  );
}
