import { useCallback, useEffect, useRef, useState } from "react";
import { EventBus } from "@/game/EventBus";
import type { ChallengeProps } from "./types";
import { formatTime, MiniHud } from "./types";

type Item = { id: number; x: number; drift: number; kind: "modak" | "gold" | "husk" };

export default function CatchGame({ assisted, onWin, onFail }: ChallengeProps) {
  const [time, setTime] = useState(assisted ? 65 : 50);
  const [score, setScore] = useState(0);
  const [items, setItems] = useState<Item[]>([]);
  const [chain, setChain] = useState(0);
  const [maxChain, setMaxChain] = useState(0);
  const [huskHits, setHuskHits] = useState(0);
  const catching = useRef(false);
  const caught = useRef(new Set<number>());
  const lastCatch = useRef(0);
  const nextId = useRef(1);
  const finished = useRef(false);
  const goal = 30;

  useEffect(() => {
    const removals: number[] = [];
    const spawn = () => {
      const chance = Math.random();
      const item: Item = {
        id: nextId.current++, x: 12 + Math.random() * 76, drift: Math.round(Math.random() * 120 - 60),
        kind: assisted || chance > 0.86 ? (chance > 0.94 ? "gold" : "modak") : chance < 0.14 ? "husk" : chance > 0.82 ? "gold" : "modak",
      };
      setItems((value) => [...value, item]);
      removals.push(window.setTimeout(() => setItems((value) => value.filter((entry) => entry.id !== item.id)), 2450));
    };
    spawn();
    const wave = window.setInterval(() => { spawn(); if (Math.random() < 0.35) window.setTimeout(spawn, 170); }, 610);
    const clock = window.setInterval(() => setTime((value) => value - 1), 1000);
    return () => { window.clearInterval(wave); window.clearInterval(clock); removals.forEach(window.clearTimeout); };
  }, [assisted]);

  const catchItem = useCallback((id: number, kind: Item["kind"]) => {
    if (caught.current.has(id)) return;
    caught.current.add(id);
    setItems((value) => value.filter((item) => item.id !== id));
    if (kind === "husk") {
      setChain(0); setHuskHits((value) => value + 1); EventBus.emit("ui-sfx", "wrong"); return;
    }
    const now = performance.now();
    setChain((value) => { const next = now - lastCatch.current < 700 ? value + 1 : 1; setMaxChain((best) => Math.max(best, next)); return next; });
    lastCatch.current = now;
    setScore((value) => value + (kind === "gold" ? 3 : 1));
    EventBus.emit("ui-sfx", kind === "gold" ? "perfect" : "slice");
  }, []);

  const sweep = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!catching.current) return;
    for (const element of document.elementsFromPoint(event.clientX, event.clientY)) {
      const id = element.getAttribute("data-catch");
      const kind = element.getAttribute("data-kind") as Item["kind"] | null;
      if (id && kind) catchItem(Number(id), kind);
    }
  };

  useEffect(() => {
    if (finished.current) return;
    if (score >= goal) { finished.current = true; onWin(huskHits === 0 && maxChain >= 5 ? "GOLD" : maxChain >= 3 ? "SILVER" : "BRONZE"); }
    else if (time <= 0) { finished.current = true; onFail(); }
  }, [huskHits, maxChain, onFail, onWin, score, time]);

  return (
    <div className="laddu-game">
      <MiniHud left={`OFFERINGS ${score}/${goal} · CHAIN ${chain}`} right={formatTime(time)} />
      <div className="catch-field ninja" onPointerDown={(event) => { catching.current = true; event.currentTarget.setPointerCapture(event.pointerId); sweep(event); }} onPointerMove={sweep} onPointerUp={() => (catching.current = false)}>
        <div className="market-silhouette">MADHAV'S OFFERING STALL</div>
        {items.map((item) => (
          <button key={item.id} data-catch={item.id} data-kind={item.kind} className={`catch-item fruit-arc ${item.kind === "husk" ? "orb" : item.kind}`} style={{ left: `${item.x}%`, "--drift": `${item.drift}px` } as React.CSSProperties} onPointerDown={() => catchItem(item.id, item.kind)}>
            {item.kind === "husk" ? "✹" : item.kind === "gold" ? "◆" : "●"}
          </button>
        ))}
        <div className="tray">TRAY {Math.min(100, Math.round((score / goal) * 100))}% FULL</div>
        <div className="slice-callout">HOLD + SWIPE THROUGH OFFERINGS · AVOID SPIKY HUSKS</div>
      </div>
    </div>
  );
}
