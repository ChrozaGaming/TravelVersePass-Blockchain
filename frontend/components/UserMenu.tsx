"use client";

import { useAuth } from "@/contexts/AuthContext";
import { shortAddress } from "@/lib/wallet";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import {
  ChevronDown,
  Copy,
  Check,
  LayoutDashboard,
  Trophy,
  CalendarDays,
  LogOut,
  Wallet,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const CHAIN_NAME = process.env.NEXT_PUBLIC_CHAIN_NAME || "Hardhat Localhost";

export default function UserMenu() {
  const { wallet, isLoggedIn, isLoading, logout } = useAuth();

  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const router = useRouter();

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);

      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    if (open) {
      document.addEventListener("keydown", handleEscape);

      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [open]);

  // GSAP animation
  useEffect(() => {
    if (!open || !dropdownRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".menu-dropdown",
        {
          opacity: 0,
          y: -12,
          scale: 0.96,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.45,
          ease: "expo.out",
        },
      );

      gsap.fromTo(
        ".menu-item",
        {
          opacity: 0,
          x: 12,
        },
        {
          opacity: 1,
          x: 0,
          duration: 0.5,
          stagger: 0.05,
          ease: "expo.out",
        },
      );
    }, dropdownRef);

    return () => ctx.revert();
  }, [open]);

  async function handleCopy() {
    if (!wallet) return;

    try {
      await navigator.clipboard.writeText(wallet);

      setCopied(true);

      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard not available */
    }
  }

  function handleLogout() {
    const confirmed = window.confirm(
      "Yakin logout? Kamu akan login ulang dengan sign message MetaMask.",
    );

    if (!confirmed) return;

    logout();
    setOpen(false);
    router.replace("/");
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-3 px-4 py-2 rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl">
        <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />

        <span className="text-sm text-slate-400">Connecting wallet...</span>
      </div>
    );
  }

  if (!isLoggedIn || !wallet) {
    return (
      <Link
        href="/login"
        className="group relative overflow-hidden h-12 px-5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black flex items-center justify-center gap-3 transition-all duration-300 shadow-[0_0_40px_rgba(245,158,11,0.25)]"
      >
        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />

        <span className="relative z-10 text-lg">🦊</span>

        <span className="relative z-10">Connect Wallet</span>
      </Link>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="group relative overflow-hidden flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 hover:bg-emerald-500/15 px-4 py-2.5 transition-all duration-300 backdrop-blur-xl"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-emerald-400" />
            </div>

            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#0a0b18]" />
          </div>

          <div className="text-left">
            <p className="text-[11px] uppercase tracking-widest text-emerald-400/70 font-bold">
              Connected
            </p>

            <p className="text-sm font-mono font-semibold text-white">
              {shortAddress(wallet)}
            </p>
          </div>
        </div>

        <ChevronDown
          className={`relative z-10 w-4 h-4 text-emerald-300 transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          ref={dropdownRef}
          role="menu"
          className="menu-dropdown absolute right-0 mt-4 w-[340px] rounded-[2rem] border border-white/[0.08] bg-[#0a0b18]/90 backdrop-blur-2xl shadow-[0_25px_100px_rgba(0,0,0,0.55)] overflow-hidden z-50"
        >
          {/* Glow */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 blur-3xl rounded-full" />
          </div>

          {/* Wallet Info */}
          <div className="relative z-10 p-6 border-b border-white/[0.06]">
            <div className="flex items-start justify-between gap-4 mb-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <Wallet className="w-7 h-7 text-emerald-400" />
                </div>

                <div>
                  <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-widest text-emerald-400 font-bold mb-1">
                    <ShieldCheck className="w-3 h-3" />
                    Wallet Verified
                  </div>

                  <p className="text-white font-bold text-lg">
                    {shortAddress(wallet)}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCopy}
                className="w-11 h-11 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] flex items-center justify-center transition-all"
                title="Copy address"
              >
                {copied ? (
                  <Check className="w-5 h-5 text-emerald-400" />
                ) : (
                  <Copy className="w-5 h-5 text-slate-400" />
                )}
              </button>
            </div>

            <div className="rounded-2xl border border-white/[0.06] bg-black/20 p-4">
              <p className="text-[11px] uppercase tracking-widest text-slate-500 mb-2">
                Wallet Address
              </p>

              <p
                className="font-mono text-xs text-slate-300 break-all leading-relaxed"
                title={wallet}
              >
                {wallet}
              </p>
            </div>

            <div className="mt-4 flex items-center justify-between gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.03] px-4 py-3">
              <div>
                <p className="text-[11px] uppercase tracking-widest text-slate-500 mb-1">
                  Network
                </p>

                <p className="text-sm font-semibold text-white">{CHAIN_NAME}</p>
              </div>

              <div className="inline-flex items-center gap-2 text-emerald-400 text-sm font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Active
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="relative z-10 p-3">
            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              className="menu-item flex items-center gap-4 px-4 py-4 rounded-2xl text-slate-300 hover:text-white hover:bg-white/[0.05] transition-all"
              role="menuitem"
            >
              <div className="w-12 h-12 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                <LayoutDashboard className="w-5 h-5 text-violet-400" />
              </div>

              <div>
                <p className="font-semibold">Dashboard</p>

                <p className="text-xs text-slate-500 mt-1">
                  View travel analytics
                </p>
              </div>
            </Link>

            <Link
              href="/badges"
              onClick={() => setOpen(false)}
              className="menu-item flex items-center gap-4 px-4 py-4 rounded-2xl text-slate-300 hover:text-white hover:bg-white/[0.05] transition-all"
              role="menuitem"
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-amber-400" />
              </div>

              <div>
                <p className="font-semibold">My Badges</p>

                <p className="text-xs text-slate-500 mt-1">
                  NFT collection & rewards
                </p>
              </div>
            </Link>

            <Link
              href="/timeline"
              onClick={() => setOpen(false)}
              className="menu-item flex items-center gap-4 px-4 py-4 rounded-2xl text-slate-300 hover:text-white hover:bg-white/[0.05] transition-all"
              role="menuitem"
            >
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                <CalendarDays className="w-5 h-5 text-cyan-400" />
              </div>

              <div>
                <p className="font-semibold">Timeline</p>

                <p className="text-xs text-slate-500 mt-1">
                  Explore travel history
                </p>
              </div>
            </Link>
          </nav>

          {/* Footer */}
          <div className="relative z-10 border-t border-white/[0.06] p-4">
            <div className="flex items-center justify-between gap-4 mb-4 rounded-2xl border border-white/[0.06] bg-white/[0.03] px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-emerald-400" />
                </div>

                <div>
                  <p className="text-sm font-semibold text-white">
                    TravelVerse ID
                  </p>

                  <p className="text-xs text-slate-500">Wallet authenticated</p>
                </div>
              </div>

              <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Verified
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="menu-item flex items-center justify-center gap-3 w-full h-14 rounded-2xl bg-rose-500/10 hover:bg-rose-500/15 border border-rose-500/20 text-rose-300 font-bold transition-all duration-300"
              role="menuitem"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
