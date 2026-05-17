"use client";

import { Scanner, type IDetectedBarcode } from "@yudiel/react-qr-scanner";
import { useState } from "react";

type Props = {
  onScan: (token: string) => void;
  paused?: boolean;
};

export default function QRScanner({ onScan, paused }: Readonly<Props>) {
  const [manualInput, setManualInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"camera" | "manual">("camera");

  function handleDetect(codes: IDetectedBarcode[]) {
    if (codes.length === 0) return;
    const value = codes[0]?.rawValue;
    if (value) onScan(value);
  }

  function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!manualInput.trim()) {
      setError("QR token kosong");
      return;
    }
    onScan(manualInput.trim());
  }

  return (
    <div>
      {/* Mode tabs */}
      <nav className="flex gap-2 mb-4 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setMode("camera")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            mode === "camera"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-600 hover:text-slate-900"
          }`}
        >
          📷 Kamera
        </button>
        <button
          type="button"
          onClick={() => setMode("manual")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            mode === "manual"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-600 hover:text-slate-900"
          }`}
        >
          ⌨️ Manual
        </button>
      </nav>

      {mode === "camera" && (
        <div>
          <div className="rounded-lg overflow-hidden border-2 border-slate-200 bg-black aspect-square max-w-md mx-auto">
            <Scanner
              onScan={handleDetect}
              paused={paused}
              constraints={{ facingMode: "environment" }}
            />
          </div>
          <p className="text-sm text-slate-600 text-center mt-3">
            Arahkan kamera ke QR code di lokasi wisata.
          </p>
        </div>
      )}

      {mode === "manual" && (
        <form onSubmit={handleManualSubmit} className="space-y-3">
          <div>
            <label
              htmlFor="qr-token"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              QR Token
            </label>
            <input
              id="qr-token"
              type="text"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              placeholder="1.1716482000.1716482900.abc..."
              className="input font-mono text-sm"
            />
            <p className="text-xs text-slate-500 mt-1">
              Paste token dari halaman QR display (mode debug)
            </p>
          </div>
          <button type="submit" className="btn-primary w-full">
            Submit Check-in
          </button>
          {error && (
            <div className="alert-error" role="alert">
              {error}
            </div>
          )}
        </form>
      )}
    </div>
  );
}
