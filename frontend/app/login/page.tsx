"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function LoginPage() {
  const { wallet, isLoggedIn, isLoading, login } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [signing, setSigning] = useState(false);

  useEffect(() => {
    if (!isLoading && isLoggedIn) {
      router.replace("/dashboard");
    }
  }, [isLoading, isLoggedIn, router]);

  async function handleLogin() {
    setError(null);
    setSigning(true);
    try {
      await login();
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setSigning(false);
    }
  }

  return (
    <div className="container-page max-w-md">
      <div className="card">
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">🦊</div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Login</h1>
          <p className="text-sm text-slate-600">
            Connect MetaMask untuk login. Kamu akan diminta sign message (gratis,
            tidak ada gas fee).
          </p>
        </div>

        <button
          type="button"
          onClick={handleLogin}
          disabled={signing}
          className="btn-primary w-full"
        >
          {signing ? "Menunggu signature..." : "Login dengan Wallet"}
        </button>

        {error && (
          <div className="alert-error mt-4" role="alert">
            <strong>Error:</strong> {error}
          </div>
        )}

        {wallet && (
          <p className="text-xs text-slate-500 mt-4 break-all">
            Wallet: {wallet}
          </p>
        )}
      </div>

      <details className="mt-6 card">
        <summary className="cursor-pointer font-medium text-slate-700">
          Butuh bantuan?
        </summary>
        <ol className="list-decimal list-inside mt-3 space-y-2 text-sm text-slate-600">
          <li>
            Install MetaMask:{" "}
            <a
              href="https://metamask.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              metamask.io
            </a>
          </li>
          <li>Tambah jaringan Hardhat Localhost (Chain ID 31337) atau Polygon Amoy (80002)</li>
          <li>
            Import test account jika di local network — lihat docs developer
          </li>
        </ol>
      </details>
    </div>
  );
}
