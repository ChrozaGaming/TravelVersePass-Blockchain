"use client";

import Link from "next/link";
import type { Badge } from "@/lib/types";

export default function NFTBadgeCard({ badge }: Readonly<{ badge: Badge }>) {
  const date = new Date(badge.mintedAt).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const txBadge = badge.txHashes?.badge;
  const txReward = badge.txHashes?.reward;
  const txLevelUp = badge.txHashes?.levelUp;

  return (
    <article className="card hover:shadow-md transition-shadow h-full flex flex-col">
      {badge.destination?.image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={badge.destination.image_url}
          alt={badge.destination.name}
          className="w-full h-40 object-cover rounded-md mb-3 bg-slate-100"
        />
      ) : (
        <div className="w-full h-40 bg-gradient-to-br from-blue-100 to-emerald-100 rounded-md mb-3 flex items-center justify-center text-5xl">
          🏅
        </div>
      )}
      <div className="flex-1 flex flex-col">
        <div className="flex items-start justify-between mb-2 gap-2">
          <h3 className="font-semibold text-slate-900">
            {badge.destination?.name ?? `Destination #${badge.tokenId}`}
          </h3>
          <span className="badge-tag bg-blue-100 text-blue-700 shrink-0">
            #{badge.tokenId}
          </span>
        </div>
        <p className="text-xs text-slate-500 mb-3">📅 {date}</p>

        {badge.levelAfter && (
          <div className="mb-3 inline-block self-start bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-800 text-xs font-semibold px-2 py-1 rounded">
            🌟 Level up: {badge.levelAfter}
          </div>
        )}

        {/* Tx Hashes */}
        {(txBadge || txReward || txLevelUp) && (
          <div className="mt-auto pt-3 border-t border-slate-200 space-y-1.5">
            <p className="text-[10px] uppercase tracking-wide text-slate-400 font-medium">
              On-chain proof
            </p>
            {txBadge && (
              <TxLink
                label="Badge Mint"
                hash={txBadge}
                emoji="🏅"
                color="text-purple-600"
              />
            )}
            {txReward && (
              <TxLink
                label="+10 TVT"
                hash={txReward}
                emoji="🎁"
                color="text-emerald-600"
              />
            )}
            {txLevelUp && (
              <TxLink
                label="+200 TVT Bonus"
                hash={txLevelUp}
                emoji="🌟"
                color="text-orange-600"
              />
            )}
          </div>
        )}
      </div>
    </article>
  );
}

function TxLink({
  label,
  hash,
  emoji,
  color,
}: Readonly<{
  label: string;
  hash: string;
  emoji: string;
  color: string;
}>) {
  const explorer = process.env.NEXT_PUBLIC_BLOCK_EXPLORER;
  const href = explorer ? `${explorer}/tx/${hash}` : null;
  const short = `${hash.slice(0, 8)}…${hash.slice(-6)}`;

  if (!href) {
    return (
      <div className="text-xs flex items-center gap-1.5">
        <span aria-hidden>{emoji}</span>
        <span className={`font-medium ${color}`}>{label}:</span>
        <span className="font-mono text-slate-500" title={hash}>
          {short}
        </span>
      </div>
    );
  }

  return (
    <Link
      href={href}
      className="text-xs flex items-center gap-1.5 hover:bg-slate-50 -mx-1 px-1 rounded transition-colors"
      title={hash}
    >
      <span aria-hidden>{emoji}</span>
      <span className={`font-medium ${color}`}>{label}:</span>
      <span className="font-mono text-blue-600 hover:underline truncate">
        {short}
      </span>
    </Link>
  );
}
