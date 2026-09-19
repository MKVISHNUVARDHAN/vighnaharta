import { useCallback, useEffect, useRef, useState } from "react";
import { EventBus } from "@/game/EventBus";
import type { ChallengeProps } from "./types";
import { MiniHud } from "./types";

const COLS = 6;
const ROWS = 6;
const FLOWERS = ["🌼", "🌹", "✿", "🌺"];
type Special = "row" | "col" | "burst" | "lotus" | null;
type Tile = { id: number; flower: number; special: Special };
type Counts = [number, number, number];

let tileId = 1;
const randomTile = (): Tile => ({ id: tileId++, flower: Math.floor(Math.random() * FLOWERS.length), special: null });
const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

function matchSet(board: Tile[]) {
  const matched = new Set<number>();
  const runs: number[][] = [];
  for (let row = 0; row < ROWS; row++) {
    let start = 0;
    for (let col = 1; col <= COLS; col++) {
      const same = col < COLS && board[row * COLS + col].flower === board[row * COLS + start].flower;
      if (same) continue;
      if (col - start >= 3) {
        const run = Array.from({ length: col - start }, (_, i) => row * COLS + start + i);
        run.forEach((i) => matched.add(i)); runs.push(run);
      }
      start = col;
    }
  }
  for (let col = 0; col < COLS; col++) {
    let start = 0;
    for (let row = 1; row <= ROWS; row++) {
      const same = row < ROWS && board[row * COLS + col].flower === board[start * COLS + col].flower;
      if (same) continue;
      if (row - start >= 3) {
        const run = Array.from({ length: row - start }, (_, i) => (start + i) * COLS + col);
        run.forEach((i) => matched.add(i)); runs.push(run);
      }
      start = row;
    }
  }
  return { matched, runs };
}

function makeBoard() {
  const board: Tile[] = [];
  for (let i = 0; i < ROWS * COLS; i++) {
    let tile = randomTile();
    while (
      (i % COLS >= 2 && board[i - 1]?.flower === tile.flower && board[i - 2]?.flower === tile.flower) ||
      (i >= COLS * 2 && board[i - COLS]?.flower === tile.flower && board[i - COLS * 2]?.flower === tile.flower)
    ) tile = randomTile();
    board.push(tile);
  }
  return board;
}

function hasLegalMove(board: Tile[]) {
  for (let index = 0; index < board.length; index++) {
    for (const other of [index + 1, index + COLS]) {
      if (other >= board.length || (other === index + 1 && index % COLS === COLS - 1)) continue;
      const copy = [...board]; [copy[index], copy[other]] = [copy[other], copy[index]];
      if (matchSet(copy).matched.size || (copy[index].special && copy[other].special)) return true;
    }
  }
  return false;
}

function makePlayableBoard() {
  let board = makeBoard();
  while (!hasLegalMove(board)) board = makeBoard();
  return board;
}

function gravity(board: (Tile | null)[]) {
  const result = [...board];
  for (let col = 0; col < COLS; col++) {
    const existing: Tile[] = [];
    for (let row = ROWS - 1; row >= 0; row--) {
      const tile = result[row * COLS + col];
      if (tile) existing.push(tile);
    }
    for (let row = ROWS - 1, i = 0; row >= 0; row--, i++) result[row * COLS + col] = existing[i] ?? randomTile();
  }
  return result as Tile[];
}

function specialCells(board: Tile[], index: number, special: Special) {
  const cells = new Set<number>();
  const row = Math.floor(index / COLS), col = index % COLS;
  if (special === "row") for (let x = 0; x < COLS; x++) cells.add(row * COLS + x);
  if (special === "col") for (let y = 0; y < ROWS; y++) cells.add(y * COLS + col);
  if (special === "burst") for (let y = row - 1; y <= row + 1; y++) for (let x = col - 1; x <= col + 1; x++) if (x >= 0 && x < COLS && y >= 0 && y < ROWS) cells.add(y * COLS + x);
  if (special === "lotus") board.forEach((tile, i) => { if (tile.flower === board[index].flower) cells.add(i); });
  return cells;
}

