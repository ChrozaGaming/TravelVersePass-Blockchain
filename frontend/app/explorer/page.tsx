"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useRef } from "react";
import gsap from "gsap";
import {
  type CheckinEvent,
  type ExplorerDestination,
  type NetworkStats,
  type RecentTx,
  type TransferEvent,
  TOKEN_ADDRESS,
  addressLabel,
  classifySearch,
  formatTVT,
  getAllDestinations,
  getNetworkStats,
  getRecentCheckins,
  getRecentTransactions,
  getRecentTransfers,
  relativeTime,
  shortAddr,
  shortHash,
} from "@/lib/explorer";
import {
  Search,
  Globe2,
  Map as MapIcon,
  Activity,
  Box,
  Database,
  Cpu,
  Layers,
  ArrowRight,
  Terminal,
  MapPin,
  Award,
  Zap,
  ArrowLeftRight,
  AlertCircle,
} from "lucide-react";

export default function ExplorerHome() {
  const router = useRouter();
  const [stats, setStats] = useState<NetworkStats | null>(null);
  const [transfers, setTransfers] = useState<TransferEvent[]>([]);
  const [recentTxs, setRecentTxs] = useState<RecentTx[]>([]);
  const [checkins, setCheckins] = useState<CheckinEvent[]>([]);
  const [destinations, setDestinations] = useState<ExplorerDestination[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [s, t, rt, c, d] = await Promise.all([
          getNetworkStats(),
          getRecentTransfers(50),
          getRecentTransactions(30),
          getRecentCheckins(50),
          getAllDestinations(),
        ]);
        if (!cancelled) {
          setStats(s);
          setTransfers(t);
          setRecentTxs(rt);
          setCheckins(c);
          setDestinations(d);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    const interval = setInterval(load, 10_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (!loading && containerRef.current) {
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
  }, [loading, stats]);

  const destMap = useMemo(() => {
    return new Map(destinations.map((d) => [d.id, d]));
  }, [destinations]);

  const checkinTxMap = useMemo(() => {
    return new Map(checkins.map((c) => [c.txHash, c]));
  }, [checkins]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const result = classifySearch(search);
    if (result.kind === "tx") router.push(`/explorer/tx/${result.value}`);
    else if (result.kind === "block")
      router.push(`/explorer/block/${result.value}`);
    else if (result.kind === "address")
      router.push(`/explorer/address/${result.value}`);
    else
      alert(
        "Format gak dikenali. Masukin block number, tx hash, atau address.",
      );
  }

  let networkSection: React.ReactNode;
  if (error) {
    networkSection = (
      <div className="flex items-start gap-3 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm backdrop-blur-md">
        <AlertCircle className="w-5 h-5 shrink-0" />
        <p className="font-mono">Error: {error}</p>
      </div>
    );
  } else if (loading && !stats) {
    networkSection = (
      <div className="flex items-center gap-3 text-cyan-500/70 font-mono text-xs animate-pulse">
        <Activity className="w-4 h-4 animate-spin" /> Fetching network state...
      </div>
    );
  } else if (stats) {
    networkSection = (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          icon={<Database className="w-4 h-4" />}
          label="Chain ID"
          value={String(stats.chainId)}
        />
        <StatCard
          icon={<Box className="w-4 h-4" />}
          label="Latest Block"
          value={`#${stats.blockNumber}`}
          highlight
        />
        <StatCard
          icon={<Activity className="w-4 h-4" />}
          label="Gas Price"
          value={`${Number(stats.gasPrice).toFixed(2)} gwei`}
        />
        <StatCard
          icon={<Layers className="w-4 h-4" />}
          label={`${stats.tvtSymbol} Supply`}
          value={`${Number(stats.tvtSupply).toLocaleString("id-ID", {
            maximumFractionDigits: 2,
          })}`}
        />
      </div>
    );
  } else {
    networkSection = null;
  }

  return (
    <div
      ref={containerRef}
      className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-32 relative z-10 font-sans"
    >
      {/* Background Glow */}
      <div className="absolute top-[5%] left-[10%] w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute top-[40%] right-[5%] w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <div className="gsap-reveal opacity-0 translate-y-4 mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono font-bold tracking-wide mb-4">
            <Globe2 className="w-3.5 h-3.5" />
            BLOCK EXPLORER
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-3">
            TravelVerse Ledger
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl leading-relaxed">
            Explorer publik untuk TVT token & seluruh aktivitas on-chain. Pantau
            semua check-in secara real-time.
          </p>
        </div>
        <Link
          href="/explorer/destinations"
          className="group inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/[0.03] hover:bg-white/[0.08] text-white font-medium rounded-xl border border-white/[0.1] hover:border-cyan-500/30 transition-all"
        >
          <MapIcon className="w-4 h-4 text-cyan-400" />
          Analytics Destinasi
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Search Bar */}
      <form
        onSubmit={handleSearch}
        className="gsap-reveal opacity-0 translate-y-8 bg-[#0a0b18]/80 backdrop-blur-2xl border border-white/[0.08] rounded-[2rem] p-6 mb-10 shadow-xl relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/[0.02] to-transparent pointer-events-none" />
        <label
          htmlFor="search"
          className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 relative z-10"
        >
          <Search className="w-4 h-4 text-cyan-500" />
          Network Search
        </label>
        <div className="flex flex-col sm:flex-row gap-3 relative z-10">
          <input
            id="search"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Block number / Tx hash (0x...) / Address (0x...)"
            className="w-full flex-1 bg-[#030308] border border-white/[0.1] rounded-xl px-5 py-4 text-cyan-400 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all shadow-inner font-mono text-sm"
          />
          <button
            type="submit"
            className="shrink-0 px-8 py-4 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-black rounded-xl transition-all shadow-[0_0_20px_rgba(8,145,178,0.3)] hover:shadow-[0_0_30px_rgba(8,145,178,0.5)] tracking-wider"
          >
            SEARCH
          </button>
        </div>
        <p className="text-[10px] font-mono text-slate-500 mt-3 relative z-10">
          Format: Block # (angka) | Tx Hash (0x+64 hex) | Address (0x+40 hex)
        </p>
      </form>

      {/* Network Stats & Token Info */}
      <div className="gsap-reveal opacity-0 translate-y-8 grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
        <section className="lg:col-span-2">
          <h2 className="flex items-center gap-2 text-lg font-bold text-white mb-4">
            <Activity className="w-5 h-5 text-cyan-400" /> Network State
          </h2>
          {networkSection}
        </section>

        {TOKEN_ADDRESS && (
          <section className="lg:col-span-1">
            <h2 className="flex items-center gap-2 text-lg font-bold text-white mb-4">
              <Cpu className="w-5 h-5 text-cyan-400" /> TVT Contract
            </h2>
            <div className="bg-[#0a0b18]/80 backdrop-blur-2xl border border-white/[0.08] rounded-2xl p-6 h-[calc(100%-2.5rem)] flex flex-col justify-center">
              <div className="mb-3">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">
                  Address
                </span>
                <Link
                  href={`/explorer/address/${TOKEN_ADDRESS}`}
                  className="font-mono text-sm text-cyan-400 hover:text-cyan-300 hover:underline break-all"
                >
                  {TOKEN_ADDRESS}
                </Link>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-mono mt-auto pt-4 border-t border-white/[0.05]">
                ERC-20 loyalty token. <br />{" "}
                <span className="text-emerald-400">10 TVT</span>/check-in ·{" "}
                <span className="text-amber-400">200 TVT</span>/level up
              </p>
            </div>
          </section>
        )}
      </div>

      {/* Recent Check-ins (BadgeMinted events) */}
      <section className="gsap-reveal opacity-0 translate-y-8 mb-14">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <h2 className="flex items-center gap-2 text-xl font-bold text-white">
            <MapPin className="w-6 h-6 text-emerald-400" /> Public Check-in Feed
          </h2>
          <Link
            href="/explorer/destinations"
            className="text-xs font-mono text-cyan-400 hover:text-cyan-300 hover:underline"
          >
            View Destination Analytics →
          </Link>
        </div>
        <CheckinFeed checkins={checkins} destMap={destMap} loading={loading} />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Transactions (All) */}
        <section className="gsap-reveal opacity-0 translate-y-8">
          <div className="flex items-end justify-between mb-4">
            <h2 className="flex items-center gap-2 text-lg font-bold text-white">
              <Zap className="w-5 h-5 text-cyan-400" /> Network Txns
            </h2>
            <span className="text-[10px] font-mono text-slate-500 bg-white/[0.05] px-2 py-1 rounded">
              {recentTxs.length} LATEST
            </span>
          </div>
          <div className="bg-[#0a0b18]/80 backdrop-blur-2xl border border-white/[0.08] rounded-2xl overflow-hidden shadow-2xl">
            <RecentTxTable
              txs={recentTxs}
              loading={loading}
              tvtTransfers={transfers}
            />
          </div>
        </section>

        {/* Recent Transfers (TVT) */}
        <section className="gsap-reveal opacity-0 translate-y-8">
          <div className="flex items-end justify-between mb-4">
            <h2 className="flex items-center gap-2 text-lg font-bold text-white">
              <ArrowLeftRight className="w-5 h-5 text-emerald-400" /> TVT
              Transfers
            </h2>
            <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 bg-white/[0.05] px-2 py-1 rounded">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              AUTO 10s
            </div>
          </div>
          <div className="bg-[#0a0b18]/80 backdrop-blur-2xl border border-white/[0.08] rounded-2xl overflow-hidden shadow-2xl">
            <TransferTable
              transfers={transfers}
              loading={loading}
              checkinTxMap={checkinTxMap}
              destMap={destMap}
            />
          </div>
        </section>
      </div>
    </div>
  );
}

