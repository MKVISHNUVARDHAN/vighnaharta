import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { EventBus } from "@/game/EventBus";
import type { ChallengeProps } from "./types";
import { formatTime, MiniHud } from "./types";

const SIZE = 5;
const BRIDGE = 12;
const PAIRS = [
  { symbol: "●", color: "#ffb43d", ends: [10, 14] },
  { symbol: "◆", color: "#65d9c2", ends: [2, 17] },
  { symbol: "✦", color: "#ee71a8", ends: [20, 24] },
];

export default function RangoliLightGame({ assisted, onWin }: ChallengeProps) {
  const [paths, setPaths] = useState<number[][]>([[], [], []]);
  const [active, setActive] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [redraws, setRedraws] = useState(0);
  const [celebrating, setCelebrating] = useState(false);
  const [released, setReleased] = useState<boolean[]>([false, false, false]);
  const [message, setMessage] = useState("CONNECT MATCHING SYMBOLS · USE THE RAISED CROSSING");
  const finishRef = useRef({ onWin, elapsed, redraws, assisted });
  finishRef.current = { onWin, elapsed, redraws, assisted };
  const start = useMemo(() => performance.now(), []);

  useEffect(() => {
    const timer = window.setInterval(() => setElapsed((performance.now() - start) / 1000), 250);
    return () => window.clearInterval(timer);
  }, [start]);

  const ownerAt = (cell: number, excluding: number) => paths.findIndex((path, index) => index !== excluding && path.includes(cell));
  const endpointOwner = (cell: number) => PAIRS.findIndex((pair) => pair.ends.includes(cell));
  const completed = paths.map((path, pair) => path.length > 1 && PAIRS[pair].ends.includes(path[path.length - 1]));

  const choose = useCallback((cell: number) => {
    if (celebrating) return;
    const endpoint = endpointOwner(cell);
    if (active === null) {
      if (endpoint < 0) { setMessage("START ON A GLOWING SYMBOL"); return; }
      setPaths((current) => current.map((path, index) => index === endpoint ? [cell] : path));
      setActive(endpoint); setMessage(`DRAW THE ${PAIRS[endpoint].symbol} LIGHT PATH`); return;
    }
    const path = paths[active], last = path[path.length - 1];
    const adjacent = Math.abs(Math.floor(cell / SIZE) - Math.floor(last / SIZE)) + Math.abs((cell % SIZE) - (last % SIZE)) === 1;
    if (!adjacent) return;
    if (path.length > 1 && path[path.length - 2] === cell) {
      setPaths((current) => current.map((value, index) => index === active ? value.slice(0, -1) : value)); return;
    }
    const endOwner = endpointOwner(cell);
    if (endOwner >= 0 && endOwner !== active) { setMessage("THAT SYMBOL BELONGS TO ANOTHER LIGHT"); return; }
    if (path.includes(cell)) return;
    const occupied = ownerAt(cell, active);
    if (occupied >= 0 && cell !== BRIDGE) { setMessage("PATHS CROSS ONLY ON THE RAISED TILE"); return; }
    if (cell === BRIDGE && occupied >= 0) {
      const incomingHorizontal = Math.floor(last / SIZE) === Math.floor(cell / SIZE);
      const otherPath = paths[occupied], otherIndex = otherPath.indexOf(cell), otherBefore = otherPath[otherIndex - 1], otherAfter = otherPath[otherIndex + 1];
      const otherHorizontal = otherBefore !== undefined && otherAfter !== undefined && Math.floor(otherBefore / SIZE) === Math.floor(otherAfter / SIZE);
      if (incomingHorizontal === otherHorizontal) { setMessage("USE THE OTHER LEVEL OF THE CROSSING"); return; }
    }
    const nextPath = [...path, cell];
    setPaths((current) => current.map((value, index) => index === active ? nextPath : value));
    EventBus.emit("ui-sfx", "good");
    if (PAIRS[active].ends.includes(cell) && cell !== path[0]) {
      setMessage(`${PAIRS[active].symbol} LIGHT CONNECTED · TWO PETALS AWAKE`); setActive(null); EventBus.emit("ui-sfx", "perfect");
    }
  }, [active, paths, celebrating]);

  useEffect(() => {
    if (!completed.every(Boolean) || celebrating) return;
    setCelebrating(true); setMessage("ALL SIX PETALS READY · RELEASE THE THREE LIGHTS");
  }, [celebrating, completed]);

  const release = (pair: number) => {
    setReleased((current) => { const next = [...current]; next[pair] = true; return next; });
    EventBus.emit("ui-sfx", pair === 2 ? "rangoli" : "perfect");
  };

  useEffect(() => {
    if (!released.every(Boolean)) return;
    const timer = window.setTimeout(() => { const {onWin, assisted, elapsed, redraws} = finishRef.current; onWin(assisted ? "ASSISTED" : elapsed <= 60 && redraws <= 1 ? "GOLD" : elapsed <= 90 && redraws <= 3 ? "SILVER" : "BRONZE"); }, 900);
    return () => window.clearTimeout(timer);
  }, [released]);

  const resetPath = (pair: number) => { setPaths((current) => current.map((path, index) => index === pair ? [] : path)); setActive(null); setCelebrating(false); setReleased([false, false, false]); setRedraws((value) => value + 1); };

  return (
    <div className="rangoli-game-v2">
      <MiniHud left={`PETALS ${completed.filter(Boolean).length * 2}/6 · REDRAWS ${redraws}`} right={formatTime(elapsed)} />
      <div className="light-board" onPointerMove={(event) => {
        if (!event.buttons) return;
        const target = document.elementFromPoint(event.clientX, event.clientY)?.closest('[data-light-cell]');
        if (target) choose(Number(target.getAttribute('data-light-cell')));
      }}>
        <svg className="rangoli-wires" viewBox="0 0 100 100" aria-hidden="true">{paths.map((path, i) => <polyline key={i} points={path.map(cell => `${10 + (cell % SIZE) * 20},${10 + Math.floor(cell / SIZE) * 20}`).join(' ')} fill="none" stroke={PAIRS[i].color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />)}</svg>
        {Array.from({ length: SIZE * SIZE }, (_, cell) => {
          const endpoint = endpointOwner(cell), owners = paths.map((path, index) => path.includes(cell) ? index : -1).filter((index) => index >= 0);
          return <button key={cell} data-light-cell={cell} aria-label={`Light tile ${cell + 1}`} className={`light-cell ${cell === BRIDGE ? "bridge" : ""} ${owners.length ? "powered" : ""}`} style={{ "--light": owners.length ? PAIRS[owners[0]].color : "#41516a" } as React.CSSProperties} onPointerEnter={(event) => event.buttons === 1 && choose(cell)} onPointerDown={() => choose(cell)}>
            {cell === BRIDGE && <em>╬</em>}{endpoint >= 0 && <strong style={{ color: PAIRS[endpoint].color }}>{PAIRS[endpoint].symbol}</strong>}
            {owners.map((owner) => <i key={owner} style={{ background: PAIRS[owner].color }} />)}
          </button>;
        })}
      </div>
      <div className="path-actions">{PAIRS.map((pair, index) => <button key={pair.symbol} onClick={() => resetPath(index)} style={{ color: pair.color }}>REDRAW {pair.symbol}</button>)}</div>
      <p className="rangoli-message">{message}</p>
      {celebrating && <div className="light-release">{PAIRS.map((pair, index) => <button key={pair.symbol} disabled={released[index]} onClick={() => release(index)} style={{ "--light": pair.color } as React.CSSProperties}>{released[index] ? "LIT" : `${pair.symbol} RELEASE`}</button>)}</div>}
    </div>
  );
}
