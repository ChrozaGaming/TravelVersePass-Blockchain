"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
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

  // Map destId → destination object untuk lookup cepat
  const destMap = useMemo(() => {
    return new Map(destinations.map((d) => [d.id, d]));
  }, [destinations]);

  // Map txHash → check-in info untuk enrich tabel Transfers
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
        "Format gak dikenali. Masukin block number, tx hash, atau address."
      );
  }

  let networkSection: React.ReactNode;
  if (error) {
    networkSection = (
      <div className="alert-error" role="alert">
        Error: {error}
      </div>
    );
  } else if (loading && !stats) {
    networkSection = <p className="text-slate-500">Memuat stats...</p>;
  } else if (stats) {
    networkSection = (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Chain ID" value={String(stats.chainId)} />
        <StatCard
          label="Latest Block"
          value={`#${stats.blockNumber}`}
          highlight
        />
        <StatCard
          label="Gas Price"
          value={`${Number(stats.gasPrice).toFixed(2)} gwei`}
        />
        <StatCard
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
    <div className="container-page max-w-6xl">
      <div className="mb-6">
        <h1 className="section-title">🔍 TravelVerse Block Explorer</h1>
        <p className="section-subtitle">
          Explorer publik untuk TVT token & seluruh aktivitas on-chain.
          Lihat semua check-in dari semua user, gak perlu login.
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-sm">
          <Link
            href="/explorer/destinations"
            className="inline-flex items-center gap-1 text-blue-600 hover:underline"
          >
            🗺️ Lihat per Destinasi →
          </Link>
        </div>
      </div>

      {/* Search bar */}
      <form onSubmit={handleSearch} className="card mb-6">
        <label
          htmlFor="search"
          className="block text-sm font-medium text-slate-700 mb-2"
        >
          Search blockchain
        </label>
        <div className="flex gap-2">
          <input
            id="search"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Block number / Tx hash (0x...) / Address (0x...)"
            className="input flex-1 font-mono text-sm"
          />
          <button type="submit" className="btn-primary">
            Search
          </button>
        </div>
        <p className="text-xs text-slate-500 mt-2">
          Block #: angka. Tx: 0x + 64 hex chars. Address: 0x + 40 hex chars.
        </p>
      </form>

      {/* Network Stats */}
      <section className="mb-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-3">
          Network Stats
        </h2>
        {networkSection}
      </section>

      {/* TVT Contract Info */}
      {TOKEN_ADDRESS && (
        <section className="mb-6">
          <div className="card">
            <h2 className="text-lg font-semibold text-slate-900 mb-2">
              TVT Token Contract
            </h2>
            <p className="text-sm text-slate-600 mb-2">
              <strong>Address:</strong>{" "}
              <Link
                href={`/explorer/address/${TOKEN_ADDRESS}`}
                className="text-blue-600 hover:underline font-mono"
              >
                {TOKEN_ADDRESS}
              </Link>
            </p>
            <p className="text-xs text-slate-500">
              ERC-20 loyalty token. 10 TVT per check-in · 200 TVT per level up
            </p>
          </div>
        </section>
      )}

      {/* Recent Transactions (semua tx network) */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-slate-900">
            ⚡ Recent Transactions (All Network)
          </h2>
          <span className="text-xs text-slate-500">
            {recentTxs.length} latest tx across all blocks
          </span>
        </div>
        <RecentTxTable
          txs={recentTxs}
          loading={loading}
          tvtTransfers={transfers}
        />
      </section>

      {/* Recent Check-ins (BadgeMinted events) */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-slate-900">
            🎒 Recent Check-ins (Public Feed)
          </h2>
          <Link
            href="/explorer/destinations"
            className="text-xs text-blue-600 hover:underline"
          >
            View all destinations →
          </Link>
        </div>

        <CheckinFeed
          checkins={checkins}
          destMap={destMap}
          loading={loading}
        />
      </section>

      {/* Recent Transfers */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-slate-900">
            Recent TVT Transfers
          </h2>
          <span className="text-xs text-slate-500">
            Auto-refresh tiap 10s · {transfers.length} latest
          </span>
        </div>

        <TransferTable
          transfers={transfers}
          loading={loading}
          checkinTxMap={checkinTxMap}
          destMap={destMap}
        />
      </section>
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
    return <p className="text-slate-500">Memuat check-ins...</p>;
  }
  if (checkins.length === 0) {
    return (
      <div className="card text-center">
        <p className="text-slate-500">
          Belum ada check-in di destinasi manapun. Mulai dari{" "}
          <Link href="/scan" className="text-blue-600 hover:underline">
            /scan
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-2 list-none">
      {checkins.map((c) => {
        const dest = destMap.get(c.destinationId);
        return (
          <li key={`${c.txHash}-${c.logIndex}`}>
            <article className="card flex flex-col sm:flex-row gap-3 hover:shadow-md transition-shadow">
              {dest?.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={dest.image_url}
                  alt={dest.name}
                  className="w-full sm:w-24 h-24 object-cover rounded-md bg-slate-100 shrink-0"
                />
              ) : (
                <div className="w-full sm:w-24 h-24 bg-gradient-to-br from-blue-100 to-emerald-100 rounded-md flex items-center justify-center text-3xl shrink-0">
                  📍
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h3 className="font-semibold text-slate-900">
                    {dest ? (
                      <Link
                        href={`/explorer/destinations/${c.destinationId}`}
                        className="hover:text-blue-600 hover:underline"
                      >
                        {dest.name}
                      </Link>
                    ) : (
                      <span className="text-slate-500 italic">
                        Destination #{c.destinationId}
                      </span>
                    )}
                  </h3>
                  <span className="badge-tag bg-purple-100 text-purple-700">
                    Badge #{c.tokenId}
                  </span>
                </div>
                {dest?.description && (
                  <p className="text-xs text-slate-500 line-clamp-1 mb-2">
                    {dest.description}
                  </p>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 text-xs">
                  <div>
                    <span className="text-slate-400">User:</span>{" "}
                    <Link
                      href={`/explorer/address/${c.user}`}
                      className="font-mono text-blue-600 hover:underline"
                      title={c.user}
                    >
                      {addressLabel(c.user) ?? shortAddr(c.user)}
                    </Link>
                  </div>
                  <div>
                    <span className="text-slate-400">Block:</span>{" "}
                    <Link
                      href={`/explorer/block/${c.blockNumber}`}
                      className="text-blue-600 hover:underline"
                    >
                      #{c.blockNumber}
                    </Link>
                  </div>
                  <div>
                    <span className="text-slate-400">Time:</span>{" "}
                    <span className="text-slate-600">
                      {c.timestamp ? relativeTime(c.timestamp) : "—"}
                    </span>
                  </div>
                </div>
                <div className="mt-2">
                  <Link
                    href={`/explorer/tx/${c.txHash}`}
                    className="text-xs font-mono text-blue-600 hover:underline"
                    title={c.txHash}
                  >
                    Tx: {shortHash(c.txHash)} →
                  </Link>
                </div>
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
    return <p className="text-slate-500">Memuat transfers...</p>;
  }
  if (transfers.length === 0) {
    return (
      <div className="card text-center">
        <p className="text-slate-500">
          Belum ada transfer TVT. Coba check-in dulu di /scan.
        </p>
      </div>
    );
  }

  return (
    <div className="card p-0 overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-slate-600">
          <tr>
            <th className="text-left p-3 font-medium">Tx Hash</th>
            <th className="text-left p-3 font-medium">Block</th>
            <th className="text-left p-3 font-medium">Time</th>
            <th className="text-left p-3 font-medium">From</th>
            <th className="text-left p-3 font-medium">To</th>
            <th className="text-left p-3 font-medium">Context</th>
            <th className="text-right p-3 font-medium">Value (TVT)</th>
          </tr>
        </thead>
        <tbody>
          {transfers.map((t) => {
            // Cek apakah tx ini adalah check-in tx (ada di check-in map)
            const checkin = checkinTxMap.get(t.txHash);
            const dest = checkin ? destMap.get(checkin.destinationId) : null;
            return (
              <tr
                key={`${t.txHash}-${t.logIndex}`}
                className="border-t border-slate-200 hover:bg-slate-50"
              >
                <td className="p-3 font-mono">
                  <Link
                    href={`/explorer/tx/${t.txHash}`}
                    className="text-blue-600 hover:underline"
                  >
                    {shortHash(t.txHash)}
                  </Link>
                </td>
                <td className="p-3">
                  <Link
                    href={`/explorer/block/${t.blockNumber}`}
                    className="text-blue-600 hover:underline"
                  >
                    #{t.blockNumber}
                  </Link>
                </td>
                <td className="p-3 text-slate-500 whitespace-nowrap">
                  {t.timestamp ? relativeTime(t.timestamp) : "—"}
                </td>
                <td className="p-3 font-mono">
                  <AddressLink addr={t.from} />
                </td>
                <td className="p-3 font-mono">
                  <AddressLink addr={t.to} />
                </td>
                <td className="p-3 text-xs">
                  {dest ? (
                    <Link
                      href={`/explorer/destinations/${checkin!.destinationId}`}
                      className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-1 rounded font-medium hover:bg-emerald-100"
                    >
                      🏅 Check-in: {dest.name}
                    </Link>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </td>
                <td className="p-3 text-right font-semibold text-emerald-700">
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
  );
}

// =====================================================================
// Small components
// =====================================================================

function StatCard({
  label,
  value,
  highlight,
}: Readonly<{
  label: string;
  value: string;
  highlight?: boolean;
}>) {
  return (
    <div className={`card ${highlight ? "border-blue-400 bg-blue-50" : ""}`}>
      <p className="text-xs text-slate-500 uppercase tracking-wide">{label}</p>
      <p className="text-lg font-bold text-slate-900 mt-1 font-mono">{value}</p>
    </div>
  );
}

function AddressLink({ addr }: Readonly<{ addr: string }>) {
  const label = addressLabel(addr);
  return (
    <Link
      href={`/explorer/address/${addr}`}
      className="text-blue-600 hover:underline"
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
  "Contract Creation": "bg-purple-100 text-purple-700",
  "Contract Call": "bg-blue-100 text-blue-700",
  "ETH Transfer": "bg-emerald-100 text-emerald-700",
  Empty: "bg-slate-100 text-slate-500",
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
  // Build map: txHash → total TVT yang dipindah dalam tx tsb.
  // Satu tx bisa punya multiple Transfer events, kita sum semuanya.
  const tvtByTx = useMemo(() => {
    const map = new Map<string, bigint>();
    for (const t of tvtTransfers) {
      map.set(t.txHash, (map.get(t.txHash) ?? 0n) + t.value);
    }
    return map;
  }, [tvtTransfers]);

  if (loading && txs.length === 0) {
    return <p className="text-slate-500">Memuat transactions...</p>;
  }
  if (txs.length === 0) {
    return (
      <div className="card text-center">
        <p className="text-slate-500">Belum ada transaksi di network.</p>
      </div>
    );
  }

  return (
    <div className="card p-0 overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-slate-600">
          <tr>
            <th className="text-left p-3 font-medium">Tx Hash</th>
            <th className="text-left p-3 font-medium">Block</th>
            <th className="text-left p-3 font-medium">Time</th>
            <th className="text-left p-3 font-medium">Type</th>
            <th className="text-left p-3 font-medium">From</th>
            <th className="text-left p-3 font-medium">To / Method</th>
            <th className="text-right p-3 font-medium">Value</th>
          </tr>
        </thead>
        <tbody>
          {txs.map((t) => {
            const tvtAmount = tvtByTx.get(t.hash);
            return (
              <tr
                key={t.hash}
                className="border-t border-slate-200 hover:bg-slate-50"
              >
                <td className="p-3 font-mono">
                  <Link
                    href={`/explorer/tx/${t.hash}`}
                    className="text-blue-600 hover:underline"
                  >
                    {shortHash(t.hash)}
                  </Link>
                </td>
                <td className="p-3">
                  <Link
                    href={`/explorer/block/${t.blockNumber}`}
                    className="text-blue-600 hover:underline"
                  >
                    #{t.blockNumber}
                  </Link>
                  <div className="text-xs text-slate-400">
                    idx {t.blockIndex}
                  </div>
                </td>
                <td className="p-3 text-slate-500 whitespace-nowrap text-xs">
                  {t.timestamp ? relativeTime(t.timestamp) : "—"}
                </td>
                <td className="p-3">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${TX_KIND_STYLE[t.kind]}`}
                  >
                    {t.kind}
                  </span>
                </td>
                <td className="p-3 font-mono text-xs">
                  <AddressLink addr={t.from} />
                  <div className="text-slate-400">nonce {t.nonce}</div>
                </td>
                <td className="p-3 text-xs">
                  {t.to ? (
                    <>
                      <AddressLink addr={t.to} />
                      {t.contractName && t.functionName && (
                        <div className="mt-1 inline-block bg-amber-50 text-amber-700 px-2 py-0.5 rounded font-mono">
                          {t.contractName}.{t.functionName}()
                        </div>
                      )}
                    </>
                  ) : (
                    <span className="italic text-purple-600">
                      Contract Creation
                    </span>
                  )}
                </td>
                <td className="p-3 text-right font-mono whitespace-nowrap">
                  <ValueCell ethWei={t.value} ethStr={t.valueEth} tvtWei={tvtAmount} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// Smart Value cell: TVT priority kalau ada, fallback ke ETH, fallback ke "—"
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
      <div>
        <span className="font-semibold text-emerald-700">
          {Number(formatTVT(tvtWei)).toLocaleString("id-ID", {
            maximumFractionDigits: 4,
          })}
        </span>{" "}
        <span className="text-xs text-emerald-600">TVT</span>
        {ethWei > 0n && (
          <div className="text-xs text-slate-400">
            + {Number(ethStr).toFixed(4)} ETH
          </div>
        )}
      </div>
    );
  }
  if (ethWei > 0n) {
    return (
      <div>
        <span className="font-semibold text-blue-700">
          {Number(ethStr).toLocaleString("id-ID", {
            maximumFractionDigits: 4,
          })}
        </span>{" "}
        <span className="text-xs text-blue-600">ETH</span>
      </div>
    );
  }
  return <span className="text-slate-300">—</span>;
}
