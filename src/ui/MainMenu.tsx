import React, { useState } from 'react';
import { useGameStore } from '@/stores/gameStore';

export function MainMenu({ onStart }: { onStart: () => void }) {
  const highScore = useGameStore((s) => s.highScore);
  const [showHelp, setShowHelp] = useState(false);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-[#1a0e05] via-[#0a0a1a] to-[#050914] z-50">
      {/* Decorative top glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-radial from-warm-gold/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Title */}
      <div className="text-center mb-10 animate-fadeIn">
        <p className="text-warm-gold/60 text-xs font-bold tracking-[0.3em] mb-3">
          गणपती बाप्पा मोरया
        </p>
        <h1 className="font-display text-5xl sm:text-6xl text-warm-gold tracking-wider mb-2"
            style={{ textShadow: '0 0 40px rgba(212, 165, 60, 0.3)' }}>
          VIGHNAHARTA
        </h1>
        <h2 className="font-display text-xl sm:text-2xl text-ivory/80 tracking-[0.15em]">
          PATH OF LIGHT
        </h2>
        <p className="mt-4 text-ivory/40 text-sm tracking-wider max-w-md mx-auto">
          Clear the Vighnas. Guide the Procession.
        </p>
      </div>

      {/* High Score */}
      {highScore > 0 && (
        <div className="mb-6 text-center animate-fadeIn" style={{ animationDelay: '0.2s' }}>
          <span className="text-[9px] font-bold tracking-[0.2em] text-warm-gold/50">PERSONAL BEST</span>
          <p className="font-display text-lg text-warm-gold">{highScore.toLocaleString()}</p>
        </div>
      )}

      {/* Start Button */}
      <button
        onClick={onStart}
        className="px-12 py-4 bg-gradient-to-r from-festival-orange to-marigold text-white font-display text-xl tracking-[0.15em] rounded-xl
                   shadow-lg shadow-festival-orange/30 hover:shadow-xl hover:shadow-festival-orange/40
                   transition-all duration-200 hover:scale-105 active:scale-95 animate-slideUp"
        style={{ animationDelay: '0.3s' }}
      >
        BEGIN SEVA
      </button>

      {/* How to Play */}
      <button
        onClick={() => setShowHelp(!showHelp)}
        className="mt-5 text-ivory/40 hover:text-ivory/70 text-xs tracking-[0.15em] transition-colors animate-fadeIn"
        style={{ animationDelay: '0.5s' }}
      >
        {showHelp ? 'CLOSE' : 'HOW TO PLAY'}
      </button>

      {showHelp && (
        <div className="mt-4 px-6 py-4 bg-white/5 rounded-xl border border-warm-gold/15 max-w-sm animate-fadeIn">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="text-ivory/50">
              <kbd className="px-2 py-0.5 bg-white/10 rounded text-xs font-mono">WASD</kbd>
            </div>
            <div className="text-ivory/80">Move</div>
            <div className="text-ivory/50">
              <kbd className="px-2 py-0.5 bg-white/10 rounded text-xs font-mono">SPACE</kbd>
            </div>
            <div className="text-ivory/80">Jump</div>
            <div className="text-ivory/50">
              <kbd className="px-2 py-0.5 bg-white/10 rounded text-xs font-mono">SHIFT</kbd> / <kbd className="px-2 py-0.5 bg-white/10 rounded text-xs font-mono">LMB</kbd>
            </div>
            <div className="text-ivory/80">Tail</div>
          </div>
          <p className="mt-3 text-ivory/30 text-xs text-center">
            Run ahead of the procession. Use your tail to clear obstacles.
          </p>
        </div>
      )}

      {/* Footer */}
      <p className="absolute bottom-6 text-ivory/20 text-[10px] tracking-[0.15em] animate-fadeIn"
         style={{ animationDelay: '0.7s' }}>
        A GANESH CHATURTHI FESTIVAL GAME
      </p>
    </div>
  );
}
