"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import WalletConnect from "@/components/WalletConnect";
import { useAuth } from "@/contexts/AuthContext";
import {
  Hexagon,
  BadgeCheck,
  Map,
  QrCode,
  ArrowRight,
  Activity,
  Compass,
  Trophy,
} from "lucide-react";

export default function HomePage() {
  const { isLoggedIn } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(".gsap-reveal", {
        y: 0,
        opacity: 1,
        duration: 1.2,
        stagger: 0.1,
        ease: "expo.out",
        delay: 0.1,
      });

      gsap.to(".gsap-float", {
        y: -15,
        rotation: 2,
        duration: 4,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
      });

      gsap.to(".gsap-spin-slow", {
        rotation: 360,
        duration: 50,
        repeat: -1,
        ease: "none",
        transformOrigin: "center center",
      });

      gsap.to(".gsap-orb-1", {
        x: 50,
        y: -40,
        duration: 10,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
      });
      gsap.to(".gsap-orb-2", {
        x: -40,
        y: 50,
        duration: 12,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
        delay: 2,
      });
      gsap.to(".gsap-orb-3", {
        x: 30,
        y: 35,
        duration: 14,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
        delay: 4,
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-[#030308] text-slate-200 selection:bg-amber-500/30 selection:text-amber-100 overflow-hidden relative"
    >
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:80px_80px] [mask-image:radial-gradient(ellipse_100%_100%_at_50%_0%,#000_40%,transparent_100%)] pointer-events-none" />

      <div className="gsap-orb-1 absolute -top-[20%] -left-[10%] w-[50vw] h-[60vw] rounded-full bg-amber-500/10 blur-[160px] pointer-events-none mix-blend-screen" />
     
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-32">
        <section className="flex flex-col items-center text-center mb-28">
          <div className="gsap-reveal opacity-0 translate-y-8 inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/[0.02] border border-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-xl mb-12 cursor-default hover:bg-white/[0.04] transition-colors">
            <div className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.8)]" />
            </div>
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-slate-300">
              NFT Tourist Pass
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
            <span className="text-[11px] font-semibold text-amber-400 tracking-wide">
              Live Network
            </span>
          </div>

          <h1 className="gsap-reveal opacity-0 translate-y-8 text-[clamp(4.5rem,12vw,9.5rem)] font-black tracking-tighter mb-2 leading-[0.9] relative select-none">
            <span className="absolute inset-0 -z-10 blur-[120px] bg-gradient-to-b from-amber-500/20 via-orange-500/10 to-transparent" />
            <span className="block text-transparent bg-clip-text bg-gradient-to-b from-white via-white/90 to-white/20 drop-shadow-sm">
              Travel
            </span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-500 to-rose-500">
              Verse
            </span>
          </h1>

          <div className="gsap-reveal opacity-0 translate-y-8 flex items-center gap-6 mt-8 mb-10">
            <div className="h-px w-32 bg-gradient-to-r from-transparent via-amber-500/50 to-amber-500/10" />
            <span className="text-xs tracking-[0.6em] uppercase font-black text-amber-500/60 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]">
              Pass
            </span>
            <div className="h-px w-32 bg-gradient-to-l from-transparent via-amber-500/50 to-amber-500/10" />
          </div>

          <p className="gsap-reveal opacity-0 translate-y-8 text-lg sm:text-xl text-slate-400 max-w-2xl mb-16 leading-relaxed font-light">
            Revolusi pariwisata masa depan. Setiap perjalanan menjadi koleksi
            digital yang terverifikasi, gamifikatif, dan bernilai abadi di
            ekosistem blockchain.
          </p>

          <div className="gsap-reveal opacity-0 translate-y-8 w-full max-w-[380px] relative group">
            <div className="absolute -inset-0.5 rounded-[2rem] bg-gradient-to-b from-amber-500/40 via-amber-500/10 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-700 blur-sm" />
            <div className="relative bg-[#05050e]/90 backdrop-blur-3xl p-2 rounded-[2rem] shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
              <div className="p-8 rounded-[1.5rem] bg-gradient-to-b from-white/[0.04] to-transparent border border-white/[0.05]">
                <WalletConnect />
                <div className="mt-6">
                  {isLoggedIn ? (
                    <Link
                      href="/dashboard"
                      className="group/btn flex items-center justify-center gap-3 w-full py-4 px-6 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black rounded-xl transition-all duration-300 active:scale-[0.97] shadow-[0_0_30px_rgba(245,158,11,0.3)] hover:shadow-[0_0_50px_rgba(245,158,11,0.5)] tracking-wide"
                    >
                      Buka Dashboard
                      <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  ) : (
                    <Link
                      href="/login"
                      className="group/btn flex items-center justify-center gap-3 w-full py-4 px-6 bg-white/[0.03] hover:bg-white/[0.08] text-white font-bold rounded-xl transition-all duration-300 border border-white/[0.1] hover:border-amber-500/30 tracking-wide active:scale-[0.97]"
                    >
                      Login dengan Wallet
                      <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 text-amber-500 transition-transform" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {(
            [
              {
                icon: <Hexagon className="w-6 h-6" />,
                title: "Collectible",
                desc: "Klaim NFT eksklusif di setiap destinasi. Bukti digital perjalanan tersimpan permanen di wallet kamu.",
                glow: "bg-amber-500/20",
                color: "text-amber-400 border-amber-500/20 bg-amber-500/10",
              },
              {
                icon: <BadgeCheck className="w-6 h-6" />,
                title: "Verified",
                desc: "Keamanan tingkat tinggi dengan validasi blockchain. Tidak ada lagi tiket palsu atau ulasan fiktif.",
                glow: "bg-emerald-500/20",
                color:
                  "text-emerald-400 border-emerald-500/20 bg-emerald-500/10",
              },
              {
                icon: <Trophy className="w-6 h-6" />,
                title: "Gamified",
                desc: "Kumpulkan poin, buka pencapaian, dan naik level dari Beginner hingga Legendary Traveler.",
                glow: "bg-violet-500/20",
                color: "text-violet-400 border-violet-500/20 bg-violet-500/10",
              },
            ] as const
          ).map((item) => (
            <div
              key={item.title}
              className="gsap-reveal opacity-0 translate-y-8 group relative p-8 rounded-[2rem] border border-white/[0.06] bg-white/[0.01] overflow-hidden transition-all duration-500 hover:bg-white/[0.03] hover:border-white/[0.15] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]"
            >
              <div
                className={`absolute -top-10 -right-10 w-48 h-48 blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none ${item.glow}`}
              />
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border transition-all duration-500 group-hover:scale-110 shadow-lg ${item.color}`}
              >
                {item.icon}
              </div>
              <h3 className="font-black text-white text-xl mb-3 tracking-wide">
                {item.title}
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed font-medium">
                {item.desc}
              </p>
            </div>
          ))}
        </section>

        <section className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <Link
            href="/destinations"
            className="gsap-reveal opacity-0 translate-y-8 md:col-span-7 block min-h-[340px] bg-gradient-to-br from-[#0c0a10] to-[#050408] p-10 sm:p-12 rounded-[2.5rem] border border-white/[0.06] hover:border-amber-500/40 relative overflow-hidden group transition-all duration-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
          >
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] mix-blend-overlay pointer-events-none" />
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-amber-500/10 rounded-full blur-[100px] -translate-y-1/3 translate-x-1/4 group-hover:bg-amber-500/20 transition-colors duration-700 pointer-events-none" />
            <Compass className="gsap-spin-slow absolute -right-16 -bottom-16 w-80 h-80 text-white/[0.02] group-hover:text-amber-500/[0.06] transition-colors duration-700 pointer-events-none" />

            <div className="flex flex-col h-full justify-between relative z-10">
              <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center border border-amber-500/20 shadow-[0_0_30px_rgba(245,158,11,0.1)] group-hover:scale-110 group-hover:border-amber-500/40 transition-all duration-500 backdrop-blur-md">
                <Map className="w-7 h-7 text-amber-400" />
              </div>
              <div className="mt-16">
                <div className="flex items-center gap-4 mb-4">
                  <h3 className="font-black text-4xl sm:text-5xl text-white tracking-tighter leading-none">
                    Explore
                    <br />
                    Destinations
                  </h3>
                  <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 shrink-0 border border-amber-500/30">
                    <ArrowRight className="w-5 h-5 text-amber-400" />
                  </div>
                </div>
                <p className="text-slate-400 text-base max-w-sm leading-relaxed font-medium">
                  Jelajahi destinasi wisata eksotis yang terintegrasi dengan
                  ekosistem smart tourism Web3 kami.
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/scan"
            className="gsap-reveal opacity-0 translate-y-8 md:col-span-5 block min-h-[340px] bg-gradient-to-br from-[#0a0714] to-[#040208] p-10 sm:p-12 rounded-[2.5rem] border border-white/[0.06] hover:border-violet-500/40 relative overflow-hidden group transition-all duration-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
          >
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] mix-blend-overlay pointer-events-none" />
            <div className="absolute top-0 right-0 w-[350px] h-[350px] bg-violet-600/10 rounded-full blur-[90px] -translate-y-1/3 translate-x-1/4 group-hover:bg-violet-500/20 transition-colors duration-700 pointer-events-none" />

            <div className="gsap-float absolute right-6 top-12 w-[88px] h-[88px] border border-violet-500/20 rounded-3xl rotate-12 flex items-center justify-center bg-violet-500/[0.05] backdrop-blur-md pointer-events-none group-hover:border-violet-500/40 group-hover:shadow-[0_0_40px_rgba(139,92,246,0.2)] transition-all duration-500">
              <QrCode className="w-10 h-10 text-violet-400/50 group-hover:text-violet-400 transition-colors" />
            </div>

            <div className="flex flex-col h-full justify-between relative z-10">
              <div className="w-14 h-14 bg-violet-500/10 rounded-2xl flex items-center justify-center border border-violet-500/20 shadow-[0_0_30px_rgba(139,92,246,0.1)] group-hover:scale-110 group-hover:border-violet-500/40 transition-all duration-500 backdrop-blur-md">
                <Activity className="w-7 h-7 text-violet-400" />
              </div>
              <div className="mt-16">
                <div className="flex items-center gap-4 mb-4">
                  <h3 className="font-black text-4xl sm:text-5xl text-white tracking-tighter leading-none">
                    Scan to
                    <br />
                    Claim
                  </h3>
                  <div className="w-12 h-12 rounded-full bg-violet-500/20 flex items-center justify-center opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 shrink-0 border border-violet-500/30">
                    <ArrowRight className="w-5 h-5 text-violet-400" />
                  </div>
                </div>
                <p className="text-slate-400 text-base max-w-xs leading-relaxed font-medium">
                  Sedang di lokasi? Pindai QR code dan klaim badge NFT
                  perjalanan kamu sekarang juga.
                </p>
              </div>
            </div>
          </Link>
        </section>
      </main>
    </div>
  );
}
