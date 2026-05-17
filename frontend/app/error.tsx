"use client";

import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>) {
  useEffect(() => {
    console.error("[error boundary]", error);
  }, [error]);

  return (
    <div className="container-page max-w-md">
      <div className="card text-center">
        <div className="text-5xl mb-3">⚠️</div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Ada yang error
        </h1>
        <p className="text-sm text-slate-600 mb-4">
          {error.message || "Unknown error occurred"}
        </p>
        {error.digest && (
          <p className="text-xs text-slate-400 mb-4 font-mono">
            digest: {error.digest}
          </p>
        )}
        <div className="flex gap-2 justify-center">
          <button type="button" onClick={reset} className="btn-primary">
            Coba lagi
          </button>
          <a href="/" className="btn-secondary">
            Ke Home
          </a>
        </div>
      </div>
    </div>
  );
}
