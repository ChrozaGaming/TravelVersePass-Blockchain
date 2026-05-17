"use client";

import { useAuth } from "@/contexts/AuthContext";
import { shortAddress } from "@/lib/wallet";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const CHAIN_NAME =
  process.env.NEXT_PUBLIC_CHAIN_NAME || "Hardhat Localhost";

export default function UserMenu() {
  const { wallet, isLoggedIn, isLoading, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
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
      return () => document.removeEventListener("mousedown", handleClickOutside);
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
      "Yakin logout? Kamu akan login ulang dengan sign message MetaMask."
    );
    if (!confirmed) return;
    logout();
    setOpen(false);
    router.replace("/");
  }

  if (isLoading) {
    return (
      <div className="text-xs text-slate-400 px-3 py-2">
        <span className="inline-block w-2 h-2 bg-slate-300 rounded-full animate-pulse mr-1.5" />
        Loading...
      </div>
    );
  }

  if (!isLoggedIn || !wallet) {
    return (
      <Link href="/login" className="btn-primary text-sm py-2 px-4">
        🦊 Login
      </Link>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 px-3 py-2 rounded-md text-sm font-mono transition-colors"
      >
        <span className="w-2 h-2 bg-emerald-500 rounded-full" />
        <span>{shortAddress(wallet)}</span>
        <svg
          className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-slate-200 z-50 overflow-hidden"
        >
          {/* Wallet info */}
          <div className="p-4 bg-gradient-to-br from-blue-50 to-emerald-50 border-b border-slate-200">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-500 uppercase tracking-wide font-semibold">
                Wallet
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                title="Copy address"
              >
                {copied ? "✅ Copied!" : "📋 Copy"}
              </button>
            </div>
            <p
              className="font-mono text-xs text-slate-700 break-all"
              title={wallet}
            >
              {wallet}
            </p>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-600">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
              <span>{CHAIN_NAME}</span>
            </div>
          </div>

          {/* Quick links */}
          <nav className="py-2" role="none">
            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
              role="menuitem"
            >
              <span>📊</span>
              <span>Dashboard</span>
            </Link>
            <Link
              href="/badges"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
              role="menuitem"
            >
              <span>🏅</span>
              <span>My Badges</span>
            </Link>
            <Link
              href="/timeline"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
              role="menuitem"
            >
              <span>📅</span>
              <span>Timeline</span>
            </Link>
          </nav>

          {/* Logout */}
          <div className="border-t border-slate-200 py-2">
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left transition-colors"
              role="menuitem"
            >
              <span>🚪</span>
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
