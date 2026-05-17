"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
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

export default function AddressDetailPage() {
  const params = useParams<{ addr: string }>();
  const rawAddr = params?.addr;

  const [info, setInfo] = useState<AddressInfo | null>(null);
  const [transfers, setTransfers] = useState<TransferEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!rawAddr) return;
    if (!/^0x[a-fA-F0-9]{40}$/.test(rawAddr)) {
      setError("Invalid address format");
      setLoading(false);
      return;
    }
    Promise.all([
      getAddressInfo(rawAddr),
      getTransfersForAddress(rawAddr, 50),
    ])
      .then(([i, t]) => {
        setInfo(i);
        setTransfers(t);
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load")
      )
      .finally(() => setLoading(false));
  }, [rawAddr]);

  if (loading) {
    return (
      <div className="container-page">
        <p className="text-slate-500">Memuat address...</p>
      </div>
    );
  }
  if (error || !info) {
    return (
      <div className="container-page max-w-2xl">
        <div className="alert-error" role="alert">
          {error || "Address not found"}
        </div>
        <Link href="/explorer" className="text-blue-600 hover:underline mt-4 inline-block">
          ← Back to Explorer
        </Link>
      </div>
    );
  }

  return (
    <div className="container-page max-w-4xl">
      <div className="mb-4">
        <Link href="/explorer" className="text-sm text-blue-600 hover:underline">
          ← Back to Explorer
        </Link>
      </div>

      <h1 className="section-title">
        {info.isContract ? "📜 Contract" : "👤 Address"}
      </h1>
      {info.label && (
        <div className="inline-block bg-purple-100 text-purple-700 text-xs font-semibold px-2 py-1 rounded mb-2">
          {info.label}
        </div>
      )}
      <p className="font-mono text-xs sm:text-sm text-slate-600 break-all mb-6">
        {info.address}
      </p>

      {/* Balance Cards */}
      <div className="grid sm:grid-cols-3 gap-3 mb-6">
        <div className="card">
          <p className="text-xs text-slate-500 uppercase tracking-wide">
            ETH Balance
          </p>
          <p className="text-2xl font-bold text-slate-900 mt-1 font-mono">
            {Number(info.ethBalance).toLocaleString("id-ID", {
              maximumFractionDigits: 4,
            })}
          </p>
          <p className="text-xs text-slate-500 mt-1">native token</p>
        </div>
        <div className="card border-emerald-200 bg-emerald-50">
          <p className="text-xs text-emerald-700 uppercase tracking-wide">
            TVT Balance
          </p>
          <p className="text-2xl font-bold text-emerald-900 mt-1 font-mono">
            {Number(info.tvtBalance).toLocaleString("id-ID", {
              maximumFractionDigits: 4,
            })}
          </p>
          <p className="text-xs text-emerald-700 mt-1">reward token</p>
        </div>
        <div className="card">
          <p className="text-xs text-slate-500 uppercase tracking-wide">
            Tx Count (Nonce)
          </p>
          <p className="text-2xl font-bold text-slate-900 mt-1 font-mono">
            {info.txCount}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            txs sent from this address
          </p>
        </div>
      </div>

      {/* Address Metadata */}
      <div className="card mb-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-3">Metadata</h2>
        <dl className="space-y-3 text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-1 sm:gap-3">
            <dt className="text-slate-500 font-medium">Address Type</dt>
            <dd>
              {info.isContract ? (
                <span className="inline-block bg-purple-100 text-purple-700 text-xs font-semibold px-2 py-1 rounded">
                  Smart Contract
                </span>
              ) : (
                <span className="inline-block bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-1 rounded">
                  EOA (Externally Owned Account)
                </span>
              )}
            </dd>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-1 sm:gap-3">
            <dt className="text-slate-500 font-medium">Full Address</dt>
            <dd className="font-mono text-xs break-all">{info.address}</dd>
          </div>
          {info.label && (
            <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-1 sm:gap-3">
              <dt className="text-slate-500 font-medium">Known Label</dt>
              <dd>{info.label}</dd>
            </div>
          )}
        </dl>
      </div>

      {/* TVT Transfer History */}
      <div className="card">
        <h2 className="text-lg font-semibold text-slate-900 mb-3">
          TVT Transfer History ({transfers.length})
        </h2>
        {transfers.length === 0 ? (
          <p className="text-sm text-slate-500">
            Belum ada TVT transfer dari/ke address ini.
          </p>
        ) : (
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="text-left p-2 font-medium">Direction</th>
                  <th className="text-left p-2 font-medium">Tx</th>
                  <th className="text-left p-2 font-medium">Block</th>
                  <th className="text-left p-2 font-medium">Counterparty</th>
                  <th className="text-right p-2 font-medium">Amount</th>
                </tr>
              </thead>
              <tbody>
                {transfers.map((t) => {
                  const isOut =
                    t.from.toLowerCase() === info.address.toLowerCase();
                  const counterparty = isOut ? t.to : t.from;
                  return (
                    <tr
                      key={`${t.txHash}-${t.logIndex}`}
                      className="border-t border-slate-200"
                    >
                      <td className="p-2">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                            isOut
                              ? "bg-red-50 text-red-700"
                              : "bg-emerald-50 text-emerald-700"
                          }`}
                        >
                          {isOut ? "OUT ↗" : "IN ↙"}
                        </span>
                      </td>
                      <td className="p-2 font-mono">
                        <Link
                          href={`/explorer/tx/${t.txHash}`}
                          className="text-blue-600 hover:underline"
                        >
                          {shortHash(t.txHash)}
                        </Link>
                        <div className="text-xs text-slate-500">
                          {t.timestamp ? relativeTime(t.timestamp) : "—"}
                        </div>
                      </td>
                      <td className="p-2">
                        <Link
                          href={`/explorer/block/${t.blockNumber}`}
                          className="text-blue-600 hover:underline"
                        >
                          #{t.blockNumber}
                        </Link>
                      </td>
                      <td className="p-2 font-mono">
                        <Link
                          href={`/explorer/address/${counterparty}`}
                          className="text-blue-600 hover:underline"
                          title={counterparty}
                        >
                          {addressLabel(counterparty) ?? shortAddr(counterparty)}
                        </Link>
                      </td>
                      <td
                        className={`p-2 text-right font-mono font-semibold ${
                          isOut ? "text-red-700" : "text-emerald-700"
                        }`}
                      >
                        {isOut ? "-" : "+"}
                        {Number(formatTVT(t.value)).toLocaleString("id-ID", {
                          maximumFractionDigits: 4,
                        })}{" "}
                        TVT
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
