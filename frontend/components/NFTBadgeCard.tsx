"use client";

import Link from "next/link";
import type { Badge } from "@/lib/types";
import {
  Calendar,
  Award,
  Sparkles,
  Gift,
  Fingerprint,
  ExternalLink,
  Map,
} from "lucide-react";
import React from "react";

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
    <article className="group relative flex flex-col h-full bg-[#0a0b18]/80 backdrop-blur-xl border border-white/[0.08] rounded-[2rem] overflow-hidden transition-all duration-500 hover:border-violet-500/40 hover:shadow-[0_0_30px_rgba(139,92,246,0.15)]">
      {/* Decorative Gradient Hover */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-500/[0.02] to-violet-500/[0.05] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* Image Area */}
      <div className="relative h-48 w-full bg-[#05050e] overflow-hidden">
        {badge.destination?.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={badge.destination.image_url}
            alt={badge.destination.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#0a0b18] to-[#160d27] flex items-center justify-center relative">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
            <Award className="w-16 h-16 text-violet-500/20" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0b18] via-[#0a0b18]/20 to-transparent" />

        {/* Token ID Badge */}
        <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 shadow-lg">
          <Fingerprint className="w-3.5 h-3.5 text-violet-400" />
          <span className="text-xs font-mono font-bold text-violet-300">
            #{badge.tokenId}
          </span>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-6 flex flex-col relative z-10">
        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-violet-400 transition-colors tracking-wide leading-tight">
          {badge.destination?.name ?? `Destination #${badge.tokenId}`}
        </h3>

        <div className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-5">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          {date}
        </div>

        {badge.levelAfter && (
          <div className="mb-5 inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 px-3 py-2 rounded-xl self-start">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
              Level Up: {badge.levelAfter}
            </span>
          </div>
        )}

        {/* Tx Hashes Terminal Style */}
        {(txBadge || txReward || txLevelUp) && (
          <div className="mt-auto pt-5 border-t border-white/[0.05] space-y-2.5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-3 bg-violet-500 rounded-full" />
              <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold font-mono">
                On-Chain Proof
              </p>
            </div>

            {txBadge && (
              <TxLink
                label="Badge Mint"
                hash={txBadge}
                icon={<Award className="w-3.5 h-3.5" />}
                colorClass="text-violet-400 bg-violet-500/10 border-violet-500/20"
              />
            )}
            {txReward && (
              <TxLink
                label="+10 TVT Reward"
                hash={txReward}
                icon={<Gift className="w-3.5 h-3.5" />}
                colorClass="text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
              />
            )}
            {txLevelUp && (
              <TxLink
                label="+200 TVT Bonus"
                hash={txLevelUp}
                icon={<Sparkles className="w-3.5 h-3.5" />}
                colorClass="text-amber-400 bg-amber-500/10 border-amber-500/20"
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
  icon,
  colorClass,
}: Readonly<{
  label: string;
  hash: string;
  icon: React.ReactNode;
  colorClass: string;
}>) {
  const explorer = process.env.NEXT_PUBLIC_BLOCK_EXPLORER;
  const href = explorer ? `${explorer}/tx/${hash}` : null;
  const short = `${hash.slice(0, 8)}…${hash.slice(-6)}`;

  const content = (
    <div className="flex items-center gap-3 group/tx">
      <div
        className={`w-7 h-7 rounded-lg flex items-center justify-center border shrink-0 ${colorClass}`}
      >
        {icon}
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide truncate">
          {label}
        </span>
        <span
          className={`font-mono text-xs truncate ${
            href
              ? "text-blue-400 group-hover/tx:text-blue-300 transition-colors group-hover/tx:underline"
              : "text-slate-500"
          }`}
        >
          {short}
        </span>
      </div>
      {href && (
        <ExternalLink className="w-3 h-3 text-slate-600 ml-auto opacity-0 group-hover/tx:opacity-100 transition-opacity" />
      )}
    </div>
  );

  if (!href) {
    return (
      <div
        className="block bg-[#05050e] p-2 rounded-xl border border-white/[0.02]"
        title={hash}
      >
        {content}
      </div>
    );
  }

  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-[#05050e] p-2 rounded-xl border border-white/[0.02] hover:border-white/[0.08] transition-colors"
      title={hash}
    >
      {content}
    </Link>
  );
}
