"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
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

export default function TxDetailPage() {
  const params = useParams<{ hash: string }>();
  const hash = params?.hash;

  const [tx, setTx] = useState<TxDetail | null>(null);
  const [destination, setDestination] = useState<ExplorerDestination | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hash) return;
    getTxDetail(hash)
      .then(async (res) => {
        if (!res) {
          setError("Transaction not found");
          return;
        }
        setTx(res);

        // Cek apakah tx ini punya BadgeMinted event → enrich dengan destination
        const badgeLog = res.logs.find(
          (l) => l.eventName === "BadgeMinted"
        );
        if (badgeLog) {
          const destId = Number.parseInt(badgeLog.args.destinationId, 10);
          if (!Number.isNaN(destId)) {
            const dest = await getDestinationById(destId);
            setDestination(dest);
          }
        }
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load")
      )
      .finally(() => setLoading(false));
  }, [hash]);

  if (loading) {
    return (
      <div className="container-page">
        <p className="text-slate-500">Memuat transaksi...</p>
      </div>
    );
  }
  if (error || !tx) {
    return (
      <div className="container-page max-w-2xl">
        <div className="alert-error" role="alert">
          {error || "Transaction not found"}
        </div>
        <Link href="/explorer" className="text-blue-600 hover:underline mt-4 inline-block">
          ← Back to Explorer
        </Link>
      </div>
    );
  }

  const statusColor = {
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    failed: "bg-red-50 text-red-700 border-red-200",
    pending: "bg-amber-50 text-amber-700 border-amber-200",
  }[tx.status];

  return (
    <div className="container-page max-w-4xl">
      <div className="mb-4">
        <Link href="/explorer" className="text-sm text-blue-600 hover:underline">
          ← Back to Explorer
        </Link>
      </div>

      <h1 className="section-title break-all">Transaction</h1>
      <p className="font-mono text-xs sm:text-sm text-slate-600 break-all mb-6">
        {tx.hash}
      </p>

      {/* Destination Context — hanya muncul kalau tx ini check-in */}
      {destination && (
        <div className="card mb-4 border-emerald-200 bg-emerald-50">
          <div className="flex flex-col sm:flex-row gap-4">
            {destination.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={destination.image_url}
                alt={destination.name}
                className="w-full sm:w-32 h-32 object-cover rounded-md bg-emerald-100"
              />
            ) : (
              <div className="w-full sm:w-32 h-32 bg-gradient-to-br from-emerald-100 to-blue-100 rounded-md flex items-center justify-center text-4xl shrink-0">
                📍
              </div>
            )}
            <div className="flex-1">
              <div className="inline-block bg-emerald-600 text-white text-xs font-semibold px-2 py-1 rounded mb-2">
                🏅 Check-in Transaction
              </div>
              <h2 className="text-xl font-bold text-emerald-900 mb-1">
                {destination.name}
              </h2>
              <p className="text-sm text-emerald-800 mb-2">
                {destination.description}
              </p>
              <p className="text-xs text-emerald-700 mb-2">
                📍 {destination.location_lat}, {destination.location_lng}
              </p>
              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/explorer/destinations/${destination.id}`}
                  className="text-xs text-emerald-700 hover:underline font-medium"
                >
                  Lihat semua check-in di destinasi ini →
                </Link>
                <a
                  href={`https://www.google.com/maps?q=${destination.location_lat},${destination.location_lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-emerald-700 hover:underline font-medium"
                >
                  📍 Google Maps →
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="card mb-4">
        <h2 className="text-lg font-semibold text-slate-900 mb-3">Overview</h2>
        <DetailGrid>
          <DetailRow label="Status">
            <span className={`inline-block px-2 py-1 rounded text-xs font-semibold border ${statusColor}`}>
              {tx.status === "success" && "✓ Success"}
              {tx.status === "failed" && "✗ Failed"}
              {tx.status === "pending" && "⏳ Pending"}
            </span>
          </DetailRow>
          <DetailRow label="Block">
            <Link
              href={`/explorer/block/${tx.blockNumber}`}
              className="text-blue-600 hover:underline font-mono"
            >
              #{tx.blockNumber}
            </Link>
          </DetailRow>
          <DetailRow label="Timestamp">
            {tx.timestamp ? (
              <>
                <span>{formatTimestamp(tx.timestamp)}</span>{" "}
                <span className="text-xs text-slate-500">
                  ({relativeTime(tx.timestamp)})
                </span>
              </>
            ) : (
              "—"
            )}
          </DetailRow>
          <DetailRow label="Position in Block">
            <span className="font-mono">{tx.index}</span>
          </DetailRow>
          <DetailRow label="From">
            <AddressLink addr={tx.from} />
          </DetailRow>
          <DetailRow label="To">
            {tx.to ? (
              <AddressLink addr={tx.to} />
            ) : (
              <span className="text-slate-500 italic">Contract Creation</span>
            )}
          </DetailRow>
          <DetailRow label="Value">
            <span className="font-semibold">{tx.value}</span>{" "}
            <span className="text-slate-500">ETH</span>
            <p className="text-xs text-slate-500 font-mono break-all mt-1">
              {tx.valueWei.toString()} wei
            </p>
          </DetailRow>
        </DetailGrid>
      </div>

      <div className="card mb-4">
        <h2 className="text-lg font-semibold text-slate-900 mb-3">
          Gas &amp; Fee
        </h2>
        <DetailGrid>
          <DetailRow label="Gas Used">
            <span className="font-mono">{Number(tx.gasUsed).toLocaleString()}</span>
            {tx.gasLimit !== "0" && (
              <span className="text-xs text-slate-500 ml-2">
                / {Number(tx.gasLimit).toLocaleString()} limit (
                {((Number(tx.gasUsed) / Number(tx.gasLimit)) * 100).toFixed(2)}%)
              </span>
            )}
          </DetailRow>
          <DetailRow label="Gas Price">
            <span className="font-mono">
              {Number(tx.gasPrice).toFixed(4)} gwei
            </span>
          </DetailRow>
          <DetailRow label="Transaction Fee">
            <span className="font-mono font-semibold">{tx.fee} ETH</span>
          </DetailRow>
          {tx.maxFeePerGas && (
            <DetailRow label="Max Fee Per Gas">
              <span className="font-mono">
                {Number(tx.maxFeePerGas).toFixed(4)} gwei
              </span>
            </DetailRow>
          )}
          {tx.maxPriorityFeePerGas && (
            <DetailRow label="Max Priority Fee">
              <span className="font-mono">
                {Number(tx.maxPriorityFeePerGas).toFixed(4)} gwei
              </span>
            </DetailRow>
          )}
        </DetailGrid>
      </div>

      <div className="card mb-4">
        <h2 className="text-lg font-semibold text-slate-900 mb-3">Tx Metadata</h2>
        <DetailGrid>
          <DetailRow label="Tx Type">
            <span className="font-mono">
              {tx.type} ({txTypeLabel(tx.type)})
            </span>
          </DetailRow>
          <DetailRow label="Nonce">
            <span className="font-mono">{tx.nonce}</span>
          </DetailRow>
          <DetailRow label="Chain ID">
            <span className="font-mono">{tx.chainId}</span>
          </DetailRow>
          <DetailRow label="Block Hash">
            <span className="font-mono text-xs break-all">
              {tx.blockHash || "—"}
            </span>
          </DetailRow>
        </DetailGrid>
      </div>

      {/* Event Logs */}
      <div className="card mb-4">
        <h2 className="text-lg font-semibold text-slate-900 mb-3">
          Event Logs ({tx.logs.length})
        </h2>
        {tx.logs.length === 0 ? (
          <p className="text-sm text-slate-500">
            Tidak ada event yang di-decode. Mungkin event dari contract lain
            atau tx tidak emit event.
          </p>
        ) : (
          <ol className="space-y-3">
            {tx.logs.map((log, i) => (
              <li
                key={`${log.logIndex}-${i}`}
                className="border border-slate-200 rounded-md p-3 bg-slate-50"
              >
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-semibold rounded">
                    {log.contractName}
                  </span>
                  <span className="font-mono font-semibold text-slate-900">
                    {log.eventName}
                  </span>
                  <span className="text-xs text-slate-500">
                    #{log.logIndex}
                  </span>
                </div>
                <dl className="text-xs space-y-1 font-mono">
                  {Object.entries(log.args).map(([k, v]) => (
                    <div key={k} className="flex gap-2">
                      <dt className="text-slate-500 w-32 flex-shrink-0">{k}:</dt>
                      <dd className="break-all text-slate-900">{v}</dd>
                    </div>
                  ))}
                </dl>
              </li>
            ))}
          </ol>
        )}
      </div>

      {/* Input Data */}
      <details className="card">
        <summary className="cursor-pointer font-medium">
          Input Data (raw calldata)
        </summary>
        <pre className="mt-3 text-xs font-mono bg-slate-50 p-3 rounded break-all whitespace-pre-wrap">
          {tx.input}
        </pre>
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
  return <dl className="space-y-3">{children}</dl>;
}

function DetailRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-1 sm:gap-3 text-sm">
      <dt className="text-slate-500 font-medium">{label}</dt>
      <dd className="text-slate-900">{children}</dd>
    </div>
  );
}

function AddressLink({ addr }: { addr: string }) {
  const label = addressLabel(addr);
  return (
    <Link
      href={`/explorer/address/${addr}`}
      className="text-blue-600 hover:underline font-mono"
      title={addr}
    >
      {label ? (
        <>
          <span className="font-sans">{label}</span>{" "}
          <span className="text-xs text-slate-500">({shortAddr(addr)})</span>
        </>
      ) : (
        addr
      )}
    </Link>
  );
}
