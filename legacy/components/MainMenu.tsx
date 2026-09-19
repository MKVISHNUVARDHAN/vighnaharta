import React, { useState } from 'react';
import ArcadeRoom from './ArcadeRoom';
import SettingsPanel from './SettingsPanel';
import { useGameStore } from '@/stores/gameStore';

interface MainMenuProps {
  onStart: () => void;
}

const MainMenu: React.FC<MainMenuProps> = ({ onStart }) => {
  const [arcade, setArcade] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const personalBest = useGameStore((state) => state.personalBest);

  if (arcade) return <ArcadeRoom onClose={() => setArcade(false)} />;
  return (
    <div className="absolute inset-0 bg-deep-shadow flex flex-col items-center justify-center p-6 select-none font-body overflow-hidden">
      {/* Atmosphere Glow */}
      <div className="absolute w-[500px] h-[500px] bg-gradient-to-tr from-marigold/10 via-warm-gold/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Main Header */}
      <div className="mb-8 text-center z-10">
        <span className="text-xs uppercase tracking-[0.4em] text-warm-gold font-semibold block mb-2 font-display">
          NIAT Ganesh Chaturthi Contest Edition
        </span>
        <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-warm-gold via-marigold to-ivory drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)] font-display tracking-widest">
          VIGHNAHARTA
        </h1>
        <h2 className="text-sm md:text-xl text-ivory/80 tracking-[0.4em] mt-2 font-display uppercase">
          PATH OF LIGHT
        </h2>
        <p className="text-xs md:text-sm text-ivory/60 max-w-md mx-auto mt-3 font-light leading-relaxed">
          Become Mooshak, the festival’s swift helper. Master six living city challenges and carry Lord Ganesha’s procession to the nimarjanam ghat.
        </p>
      </div>

      {/* Personal Best Capsule */}
      {personalBest.score > 0 && (
        <div className="mb-8 px-6 py-2.5 rounded-2xl bg-navy/80 border border-warm-gold/30 backdrop-blur-md flex items-center space-x-4 shadow-lg z-10">
          <div className="text-left">
            <span className="text-[10px] uppercase tracking-widest text-warm-gold font-bold block">
              Best Journey
            </span>
            <span className="text-xl font-black text-ivory font-display">
              {personalBest.score}/6 roads
            </span>
          </div>
          <div className="h-7 w-px bg-warm-gold/20" />
          <div className="text-right">
            <span className="text-[10px] uppercase tracking-widest text-ivory/60 font-semibold block">
              Festival Grade
            </span>
            <span className="text-xl font-bold text-warm-gold font-display">
              {personalBest.grade || 'A'}
            </span>
          </div>
        </div>
      )}

      {/* Controls Quick Reference */}
      <div className="mb-8 grid grid-cols-2 gap-4 max-w-sm w-full text-center text-xs text-ivory/70 z-10">
        <div className="p-3 rounded-xl bg-navy/40 border border-ivory/10">
          <span className="font-bold text-warm-gold block mb-0.5">Desktop</span>
          <span>Keyboard and mouse challenges with instant musical controls</span>
        </div>
        <div className="p-3 rounded-xl bg-navy/40 border border-ivory/10">
          <span className="font-bold text-warm-gold block mb-0.5">Mobile</span>
          <span>Every challenge includes touch controls</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col items-center space-y-3 z-10 w-full max-w-xs">
        <button
          onClick={onStart}
          className="w-full py-4 bg-gradient-to-r from-marigold to-warm-gold hover:from-warm-gold hover:to-marigold text-deep-shadow font-extrabold text-lg md:text-xl rounded-2xl shadow-[0_4px_24px_rgba(232,163,23,0.35)] transition-all transform hover:scale-[1.02] active:scale-[0.98] font-display tracking-widest uppercase"
        >
          START PROCESSION
        </button>

        <button className="arcade-menu-button" onClick={() => setArcade(true)}>PLAY THE SIX MINIGAMES →</button>
        <button
          onClick={() => setShowSettings(true)}
          className="w-full py-2.5 border border-warm-gold/30 hover:border-warm-gold text-ivory/80 hover:text-ivory rounded-xl transition-all text-xs font-bold tracking-widest uppercase active:scale-[0.98]"
        >
          SETTINGS & ACCESSIBILITY
        </button>
      </div>

      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
    </div>
  );
};

export default MainMenu;