// =====================================================================
// Check-in Feed
// =====================================================================

function CheckinFeed({
  checkins,
  destMap,
  loading,
}: Readonly<{
  checkins: CheckinEvent[];
  destMap: Map<number, ExplorerDestination>;
  loading: boolean;
}>) {
  if (loading && checkins.length === 0) {
    return (
      <p className="text-slate-500 font-mono text-xs">Memuat log feed...</p>
    );
  }
  if (checkins.length === 0) {
    return (
      <div className="bg-[#0a0b18]/50 backdrop-blur-xl border border-white/[0.05] rounded-[2rem] p-12 text-center">
        <p className="text-slate-500 font-mono text-sm">
          Belum ada aktivitas.{" "}
          <Link href="/scan" className="text-cyan-400 hover:underline">
            Inisialisasi Check-in
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 list-none p-0">
      {checkins.slice(0, 8).map((c) => {
        // Limit for better UI fit
        const dest = destMap.get(c.destinationId);
        return (
          <li key={`${c.txHash}-${c.logIndex}`}>
            <article className="bg-[#0a0b18]/80 backdrop-blur-xl border border-white/[0.05] hover:border-emerald-500/30 rounded-2xl p-4 flex flex-col sm:flex-row gap-4 transition-all hover:shadow-[0_0_20px_rgba(16,185,129,0.1)] group">
              <div className="w-full sm:w-24 h-24 rounded-xl overflow-hidden bg-[#030308] border border-white/[0.05] shrink-0">
                {dest?.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={dest.image_url}
                    alt={dest.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#0a0b18] to-[#05050e]">
                    <MapPin className="w-8 h-8 text-white/10" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                  <h3 className="font-bold text-white text-sm truncate max-w-[150px]">
                    {dest ? (
                      <Link
                        href={`/explorer/destinations/${c.destinationId}`}
                        className="hover:text-emerald-400 transition-colors"
                      >
                        {dest.name}
                      </Link>
                    ) : (
                      <span className="text-slate-500 font-mono">
                        #{c.destinationId}
                      </span>
                    )}
                  </h3>
                  <span className="inline-flex items-center gap-1 bg-violet-500/10 border border-violet-500/20 text-violet-400 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md">
                    <Award className="w-3 h-3" /> #{c.tokenId}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-x-2 gap-y-1 mb-3">
                  <div className="text-[10px] font-mono">
                    <span className="text-slate-500">User:</span>{" "}
                    <Link
                      href={`/explorer/address/${c.user}`}
                      className="text-cyan-400 hover:underline"
                      title={c.user}
                    >
                      {addressLabel(c.user) ?? shortAddr(c.user)}
                    </Link>
                  </div>
                  <div className="text-[10px] font-mono">
                    <span className="text-slate-500">Block:</span>{" "}
                    <Link
                      href={`/explorer/block/${c.blockNumber}`}
                      className="text-cyan-400 hover:underline"
                    >
                      #{c.blockNumber}
                    </Link>
                  </div>
                  <div className="text-[10px] font-mono col-span-2">
                    <span className="text-slate-500">Time:</span>{" "}
                    <span className="text-slate-300">
                      {c.timestamp ? relativeTime(c.timestamp) : "—"}
                    </span>
                  </div>
                </div>

                <Link
                  href={`/explorer/tx/${c.txHash}`}
                  className="mt-auto flex items-center gap-1.5 text-[10px] font-mono text-slate-500 hover:text-cyan-400 transition-colors w-max"
                  title={c.txHash}
                >
                  <Terminal className="w-3 h-3" /> Tx: {shortHash(c.txHash)}
                </Link>
              </div>
            </article>
          </li>
        );
      })}
    </ul>
  );
}

// =====================================================================
// Transfer Table (TVT Transfer events)
// =====================================================================

function TransferTable({
  transfers,
  loading,
  checkinTxMap,
  destMap,
}: Readonly<{
  transfers: TransferEvent[];
  loading: boolean;
  checkinTxMap: Map<string, CheckinEvent>;
  destMap: Map<number, ExplorerDestination>;
}>) {
  if (loading && transfers.length === 0) {
    return (
      <div className="p-6 text-slate-500 font-mono text-xs">
        Loading streams...
      </div>
    );
  }
  if (transfers.length === 0) {
    return (
      <div className="p-6 text-slate-500 font-mono text-xs text-center">
        Belum ada transfer TVT.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs whitespace-nowrap">
        <thead className="bg-[#030308] text-slate-500 font-mono">
          <tr>
            <th className="p-4 font-bold tracking-widest uppercase text-[10px]">
              Tx Hash
            </th>
            <th className="p-4 font-bold tracking-widest uppercase text-[10px]">
              From / To
            </th>
            <th className="p-4 font-bold tracking-widest uppercase text-[10px]">
              Context
            </th>
            <th className="p-4 font-bold tracking-widest uppercase text-[10px] text-right">
              Value (TVT)
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.05]">
          {transfers.slice(0, 10).map((t) => {
            const checkin = checkinTxMap.get(t.txHash);
            const dest = checkin ? destMap.get(checkin.destinationId) : null;
            return (
              <tr
                key={`${t.txHash}-${t.logIndex}`}
                className="hover:bg-white/[0.02] transition-colors"
              >
                <td className="p-4">
                  <div className="flex flex-col gap-1 font-mono">
                    <Link
                      href={`/explorer/tx/${t.txHash}`}
                      className="text-cyan-400 hover:underline"
                    >
                      {shortHash(t.txHash)}
                    </Link>
                    <span className="text-[9px] text-slate-500">
                      {t.timestamp ? relativeTime(t.timestamp) : "—"}
                    </span>
                  </div>
                </td>
                <td className="p-4 font-mono text-[11px]">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-600">F:</span>{" "}
                      <AddressLink addr={t.from} />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-600">T:</span>{" "}
                      <AddressLink addr={t.to} />
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  {dest ? (
                    <Link
                      href={`/explorer/destinations/${checkin!.destinationId}`}
                      className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
                    >
                      <MapPin className="w-3 h-3" /> {dest.name.slice(0, 15)}...
                    </Link>
                  ) : (
                    <span className="text-slate-600 font-mono">—</span>
                  )}
                </td>
                <td className="p-4 text-right font-mono font-bold text-emerald-400">
                  +
                  {Number(formatTVT(t.value)).toLocaleString("id-ID", {
                    maximumFractionDigits: 2,
                  })}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// =====================================================================
// Small components
// =====================================================================

function StatCard({
  label,
  value,
  highlight,
  icon,
}: Readonly<{
  label: string;
  value: string;
  highlight?: boolean;
  icon: React.ReactNode;
}>) {
  return (
    <div
      className={`bg-[#0a0b18]/80 backdrop-blur-xl border p-5 rounded-2xl relative overflow-hidden ${
        highlight
          ? "border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.15)]"
          : "border-white/[0.05]"
      }`}
    >
      {highlight && (
        <div className="absolute top-0 right-0 w-20 h-20 bg-cyan-500/10 rounded-full blur-xl" />
      )}
      <p className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 relative z-10">
        <span className={highlight ? "text-cyan-400" : "text-slate-400"}>
          {icon}
        </span>{" "}
        {label}
      </p>
      <p
        className={`text-xl sm:text-2xl font-black font-mono relative z-10 truncate ${
          highlight
            ? "text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]"
            : "text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function AddressLink({ addr }: Readonly<{ addr: string }>) {
  const label = addressLabel(addr);
  return (
    <Link
      href={`/explorer/address/${addr}`}
      className="text-cyan-400 hover:text-cyan-300 hover:underline transition-colors"
      title={addr}
    >
      {label ?? shortAddr(addr)}
    </Link>
  );
}

// =====================================================================
// Recent Transactions Table (all network txs, not just TVT)
// =====================================================================

const TX_KIND_STYLE: Record<RecentTx["kind"], string> = {
  "Contract Creation": "bg-violet-500/10 text-violet-400 border-violet-500/20",
  "Contract Call": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "ETH Transfer": "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  Empty: "bg-slate-500/10 text-slate-400 border-slate-500/20",
};

function RecentTxTable({
  txs,
  loading,
  tvtTransfers,
}: Readonly<{
  txs: RecentTx[];
  loading: boolean;
  tvtTransfers: TransferEvent[];
}>) {
  const tvtByTx = useMemo(() => {
    const map = new Map<string, bigint>();
    for (const t of tvtTransfers) {
      map.set(t.txHash, (map.get(t.txHash) ?? 0n) + t.value);
    }
    return map;
  }, [tvtTransfers]);

  if (loading && txs.length === 0) {
    return (
      <div className="p-6 text-slate-500 font-mono text-xs">
        Loading mempool...
      </div>
    );
  }
  if (txs.length === 0) {
    return (
      <div className="p-6 text-slate-500 font-mono text-xs text-center">
        Belum ada transaksi di network.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs whitespace-nowrap">
        <thead className="bg-[#030308] text-slate-500 font-mono">
          <tr>
            <th className="p-4 font-bold tracking-widest uppercase text-[10px]">
              Tx Hash / Block
            </th>
            <th className="p-4 font-bold tracking-widest uppercase text-[10px]">
              Type
            </th>
            <th className="p-4 font-bold tracking-widest uppercase text-[10px]">
              From / To
            </th>
            <th className="p-4 font-bold tracking-widest uppercase text-[10px] text-right">
              Value Flow
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.05]">
          {txs.slice(0, 10).map((t) => {
            const tvtAmount = tvtByTx.get(t.hash);
            return (
              <tr
                key={t.hash}
                className="hover:bg-white/[0.02] transition-colors"
              >
                <td className="p-4">
                  <div className="flex flex-col gap-1 font-mono">
                    <Link
                      href={`/explorer/tx/${t.hash}`}
                      className="text-cyan-400 hover:underline"
                    >
                      {shortHash(t.hash)}
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
                <td className="p-4">
                  <span
                    className={`inline-flex items-center justify-center px-2 py-1 border rounded text-[9px] uppercase font-bold tracking-wider ${
                      TX_KIND_STYLE[t.kind]
                    }`}
                  >
                    {t.kind}
                  </span>
                </td>
                <td className="p-4 font-mono text-[11px]">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-600">F:</span>
                      <AddressLink addr={t.from} />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-600">T:</span>
                      {t.to ? (
                        <div className="flex items-center gap-2">
                          <AddressLink addr={t.to} />
                          {t.contractName && t.functionName && (
                            <span className="text-[9px] bg-white/[0.05] border border-white/10 px-1.5 py-0.5 rounded text-slate-300">
                              {t.functionName}()
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="italic text-violet-400/80">
                          Contract Creation
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="p-4 text-right font-mono">
                  <ValueCell
                    ethWei={t.value}
                    ethStr={t.valueEth}
                    tvtWei={tvtAmount}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function ValueCell({
  ethWei,
  ethStr,
  tvtWei,
}: Readonly<{
  ethWei: bigint;
  ethStr: string;
  tvtWei: bigint | undefined;
}>) {
  if (tvtWei && tvtWei > 0n) {
    return (
      <div className="flex flex-col items-end gap-1">
        <div className="bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md inline-flex items-center gap-1.5">
          <span className="font-bold text-emerald-400">
            {Number(formatTVT(tvtWei)).toLocaleString("id-ID", {
              maximumFractionDigits: 2,
            })}
          </span>
          <span className="text-[9px] text-emerald-500/80">TVT</span>
        </div>
        {ethWei > 0n && (
          <div className="text-[10px] text-cyan-400/60">
            + {Number(ethStr).toFixed(4)} ETH
          </div>
        )}
      </div>
    );
  }
  if (ethWei > 0n) {
    return (
      <div className="inline-flex items-center gap-1.5">
        <span className="font-bold text-cyan-400">
          {Number(ethStr).toLocaleString("id-ID", { maximumFractionDigits: 4 })}
        </span>
        <span className="text-[9px] text-cyan-600">ETH</span>
      </div>
    );
  }
  return <span className="text-slate-600 text-xs">—</span>;
}
