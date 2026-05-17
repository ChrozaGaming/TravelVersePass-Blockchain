"use client";

import type { PassData } from "@/lib/types";

const TIERS = [
  { name: "Beginner", min: 0, max: 5, emoji: "🥉", color: "from-slate-400 to-slate-500" },
  { name: "Explorer", min: 6, max: 20, emoji: "🥈", color: "from-blue-400 to-blue-500" },
  { name: "Adventurer", min: 21, max: 50, emoji: "🥇", color: "from-amber-400 to-amber-500" },
  { name: "Legendary Traveler", min: 50, max: Infinity, emoji: "👑", color: "from-purple-500 to-pink-500" },
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
    <section>
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="text-xs text-slate-500 uppercase tracking-wide">
            Level
          </div>
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <span>{currentTier.emoji}</span>
            <span>{pass.level}</span>
          </h3>
        </div>
        <div className="text-right">
          <div className="text-xs text-slate-500 uppercase tracking-wide">
            Visits
          </div>
          <div className="text-2xl font-bold text-blue-600">
            {pass.visitedCount}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${currentTier.color} transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {next ? (
        <p className="text-sm text-slate-600 mt-2">
          <strong>{remaining}</strong> kunjungan lagi untuk level{" "}
          <strong>{next.emoji} {next.name}</strong>
        </p>
      ) : (
        <p className="text-sm text-emerald-700 mt-2 font-semibold">
          🏆 Sudah di level tertinggi! Legendary Traveler.
        </p>
      )}
    </section>
  );
}
