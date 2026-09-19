import React, { useCallback } from 'react';
import { useGameStore } from './stores/gameStore';
import { World } from './game3d/World';
import { MobileControls } from './game3d/ui/MobileControls';
import { GameHUD } from './game3d/ui/GameHUD';
import { MainMenu } from './ui/MainMenu';
import { ResultScreen } from './ui/ResultScreen';

const App: React.FC = () => {
  const gamePhase = useGameStore((s) => s.gamePhase);
  const setGamePhase = useGameStore((s) => s.setGamePhase);
  const resetRun = useGameStore((s) => s.resetRun);
  const finishRun = useGameStore((s) => s.finishRun);

  const handleStart = useCallback(() => {
    resetRun();
    setGamePhase('PLAYING');
  }, [resetRun, setGamePhase]);

  const handleRetry = useCallback(() => {
    resetRun();
    setGamePhase('PLAYING');
  }, [resetRun, setGamePhase]);

  const handleMainMenu = useCallback(() => {
    setGamePhase('MENU');
  }, [setGamePhase]);

  return (
    <div className="w-full h-screen overflow-hidden bg-deep-shadow text-ivory relative font-body">
      {/* ── MENU ── */}
      {gamePhase === 'MENU' && (
        <MainMenu onStart={handleStart} />
      )}

      {/* ── PLAYING ── */}
      {gamePhase === 'PLAYING' && (
        <>
          <div className="absolute inset-0">
            <World />
          </div>
          <GameHUD />
          <MobileControls />
        </>
      )}

      {/* ── RESULTS ── */}
      {gamePhase === 'RESULTS' && (
        <ResultScreen onRetry={handleRetry} onMainMenu={handleMainMenu} />
      )}

      {/* ── FAILED ── */}
      {gamePhase === 'FAILED' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-50">
          <p className="text-warm-gold font-display text-lg tracking-widest mb-2 opacity-70">
            VIGHNAHARTA
          </p>
          <h1 className="text-ivory font-display text-3xl mb-8">
            THE PATH NEEDED MORE TIME
          </h1>
          <div className="text-ivory/60 text-sm mb-8">
            Seva Score: {useGameStore.getState().sevaScore.toLocaleString()}
          </div>
          <button
            onClick={handleRetry}
            className="px-10 py-4 bg-festival-orange hover:bg-festival-orange/90 text-white font-display text-xl tracking-wider rounded-lg transition-transform hover:scale-105 active:scale-95"
          >
            RETRY
          </button>
          <button
            onClick={handleMainMenu}
            className="mt-4 text-ivory/50 hover:text-ivory text-sm tracking-wider transition-colors"
          >
            MAIN MENU
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
