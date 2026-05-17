"use client";

import AuthGuard from "@/components/AuthGuard";
import { mintPass } from "@/lib/contracts";
import { useRouter } from "next/navigation";
import { useState } from "react";

function MintPassInner() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ tokenId: number; txHash: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const result = await mintPass(username);
      setSuccess(result);
      setTimeout(() => router.replace("/dashboard"), 3000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Mint failed";
      if (msg.includes("already minted")) {
        setError("Kamu sudah punya Tourist Pass. Buka dashboard.");
      } else if (msg.includes("user rejected") || msg.includes("user denied")) {
        setError("Kamu batal sign transaction.");
      } else {
        setError(msg);
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="container-page max-w-md">
        <div className="card text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold text-emerald-700 mb-3">
            Tourist Pass berhasil di-mint!
          </h1>
          <div className="space-y-3 text-sm">
            <div className="bg-emerald-50 border border-emerald-200 rounded-md p-3">
              <p className="text-slate-700">Token ID:</p>
              <p className="text-2xl font-bold text-emerald-700">
                #{success.tokenId}
              </p>
            </div>
            <p className="text-slate-600">
              Tx hash:{" "}
              {process.env.NEXT_PUBLIC_BLOCK_EXPLORER ? (
                <a
                  href={`${process.env.NEXT_PUBLIC_BLOCK_EXPLORER}/tx/${success.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline break-all"
                >
                  {success.txHash.slice(0, 20)}...
                </a>
              ) : (
                <span className="font-mono break-all" title="No block explorer for Hardhat Local">
                  {success.txHash.slice(0, 14)}…{success.txHash.slice(-6)}
                </span>
              )}
            </p>
            <p className="text-slate-500 text-xs">
              Mengarahkan ke dashboard dalam 3 detik...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page max-w-md">
      <div className="card">
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">🪪</div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Mint Tourist Pass
          </h1>
          <p className="text-sm text-slate-600">
            Mint NFT Tourist Pass kamu (1x per wallet). Butuh sedikit ETH/MATIC
            untuk gas fee.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              maxLength={32}
              required
              placeholder="Hilmy"
              className="input"
            />
            <p className="text-xs text-slate-500 mt-1">
              Max 32 karakter, tampil di passport NFT.
            </p>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full"
          >
            {submitting ? "Minting..." : "Mint Pass"}
          </button>

          {error && (
            <div className="alert-error" role="alert">
              {error}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default function MintPassPage() {
  return (
    <AuthGuard>
      <MintPassInner />
    </AuthGuard>
  );
}
