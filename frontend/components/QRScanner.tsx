"use client";

import { Scanner, type IDetectedBarcode } from "@yudiel/react-qr-scanner";
import { useState } from "react";
import {
  Camera,
  Keyboard,
  Terminal,
  ArrowRight,
  AlertCircle,
} from "lucide-react";

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
    <div className="w-full h-full flex flex-col relative z-20">
      {/* Floating Mode Tabs */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[90%] max-w-[240px] z-30">
        <div className="bg-[#030308]/80 backdrop-blur-md border border-white/[0.08] rounded-xl p-1 flex shadow-lg">
          <button
            type="button"
            onClick={() => setMode("camera")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all duration-300 ${
              mode === "camera"
                ? "bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-inner"
                : "text-slate-500 hover:text-slate-300 border border-transparent"
            }`}
          >
            <Camera className="w-3.5 h-3.5" /> Kamera
          </button>
          <button
            type="button"
            onClick={() => setMode("manual")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all duration-300 ${
              mode === "manual"
                ? "bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-inner"
                : "text-slate-500 hover:text-slate-300 border border-transparent"
            }`}
          >
            <Keyboard className="w-3.5 h-3.5" /> Manual
          </button>
        </div>
      </div>

      {mode === "camera" && (
        <div className="w-full h-full absolute inset-0 z-10 bg-black">
          {/* CSS selector untuk memaksa video memenuhi container tanpa merusak library */}
          <div className="w-full h-full [&>div]:!w-full [&>div]:!h-full [&_video]:!object-cover">
            <Scanner
              onScan={handleDetect}
              paused={paused}
              constraints={{ facingMode: "environment" }}
            />
          </div>
        </div>
      )}

      {mode === "manual" && (
        <div className="w-full h-full absolute inset-0 z-10 bg-[#030308] flex flex-col justify-center px-6 sm:px-10 pt-10">
          <form
            onSubmit={handleManualSubmit}
            className="space-y-4 w-full relative z-20"
          >
            <div>
              <label
                htmlFor="qr-token"
                className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-2"
              >
                <Terminal className="w-4 h-4 text-amber-500" />
                Input QR Token
              </label>
              <input
                id="qr-token"
                type="text"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                placeholder="1.1716482000.abc..."
                className="w-full bg-black/60 border border-white/[0.1] rounded-xl px-5 py-4 text-amber-400 placeholder:text-slate-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all shadow-inner font-mono text-sm"
              />
              <p className="text-[10px] text-slate-500 mt-2 font-medium text-center">
                Paste token dari layar operator (mode debug)
              </p>
            </div>

            <button
              type="submit"
              disabled={paused}
              className="group flex items-center justify-center gap-3 w-full py-3.5 px-6 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl transition-all duration-300 active:scale-[0.98] shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:shadow-[0_0_30px_rgba(245,158,11,0.4)] tracking-wider uppercase text-xs disabled:opacity-50"
            >
              Submit Check-in
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            {error && (
              <div className="flex items-start gap-2 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs animate-in fade-in slide-in-from-top-2 duration-300 backdrop-blur-md">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <p className="font-mono">{error}</p>
              </div>
            )}
          </form>
        </div>
      )}
    </div>
  );
}
