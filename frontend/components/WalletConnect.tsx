"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { shortAddress } from "@/lib/wallet";
import { Wallet, LogOut, Loader2, AlertCircle } from "lucide-react";

export default function WalletConnect() {
  const { wallet, isLoggedIn, isLoading, login, logout } = useAuth();
  const [error, setError] = useState<string | null>(null);

  async function handleLogin() {
    setError(null);
    try {
      await login();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-4 text-sm font-medium text-slate-400 bg-slate-900/30 rounded-2xl border border-slate-800/50">
        <Loader2 className="w-4 h-4 animate-spin text-cyan-500" />
        Memuat session...
      </div>
    );
  }

  if (isLoggedIn && wallet) {
    return (
      <div className="flex items-center justify-between gap-3 p-2 bg-slate-900/50 border border-slate-700/50 rounded-2xl backdrop-blur-sm">
        <div className="flex-1 flex items-center gap-3 px-4 py-2 bg-slate-800/50 rounded-xl border border-slate-700/50">
          <div className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
          </div>
          <span className="text-slate-200 font-mono text-sm font-medium tracking-wide">
            {shortAddress(wallet)}
          </span>
        </div>
        <button
          type="button"
          onClick={logout}
          className="p-3 text-slate-400 hover:text-rose-400 hover:bg-rose-400/10 rounded-xl transition-all duration-300 group"
          title="Disconnect Wallet"
        >
          <LogOut className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={handleLogin}
        className="flex items-center justify-center gap-2 w-full py-4 px-6 bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 text-white font-semibold rounded-2xl border border-slate-700 transition-all duration-300 shadow-lg active:scale-[0.98]"
      >
        <Wallet className="w-5 h-5 text-cyan-400" />
        Connect Wallet
      </button>

      {error && (
        <div className="mt-4 flex items-start gap-3 p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm animate-in fade-in slide-in-from-top-2 duration-300">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="leading-relaxed">{error}</p>
        </div>
      )}
    </div>
  );
}
