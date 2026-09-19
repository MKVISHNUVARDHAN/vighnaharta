import React, { useEffect, useState } from 'react';
import { useGameStore } from '@/stores/gameStore';

function BellDisplay({ remaining }: { remaining: number }) {
  return (
    <div className="flex gap-1.5">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={`text-xl transition-all duration-300 ${
            i < remaining ? 'opacity-100 scale-100' : 'opacity-30 scale-90 grayscale'
          } ${remaining === 1 && i === 0 ? 'pulse-glow' : ''}`}
        >
          🔔
        </span>
      ))}
    </div>
  );
}

function DistanceBar({ distance }: { distance: number }) {
  const maxDist = 70;
  const ratio = Math.min(distance / maxDist, 1);
  const barColor =
    distance > 50 ? '#6ed5a4' :
    distance > 25 ? '#ffd36a' :
    distance > 15 ? '#f5963a' :
    '#e84040';

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex items-center gap-2 w-full max-w-[280px]">
        <span className="text-xs">🐘</span>
        <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden relative">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${ratio * 100}%`,
              background: `linear-gradient(90deg, ${barColor}88, ${barColor})`,
              boxShadow: `0 0 8px ${barColor}60`,
            }}
          />
        </div>
        <span className="text-xs">🐭</span>
      </div>
      <span
        className="text-xs font-bold tracking-wider tabular-nums"
        style={{ color: barColor }}
      >
        {Math.round(distance)}m
      </span>
    </div>
  );
}

function FlowDisplay({ multiplier, progress, isSurge }: {
  multiplier: number;
  progress: number;
  isSurge: boolean;
}) {
  if (multiplier <= 1 && !isSurge) return null;

  return (
    <div className={`flex flex-col items-center gap-1 ${isSurge ? 'pulse-glow' : ''}`}>
      <span className={`font-display text-lg font-bold tracking-wider ${
        isSurge ? 'text-yellow-300' : 'text-warm-gold'
      }`}>
        {isSurge ? '⚡ SEVA SURGE ⚡' : `×${multiplier}`}
      </span>
      {!isSurge && (
        <div className="w-24 h-1.5 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-festival-orange to-warm-gold transition-all duration-200"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      )}
    </div>
  );
}

// Toast system
let toastId = 0;
interface Toast {
  id: number;
  message: string;
  style: string;
}

export function GameHUD() {
  const sevaScore = useGameStore((s) => s.sevaScore);
  const distance = useGameStore((s) => s.procession.distance);
  const bells = useGameStore((s) => s.procession.bellsRemaining);
  const flowMultiplier = useGameStore((s) => s.flow.multiplier);
  const flowProgress = useGameStore((s) => s.flow.progress);
  const isSurge = useGameStore((s) => s.flow.isSurge);
  const timeElapsed = useGameStore((s) => s.timeElapsed);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Format time
  const mins = Math.floor(timeElapsed / 60);
  const secs = Math.floor(timeElapsed % 60);
  const timeStr = `${mins}:${secs.toString().padStart(2, '0')}`;

  // Toast listener (via window event for simplicity)
  useEffect(() => {
    const handler = (e: CustomEvent) => {
      const id = ++toastId;
      const { message, style } = e.detail;
      setToasts((prev) => [...prev, { id, message, style }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 1200);
    };
    window.addEventListener('game-toast' as any, handler);
    return () => window.removeEventListener('game-toast' as any, handler);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none z-10 p-4 flex flex-col justify-between">
      {/* ── Top Row ── */}
      <div className="flex justify-between items-start gap-4">
        {/* Score */}
        <div className="flex flex-col">
          <span className="text-[9px] font-bold tracking-[0.2em] text-warm-gold/70">SEVA</span>
          <strong className="font-display text-2xl sm:text-3xl text-ivory tabular-nums">
            {sevaScore.toLocaleString()}
          </strong>
        </div>

        {/* Procession Distance */}
        <div className="flex flex-col items-center px-3 py-2 rounded-2xl bg-black/50 backdrop-blur-md border border-warm-gold/20">
          <span className="text-[8px] font-bold tracking-[0.2em] text-warm-gold/60 mb-1">PROCESSION</span>
          <DistanceBar distance={distance} />
        </div>

        {/* Bells + Time */}
        <div className="flex flex-col items-end gap-1">
          <BellDisplay remaining={bells} />
          <span className="text-sm font-mono text-ivory/60 tabular-nums">{timeStr}</span>
        </div>
      </div>

      {/* ── Center Toasts ── */}
      <div className="absolute top-[20%] left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`toast-pop px-5 py-2 rounded-full font-display text-lg font-bold tracking-wider whitespace-nowrap
              ${t.style === 'perfect' ? 'text-emerald-400 bg-emerald-400/10 border border-emerald-400/40' :
                t.style === 'warning' ? 'text-orange-400 bg-orange-400/10 border border-orange-400/40' :
                t.style === 'chain' ? 'text-yellow-300 bg-yellow-300/10 border border-yellow-300/40' :
                'text-ivory bg-white/10 border border-white/20'}`}
          >
            {t.message}
          </div>
        ))}
      </div>

      {/* ── Bottom: Flow Multiplier ── */}
      <div className="flex justify-center">
        <FlowDisplay multiplier={flowMultiplier} progress={flowProgress} isSurge={isSurge} />
      </div>
    </div>
  );
}
