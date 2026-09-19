import { useCallback, useEffect, useRef, useState } from "react";
import { EventBus } from "@/game/EventBus";
import RoadRallyGame from "@/ui/challenges/RoadRallyGame";
import CatchGame from "@/ui/challenges/CatchGame";
import FlowerMatchGame from "@/ui/challenges/FlowerMatchGame";
import RhythmGame from "@/ui/challenges/RhythmGame";
import MonsoonCrossingGame from "@/ui/challenges/MonsoonCrossingGame";
import RangoliLightGame from "@/ui/challenges/RangoliLightGame";
import type { ChallengeProps, Medal } from "@/ui/challenges/types";

type Mode = "idle" | "dialogue" | "rules" | "play" | "success" | "failed";
type StageInfo = { place: string; npc: string; portrait: string; problem: string; title: string; subtitle: string; rules: string[]; target: string; accent: string };

export const STAGES: StageInfo[] = [
  { place: "WELCOME STREET", npc: "Aaji Meera", portrait: "👵🏽", problem: "The street is jammed with carts and barricades. Shove carts into side alleys before the sacred Rath arrives!", title: "ROAD RALLY", subtitle: "Physics Momentum Car Jam — Push carts into side alleys!", rules: ["Arrow Keys / WASD / D-Pad to shove carts", "Momentum slides carts along the street", "Push carts into marked side alleys before the Rath arrives"], target: "CLEAR ALL CARTS", accent: "#f2b84b" },
  { place: "MODAK MARKET", npc: "Madhav Halwai", portrait: "👨🏽‍🍳", problem: "Balconies shower fresh sweets for the Rath. Stack and merge them on your silver thali without spilling!", title: "MODAK CATCH", subtitle: "Suika Sweet Merge — Stack & merge matching offerings!", rules: ["Move thali and click to drop sweets", "Matching sweets merge into higher tiers (Laddu → Pedha → Modak)", "Keep balanced! Don't let offerings spill over the rim"], target: "MERGE TO MODAK", accent: "#ff8c42" },
  { place: "GARLAND BAZAAR", npc: "Sakhi Tara", portrait: "👩🏽", problem: "Three temple garlands need assembly. Drop granular petals into the mould to bind vibrant floral links.", title: "FLOWER FESTIVAL", subtitle: "Sandtrix Petal Mosaic — Granular floral chain reactions!", rules: ["Guide the petal dispenser left and right", "Connect continuous bands of color from rim to core", "Bind 3 complete floral links to adorn the gate"], target: "BIND 3 GARLANDS", accent: "#ef5da8" },
  { place: "DHOL CHOWK", npc: "Rohan Dholi", portrait: "🥁", problem: "The Nashik Dhol band leads the procession! Call-and-response the beats with Bass, Treble, and Tasha.", title: "DHOL UTSAV", subtitle: "Jugalbandi Rhythm — Real dhol acoustic strikes!", rules: ["D & F for Bass & Treble Dhol; J & K for Tasha strikes", "Hit matching notes exactly on the strike bar", "Match the Master Dholi's Taal rhythm"], target: "HOLD THE TAAL", accent: "#5fd1c8" },
  { place: "MONSOON APPROACH", npc: "Kaka Deepak", portrait: "🧔🏽", problem: "The swollen river flooded the access ghat. Leap across floating rafts and secure three sluice latches.", title: "MONSOON CROSSING", subtitle: "Dynamic Raft River Crossing with checkpoints!", rules: ["Hop across moving rafts and stable river rocks", "Turn three sluice latches to establish permanent checkpoints", "Cross safely to the northern bank"], target: "SECURE 3 LATCHES", accent: "#62bdea" },
  { place: "GHAT COURTYARD", npc: "Anaya", portrait: "👩🏽‍🎨", problem: "The farewell courtyard is dark. Route the divine beam through mirrors to illuminate the sacred rangoli.", title: "RANGOLI LIGHTWORKS", subtitle: "Optics Laser Mandala — Direct the divine light!", rules: ["Rotate mirrors and beam splitters", "Guide the laser beam across the rangoli geometry", "Illuminate all 6 lotus petals to start Nimarjanam"], target: "LIGHT 6 PETALS", accent: "#ffd36a" },
];

