"use client";

import { useAuth } from "@/contexts/AuthContext";
import { shortAddress } from "@/lib/wallet";
import { useState } from "react";

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
      <div className="text-sm text-slate-500 text-center py-2">
        Memuat session...
      </div>
    );
  }

  if (isLoggedIn && wallet) {
    return (
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-md px-3 py-2 text-sm font-mono">
          🟢 {shortAddress(wallet)}
        </div>
        <button type="button" onClick={logout} className="btn-secondary text-sm">
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleLogin}
        className="btn-primary w-full"
      >
        🦊 Connect Wallet
      </button>
      {error && (
        <div className="alert-error mt-3" role="alert">
          {error}
        </div>
      )}
    </div>
  );
}