export default function FlowerMatchGame({ assisted, onWin, onFail }: ChallengeProps) {
  const [board, setBoard] = useState<Tile[]>(makePlayableBoard);
  const [selected, setSelected] = useState<number | null>(null);
  const [moves, setMoves] = useState(assisted ? 27 : 22);
  const [counts, setCounts] = useState<Counts>([0, 0, 0]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("SWAP NEIGHBOURS · MATCH 3 OR MORE");
  const [cascade, setCascade] = useState(0);
  const mounted = useRef(true);
  const countsRef = useRef<Counts>([0, 0, 0]);
  const movesRef = useRef(moves);
  const goal = 15;

  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);

  const addCollected = (tiles: Tile[]) => {
    const next = [...countsRef.current] as Counts;
    tiles.forEach((tile) => { if (tile.flower < 3) next[tile.flower]++; });
    countsRef.current = next; setCounts(next);
    return next;
  };

  const resolve = useCallback(async (initial: Tile[], preferred: number) => {
    let working = initial;
    let chain = 0;
    while (mounted.current) {
      const found = matchSet(working);
      if (!found.matched.size) break;
      chain++;
      setCascade(chain); setMessage(chain > 1 ? `CASCADE ×${chain}!` : "BLOOM!");
      const clear = new Set(found.matched);
      for (const index of clear) {
        const special = working[index].special;
        if (special) specialCells(working, index, special).forEach((cell) => clear.add(cell));
      }
      let create: { index: number; special: Exclude<Special, null> } | null = null;
      const longest = [...found.runs].sort((a, b) => b.length - a.length)[0];
      const intersection = [...found.matched].find((index) => found.runs.filter((run) => run.includes(index)).length > 1);
      if (longest?.length >= 5) create = { index: longest.includes(preferred) ? preferred : longest[Math.floor(longest.length / 2)], special: "lotus" };
      else if (intersection !== undefined) create = { index: intersection, special: "burst" };
      else if (longest?.length === 4) create = { index: longest.includes(preferred) ? preferred : longest[1], special: Math.floor(longest[0] / COLS) === Math.floor(longest[1] / COLS) ? "row" : "col" };
      if (create) clear.delete(create.index);
      const removed = [...clear].map((index) => working[index]);
      addCollected(removed);
      const cleared = working.map((tile, index) => clear.has(index) ? null : create?.index === index ? { ...tile, special: create.special } : tile);
      setBoard(cleared.map((tile) => tile ?? { id: -1, flower: 0, special: null }));
      EventBus.emit("ui-sfx", chain > 1 ? "perfect" : "good");
      await wait(180);
      working = gravity(cleared);
      setBoard(working);
      await wait(220);
      preferred = -1;
    }
    if (!mounted.current) return;
    if (!hasLegalMove(working)) {
      working = makePlayableBoard();
      setMessage("NO MOVES · FLOWERS RESHUFFLED FOR FREE");
    }
    setBoard(working); setBusy(false); setCascade(0);
    const complete = countsRef.current.every((value) => value >= goal);
    if (complete) {
      const remaining = movesRef.current;
      onWin(assisted ? "ASSISTED" : remaining >= 7 ? "GOLD" : remaining >= 4 ? "SILVER" : "BRONZE");
    } else if (movesRef.current <= 0) onFail();
    else setMessage("BUILD A SPECIAL FLOWER FOR A BIG CASCADE");
  }, [assisted, goal, onFail, onWin]);

  const swap = (a: number, b: number) => {
    if (busy) return;
    const adjacent = Math.abs(Math.floor(a / COLS) - Math.floor(b / COLS)) + Math.abs((a % COLS) - (b % COLS)) === 1;
    if (!adjacent) { setSelected(b); return; }
    const next = [...board]; [next[a], next[b]] = [next[b], next[a]];
    const specialSwap = next[a].special && next[b].special;
    if (!matchSet(next).matched.size && !specialSwap) {
      setMessage("THAT SWAP MAKES NO MATCH"); EventBus.emit("ui-sfx", "wrong"); setSelected(null); return;
    }
    setSelected(null); setBusy(true); setBoard(next);
    const remaining = movesRef.current - 1; movesRef.current = remaining; setMoves(remaining);
    if (specialSwap) {
      const clear = new Set<number>([a, b]);
      specialCells(next, a, next[a].special).forEach((i) => clear.add(i));
      specialCells(next, b, next[b].special).forEach((i) => clear.add(i));
      addCollected([...clear].map((i) => next[i]));
      const cleared = next.map((tile, i) => clear.has(i) ? null : tile);
      setMessage("SPECIAL COMBINATION!"); EventBus.emit("ui-sfx", "perfect");
      window.setTimeout(() => resolve(gravity(cleared), b), 260);
    } else resolve(next, b);
  };

  const choose = (index: number) => {
    if (busy) return;
    if (selected === null) { setSelected(index); EventBus.emit("ui-sfx", "good"); }
    else if (selected === index) setSelected(null);
    else swap(selected, index);
  };

  return (
    <div className="match-game flower-festival">
      <MiniHud left={`MOVES ${moves}`} right={cascade > 1 ? `CASCADE ×${cascade}` : "GARLANDS"} />
      <div className="flower-targets">
        {[0, 1, 2].map((flower) => <div key={flower} className={counts[flower] >= goal ? "complete" : ""}><span>{FLOWERS[flower]}</span><b>{Math.min(goal, counts[flower])}/{goal}</b><i /></div>)}
      </div>
      <div className={`flower-board-v2 ${busy ? "resolving" : ""}`}>
        {board.map((tile, index) => (
          <button key={tile.id < 0 ? `empty-${index}` : tile.id} className={`${selected === index ? "picked" : ""} ${tile.id < 0 ? "clearing" : ""} special-${tile.special ?? "none"}`} onClick={() => choose(index)} aria-label={`${FLOWERS[tile.flower]} ${tile.special ?? "flower"}`}>
            <span>{tile.id < 0 ? "" : tile.special === "lotus" ? "❉" : FLOWERS[tile.flower]}</span>
            {tile.special === "row" && <em>↔</em>}{tile.special === "col" && <em>↕</em>}{tile.special === "burst" && <em>✦</em>}
          </button>
        ))}
      </div>
      <p className="match-message">{message}</p>
    </div>
  );
}
