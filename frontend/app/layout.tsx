import type { Metadata } from "next";
import { Outfit, Space_Grotesk } from "next/font/google";
import { AuthProvider } from "@/contexts/AuthContext";
import UserMenu from "@/components/UserMenu";
import Link from "next/link";
import {
  Globe2,
  Map,
  QrCode,
  LayoutDashboard,
  BadgeCheck,
  Clock,
  Search,
} from "lucide-react";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"], display: "swap" });
const space = Space_Grotesk({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "TravelVerse Pass",
  description: "NFT Tourist Pass Platform — Blockchain-Based Smart Tourism",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" className="scroll-smooth">
      <body
        className={`${outfit.className} bg-[#030308] text-slate-200 antialiased selection:bg-amber-500/30 selection:text-amber-100 min-h-screen flex flex-col relative`}
      >
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:80px_80px] [mask-image:radial-gradient(ellipse_100%_100%_at_50%_0%,#000_40%,transparent_100%)]" />
          <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-amber-500/10 blur-[150px] mix-blend-screen" />
          <div className="absolute top-[20%] right-[-20%] w-[60vw] h-[60vw] rounded-full bg-orange-600/10 blur-[150px] mix-blend-screen" />
        </div>

        <AuthProvider>
          <header className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-6xl px-4 sm:px-6 transition-all duration-300">
            <div className="bg-[#0a0b18]/80 backdrop-blur-2xl border border-white/[0.08] rounded-full shadow-2xl shadow-amber-900/10 px-6 h-16 flex items-center justify-between gap-4">
              <Link
                href="/"
                className="flex items-center gap-2.5 text-white shrink-0 group"
              >
                <Globe2 className="w-6 h-6 text-amber-500 group-hover:rotate-12 transition-transform duration-500" />
                <span
                  className={`hidden sm:inline ${space.className} font-bold text-xl tracking-tight`}
                >
                  TravelVerse{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
                    Pass
                  </span>
                </span>
              </Link>

              <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
                {[
                  { name: "Destinations", path: "/destinations" },
                  { name: "Scan QR", path: "/scan" },
                  { name: "Dashboard", path: "/dashboard" },
                ].map((item) => (
                  <Link
                    key={item.name}
                    href={item.path}
                    className="px-5 py-2 rounded-full text-sm font-medium text-slate-400 hover:text-amber-300 hover:bg-amber-500/10 transition-all duration-300"
                  >
                    {item.name}
                  </Link>
                ))}
                <div className="w-px h-4 bg-white/10 mx-2" />
                <Link
                  href="/explorer"
                  className="px-5 py-2 rounded-full text-sm font-medium text-slate-400 hover:text-orange-300 hover:bg-orange-500/10 transition-all duration-300 flex items-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  Explorer
                </Link>
              </nav>

              <div className="shrink-0 flex items-center">
                <UserMenu />
              </div>
            </div>
          </header>

          <main className="flex-1 w-full relative z-10 flex flex-col pt-32 pb-28 md:pb-10">
            {children}
          </main>

          <nav className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-md">
            <div className="bg-[#0a0b18]/90 backdrop-blur-2xl border border-white/[0.08] rounded-full shadow-2xl px-4 py-3 flex items-center justify-between gap-1 overflow-x-auto custom-scrollbar">
              {[
                { icon: Map, path: "/destinations" },
                { icon: QrCode, path: "/scan" },
                { icon: LayoutDashboard, path: "/dashboard" },
                { icon: BadgeCheck, path: "/badges" },
                { icon: Clock, path: "/timeline" },
                { icon: Search, path: "/explorer" },
              ].map((item, i) => (
                <Link
                  key={i}
                  href={item.path}
                  className="p-3.5 rounded-full text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 active:scale-95 transition-all duration-300 shrink-0"
                >
                  <item.icon className="w-5 h-5" />
                </Link>
              ))}
            </div>
          </nav>

          <footer className="border-t border-white/5 bg-[#030308]/80 backdrop-blur-md relative z-20 mt-auto hidden md:block">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-slate-500 text-sm font-medium">
                TravelVerse Pass — Kelompok 8 · TI A · Universitas Brawijaya
                2026
              </p>
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/[0.02] border border-white/[0.05] shadow-inner">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-slate-400 text-xs font-medium tracking-wide">
                  Powered by Polygon
                </span>
              </div>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
