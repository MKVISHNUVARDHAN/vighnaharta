import React, { useEffect, useState } from "react";
import { EventBus } from "@/game/EventBus";

export default function GameHUD() {
  const [objective, setObjective] = useState({
    title: "THE CITY IS WAITING",
    hint: "Six neighbourhoods need Mooshak",
  });
  const [toast, setToast] = useState<{ message: string; tone: string } | null>(
    null,
  );
  const [points, setPoints] = useState({ score: 0, combo: 0 });
  const [inChallenge, setInChallenge] = useState(false);
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    let timer = 0;
    const onScore = (score: number, combo: number) => setPoints({score, combo});
    EventBus.on("journey-score", onScore);
    EventBus.on("challenge-active", setInChallenge);
    const objectiveChanged = (title: string, hint: string) =>
      setObjective({ title, hint });
    const onToast = (message: string, tone: string) => {
      clearTimeout(timer);
      setToast({ message, tone });
      timer = window.setTimeout(() => setToast(null), 1500);
    };
    EventBus.on("objective-changed", objectiveChanged);
    EventBus.on("toast", onToast);
    EventBus.on("progress-changed", setProgress);
    return () => {
      clearTimeout(timer);
      EventBus.off("journey-score", onScore);
      EventBus.off("challenge-active", setInChallenge);
      EventBus.off("objective-changed", objectiveChanged);
      EventBus.off("toast", onToast);
      EventBus.off("progress-changed", setProgress);
    };
  }, []);
  const [showStoryIntro, setShowStoryIntro] = useState(true);

  // Auto-dismiss story intro on first arrow / WASD key press
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyA', 'KeyS', 'KeyD', 'Space', 'Enter'].includes(e.code)) {
        setShowStoryIntro(false);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  return (
    <div className="world-hud absolute inset-0 pointer-events-none select-none">
      <div className="world-title">
        <span>MOOSHAK’S SEVA JOURNEY</span>
        <strong>{objective.title}</strong>
        <small>{objective.hint}</small>
        <div>
          <i style={{ width: `${progress * 100}%` }} />
        </div>
      </div>

      {/* Storytelling Onboarding Modal */}
      {showStoryIntro && (
        <div className="pointer-events-auto absolute inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
          <div className="max-w-md rounded-2xl border-2 border-warm-gold bg-navy/95 p-6 text-center shadow-[0_0_50px_rgba(255,215,0,0.3)]">
            <div className="text-3xl mb-2">🪔 🐘 🪔</div>
            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-warm-gold block font-display">
              Festival Mission
            </span>
            <h1 className="text-2xl font-black text-ivory mt-1 mb-3 font-display">
              MOOSHAK’S SACRED SCOUT
            </h1>
            <p className="text-xs text-ivory/80 leading-relaxed mb-4 text-left bg-black/30 p-3.5 rounded-xl border border-warm-gold/20">
              Lord Ganesha’s sacred Rath procession has begun journeying towards the Nimarjanam Ghat. 
              However, <strong>six crossroads are blocked</strong> by civic hurdles (Vighnas)!
              <br /><br />
              You are <strong>Mooshak</strong>, Ganesha’s swift vahan. 
              <strong> Roam the city freely</strong>, converse with devotees, and when you are ready, approach the glowing altars to clear the way!
            </p>

            <div className="text-left bg-warm-gold/10 border border-warm-gold/30 rounded-xl p-3 mb-5 space-y-1.5 text-[11px] text-ivory/90">
              <div>🕹️ <strong className="text-warm-gold">Move:</strong> WASD or Arrow Keys (or Click anywhere)</div>
              <div>⚡ <strong className="text-warm-gold">Dash:</strong> SPACE or SHIFT</div>
              <div>💬 <strong className="text-warm-gold">NPCs:</strong> Walk near citizens to hear festival barks</div>
              <div>🪔 <strong className="text-warm-gold">Challenges:</strong> Walk to glowing altars & press <span className="text-warm-gold font-bold">[E]</span> or Click to start</div>
            </div>

            <button
              onClick={() => {
                setShowStoryIntro(false);
                EventBus.emit("toast", "Free Roam Unlocked! Explore freely.", "good");
              }}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-warm-gold via-marigold to-warm-gold text-deep-shadow font-black font-display text-sm tracking-wider uppercase shadow-lg hover:brightness-110 active:scale-98 transition-all cursor-pointer"
            >
              ROAM THE FESTIVAL STREETS ➔
            </button>
          </div>
        </div>
      )}

      {toast && (
        <div className={`slice-toast toast-${toast.tone}`}>{toast.message}</div>
      )}

      {!inChallenge && (
        <>
          <div className="journey-points">
            <strong>{points.score.toLocaleString()}</strong>
            <span>LIGHT POINTS · {points.combo} CHAIN</span>
          </div>

          {/* Crisp, Permanent Controls Helper at the bottom */}
          <div className="road-controls !bottom-5 !left-1/2 !-translate-x-1/2 !bg-navy/90 !border-warm-gold/40 !backdrop-blur-md !py-2 !px-5 !rounded-full !shadow-lg">
            🕹️ <strong>WASD / ARROW KEYS</strong> TO MOVE • ⚡ <strong>SPACE</strong> TO DASH • 🪔 <strong>[E] / CLICK ALTAR</strong> TO HELP
          </div>

          <button
            className="world-dash"
            onPointerDown={(e) => {
              e.stopPropagation();
              EventBus.emit("journey-dash");
            }}
          >
            DASH<br/><small>SPACE</small>
          </button>
        </>
      )}
    </div>
  );
}
