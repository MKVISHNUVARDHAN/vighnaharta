import { useState } from 'react';
import { STAGES } from './ChallengeLayer';
import type { Medal } from '../challenges/types';
import { EventBus } from '@/game/EventBus';
import { useGameStore } from '@/stores/gameStore';

const ICONS = ['✨', '◆', '✿', '♫', '✦', '❈'];

export default function ArcadeRoom({ onClose }: { onClose: () => void }) {
  const [stage, setStage] = useState<number | null>(null);
  const setGamePhase = useGameStore((state) => state.setGamePhase);
  const [bests] = useState<Record<number, string>>(() => {
    try {
      return JSON.parse(localStorage.getItem('vighnaharta-arcade-medals') || '{}');
    } catch {
      return {};
    }
  });

  const launchPhaserGame = (stageIdx: number) => {
    setGamePhase('PLAYING');
    setTimeout(() => {
      EventBus.emit('stage-arrived', stageIdx);
    }, 350);
  };

  return (
    <div
      className="arcade-room"
      style={{ '--accent': stage === null ? '#ffd36a' : STAGES[stage].accent } as React.CSSProperties}
    >
      <nav>
        <button
          onClick={() => {
            if (stage === null) onClose();
            else setStage(null);
          }}
        >
          ← {stage === null ? 'MAIN MENU' : 'ALL GAMES'}
        </button>
        <span>VIGHNAHARTA / FESTIVAL ARCADE</span>
      </nav>

      {stage === null ? (
        <>
          <header>
            <p>SIX WAYS TO SAVE THE FESTIVAL</p>
            <h1>One more round.</h1>
            <p>Pick a game. Master its momentum and rhythm. Chase a gold medal.</p>
          </header>
          <div className="arcade-grid">
            {STAGES.map((info, i) => (
              <button
                key={info.title}
                onClick={() => setStage(i)}
                style={{ '--accent': info.accent } as React.CSSProperties}
              >
                <i>{ICONS[i]}</i>
                <small>0{i + 1} / {bests[i] || 'READY TO PLAY'}</small>
                <h2>{info.title}</h2>
                <p>{info.subtitle}</p>
                <b>PLAY →</b>
              </button>
            ))}
          </div>
        </>
      ) : (
        <section className="arcade-stage">
          <header>
            <small>{STAGES[stage].place}</small>
            <h1>{STAGES[stage].title}</h1>
          </header>
          <div className="arcade-ready">
            <div className="arcade-emblem">{ICONS[stage]}</div>
            <h2>{STAGES[stage].subtitle}</h2>
            <ul>
              {STAGES[stage].rules.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
            <button
              className="primary-cta"
              onClick={() => launchPhaserGame(stage)}
            >
              LAUNCH CHALLENGE ➔
            </button>
          </div>
        </section>
      )}
    </div>
  );
}