export const GAMES: Array<(props: ChallengeProps) => JSX.Element> = [RoadRallyGame, CatchGame, FlowerMatchGame, RhythmGame, MonsoonCrossingGame, RangoliLightGame];

function PhaserChallengeBridge({ stage, onWin, onFail, assisted, attempt }: { stage: number, onWin: (medal?: Medal) => void, onFail: () => void, assisted: boolean, attempt: number }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      EventBus.emit('start-phaser-challenge', { stage, onWin, onFail, assisted, attempt });
    }, 50);
    return () => {
      clearTimeout(timer);
      EventBus.emit('stop-phaser-challenge', { stage });
    };
  }, [stage, attempt, assisted]);
  
  return null;
}

const SUCCESS_QUOTES = [
  "The road is clear! The bell rings!",
  "The offering trays overflow with sweetness!",
  "The garlands shine brighter than the sun!",
  "The drums echo through every street!",
  "The monsoon bows to your courage!",
  "The rangoli lights up the night sky!"
];

const getFailureQuote = (attempt: number) => {
  if (attempt <= 1) return "The road is tough, but you're tougher.";
  if (attempt === 2) return "Even Lord Ganesha faced obstacles. That's why he removes them.";
  return "Take help. There's no shame in accepting a hand.";
};

const getMedalColor = (medal?: Medal) => {
  switch (medal) {
    case 'GOLD': return '#ffd700';
    case 'SILVER': return '#c0c0c0';
    case 'BRONZE': return '#cd7f32';
    case 'ASSISTED': return '#88ccff';
    default: return '#333';
  }
};

