import type { Metadata } from "next";
import { AuthProvider } from "@/contexts/AuthContext";
import UserMenu from "@/components/UserMenu";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "TravelVerse Pass",
  description: "NFT Tourist Pass Platform — Blockchain-Based Smart Tourism",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body>
        <AuthProvider>
          <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
              <Link
                href="/"
                className="flex items-center gap-2 text-blue-600 font-bold text-lg shrink-0"
              >
                <span aria-hidden>🌍</span>
                <span className="hidden sm:inline">TravelVerse Pass</span>
              </Link>
              <nav
                aria-label="Main navigation"
                className="hidden md:flex items-center gap-6 flex-1 justify-center"
              >
                <Link href="/destinations" className="nav-link">
                  Destinations
                </Link>
                <Link href="/scan" className="nav-link">
                  Scan QR
                </Link>
                <Link href="/dashboard" className="nav-link">
                  Dashboard
                </Link>
                <Link href="/explorer" className="nav-link">
                  🔍 Explorer
                </Link>
              </nav>
              <div className="shrink-0">
                <UserMenu />
              </div>
            </div>
            {/* Mobile nav */}
            <nav
              aria-label="Mobile navigation"
              className="md:hidden border-t border-slate-200 overflow-x-auto"
            >
              <div className="flex items-center gap-4 px-4 py-2 whitespace-nowrap">
                <Link href="/destinations" className="nav-link">
                  Destinations
                </Link>
                <Link href="/scan" className="nav-link">
                  Scan
                </Link>
                <Link href="/dashboard" className="nav-link">
                  Dashboard
                </Link>
                <Link href="/badges" className="nav-link">
                  Badges
                </Link>
                <Link href="/timeline" className="nav-link">
                  Timeline
                </Link>
                <Link href="/explorer" className="nav-link">
                  🔍 Explorer
                </Link>
              </div>
            </nav>
          </header>

          <main className="min-h-[calc(100vh-4rem)]">{children}</main>

          <footer className="border-t border-slate-200 bg-white">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 text-center text-sm text-slate-500">
              <p>
                TravelVerse Pass — Kelompok 8 · TI A · Universitas Brawijaya
                2026
              </p>
              <p className="mt-1">
                Tugas Akhir Mata Kuliah Blockchain · Powered by Polygon
              </p>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
