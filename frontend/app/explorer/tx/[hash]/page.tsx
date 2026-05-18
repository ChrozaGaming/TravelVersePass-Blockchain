"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import gsap from "gsap";
import {
  type ExplorerDestination,
  type TxDetail,
  addressLabel,
  formatTimestamp,
  getDestinationById,
  getTxDetail,
  relativeTime,
  shortAddr,
} from "@/lib/explorer";
import {
  ArrowLeft,
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  Box,
  Zap,
  Database,
  Terminal,
  MapPin,
  ExternalLink,
  Code2,
  Hash,
  Map,
  AlertCircle,
} from "lucide-react";

export default function TxDetailPage() {
  const params = useParams<{ hash: string }>();
  const hash = params?.hash;

  const [tx, setTx] = useState<TxDetail | null>(null);
  const [destination, setDestination] = useState<ExplorerDestination | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hash) return;
    getTxDetail(hash)
      .then(async (res) => {
        if (!res) {
          setError("Transaction not found");
          return;
        }
        setTx(res);

        const badgeLog = res.logs.find((l) => l.eventName === "BadgeMinted");
        if (badgeLog) {
          const destId = Number.parseInt(badgeLog.args.destinationId, 10);
          if (!Number.isNaN(destId)) {
            const dest = await getDestinationById(destId);
            setDestination(dest);
          }
        }
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load"),
      )
      .finally(() => setLoading(false));
  }, [hash]);

  useEffect(() => {
    if (!loading && tx && containerRef.current) {
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
  }, [loading, tx]);

  if (loading) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center gap-4 relative z-10">
        <div className="relative w-16 h-16 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-t-2 border-cyan-500 animate-spin" />
          <Hash className="w-6 h-6 text-cyan-500/40" />
        </div>
        <p className="text-slate-400 font-mono text-sm tracking-widest uppercase animate-pulse">
          Indexing Transaction...
        </p>
      </div>
    );
  }

  if (error || !tx) {
    return (
      <div className="w-full max-w-3xl mx-auto mt-20 relative z-10 px-4 sm:px-6">
        <div className="bg-rose-500/10 border border-rose-500/20 backdrop-blur-xl rounded-[2rem] p-8 flex flex-col items-center text-center">
          <AlertCircle className="w-12 h-12 text-rose-400 mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Query Failed</h2>
          <p className="text-slate-400 font-mono text-sm mb-6">
            {error || "Transaction not found on the ledger"}
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

  const statusStyle = {
    success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    failed: "bg-rose-500/10 text-rose-400 border-rose-500/30",
    pending: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  }[tx.status];

  const statusIcon = {
    success: <CheckCircle2 className="w-3.5 h-3.5" />,
    failed: <XCircle className="w-3.5 h-3.5" />,
    pending: <Clock className="w-3.5 h-3.5" />,
  }[tx.status];

  return (
    <div
      ref={containerRef}
      className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-32 relative z-10 font-sans"
    >
      {/* Background Glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[20%] left-0 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Navigation */}
      <div className="gsap-reveal opacity-0 translate-y-4 mb-8">
        <Link
          href="/explorer"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-cyan-400 transition-colors bg-white/[0.02] hover:bg-cyan-500/10 px-4 py-2 rounded-full border border-white/[0.05] hover:border-cyan-500/30"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Explorer
        </Link>
      </div>

      {/* Header */}
      <div className="gsap-reveal opacity-0 translate-y-4 mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono font-bold tracking-wide mb-4">
          <Hash className="w-3.5 h-3.5" />
          TRANSACTION DETAILS
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight mb-3 break-all leading-tight">
          {tx.hash}
        </h1>
      </div>

      {/* Destination Context (if check-in) */}
      {destination && (
        <div className="gsap-reveal opacity-0 translate-y-8 bg-gradient-to-r from-emerald-500/10 to-teal-500/5 backdrop-blur-xl border border-emerald-500/20 rounded-[2rem] p-5 mb-6 flex flex-col sm:flex-row gap-5 items-center relative overflow-hidden group">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all duration-500 pointer-events-none" />

          <div className="w-full sm:w-32 h-32 shrink-0 rounded-xl overflow-hidden bg-[#030308] border border-emerald-500/20 relative z-10">
            {destination.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={destination.image_url}
                alt={destination.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl bg-gradient-to-br from-[#0a0b18] to-emerald-900/20">
                <Map className="w-10 h-10 text-emerald-500/50" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0 w-full relative z-10">
            <div className="inline-flex items-center gap-1.5 bg-emerald-500 text-slate-950 text-[10px] font-black tracking-widest uppercase px-2.5 py-1 rounded-md mb-3">
              <CheckCircle2 className="w-3 h-3" /> Check-in Verified
            </div>
            <h2 className="text-2xl font-bold text-white mb-1 truncate">
              {destination.name}
            </h2>
            <p className="text-sm text-emerald-200/70 mb-4 line-clamp-1">
              {destination.description}
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href={`/explorer/destinations/${destination.id}`}
                className="text-xs font-mono text-emerald-400 hover:text-emerald-300 hover:underline flex items-center gap-1"
              >
                <Database className="w-3.5 h-3.5" /> View Analytics
              </Link>
              <a
                href={`https://www.google.com/maps?q=${destination.location_lat},${destination.location_lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-mono text-emerald-400 hover:text-emerald-300 hover:underline flex items-center gap-1"
              >
                <MapPin className="w-3.5 h-3.5" /> Google Maps
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Main Details Grid */}
      <div className="gsap-reveal opacity-0 translate-y-8 bg-[#0a0b18]/80 backdrop-blur-xl border border-white/[0.08] rounded-[2rem] p-6 sm:p-8 mb-6 shadow-xl">
        <h2 className="flex items-center gap-2 text-lg font-bold text-white mb-6">
          <Activity className="w-5 h-5 text-cyan-400" /> Overview
        </h2>
        <DetailGrid>
          <DetailRow label="Transaction Status">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border ${statusStyle}`}
            >
              {statusIcon} {tx.status}
            </span>
          </DetailRow>
          <DetailRow label="Block Number">
            <div className="flex items-center gap-2">
              <Link
                href={`/explorer/block/${tx.blockNumber}`}
                className="text-cyan-400 hover:underline font-mono flex items-center gap-1"
              >
                <Box className="w-3.5 h-3.5" /> {tx.blockNumber}
              </Link>
              <span className="text-[10px] bg-white/[0.05] border border-white/10 px-2 py-0.5 rounded text-slate-400">
                Idx: {tx.index}
              </span>
            </div>
          </DetailRow>
          <DetailRow label="Timestamp">
            {tx.timestamp ? (
              <div className="flex items-center gap-2">
                <span className="text-slate-200">
                  {formatTimestamp(tx.timestamp)}
                </span>
                <span className="text-[10px] font-mono text-slate-500 bg-white/[0.03] px-2 py-0.5 rounded">
                  {relativeTime(tx.timestamp)}
                </span>
              </div>
            ) : (
              "—"
            )}
          </DetailRow>
          <DetailRow label="From">
            <AddressLink addr={tx.from} />
          </DetailRow>
          <DetailRow label="Interacted To">
            {tx.to ? (
              <AddressLink addr={tx.to} />
            ) : (
              <span className="text-slate-500 italic bg-white/[0.03] px-2 py-1 rounded border border-white/[0.05] text-xs">
                Contract Creation
              </span>
            )}
          </DetailRow>
          <DetailRow label="Value Transferred">
            <div className="flex flex-col">
              <div>
                <span className="font-bold text-white">{tx.value}</span>{" "}
                <span className="text-slate-500 text-xs">ETH</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono mt-0.5">
                {tx.valueWei.toString()} wei
              </span>
            </div>
          </DetailRow>
        </DetailGrid>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Gas & Fee */}
        <div className="gsap-reveal opacity-0 translate-y-8 bg-[#0a0b18]/80 backdrop-blur-xl border border-white/[0.08] rounded-[2rem] p-6 sm:p-8 shadow-xl">
          <h2 className="flex items-center gap-2 text-lg font-bold text-white mb-6">
            <Zap className="w-5 h-5 text-amber-400" /> Gas & Fee
          </h2>
          <DetailGrid>
            <DetailRow label="Gas Used / Limit">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-slate-200">
                    {Number(tx.gasUsed).toLocaleString()}
                  </span>
                  <span className="text-slate-500 text-xs">
                    / {Number(tx.gasLimit).toLocaleString()}
                  </span>
                </div>
                {tx.gasLimit !== "0" && (
                  <div className="w-full bg-[#030308] h-1.5 rounded-full overflow-hidden mt-1 border border-white/[0.05]">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-orange-500"
                      style={{
                        width: `${
                          (Number(tx.gasUsed) / Number(tx.gasLimit)) * 100
                        }%`,
                      }}
                    />
                  </div>
                )}
              </div>
            </DetailRow>
            <DetailRow label="Gas Price">
              <span className="font-mono text-slate-300">
                {Number(tx.gasPrice).toFixed(4)}{" "}
                <span className="text-slate-500 text-[10px]">gwei</span>
              </span>
            </DetailRow>
            <DetailRow label="Tx Fee">
              <span className="font-mono font-bold text-amber-400">
                {tx.fee}{" "}
                <span className="text-amber-400/50 text-[10px]">ETH</span>
              </span>
            </DetailRow>
            {tx.maxFeePerGas && (
              <DetailRow label="Max Fee Per Gas">
                <span className="font-mono text-slate-400 text-xs">
                  {Number(tx.maxFeePerGas).toFixed(4)} gwei
                </span>
              </DetailRow>
            )}
            {tx.maxPriorityFeePerGas && (
              <DetailRow label="Max Priority">
                <span className="font-mono text-slate-400 text-xs">
                  {Number(tx.maxPriorityFeePerGas).toFixed(4)} gwei
                </span>
              </DetailRow>
            )}
          </DetailGrid>
        </div>

        {/* Metadata */}
        <div className="gsap-reveal opacity-0 translate-y-8 bg-[#0a0b18]/80 backdrop-blur-xl border border-white/[0.08] rounded-[2rem] p-6 sm:p-8 shadow-xl">
          <h2 className="flex items-center gap-2 text-lg font-bold text-white mb-6">
            <Database className="w-5 h-5 text-blue-400" /> Metadata
          </h2>
          <DetailGrid>
            <DetailRow label="Tx Type">
              <div className="flex flex-col gap-1">
                <span className="font-mono text-slate-200 text-xs bg-white/[0.03] border border-white/[0.05] px-2 py-1 rounded w-max">
                  Type {tx.type}
                </span>
                <span className="text-[10px] text-slate-500 uppercase tracking-widest">
                  {txTypeLabel(tx.type)}
                </span>
              </div>
            </DetailRow>
            <DetailRow label="Nonce">
              <span className="font-mono text-slate-300">{tx.nonce}</span>
            </DetailRow>
            <DetailRow label="Chain ID">
              <span className="font-mono text-slate-300">{tx.chainId}</span>
            </DetailRow>
            <DetailRow label="Block Hash">
              <span className="font-mono text-[10px] text-slate-500 break-all">
                {tx.blockHash || "—"}
              </span>
            </DetailRow>
          </DetailGrid>
        </div>
      </div>

      {/* Event Logs */}
      <div className="gsap-reveal opacity-0 translate-y-8 bg-[#0a0b18]/80 backdrop-blur-xl border border-white/[0.08] rounded-[2rem] p-6 sm:p-8 mb-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="flex items-center gap-2 text-lg font-bold text-white">
            <Terminal className="w-5 h-5 text-violet-400" /> Event Logs
          </h2>
          <span className="text-[10px] font-mono text-violet-400 bg-violet-500/10 border border-violet-500/20 px-3 py-1 rounded-full uppercase tracking-widest">
            {tx.logs.length} Emitted
          </span>
        </div>

        {tx.logs.length === 0 ? (
          <div className="bg-[#030308] border border-white/[0.05] rounded-xl p-8 text-center">
            <p className="text-sm font-mono text-slate-500">
              No decoded events found in this transaction.
            </p>
          </div>
        ) : (
          <ol className="space-y-4">
            {tx.logs.map((log, i) => (
              <li
                key={`${log.logIndex}-${i}`}
                className="bg-[#030308] border border-white/[0.05] rounded-xl p-4 sm:p-5 relative overflow-hidden group"
              >
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-violet-500/50" />
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className="font-mono text-xs font-bold text-violet-300 bg-violet-500/10 border border-violet-500/20 px-2 py-1 rounded">
                    {log.contractName}
                  </span>
                  <span className="font-mono font-bold text-white text-sm">
                    {log.eventName}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 ml-auto bg-white/[0.02] px-2 py-1 rounded">
                    Log Index #{log.logIndex}
                  </span>
                </div>
                <div className="bg-black/50 border border-white/[0.03] rounded-lg p-3 sm:p-4 overflow-x-auto">
                  <dl className="text-xs font-mono grid grid-cols-1 gap-y-2">
                    {Object.entries(log.args).map(([k, v]) => (
                      <div
                        key={k}
                        className="flex flex-col sm:flex-row sm:gap-4"
                      >
                        <dt className="text-slate-500 sm:w-32 shrink-0">
                          {k}:
                        </dt>
                        <dd className="text-slate-300 break-all">
                          {String(v)}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>

      {/* Input Data */}
      <details className="gsap-reveal opacity-0 translate-y-8 bg-[#0a0b18]/80 backdrop-blur-xl border border-white/[0.08] rounded-[2rem] overflow-hidden group transition-all duration-300 open:border-cyan-500/30">
        <summary className="cursor-pointer p-6 sm:p-8 flex items-center justify-between select-none bg-white/[0.01]">
          <div className="flex items-center gap-3">
            <Code2 className="w-5 h-5 text-slate-400 group-hover:text-cyan-400 transition-colors" />
            <span className="text-lg font-bold text-white">Input Data</span>
          </div>
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest bg-white/[0.05] px-2 py-1 rounded">
            Raw Calldata
          </span>
        </summary>
        <div className="p-6 sm:p-8 pt-0">
          <div className="bg-[#030308] border border-white/[0.05] rounded-xl p-4 sm:p-6 overflow-x-auto">
            <pre className="text-xs font-mono text-cyan-400/80 break-all whitespace-pre-wrap leading-relaxed">
              {tx.input}
            </pre>
          </div>
        </div>
      </details>
    </div>
  );
}

function txTypeLabel(t: number): string {
  switch (t) {
    case 0:
      return "Legacy";
    case 1:
      return "EIP-2930 (Access List)";
    case 2:
      return "EIP-1559 (Dynamic Fee)";
    case 3:
      return "EIP-4844 (Blob)";
    default:
      return "Unknown";
  }
}

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
    <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-2 sm:gap-4 py-4 items-center">
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