export default function ChallengeLayer() {
  const [stage, setStage] = useState(0);
  const [mode, setMode] = useState<Mode>("idle");
  const [attempt, setAttempt] = useState(0);
  const [assisted, setAssisted] = useState(false);
  const [medals, setMedals] = useState<Medal[]>([]);
  const [retryKey, setRetryKey] = useState(0);
  const completionTimer = useRef(0);

  useEffect(() => {
    const arrive = (index: number) => { setStage(index); setMode("dialogue"); setAttempt(0); setAssisted(false); setRetryKey(0); };
    EventBus.on("stage-arrived", arrive);
    return () => { EventBus.off("stage-arrived", arrive); window.clearTimeout(completionTimer.current); };
  }, []);

  useEffect(() => { EventBus.emit("challenge-active", mode !== "idle" && mode !== "success"); }, [mode]);

  const fail = useCallback(() => { 
    setAttempt((value) => value + 1); 
    setMode("failed"); 
  }, []);

  const continueSuccess = useCallback(() => {
    window.clearTimeout(completionTimer.current);
    EventBus.emit("challenge-cleared", stage, medals[stage]); 
    setMode("idle");
  }, [stage, medals]);

  const win = (medal: Medal = "BRONZE") => {
    if (assisted) medal = "ASSISTED";
    setMedals((current) => { const next = [...current]; next[stage] = medal; return next; });
    setMode("success");
    completionTimer.current = window.setTimeout(continueSuccess, 4000);
  };

  const info = STAGES[stage];
  return (
    <div className="challenge-layer" style={{ "--accent": info.accent } as React.CSSProperties}>
      <style>{`
        @keyframes slideUpFade { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }
        @keyframes pulseGlow { 0% { box-shadow: 0 0 0 0 rgba(255, 215, 0, 0.7); } 70% { box-shadow: 0 0 0 15px rgba(255, 215, 0, 0); } 100% { box-shadow: 0 0 0 0 rgba(255, 215, 0, 0); } }
        .animate-enter { animation: slideUpFade 0.5s ease-out forwards; }
        .animate-scale { animation: scaleIn 0.4s ease-out forwards; }
        .animate-pulse { animation: pulseGlow 2s infinite; }
      `}</style>
      
      <div className="journey-clock"><span>JOURNEY TO NIMARJANAM</span><strong>{stage + 1}/6</strong><div>{STAGES.map((_, index) => <i key={index} className={medals[index] ? "done" : index === stage ? "now" : ""}>{medals[index] ? "✓" : index + 1}</i>)}</div></div>
      
      {mode === "dialogue" && <div className="story-card animate-enter"><div className="npc-portrait">{info.portrait}</div><div className="story-copy"><span>{info.place} · THE CITY NEEDS YOU</span><h2>{info.npc}</h2><p>“{info.problem}”</p><button onClick={() => setMode("rules")}>HELP NOW <b>→</b></button></div></div>}
      
      {mode === "rules" && <div className="challenge-modal compact animate-scale"><div className="ornament"><i /><b>ॐ</b><i /></div><span className="challenge-count">CHAPTER {stage + 1} OF 6</span><h1>{info.title}</h1><p>{info.subtitle}</p><ul>{info.rules.map((rule, index) => <li key={rule}><b>{index + 1}</b>{rule}</li>)}</ul>{assisted && <div className="grace">✦ ASSIST ACTIVE · CLEARLY LABELLED · BEST SCORES SEPARATE</div>}<button className="primary-cta" onClick={() => setMode("play")}>BEGIN · {info.target}</button></div>}
      
      {mode === "play" && (
        <>
          <PhaserChallengeBridge key={retryKey} stage={stage} onWin={win} onFail={fail} assisted={assisted} attempt={attempt} />
          <div style={{
            position: 'absolute',
            top: '16px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            background: 'rgba(7, 16, 33, 0.88)',
            border: '2px solid rgba(255, 215, 0, 0.6)',
            padding: '8px 24px',
            borderRadius: '9999px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.7), 0 0 20px rgba(255, 215, 0, 0.25)',
            backdropFilter: 'blur(12px)',
            zIndex: 40,
            pointerEvents: 'none'
          }}>
            <div style={{ textAlign: 'left' }}>
              <span style={{ fontSize: '10px', letterSpacing: '2px', color: '#ffd700', fontWeight: 'bold', textTransform: 'uppercase', display: 'block' }}>
                CHAPTER {stage + 1} · {info.place}
              </span>
              <strong style={{ fontSize: '15px', fontWeight: 900, color: '#fff', letterSpacing: '1px' }}>
                {info.title}
              </strong>
            </div>
            <div style={{ width: '1px', height: '24px', background: 'rgba(255, 215, 0, 0.3)' }} />
            <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#ffd700', textTransform: 'uppercase', letterSpacing: '1px' }}>
              {info.target}
            </span>
            <button
              onClick={() => fail()}
              style={{
                pointerEvents: 'auto',
                marginLeft: '8px',
                padding: '4px 12px',
                fontSize: '11px',
                fontWeight: 'bold',
                color: 'rgba(255,255,255,0.7)',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255, 215, 0, 0.4)',
                borderRadius: '9999px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
            >
              QUIT ✕
            </button>
          </div>
        </>
      )}
      
      {mode === "success" && (
        <div className="victory-overlay animate-enter" style={{
          position: 'absolute', inset: 0,
          backgroundColor: 'rgba(0,0,0,0.85)',
          border: '4px solid #ffd700',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          color: 'white', zIndex: 100,
          textAlign: 'center'
        }}>
          <h1 style={{ fontSize: '36px', color: '#ffd700', marginBottom: '10px' }}>✦ CHAPTER COMPLETE ✦</h1>
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%',
            backgroundColor: getMedalColor(medals[stage]),
            boxShadow: `0 0 20px ${getMedalColor(medals[stage])}`,
            margin: '20px auto', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '40px', fontWeight: 'bold'
          }}>
            {medals[stage] === 'GOLD' ? '🏆' : medals[stage] === 'SILVER' ? '🥈' : medals[stage] === 'BRONZE' ? '🥉' : '🌟'}
          </div>
          <h2 style={{ fontSize: '18px', letterSpacing: '2px', marginBottom: '30px' }}>THE PROCESSION MOVES</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', backgroundColor: 'rgba(255,255,255,0.1)', padding: '15px 25px', borderRadius: '8px', marginBottom: '30px' }}>
            <div style={{ fontSize: '40px' }}>{info.portrait}</div>
            <div>
              <div style={{ fontSize: '14px', color: '#aaa', textAlign: 'left' }}>{info.npc}</div>
              <div style={{ fontSize: '18px', fontStyle: 'italic' }}>"{SUCCESS_QUOTES[stage]}"</div>
            </div>
          </div>
          <div style={{ width: '60%', height: '8px', backgroundColor: '#333', borderRadius: '4px', marginBottom: '30px', overflow: 'hidden' }}>
            <div style={{ width: `${((stage + 1) / 6) * 100}%`, height: '100%', backgroundColor: '#ffd700' }} />
          </div>
          <button onClick={continueSuccess} style={{
            backgroundColor: '#ffd700', color: 'black', padding: '12px 30px', border: 'none', borderRadius: '24px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer'
          }}>CONTINUE ➔</button>
        </div>
      )}
      
      {mode === "failed" && (
        <div className="failure-overlay animate-enter" style={{
          position: 'absolute', inset: 0,
          backgroundColor: 'rgba(20,10,10,0.9)',
          border: '4px solid #e74c3c',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          color: 'white', zIndex: 100,
          textAlign: 'center'
        }}>
          <h1 style={{ fontSize: '36px', color: 'white', marginBottom: '10px' }}>NOT YET...</h1>
          
          <div style={{ marginBottom: '30px' }}>
            <span style={{ fontSize: '12px', letterSpacing: '2px', color: '#ffd700', fontWeight: 'bold', textTransform: 'uppercase', display: 'block' }}>
              CHAPTER {stage + 1} · {info.place}
            </span>
            <strong style={{ fontSize: '24px', fontWeight: 900, color: '#fff', letterSpacing: '1px' }}>
              {info.title}
            </strong>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', backgroundColor: 'rgba(255,255,255,0.1)', padding: '15px 25px', borderRadius: '8px', marginBottom: '30px' }}>
            <div style={{ fontSize: '40px' }}>{info.portrait}</div>
            <div>
              <div style={{ fontSize: '14px', color: '#aaa', textAlign: 'left' }}>{info.npc}</div>
              <div style={{ fontSize: '18px', fontStyle: 'italic' }}>"{getFailureQuote(attempt)}"</div>
            </div>
          </div>
          
          <div style={{ fontSize: '14px', color: '#aaa', marginBottom: '30px' }}>Attempt {attempt} of ∞</div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '15px' }}>
              <button className="animate-pulse" onClick={() => { setRetryKey(k => k + 1); setMode('play'); }} style={{
                backgroundColor: '#ffd700', color: 'black', padding: '16px 40px', border: 'none', borderRadius: '30px', fontSize: '18px', fontWeight: '900', cursor: 'pointer', letterSpacing: '1px'
              }}>TRY AGAIN</button>
              
              {attempt >= 2 && (
                <button onClick={() => { setAssisted(true); setRetryKey(k => k + 1); setMode('play'); }} style={{
                  backgroundColor: 'transparent', color: '#ffd700', padding: '16px 30px', border: '2px solid #ffd700', borderRadius: '30px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer'
                }}>GET HELP</button>
              )}
            </div>
            
            <button onClick={() => setMode('rules')} style={{
              backgroundColor: 'transparent', color: '#aaa', padding: '8px 20px', border: '1px solid #555', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px'
            }}>VIEW CONTROLS</button>
          </div>
        </div>
      )}
    </div>
  );
}
