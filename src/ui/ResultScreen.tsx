import React from 'react';
import { useGameStore } from '@/stores/gameStore';

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function getGradeColor(score: number): string {
  if (score >= 50000) return '#b8e6ff'; // diamond
  if (score >= 35000) return '#ffd36a'; // gold
  if (score >= 20000) return '#c0c0c0'; // silver
  return '#cd7f32';                      // bronze
}

function getGradeLabel(score: number): string {
  if (score >= 50000) return 'DIAMOND';
  if (score >= 35000) return 'GOLD';
  if (score >= 20000) return 'SILVER';
  return 'BRONZE';
}

function StatRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between items-center py-1.5 border-b border-white/5">
      <span className="text-ivory/50 text-xs tracking-wider">{label}</span>
      <span className="text-ivory font-mono text-sm tabular-nums">{value}</span>
    </div>
  );
}

export function ResultScreen({ onRetry, onMainMenu }: {
  onRetry: () => void;
  onMainMenu: () => void;
}) {
  const sevaScore = useGameStore((s) => s.sevaScore);
  const bells = useGameStore((s) => s.procession.bellsRemaining);
  const perfectLandings = useGameStore((s) => s.perfectLandings);
  const tailSaves = useGameStore((s) => s.tailSaves);
  const secretRoutes = useGameStore((s) => s.secretRoutesFound);
  const physicsChains = useGameStore((s) => s.physicsChains);
  const timeElapsed = useGameStore((s) => s.timeElapsed);
  const maxFlow = useGameStore((s) => s.flow.multiplier);
  const highScore = useGameStore((s) => s.highScore);

  const processionStops = 3 - bells;
  const isNewBest = sevaScore >= highScore && sevaScore > 0;
  const gradeColor = getGradeColor(sevaScore);
  const gradeLabel = getGradeLabel(sevaScore);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-[#0d0820] to-[#050914] z-50 overflow-auto py-8">
      {/* Title */}
      <div className="text-center mb-4 animate-fadeIn">
        <p className="font-display text-warm-gold/50 text-xs tracking-[0.3em]">VIGHNAHARTA</p>
        <p className="font-display text-ivory/60 text-sm tracking-[0.15em]">PATH OF LIGHT</p>
      </div>

      {/* Score */}
      <div className="text-center mb-2 animate-slideUp">
        <span className="text-[9px] font-bold tracking-[0.25em] text-warm-gold/60">SEVA</span>
        <h1 className="font-display text-5xl sm:text-6xl tabular-nums"
            style={{ color: gradeColor, textShadow: `0 0 30px ${gradeColor}40` }}>
          {sevaScore.toLocaleString()}
        </h1>
        {isNewBest && (
          <span className="inline-block mt-1 px-3 py-0.5 bg-warm-gold/20 text-warm-gold text-xs font-bold tracking-[0.15em] rounded-full border border-warm-gold/30">
            ✦ NEW BEST ✦
          </span>
        )}
      </div>

      {/* Grade */}
      <div className="mb-6 animate-slideUp" style={{ animationDelay: '0.15s' }}>
        <span className="font-display text-2xl font-bold tracking-[0.2em]"
              style={{ color: gradeColor }}>
          {gradeLabel}
        </span>
      </div>

      {/* Stats */}
      <div className="w-full max-w-sm px-6 animate-slideUp" style={{ animationDelay: '0.25s' }}>
        <div className="bg-white/5 rounded-xl border border-white/10 p-4">
          <StatRow label="Procession Stops" value={processionStops} />
          <StatRow label="Max Flow" value={`×${maxFlow}`} />
          <StatRow label="Perfect Landings" value={perfectLandings} />
          <StatRow label="Tail Saves" value={tailSaves} />
          <StatRow label="Secret Routes" value={`${secretRoutes}/6`} />
          <StatRow label="Physics Chains" value={physicsChains} />
          <StatRow label="Time" value={formatTime(timeElapsed)} />
        </div>
      </div>

      {/* AGAIN Button — THE MOST IMPORTANT BUTTON */}
      <button
        onClick={onRetry}
        className="mt-8 px-14 py-4 bg-gradient-to-r from-festival-orange to-marigold text-white font-display text-2xl tracking-[0.15em] rounded-xl
                   shadow-lg shadow-festival-orange/30 hover:shadow-xl hover:shadow-festival-orange/40
                   transition-all duration-200 hover:scale-105 active:scale-95 animate-slideUp"
        style={{ animationDelay: '0.4s' }}
      >
        AGAIN
      </button>

      {/* Main Menu */}
      <button
        onClick={onMainMenu}
        className="mt-4 text-ivory/40 hover:text-ivory/70 text-xs tracking-[0.15em] transition-colors animate-fadeIn"
        style={{ animationDelay: '0.6s' }}
      >
        MAIN MENU
      </button>
    </div>
  );
}
