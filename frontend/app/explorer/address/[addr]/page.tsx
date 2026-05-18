"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import gsap from "gsap";
import {
  type AddressInfo,
  type TransferEvent,
  addressLabel,
  formatTVT,
  getAddressInfo,
  getTransfersForAddress,
  relativeTime,
  shortAddr,
  shortHash,
} from "@/lib/explorer";
import {
  ArrowLeft,
  Wallet,
  FileCode2,
  AlertCircle,
  Coins,
  Activity,
  Terminal,
  ArrowUpRight,
  ArrowDownRight,
  Hash,
  Search,
} from "lucide-react";

export default function AddressDetailPage() {
  const params = useParams<{ addr: string }>();
  const rawAddr = params?.addr;

  const [info, setInfo] = useState<AddressInfo | null>(null);
  const [transfers, setTransfers] = useState<TransferEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!rawAddr) return;
    if (!/^0x[a-fA-F0-9]{40}$/.test(rawAddr)) {
      setError("Invalid address format");
      setLoading(false);
      return;
    }
    Promise.all([getAddressInfo(rawAddr), getTransfersForAddress(rawAddr, 50)])
      .then(([i, t]) => {
        setInfo(i);
        setTransfers(t);
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load"),
      )
      .finally(() => setLoading(false));
  }, [rawAddr]);

  useEffect(() => {
    if (!loading && info && containerRef.current) {
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
  }, [loading, info]);

  if (loading) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center gap-4 relative z-10">
        <div className="relative w-16 h-16 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-t-2 border-cyan-500 animate-spin" />
          <Search className="w-6 h-6 text-cyan-500/40" />
        </div>
        <p className="text-slate-400 font-mono text-sm tracking-widest uppercase animate-pulse">
          Scanning Address...
        </p>
      </div>
    );
  }

  if (error || !info) {
    return (
      <div className="w-full max-w-3xl mx-auto mt-20 relative z-10 px-4 sm:px-6">
        <div className="bg-rose-500/10 border border-rose-500/20 backdrop-blur-xl rounded-[2rem] p-8 flex flex-col items-center text-center">
          <AlertCircle className="w-12 h-12 text-rose-400 mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Scan Failed</h2>
          <p className="text-slate-400 font-mono text-sm mb-6">
            {error || "Address not found"}
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

  return (
    <div
      ref={containerRef}
      className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-32 relative z-10 font-sans"
    >
      <div className="absolute top-[5%] right-[10%] w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[20%] left-[5%] w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="gsap-reveal opacity-0 translate-y-4 mb-8">
        <Link
          href="/explorer"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-cyan-400 transition-colors bg-white/[0.02] hover:bg-cyan-500/10 px-4 py-2 rounded-full border border-white/[0.05] hover:border-cyan-500/30"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Explorer
        </Link>
      </div>

      <div className="gsap-reveal opacity-0 translate-y-4 mb-10">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-mono font-bold tracking-wide ${
              info.isContract
                ? "bg-violet-500/10 border-violet-500/20 text-violet-400"
                : "bg-cyan-500/10 border-cyan-500/20 text-cyan-400"
            }`}
          >
            {info.isContract ? (
              <FileCode2 className="w-3.5 h-3.5" />
            ) : (
              <Wallet className="w-3.5 h-3.5" />
            )}
            {info.isContract ? "SMART CONTRACT" : "EOA WALLET"}
          </div>
          {info.label && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono font-bold tracking-wide">
              <Hash className="w-3.5 h-3.5" /> {info.label}
            </div>
          )}
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight mb-2 break-all leading-tight">
          {info.address}
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6">
        <div className="gsap-reveal opacity-0 translate-y-8 bg-[#0a0b18]/80 backdrop-blur-xl border border-white/[0.08] rounded-[2rem] p-6 shadow-xl relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-all" />
          <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1 relative z-10 flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-cyan-500" /> ETH Balance
          </p>
          <p className="text-3xl font-black text-white relative z-10 font-mono">
            {Number(info.ethBalance).toLocaleString("id-ID", {
              maximumFractionDigits: 4,
            })}
          </p>
          <p className="text-xs text-slate-500 mt-2 relative z-10 font-mono">
            Native Token
          </p>
        </div>

        <div className="gsap-reveal opacity-0 translate-y-8 bg-gradient-to-br from-[#061811] to-[#0a0b18] backdrop-blur-xl border border-emerald-500/20 rounded-[2rem] p-6 shadow-[0_0_30px_rgba(16,185,129,0.05)] relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all" />
          <p className="text-[10px] text-emerald-500/80 uppercase tracking-widest mb-1 relative z-10 flex items-center gap-2">
            <Coins className="w-3.5 h-3.5 text-emerald-400" /> TVT Balance
          </p>
          <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200 relative z-10 font-mono">
            {Number(info.tvtBalance).toLocaleString("id-ID", {
              maximumFractionDigits: 4,
            })}
          </p>
          <p className="text-xs text-emerald-500/50 mt-2 relative z-10 font-mono">
            Reward Token
          </p>
        </div>

        <div className="gsap-reveal opacity-0 translate-y-8 bg-[#0a0b18]/80 backdrop-blur-xl border border-white/[0.08] rounded-[2rem] p-6 shadow-xl relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all" />
          <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1 relative z-10 flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-amber-500" /> Tx Count
          </p>
          <p className="text-3xl font-black text-white relative z-10 font-mono">
            {info.txCount}
          </p>
          <p className="text-xs text-slate-500 mt-2 relative z-10 font-mono">
            Total Nonce
          </p>
        </div>
      </div>

      <div className="gsap-reveal opacity-0 translate-y-8 bg-[#0a0b18]/80 backdrop-blur-xl border border-white/[0.08] rounded-[2rem] p-6 sm:p-8 mb-6 shadow-xl">
        <h2 className="text-lg font-bold text-white mb-6">Address Metadata</h2>
        <div className="flex flex-col divide-y divide-white/[0.05] border-y border-white/[0.05]">
          <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-2 sm:gap-4 py-4 items-center">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Type
            </div>
            <div>
              {info.isContract ? (
                <span className="inline-block bg-violet-500/10 text-violet-400 border border-violet-500/20 text-[10px] font-bold px-2 py-1 rounded">
                  SMART CONTRACT
                </span>
              ) : (
                <span className="inline-block bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[10px] font-bold px-2 py-1 rounded">
                  EOA (Externally Owned Account)
                </span>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-2 sm:gap-4 py-4 items-center">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Full Address
            </div>
            <div className="font-mono text-xs text-slate-300 break-all bg-[#030308] px-3 py-2 rounded-lg border border-white/[0.05]">
              {info.address}
            </div>
          </div>
          {info.label && (
            <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-2 sm:gap-4 py-4 items-center">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Known Label
              </div>
              <div className="text-amber-400 font-mono text-sm font-bold">
                {info.label}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="gsap-reveal opacity-0 translate-y-8 bg-[#0a0b18]/80 backdrop-blur-xl border border-white/[0.08] rounded-[2rem] p-6 sm:p-8 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white">TVT Transfer History</h2>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full uppercase tracking-widest">
            {transfers.length} Transfers
          </span>
        </div>

        {transfers.length === 0 ? (
          <div className="bg-[#030308] border border-white/[0.05] rounded-xl p-8 text-center">
            <p className="text-sm font-mono text-slate-500">
              Belum ada TVT transfer dari/ke address ini.
            </p>
          </div>
        ) : (
          <div className="bg-[#030308] border border-white/[0.05] rounded-xl overflow-hidden overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-[#0a0b18] text-slate-500 font-mono">
                <tr>
                  <th className="p-4 font-bold tracking-widest uppercase text-[10px]">
                    Action
                  </th>
                  <th className="p-4 font-bold tracking-widest uppercase text-[10px]">
                    Tx Hash / Block
                  </th>
                  <th className="p-4 font-bold tracking-widest uppercase text-[10px]">
                    Counterparty
                  </th>
                  <th className="p-4 font-bold tracking-widest uppercase text-[10px] text-right">
                    Amount (TVT)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {transfers.map((t) => {
                  const isOut =
                    t.from.toLowerCase() === info.address.toLowerCase();
                  const counterparty = isOut ? t.to : t.from;
                  return (
                    <tr
                      key={`${t.txHash}-${t.logIndex}`}
                      className="hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border ${
                            isOut
                              ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                              : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          }`}
                        >
                          {isOut ? (
                            <>
                              <ArrowUpRight className="w-3 h-3" /> OUT
                            </>
                          ) : (
                            <>
                              <ArrowDownRight className="w-3 h-3" /> IN
                            </>
                          )}
                        </span>
                      </td>
                      <td className="p-4 font-mono">
                        <div className="flex flex-col gap-1">
                          <Link
                            href={`/explorer/tx/${t.txHash}`}
                            className="text-cyan-400 hover:text-cyan-300 hover:underline"
                          >
                            {shortHash(t.txHash)}
                          </Link>
                          <div className="flex items-center gap-2 text-[10px] text-slate-500">
                            <Link
                              href={`/explorer/block/${t.blockNumber}`}
                              className="hover:text-slate-300"
                            >
                              #{t.blockNumber}
                            </Link>
                            <span>
                              • {t.timestamp ? relativeTime(t.timestamp) : "—"}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-mono text-[11px]">
                        <Link
                          href={`/explorer/address/${counterparty}`}
                          className="text-cyan-400 hover:text-cyan-300 hover:underline flex items-center gap-2"
                          title={counterparty}
                        >
                          {addressLabel(counterparty) ??
                            shortAddr(counterparty)}
                        </Link>
                      </td>
                      <td
                        className={`p-4 text-right font-mono font-bold ${
                          isOut ? "text-rose-400" : "text-emerald-400"
                        }`}
                      >
                        {isOut ? "-" : "+"}
                        {Number(formatTVT(t.value)).toLocaleString("id-ID", {
                          maximumFractionDigits: 4,
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
