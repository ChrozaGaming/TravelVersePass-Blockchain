"use client";

import type { PassData } from "@/lib/types";
import { Target, Trophy, Sparkles } from "lucide-react";

const TIERS = [
  {
    name: "Beginner",
    min: 0,
    max: 5,
    emoji: "🥉",
    color:
      "from-slate-300 to-slate-500 shadow-[0_0_15px_rgba(148,163,184,0.4)]",
  },
  {
    name: "Explorer",
    min: 6,
    max: 20,
    emoji: "🥈",
    color: "from-cyan-300 to-blue-500 shadow-[0_0_15px_rgba(6,182,212,0.4)]",
  },
  {
    name: "Adventurer",
    min: 21,
    max: 50,
    emoji: "🥇",
    color:
      "from-amber-300 to-orange-500 shadow-[0_0_15px_rgba(245,158,11,0.4)]",
  },
  {
    name: "Legendary Traveler",
    min: 50,
    max: Infinity,
    emoji: "👑",
    color:
      "from-violet-400 to-fuchsia-500 shadow-[0_0_15px_rgba(168,85,247,0.4)]",
  },
] as const;

function getCurrentTier(visitedCount: number) {
  for (let i = TIERS.length - 1; i >= 0; i--) {
    if (visitedCount >= TIERS[i].min) return TIERS[i];
  }
  return TIERS[0];
}

export default function LevelProgress({ pass }: Readonly<{ pass: PassData }>) {
  const next = TIERS.find((t) => t.min > pass.visitedCount);
  const remaining = next ? next.min - pass.visitedCount : 0;
  const currentTier = getCurrentTier(pass.visitedCount);

  let maxForBar: number;
  if (next) {
    maxForBar = next.min;
  } else if (currentTier.max === Infinity) {
    maxForBar = 100;
  } else {
    maxForBar = currentTier.max;
  }
  const percentage = Math.min(100, (pass.visitedCount / maxForBar) * 100);

  return (
    <section className="w-full flex flex-col justify-center h-full">
      <div className="flex items-end justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest font-mono">
              Current Rank
            </span>
          </div>
          <h3 className="text-3xl font-black text-white flex items-center gap-3">
            <span className="text-4xl drop-shadow-lg">{currentTier.emoji}</span>
            <span className="tracking-tight">{currentTier.name}</span>
            <span className="text-xl font-medium text-slate-500 bg-white/[0.05] px-3 py-1 rounded-lg border border-white/10">
              Lv.{pass.level}
            </span>
          </h3>
        </div>

        <div className="text-right">
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest font-mono mb-2 flex items-center justify-end gap-2">
            Total Visits <Target className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-l from-cyan-400 to-blue-500">
            {pass.visitedCount}
          </div>
        </div>
      </div>

      <div className="relative w-full bg-black/40 rounded-full h-3 mb-5 border border-white/[0.05] shadow-inner overflow-hidden">
        <div
          className={`absolute top-0 left-0 h-full rounded-full bg-gradient-to-r ${currentTier.color} transition-all duration-1000 ease-out`}
          style={{ width: `${percentage}%` }}
        >
          <div className="absolute top-0 right-0 w-3 h-full bg-white/50 rounded-full blur-[2px]" />
        </div>
      </div>

      <div className="flex items-center justify-between">
        {next ? (
          <p className="text-sm font-medium text-slate-400 flex items-center gap-2 bg-white/[0.02] px-4 py-2 rounded-xl border border-white/[0.03]">
            Butuh{" "}
            <strong className="text-white font-bold text-base">
              {remaining}
            </strong>{" "}
            kunjungan lagi menuju
            <span className="flex items-center gap-1.5 text-white font-bold px-2 py-0.5 bg-white/[0.05] rounded-md border border-white/10">
              {next.emoji} {next.name}
            </span>
          </p>
        ) : (
          <p className="text-sm text-amber-400 font-bold flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-4 py-2 rounded-xl">
            <Sparkles className="w-4 h-4" />
            Maksimal! Anda telah mencapai rank Legendary Traveler.
          </p>
        )}

        {next && (
          <div className="text-xs font-mono text-slate-500 tracking-wider">
            {Math.round(percentage)}% TO NEXT RANK
          </div>
        )}
      </div>
    </section>
  );
}
