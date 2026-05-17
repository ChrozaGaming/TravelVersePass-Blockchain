"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  type BlockDetail,
  addressLabel,
  formatTimestamp,
  getBlockDetail,
  relativeTime,
  shortAddr,
  shortHash,
} from "@/lib/explorer";

export default function BlockDetailPage() {
  const params = useParams<{ number: string }>();
  const numStr = params?.number;

  const [block, setBlock] = useState<BlockDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        setError(err instanceof Error ? err.message : "Failed to load")
      )
      .finally(() => setLoading(false));
  }, [blockNumber]);

  if (loading) {
    return (
      <div className="container-page">
        <p className="text-slate-500">Memuat block...</p>
      </div>
    );
  }
  if (error || !block) {
    return (
      <div className="container-page max-w-2xl">
        <div className="alert-error" role="alert">
          {error || "Block not found"}
        </div>
        <Link href="/explorer" className="text-blue-600 hover:underline mt-4 inline-block">
          ← Back to Explorer
        </Link>
      </div>
    );
  }

  const gasUsagePct = block.gasLimit !== "0"
    ? (Number(block.gasUsed) / Number(block.gasLimit)) * 100
    : 0;

  return (
    <div className="container-page max-w-4xl">
      <div className="mb-4 flex items-center justify-between">
        <Link href="/explorer" className="text-sm text-blue-600 hover:underline">
          ← Back to Explorer
        </Link>
        <div className="flex gap-2">
          {block.number > 0 && (
            <Link
              href={`/explorer/block/${block.number - 1}`}
              className="text-sm text-blue-600 hover:underline"
            >
              ← Prev #{block.number - 1}
            </Link>
          )}
          <Link
            href={`/explorer/block/${block.number + 1}`}
            className="text-sm text-blue-600 hover:underline"
          >
            Next #{block.number + 1} →
          </Link>
        </div>
      </div>

      <h1 className="section-title">Block #{block.number}</h1>
      <p className="font-mono text-xs sm:text-sm text-slate-600 break-all mb-6">
        {block.hash}
      </p>

      <div className="card mb-4">
        <h2 className="text-lg font-semibold text-slate-900 mb-3">Overview</h2>
        <DetailGrid>
          <DetailRow label="Block Height">
            <span className="font-mono font-semibold">#{block.number}</span>
          </DetailRow>
          <DetailRow label="Timestamp">
            <span>{formatTimestamp(block.timestamp)}</span>{" "}
            <span className="text-xs text-slate-500">
              ({relativeTime(block.timestamp)})
            </span>
          </DetailRow>
          <DetailRow label="Transactions">
            <span className="font-semibold">{block.txCount}</span>
            {block.txCount > 0 && (
              <span className="text-xs text-slate-500 ml-1">
                tx{block.txCount > 1 ? "s" : ""} in this block
              </span>
            )}
          </DetailRow>
          <DetailRow label="Miner / Validator">
            <AddressLink addr={block.miner} />
          </DetailRow>
        </DetailGrid>
      </div>

      <div className="card mb-4">
        <h2 className="text-lg font-semibold text-slate-900 mb-3">
          Gas &amp; Fee
        </h2>
        <DetailGrid>
          <DetailRow label="Gas Used">
            <div>
              <span className="font-mono">
                {Number(block.gasUsed).toLocaleString()}
              </span>
              <span className="text-xs text-slate-500 ml-2">
                / {Number(block.gasLimit).toLocaleString()} ({gasUsagePct.toFixed(2)}%)
              </span>
              <div className="w-full bg-slate-200 rounded-full h-2 mt-1">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(gasUsagePct, 100)}%` }}
                />
              </div>
            </div>
          </DetailRow>
          <DetailRow label="Gas Limit">
            <span className="font-mono">
              {Number(block.gasLimit).toLocaleString()}
            </span>
          </DetailRow>
          {block.baseFeePerGas && (
            <DetailRow label="Base Fee / Gas">
              <span className="font-mono">
                {Number(block.baseFeePerGas).toFixed(4)} gwei
              </span>
            </DetailRow>
          )}
        </DetailGrid>
      </div>

      <div className="card mb-4">
        <h2 className="text-lg font-semibold text-slate-900 mb-3">
          Block Header
        </h2>
        <DetailGrid>
          <DetailRow label="Block Hash">
            <span className="font-mono text-xs break-all">{block.hash}</span>
          </DetailRow>
          <DetailRow label="Parent Hash">
            <Link
              href={`/explorer/block/${block.number - 1}`}
              className="text-blue-600 hover:underline font-mono text-xs break-all"
            >
              {block.parentHash}
            </Link>
          </DetailRow>
          <DetailRow label="Nonce">
            <span className="font-mono text-xs break-all">{block.nonce}</span>
          </DetailRow>
          <DetailRow label="Difficulty">
            <span className="font-mono">
              {Number(block.difficulty).toLocaleString()}
            </span>
            {block.difficulty === "0" && (
              <span className="text-xs text-slate-500 ml-2">
                (PoS / Hardhat — no PoW)
              </span>
            )}
          </DetailRow>
        </DetailGrid>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-slate-900 mb-3">
          Transactions in Block
        </h2>
        {block.txHashes.length === 0 ? (
          <p className="text-sm text-slate-500">Empty block (no transactions).</p>
        ) : (
          <ol className="space-y-2">
            {block.txHashes.map((hash, i) => (
              <li
                key={hash}
                className="flex items-center justify-between border-b border-slate-100 last:border-0 pb-2 last:pb-0"
              >
                <div>
                  <span className="text-xs text-slate-500 mr-2">#{i}</span>
                  <Link
                    href={`/explorer/tx/${hash}`}
                    className="font-mono text-sm text-blue-600 hover:underline"
                  >
                    {shortHash(hash)}
                  </Link>
                </div>
                <Link
                  href={`/explorer/tx/${hash}`}
                  className="text-xs text-blue-600 hover:underline"
                >
                  View →
                </Link>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
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
