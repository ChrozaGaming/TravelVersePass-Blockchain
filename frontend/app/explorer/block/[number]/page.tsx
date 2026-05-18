"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import gsap from "gsap";
import {
  type BlockDetail,
  addressLabel,
  formatTimestamp,
  getBlockDetail,
  relativeTime,
  shortAddr,
  shortHash,
} from "@/lib/explorer";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Box,
  Activity,
  Zap,
  Database,
  Terminal,
  AlertCircle,
  ArrowRight,
} from "lucide-react";

export default function BlockDetailPage() {
  const params = useParams<{ number: string }>();
  const numStr = params?.number;

  const [block, setBlock] = useState<BlockDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const blockNumber = numStr ? Number.parseInt(numStr, 10) : NaN;

  useEffect(() => {
    if (Number.isNaN(blockNumber)) {
      setError("Invalid block number");
      setLoading(false);
      return;
    }
    getBlockDetail(blockNumber)
      .then((res) => {
        if (!res) setError("Block not found");
        setBlock(res);
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load"),
      )
      .finally(() => setLoading(false));
  }, [blockNumber]);

  useEffect(() => {
    if (!loading && block && containerRef.current) {
      const ctx = gsap.context(() => {
        gsap.to(".gsap-reveal", {
          y: 0,
          opacity: 1,
          duration: 1,
          stagger: 0.1,
          ease: "power4.out",
        });
      }, containerRef);
      return () => ctx.revert();
    }
  }, [loading, block]);

  if (loading) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center gap-4 relative z-10">
        <div className="relative w-16 h-16 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-t-2 border-cyan-500 animate-spin" />
          <Box className="w-6 h-6 text-cyan-500/40" />
        </div>
        <p className="text-slate-400 font-mono text-sm tracking-widest uppercase animate-pulse">
          Indexing Block Data...
        </p>
      </div>
    );
  }

  if (error || !block) {
    return (
      <div className="w-full max-w-3xl mx-auto mt-20 relative z-10 px-4 sm:px-6">
        <div className="bg-rose-500/10 border border-rose-500/20 backdrop-blur-xl rounded-[2rem] p-8 flex flex-col items-center text-center">
          <AlertCircle className="w-12 h-12 text-rose-400 mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Query Failed</h2>
          <p className="text-slate-400 font-mono text-sm mb-6">
            {error || "Block not found on the ledger"}
          </p>
          <Link
            href="/explorer"
            className="px-6 py-3 bg-white/[0.05] hover:bg-white/[0.1] text-white rounded-xl border border-white/[0.1] transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Explorer
          </Link>
        </div>
      </div>
    );
  }

  const gasUsagePct =
    block.gasLimit !== "0"
      ? (Number(block.gasUsed) / Number(block.gasLimit)) * 100
      : 0;

  return (
    <div
      ref={containerRef}
      className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-32 relative z-10 font-sans"
    >
      {/* Background Glows */}
      <div className="absolute top-0 right-[10%] w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[20%] left-0 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Navigation & Pagination */}
      <div className="gsap-reveal opacity-0 translate-y-4 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Link
          href="/explorer"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-cyan-400 transition-colors bg-white/[0.02] hover:bg-cyan-500/10 px-4 py-2 rounded-full border border-white/[0.05] hover:border-cyan-500/30"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Explorer
        </Link>

        <div className="flex items-center gap-2 bg-[#0a0b18]/50 backdrop-blur-md p-1 rounded-full border border-white/[0.05]">
          {block.number > 0 ? (
            <Link
              href={`/explorer/block/${block.number - 1}`}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold text-slate-400 hover:text-cyan-400 hover:bg-white/[0.05] rounded-full transition-all"
            >
              <ChevronLeft className="w-4 h-4" /> #{block.number - 1}
            </Link>
          ) : (
            <div className="px-3 py-1.5 text-xs font-mono font-bold text-slate-600 cursor-not-allowed">
              <ChevronLeft className="w-4 h-4 inline" /> Genesis
            </div>
          )}
          <div className="w-px h-4 bg-white/10" />
          <Link
            href={`/explorer/block/${block.number + 1}`}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold text-slate-400 hover:text-cyan-400 hover:bg-white/[0.05] rounded-full transition-all"
          >
            #{block.number + 1} <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Header */}
      <div className="gsap-reveal opacity-0 translate-y-4 mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono font-bold tracking-wide mb-4">
          <Box className="w-3.5 h-3.5" />
          BLOCK INSPECTOR
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-3">
          Block{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
            #{block.number}
          </span>
        </h1>
        <p className="font-mono text-xs sm:text-sm text-slate-400 break-all">
          {block.hash}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Overview Panel */}
        <div className="gsap-reveal opacity-0 translate-y-8 lg:col-span-2 bg-[#0a0b18]/80 backdrop-blur-xl border border-white/[0.08] rounded-[2rem] p-6 sm:p-8 shadow-xl">
          <h2 className="flex items-center gap-2 text-lg font-bold text-white mb-6">
            <Activity className="w-5 h-5 text-cyan-400" /> Overview
          </h2>
          <DetailGrid>
            <DetailRow label="Block Height">
              <span className="font-mono text-cyan-400 font-bold bg-cyan-500/10 border border-cyan-500/20 px-2 py-1 rounded">
                #{block.number}
              </span>
            </DetailRow>
            <DetailRow label="Timestamp">
              <div className="flex items-center gap-2">
                <span className="text-slate-200">
                  {formatTimestamp(block.timestamp)}
                </span>
                <span className="text-[10px] font-mono text-slate-500 bg-white/[0.03] px-2 py-0.5 rounded border border-white/[0.05]">
                  {relativeTime(block.timestamp)}
                </span>
              </div>
            </DetailRow>
            <DetailRow label="Transactions">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-white">
                  {block.txCount}
                </span>
                {block.txCount > 0 && (
                  <span className="text-[10px] text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    tx{block.txCount > 1 ? "s" : ""} included
                  </span>
                )}
              </div>
            </DetailRow>
            <DetailRow label="Miner / Validator">
              <AddressLink addr={block.miner} />
            </DetailRow>
          </DetailGrid>
        </div>

        {/* Gas & Fee Panel */}
        <div className="gsap-reveal opacity-0 translate-y-8 lg:col-span-1 bg-[#0a0b18]/80 backdrop-blur-xl border border-white/[0.08] rounded-[2rem] p-6 sm:p-8 shadow-xl">
          <h2 className="flex items-center gap-2 text-lg font-bold text-white mb-6">
            <Zap className="w-5 h-5 text-amber-400" /> Gas & Fee
          </h2>
          <DetailGrid>
            <DetailRow label="Gas Used">
              <div className="flex flex-col gap-1.5 w-full">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-slate-200">
                    {Number(block.gasUsed).toLocaleString()}
                  </span>
                  <span className="text-amber-400 text-[10px] font-mono font-bold bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                    {gasUsagePct.toFixed(2)}%
                  </span>
                </div>
                <div className="w-full bg-[#030308] border border-white/[0.05] rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-amber-500 to-orange-500 h-full rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min(gasUsagePct, 100)}%` }}
                  />
                </div>
              </div>
            </DetailRow>
            <DetailRow label="Gas Limit">
              <span className="font-mono text-slate-400">
                {Number(block.gasLimit).toLocaleString()}
              </span>
            </DetailRow>
            {block.baseFeePerGas && (
              <DetailRow label="Base Fee / Gas">
                <span className="font-mono text-slate-300">
                  {Number(block.baseFeePerGas).toFixed(4)}{" "}
                  <span className="text-[10px] text-slate-500">gwei</span>
                </span>
              </DetailRow>
            )}
          </DetailGrid>
        </div>
      </div>

      {/* Block Header Panel */}
      <div className="gsap-reveal opacity-0 translate-y-8 bg-[#0a0b18]/80 backdrop-blur-xl border border-white/[0.08] rounded-[2rem] p-6 sm:p-8 mb-6 shadow-xl">
        <h2 className="flex items-center gap-2 text-lg font-bold text-white mb-6">
          <Database className="w-5 h-5 text-blue-400" /> Block Header
        </h2>
        <DetailGrid>
          <DetailRow label="Block Hash">
            <span className="font-mono text-[11px] sm:text-xs text-slate-300 break-all bg-[#030308] px-3 py-1.5 rounded-lg border border-white/[0.05]">
              {block.hash}
            </span>
          </DetailRow>
          <DetailRow label="Parent Hash">
            <Link
              href={`/explorer/block/${block.number - 1}`}
              className="font-mono text-[11px] sm:text-xs text-cyan-400 hover:text-cyan-300 hover:underline break-all bg-[#030308] px-3 py-1.5 rounded-lg border border-white/[0.05] inline-block"
            >
              {block.parentHash}
            </Link>
          </DetailRow>
          <DetailRow label="Nonce">
            <span className="font-mono text-xs text-slate-400 break-all">
              {block.nonce}
            </span>
          </DetailRow>
          <DetailRow label="Difficulty">
            <div className="flex items-center gap-2">
              <span className="font-mono text-slate-200">
                {Number(block.difficulty).toLocaleString()}
              </span>
              {block.difficulty === "0" && (
                <span className="text-[10px] text-slate-500 uppercase tracking-widest bg-white/[0.03] px-2 py-0.5 rounded border border-white/[0.05]">
                  PoS / Hardhat
                </span>
              )}
            </div>
          </DetailRow>
        </DetailGrid>
      </div>

      {/* Transactions in Block */}
      <div className="gsap-reveal opacity-0 translate-y-8 bg-[#0a0b18]/80 backdrop-blur-xl border border-white/[0.08] rounded-[2rem] p-6 sm:p-8 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="flex items-center gap-2 text-lg font-bold text-white">
            <Terminal className="w-5 h-5 text-violet-400" /> Included
            Transactions
          </h2>
          <span className="text-[10px] font-mono text-violet-400 bg-violet-500/10 border border-violet-500/20 px-3 py-1 rounded-full uppercase tracking-widest">
            {block.txHashes.length} TXs
          </span>
        </div>

        {block.txHashes.length === 0 ? (
          <div className="bg-[#030308] border border-white/[0.05] rounded-xl p-8 text-center">
            <p className="text-sm font-mono text-slate-500">
              Empty block (no transactions included).
            </p>
          </div>
        ) : (
          <div className="bg-[#030308] border border-white/[0.05] rounded-xl overflow-hidden">
            <ol className="divide-y divide-white/[0.05]">
              {block.txHashes.map((hash, i) => (
                <li
                  key={hash}
                  className="flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-mono font-bold text-slate-600 bg-white/[0.03] px-2 py-1 rounded">
                      IDX {i}
                    </span>
                    <Link
                      href={`/explorer/tx/${hash}`}
                      className="font-mono text-sm text-cyan-400 group-hover:text-cyan-300 transition-colors"
                    >
                      {shortHash(hash)}
                    </Link>
                  </div>
                  <Link
                    href={`/explorer/tx/${hash}`}
                    className="text-[10px] font-bold uppercase tracking-widest text-slate-500 group-hover:text-cyan-400 transition-colors"
                  >
                    View DetaiL{" "}
                    <ArrowRight className="w-3 h-3 inline-block -mt-0.5" />
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}

// Sub-components untuk menjaga konsistensi desain
function DetailGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col divide-y divide-white/[0.05] border-y border-white/[0.05]">
      {children}
    </div>
  );
}

function DetailRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-2 sm:gap-4 py-4 items-center">
      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
        {label}
      </div>
      <div className="text-sm">{children}</div>
    </div>
  );
}

function AddressLink({ addr }: { addr: string }) {
  const label = addressLabel(addr);
  return (
    <Link
      href={`/explorer/address/${addr}`}
      className="group flex items-center gap-2 w-max"
      title={addr}
    >
      {label ? (
        <>
          <span className="font-mono text-sm text-cyan-400 group-hover:text-cyan-300 transition-colors">
            {label}
          </span>
          <span className="text-[10px] font-mono text-slate-500 bg-white/[0.03] px-1.5 py-0.5 rounded border border-white/[0.05]">
            {shortAddr(addr)}
          </span>
        </>
      ) : (
        <span className="font-mono text-sm text-cyan-400 group-hover:text-cyan-300 transition-colors">
          {addr}
        </span>
      )}
    </Link>
  );
}
